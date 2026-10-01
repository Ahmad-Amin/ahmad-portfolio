import { anthropic } from "@ai-sdk/anthropic";
import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  tool,
  type ModelMessage,
  type UIMessage,
} from "ai";
import { Resend } from "resend";
import { buildSystemPrompt } from "@/lib/bot-context";
import { siteContent } from "@/lib/bot-tools";
import { logChatTurn } from "@/lib/chat-log";
import { parseChatRequest } from "@/lib/chat-input";
import { leadInputSchema, leadSubject } from "@/lib/chat-lead";
import { profile } from "@/data/profile";

type LoosePart = { type: string; text?: string; state?: string; output?: { success?: boolean } };

function uiMessageText(message: UIMessage | undefined): string {
  const parts = (message?.parts ?? []) as LoosePart[];
  return parts
    .map((part) => (part.type === "text" ? (part.text ?? "") : ""))
    .join("")
    .trim();
}

// The saveLead tool result rides along on the response message, so whether a
// lead was captured can be read straight off it.
function leadWasCaptured(message: UIMessage | undefined): boolean {
  const parts = (message?.parts ?? []) as LoosePart[];
  return parts.some(
    (part) =>
      part.type === "tool-saveLead" &&
      part.state === "output-available" &&
      part.output?.success === true,
  );
}

function messageContentText(content: ModelMessage["content"]): string {
  if (typeof content === "string") return content;
  return content
    .filter((part): part is Extract<typeof part, { type: "text" }> => part.type === "text")
    .map((part) => part.text)
    .join("");
}

// Human-readable transcript for the lead email — the tool executor gets the
// full message history, not just the fields the model chose to extract, so
// Ahmad can see exactly what was said rather than only the model's summary.
function formatTranscript(messages: ModelMessage[]): string {
  return messages
    .filter((message) => message.role === "user" || message.role === "assistant")
    .map((message) => {
      const text = messageContentText(message.content);
      if (!text) return null;
      return `${message.role === "user" ? "Visitor" : "Bot"}: ${text}`;
    })
    .filter((line): line is string => line !== null)
    .join("\n\n");
}

export const maxDuration = 30;

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Best-effort per-IP rate limit. Resets whenever the serverless instance
// recycles, so it won't stop determined abuse — it's just enough friction to
// keep a personal site's bot from being trivially hammered.
const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 60 * 60 * 1000;
const requestLog = new Map<string, number[]>();

// Past this many tracked IPs, drop the ones that have gone quiet, so a flood of
// one-off addresses can't grow the map without limit.
const MAX_TRACKED_IPS = 5_000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  if (requestLog.size > MAX_TRACKED_IPS) {
    for (const [key, times] of requestLog) {
      if (now - times[times.length - 1] >= RATE_WINDOW_MS) requestLog.delete(key);
    }
  }
  const recent = (requestLog.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  recent.push(now);
  requestLog.set(ip, recent);
  return recent.length > RATE_LIMIT;
}

// Only this site's own widget should call this endpoint. A browser always says
// where a request came from, so one that says another site is a different
// page trying to spend our tokens through its visitors' browsers (each from its
// own IP, which the per-IP limit can't catch). Scripts can forge these headers,
// so this closes the browser route; the rate limit and the spend limit on the
// Anthropic account cover the rest.
function isCrossSite(req: Request): boolean {
  // Modern browsers say outright whether a request is same-origin, and a proxy or
  // CDN in front of the site can't change that. When it's there, it decides.
  const fetchSite = req.headers.get("sec-fetch-site");
  if (fetchSite) return fetchSite !== "same-origin" && fetchSite !== "none";

  // Older browsers only send Origin, which we compare with the host being asked.
  const origin = req.headers.get("origin");
  if (!origin) return false;
  try {
    const hosts = [req.headers.get("host"), req.headers.get("x-forwarded-host")];
    return !hosts.includes(new URL(origin).host);
  } catch {
    return true;
  }
}

// Built per request so a single message can only ever send one lead email, however
// many times the model is talked into calling it (each call is an email to Ahmad).
function createSaveLead() {
  let used = false;

  return tool({
  description:
    "Save a visitor's contact info and what they want to build so Ahmad can follow up by email. Only call this once the visitor has clearly shared their name, email, and what they're interested in.",
  inputSchema: leadInputSchema,
  execute: async ({ name, email, whatTheyWantToBuild, notes }, { messages }) => {
    if (used) return { success: false, error: "A lead was already saved for this message." };
    used = true;

    const transcript = formatTranscript(messages) || "(no messages captured)";

    if (!resend) {
      console.log("[chat] Lead captured (RESEND_API_KEY not set, skipping email):", {
        name,
        email,
        whatTheyWantToBuild,
        notes,
        transcript,
      });
      return { success: true };
    }

    try {
      await resend.emails.send({
        from: "TechWithSwag Bot <bot@techwithswag.com>",
        to: profile.email,
        replyTo: email,
        subject: leadSubject(name),
        text: `Name: ${name}\nEmail: ${email}\n\nWhat they want to build:\n${whatTheyWantToBuild}\n\nNotes:\n${notes ?? "—"}\n\n---\n\nFull conversation:\n\n${transcript}`,
      });
      return { success: true };
    } catch (error) {
      console.error("[chat] Failed to send lead notification email:", error);
      return { success: false };
    }
  },
  });
}

export async function POST(req: Request) {
  if (isCrossSite(req)) return new Response("Forbidden", { status: 403 });
  // Forcing JSON also makes a cross-site browser request need a CORS preflight, which it fails.
  if (!req.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    return new Response("Expected a JSON request.", { status: 415 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response("Chat is not configured.", { status: 503 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (isRateLimited(ip)) {
    return new Response("Too many messages — try again in a bit.", { status: 429 });
  }

  const input = parseChatRequest(await req.text());
  if (!input.ok) {
    return Response.json({ error: input.error }, { status: input.status });
  }

  const [system, modelMessages] = await Promise.all([
    buildSystemPrompt(input.pathname),
    convertToModelMessages(input.messages),
  ]);

  const userAt = Date.now();
  const userText = uiMessageText(input.messages[input.messages.length - 1]);

  const result = streamText({
    model: anthropic("claude-haiku-4-5-20251001"),
    system,
    messages: modelMessages,
    tools: { saveLead: createSaveLead(), siteContent },
    // search, read, answer, and one more for saveLead
    stopWhen: stepCountIs(4),
    maxOutputTokens: 600,
    // Low on purpose: this bot speaks as a real person about real facts, so it should
    // be consistent, not creative. It also makes jailbreaks that rely on a lucky
    // sample much less likely to land.
    temperature: 0.3,
  });

  return result.toUIMessageStreamResponse({
    // Runs when the reply finishes, fails, or the visitor walks away
    // mid-stream, so every exchange is logged for the daily digest whether or
    // not a lead came out of it.
    onEnd: async ({ responseMessage, outcome }) => {
      if (!input.conversationId) return;
      try {
        // Summed over every model call this turn (a search or read is an extra
        // call). Missing if the visitor left mid-stream, which just means no count.
        const usage = await Promise.resolve(result.totalUsage).catch(() => undefined);
        await logChatTurn({
          conversationId: input.conversationId,
          userText,
          userAt,
          assistantText: uiMessageText(responseMessage),
          leadCaptured: leadWasCaptured(responseMessage),
          failed: outcome.status === "failed",
          inputTokens: usage?.inputTokens,
          outputTokens: usage?.outputTokens,
        });
      } catch (error) {
        console.error("[chat] Failed to log conversation:", error);
      }
    },
  });
}

import { anthropic } from "@ai-sdk/anthropic";
import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  tool,
  type ModelMessage,
} from "ai";
import { Resend } from "resend";
import { buildSystemPrompt } from "@/lib/bot-context";
import { parseChatRequest } from "@/lib/chat-input";
import { leadInputSchema, leadSubject } from "@/lib/chat-lead";
import { profile } from "@/data/profile";

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

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (requestLog.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  recent.push(now);
  requestLog.set(ip, recent);
  return recent.length > RATE_LIMIT;
}

const saveLead = tool({
  description:
    "Save a visitor's contact info and what they want to build so Ahmad can follow up by email. Only call this once the visitor has clearly shared their name, email, and what they're interested in.",
  inputSchema: leadInputSchema,
  execute: async ({ name, email, whatTheyWantToBuild, notes }, { messages }) => {
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

export async function POST(req: Request) {
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
    buildSystemPrompt(),
    convertToModelMessages(input.messages),
  ]);

  const result = streamText({
    model: anthropic("claude-haiku-4-5-20251001"),
    system,
    messages: modelMessages,
    tools: { saveLead },
    stopWhen: stepCountIs(5),
    maxOutputTokens: 1024,
  });

  return result.toUIMessageStreamResponse();
}

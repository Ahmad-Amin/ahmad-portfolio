import { z } from "zod";
import { profile } from "@/data/profile";
import { siteUrl } from "@/lib/site";
import {
  NEWSLETTER_FROM,
  createConfirmToken,
  getNewsletterTopicId,
  getResend,
} from "@/lib/subscribe";

const emailSchema = z.email().max(254);

// Best-effort limits (in-memory, so they reset when a serverless instance
// recycles). They exist mainly to protect Resend's shared daily sending quota,
// which the chatbot's lead notifications also depend on.
const IP_LIMIT = 5;
const IP_WINDOW_MS = 60 * 60 * 1000;
const GLOBAL_LIMIT = 50;
const GLOBAL_WINDOW_MS = 60 * 60 * 1000;
const EMAIL_COOLDOWN_MS = 10 * 60 * 1000;
const MAX_TRACKED_KEYS = 2000;

const hits = new Map<string, number[]>();

function tooMany(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  if (hits.size > MAX_TRACKED_KEYS) hits.clear();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  recent.push(now);
  hits.set(key, recent);
  return recent.length > limit;
}

// The link in the email must point somewhere we control. In production that's
// the configured site URL — never the request's Host header, which a caller can
// forge to get a valid token sent to their own domain. In dev, the request
// origin lets the whole flow be tested against localhost.
function confirmBaseUrl(req: Request): string {
  return process.env.NODE_ENV === "development" ? new URL(req.url).origin : siteUrl;
}

function confirmationEmail(link: string) {
  const text = [
    "Hi,",
    "",
    "Someone (hopefully you) asked to get new TechWithSwag posts by email. To finish subscribing, open this link:",
    "",
    link,
    "",
    "The link is valid for 48 hours. If you didn't ask for this, just ignore this email and nothing will happen.",
    "",
    `— ${profile.name.split(" ")[0]}`,
  ].join("\n");

  const html = `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#1d1d1f;line-height:1.6">
  <p>Hi,</p>
  <p>Someone (hopefully you) asked to get new TechWithSwag posts by email. To finish subscribing, confirm below.</p>
  <p style="margin:28px 0"><a href="${link}" style="display:inline-block;padding:12px 24px;background:#0071e3;color:#ffffff;border-radius:999px;text-decoration:none;font-weight:600">Confirm subscription</a></p>
  <p style="color:#6e6e73;font-size:13px">Or paste this link into your browser:<br>${link}</p>
  <p style="color:#6e6e73;font-size:13px">The link is valid for 48 hours. If you didn't ask for this, just ignore this email and nothing will happen.</p>
</div>`;

  return { text, html };
}

export async function POST(req: Request) {
  const resend = getResend();
  if (!resend) {
    return Response.json({ error: "Signup isn't available right now." }, { status: 503 });
  }

  // Without a topic, confirmed subscribers wouldn't be opted in to anything, so
  // refuse now rather than send confirmation emails that lead nowhere.
  if (!getNewsletterTopicId()) {
    console.error("[subscribe] RESEND_TOPIC_ID is not set; signup is disabled.");
    return Response.json({ error: "Signup isn't available right now." }, { status: 503 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (tooMany(`ip:${ip}`, IP_LIMIT, IP_WINDOW_MS)) {
    return Response.json({ error: "Too many attempts. Please try again later." }, { status: 429 });
  }

  let body: { email?: unknown; extra?: unknown };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  // Honeypot: real visitors never see or fill this field, so a value means a bot.
  // Answer like a success so the bot has nothing to adapt to.
  if (typeof body.extra === "string" && body.extra.trim() !== "") {
    return Response.json({ ok: true });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!emailSchema.safeParse(email).success) {
    return Response.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  if (tooMany("global", GLOBAL_LIMIT, GLOBAL_WINDOW_MS)) {
    return Response.json({ error: "Too many attempts. Please try again later." }, { status: 429 });
  }

  // A repeat within the cooldown looks like a success but sends nothing, so the
  // form can't be used to flood someone's inbox with confirmation emails.
  if (tooMany(`email:${email}`, 1, EMAIL_COOLDOWN_MS)) {
    return Response.json({ ok: true });
  }

  const token = createConfirmToken(email);
  if (!token) {
    return Response.json({ error: "Signup isn't available right now." }, { status: 503 });
  }

  const link = `${confirmBaseUrl(req)}/subscribe/confirm?token=${token}`;
  const { text, html } = confirmationEmail(link);

  const { error } = await resend.emails.send({
    from: NEWSLETTER_FROM,
    to: email,
    replyTo: profile.email,
    subject: "Confirm your subscription to TechWithSwag",
    text,
    html,
  });

  if (error) {
    console.error("[subscribe] Failed to send confirmation email:", error);
    return Response.json(
      { error: "Couldn't send the confirmation email. Please try again." },
      { status: 502 },
    );
  }

  return Response.json({ ok: true });
}

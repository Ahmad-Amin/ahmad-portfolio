import { timingSafeEqual } from "node:crypto";
import { profile } from "@/data/profile";
import { analyzeConversations, formatDigest, MAX_DIGEST_CONVERSATIONS } from "@/lib/chat-digest";
import {
  CONVERSATION_TTL_MS,
  DIGEST_LAST_RUN_KEY,
  DIGEST_LOCK_KEY,
  getChatLogStore,
} from "@/lib/chat-log";
import { getResend } from "@/lib/subscribe";

export const maxDuration = 60;

const DAY_MS = 24 * 60 * 60 * 1000;
// If runs were missed (Vercel delivers cron on a best-effort basis), the next
// digest reaches back to the last successful one, capped at a week.
const MAX_LOOKBACK_MS = 7 * DAY_MS;
const LOCK_TTL_SECONDS = 5 * 60;
// Quiet days send nothing. Flip this to get an "all quiet" email as a heartbeat.
const SEND_WHEN_EMPTY = false;

// Vercel sends `Authorization: Bearer $CRON_SECRET` when CRON_SECRET is set on
// the project. With no secret configured, nothing is authorized.
function isAuthorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const given = Buffer.from(req.headers.get("authorization") ?? "");
  const expected = Buffer.from(`Bearer ${secret}`);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

export async function GET(req: Request) {
  if (!isAuthorized(req)) return new Response("Unauthorized", { status: 401 });

  const store = getChatLogStore();
  if (!store) {
    return Response.json({ error: "Chat log storage is not configured." }, { status: 503 });
  }

  // Cron delivery can occasionally fire the same run twice.
  if (!(await store.tryLock(DIGEST_LOCK_KEY, LOCK_TTL_SECONDS))) {
    return Response.json({ sent: false, reason: "another digest run is in progress" });
  }

  const now = Date.now();
  const lastRun = await store.getNumber(DIGEST_LAST_RUN_KEY);
  const windowStart = Math.max(lastRun ?? now - DAY_MS, now - MAX_LOOKBACK_MS);

  await store.pruneOlderThan(now - CONVERSATION_TTL_MS);
  const found = await store.conversationsUpdatedSince(windowStart);

  if (found.length === 0 && !SEND_WHEN_EMPTY) {
    await store.setNumber(DIGEST_LAST_RUN_KEY, now);
    return Response.json({ sent: false, reason: "no conversations in this window" });
  }

  const conversations = found.slice(-MAX_DIGEST_CONVERSATIONS);
  const omittedCount = found.length - conversations.length;

  const analysis = await analyzeConversations(conversations, windowStart);
  const digest = formatDigest({ conversations, omittedCount, windowStart, windowEnd: now, analysis });

  const resend = getResend();
  if (!resend) {
    // Deliberately not advancing the last-run marker, so a later run with
    // email configured still covers this window.
    console.log("[chat-digest] RESEND_API_KEY not set, digest not emailed:\n", digest.text);
    return Response.json({
      sent: false,
      reason: "RESEND_API_KEY is not set",
      stats: digest.stats,
      preview: digest.text,
    });
  }

  const { error } = await resend.emails.send({
    from: "TechWithSwag Bot <bot@techwithswag.com>",
    to: profile.email,
    subject: digest.subject,
    text: digest.text,
  });

  if (error) {
    // The marker stays put, so the next run picks these conversations up again.
    console.error("[chat-digest] Failed to send digest email:", error);
    return Response.json({ sent: false, reason: "email send failed" }, { status: 502 });
  }

  await store.setNumber(DIGEST_LAST_RUN_KEY, now);
  return Response.json({ sent: true, stats: digest.stats, analyzed: analysis !== null });
}

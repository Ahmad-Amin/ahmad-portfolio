import { createHmac, timingSafeEqual } from "node:crypto";
import { Resend } from "resend";

export const CONFIRM_TOKEN_TTL_MS = 48 * 60 * 60 * 1000;

// Must be an address on a domain verified in Resend.
export const NEWSLETTER_FROM = "TechWithSwag <newsletter@techwithswag.com>";

// The Resend topic subscribers opt in to. Topics are what keep this site's
// unsubscribes separate from other sites sharing the same Resend account.
export function getNewsletterTopicId(): string | null {
  return process.env.RESEND_TOPIC_ID || null;
}

export function getResend(): Resend | null {
  return process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
}

// Derived (with a fixed label) from the Resend key so no extra secret has to be
// configured; rotating the key just invalidates confirmation links still in flight.
function signingKey(): Buffer | null {
  const secret = process.env.RESEND_API_KEY;
  if (!secret) return null;
  return createHmac("sha256", secret).update("newsletter-confirm-token-v1").digest();
}

export function createConfirmToken(email: string, now = Date.now()): string | null {
  const key = signingKey();
  if (!key) return null;

  const payload = Buffer.from(JSON.stringify({ e: email, x: now + CONFIRM_TOKEN_TTL_MS })).toString(
    "base64url",
  );
  const signature = createHmac("sha256", key).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

// Returns the email the token was issued for, or null if it's forged, expired or malformed.
export function verifyConfirmToken(token: string, now = Date.now()): string | null {
  const key = signingKey();
  if (!key) return null;

  const parts = token.split(".");
  if (parts.length !== 2 || !parts[0] || !parts[1]) return null;
  const [payload, signature] = parts;

  const expected = createHmac("sha256", key).update(payload).digest();
  const given = Buffer.from(signature, "base64url");
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;

  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      e?: unknown;
      x?: unknown;
    };
    if (typeof data.e !== "string" || typeof data.x !== "number" || data.x < now) return null;
    return data.e;
  } catch {
    return null;
  }
}

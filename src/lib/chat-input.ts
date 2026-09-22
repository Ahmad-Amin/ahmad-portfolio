import type { UIMessage } from "ai";
import { z } from "zod";
import { MAX_USER_MESSAGE_CHARS } from "@/lib/chat-limits";

export const MAX_BODY_CHARS = 100_000;
const MAX_HISTORY_MESSAGES = 20;
// Assistant replies are capped at 1024 output tokens, so this leaves headroom.
const MAX_ASSISTANT_MESSAGE_CHARS = 6_000;
const MAX_TOTAL_CHARS = 30_000;

// Only the fields the chat widget legitimately sends. Roles are limited to
// user/assistant so a browser can't inject its own "system" instructions.
const bodySchema = z.object({
  messages: z
    .array(
      z.object({
        id: z.string().max(100),
        role: z.enum(["user", "assistant"]),
        parts: z.array(z.looseObject({ type: z.string() })).max(50),
      }),
    )
    .min(1)
    .max(200),
});

export type ChatInputResult =
  | { ok: true; messages: UIMessage[] }
  | { ok: false; status: 400 | 413; error: string };

const invalid: ChatInputResult = { ok: false, status: 400, error: "Invalid request." };
const tooLong: ChatInputResult = { ok: false, status: 413, error: "That message is too long." };

// Turns the raw request body into messages that are safe to hand to the model:
// text parts only (no files, images or forged tool calls), sane sizes, and a
// user message last. The client sends the whole history, so earlier assistant
// turns can't be verified; everything else about them is constrained.
export function parseChatRequest(rawBody: string): ChatInputResult {
  if (rawBody.length > MAX_BODY_CHARS) return tooLong;

  let json: unknown;
  try {
    json = JSON.parse(rawBody);
  } catch {
    return invalid;
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) return invalid;

  const messages: UIMessage[] = [];
  for (const message of parsed.data.messages.slice(-MAX_HISTORY_MESSAGES)) {
    const text = message.parts
      .map((part) => (part.type === "text" && typeof part.text === "string" ? part.text : ""))
      .join("")
      .trim();
    if (!text) continue;

    const limit = message.role === "user" ? MAX_USER_MESSAGE_CHARS : MAX_ASSISTANT_MESSAGE_CHARS;
    if (text.length > limit) return tooLong;

    messages.push({ id: message.id, role: message.role, parts: [{ type: "text", text }] });
  }

  if (messages.length === 0 || messages[messages.length - 1].role !== "user") return invalid;
  if (messages.reduce((sum, m) => sum + messageLength(m), 0) > MAX_TOTAL_CHARS) return tooLong;

  return { ok: true, messages };
}

function messageLength(message: UIMessage): number {
  return message.parts.reduce((sum, part) => sum + (part.type === "text" ? part.text.length : 0), 0);
}

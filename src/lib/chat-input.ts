import type { UIMessage } from "ai";
import { z } from "zod";
import { MAX_USER_MESSAGE_CHARS } from "@/lib/chat-limits";

export const MAX_BODY_CHARS = 100_000;
// The whole history is resent to the model with every message, so how much of it
// is kept is a running cost. Twelve messages is about six exchanges of context.
const MAX_HISTORY_MESSAGES = 12;
// Assistant replies are capped at 600 output tokens, so this leaves headroom
// (the widget's built-in starter answers are also well under it).
const MAX_ASSISTANT_MESSAGE_CHARS = 6_000;
const MAX_TOTAL_CHARS = 30_000;

// Only the fields the chat widget legitimately sends. Roles are limited to
// user/assistant so a browser can't inject its own "system" instructions.
// The chat widget's useChat instance id, sent with every request; it stays the
// same for one widget session, which makes it the conversation id for logging.
const CONVERSATION_ID_PATTERN = /^[A-Za-z0-9_-]{8,64}$/;
const PATHNAME_PATTERN = /^\/[A-Za-z0-9_\-./]{0,199}$/;

const bodySchema = z.object({
  // Lenient on purpose: an odd id just means "don't log", never a failed chat.
  id: z.unknown().optional(),
  // The page the visitor is on. Checked against known pages before use.
  pathname: z.unknown().optional(),
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
  | { ok: true; messages: UIMessage[]; conversationId?: string; pathname?: string }
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

  // The window can start on an assistant message (the widget's greeting or a
  // starter answer). A conversation has to open with the visitor, and dropping
  // it also saves its tokens.
  while (messages.length > 0 && messages[0].role === "assistant") messages.shift();

  if (messages.length === 0 || messages[messages.length - 1].role !== "user") return invalid;
  if (messages.reduce((sum, m) => sum + messageLength(m), 0) > MAX_TOTAL_CHARS) return tooLong;

  const { id, pathname } = parsed.data;
  const conversationId =
    typeof id === "string" && CONVERSATION_ID_PATTERN.test(id) ? id : undefined;
  const safePathname =
    typeof pathname === "string" && PATHNAME_PATTERN.test(pathname) ? pathname : undefined;

  return { ok: true, messages, conversationId, pathname: safePathname };
}

function messageLength(message: UIMessage): number {
  return message.parts.reduce((sum, part) => sum + (part.type === "text" ? part.text.length : 0), 0);
}

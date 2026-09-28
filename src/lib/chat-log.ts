import { Redis } from "@upstash/redis";

// Persistent log of chatbot conversations, read once a day by the digest cron
// (src/app/api/cron/chat-digest). Backed by Upstash Redis when configured; in
// local dev it falls back to an in-memory store so the whole flow can be tried
// without an account. In production without Redis, logging is a silent no-op.

const CONVERSATION_TTL_SECONDS = 30 * 24 * 60 * 60;
// Bounds on what one conversation can store, so a single chatty (or abusive)
// session can't grow a record without limit.
const MAX_MESSAGES_PER_CONVERSATION = 60;
const MAX_TEXT_CHARS = 4_000;

const INDEX_KEY = "chat:index"; // sorted set: score = updatedAt (ms), member = conversation id
const conversationKey = (id: string) => `chat:conv:${id}`;

export const DIGEST_LAST_RUN_KEY = "chat:digest:last-run";
export const DIGEST_LOCK_KEY = "chat:digest:lock";

export interface LoggedMessage {
  role: "user" | "assistant";
  text: string;
  at: number;
}

export interface LoggedConversation {
  id: string;
  startedAt: number;
  updatedAt: number;
  leadCaptured: boolean;
  errorCount: number;
  messages: LoggedMessage[];
}

export interface ChatLogStore {
  getConversation(id: string): Promise<LoggedConversation | null>;
  saveConversation(conversation: LoggedConversation): Promise<void>;
  conversationsUpdatedSince(sinceMs: number): Promise<LoggedConversation[]>;
  pruneOlderThan(cutoffMs: number): Promise<void>;
  getNumber(key: string): Promise<number | null>;
  setNumber(key: string, value: number): Promise<void>;
  tryLock(key: string, ttlSeconds: number): Promise<boolean>;
}

class RedisStore implements ChatLogStore {
  constructor(private readonly redis: Redis) {}

  getConversation(id: string) {
    return this.redis.get<LoggedConversation>(conversationKey(id));
  }

  async saveConversation(conversation: LoggedConversation) {
    await this.redis
      .pipeline()
      .set(conversationKey(conversation.id), conversation, { ex: CONVERSATION_TTL_SECONDS })
      .zadd(INDEX_KEY, { score: conversation.updatedAt, member: conversation.id })
      .exec();
  }

  async conversationsUpdatedSince(sinceMs: number) {
    // Exclusive lower bound, so a conversation already covered by the last
    // digest isn't picked up again.
    const ids = await this.redis.zrange<(string | number)[]>(INDEX_KEY, sinceMs + 1, "+inf", {
      byScore: true,
    });
    if (ids.length === 0) return [];

    const found = await this.redis.mget<(LoggedConversation | null)[]>(
      ...ids.map((id) => conversationKey(String(id))),
    );
    return found.filter((c): c is LoggedConversation => c !== null);
  }

  async pruneOlderThan(cutoffMs: number) {
    await this.redis.zremrangebyscore(INDEX_KEY, 0, cutoffMs);
  }

  getNumber(key: string) {
    return this.redis.get<number>(key);
  }

  async setNumber(key: string, value: number) {
    await this.redis.set(key, value);
  }

  async tryLock(key: string, ttlSeconds: number) {
    const result = await this.redis.set(key, "1", { nx: true, ex: ttlSeconds });
    return result === "OK";
  }
}

interface MemoryState {
  conversations: Map<string, LoggedConversation>;
  numbers: Map<string, number>;
  locks: Map<string, number>;
}

// Lives on globalThis so every route handler in the dev server sees the same
// data, even when the bundler gives each route its own copy of this module.
const globalForMemory = globalThis as unknown as { __chatLogMemory?: MemoryState };

class MemoryStore implements ChatLogStore {
  private get state(): MemoryState {
    globalForMemory.__chatLogMemory ??= {
      conversations: new Map(),
      numbers: new Map(),
      locks: new Map(),
    };
    return globalForMemory.__chatLogMemory;
  }

  async getConversation(id: string) {
    return this.state.conversations.get(id) ?? null;
  }

  async saveConversation(conversation: LoggedConversation) {
    this.state.conversations.set(conversation.id, conversation);
  }

  async conversationsUpdatedSince(sinceMs: number) {
    return [...this.state.conversations.values()]
      .filter((c) => c.updatedAt > sinceMs)
      .sort((a, b) => a.updatedAt - b.updatedAt);
  }

  async pruneOlderThan(cutoffMs: number) {
    for (const [id, c] of this.state.conversations) {
      if (c.updatedAt <= cutoffMs) this.state.conversations.delete(id);
    }
  }

  async getNumber(key: string) {
    return this.state.numbers.get(key) ?? null;
  }

  async setNumber(key: string, value: number) {
    this.state.numbers.set(key, value);
  }

  async tryLock(key: string, ttlSeconds: number) {
    const now = Date.now();
    const expiresAt = this.state.locks.get(key);
    if (expiresAt !== undefined && expiresAt > now) return false;
    this.state.locks.set(key, now + ttlSeconds * 1000);
    return true;
  }
}

// Vercel's Upstash integration injects KV_REST_API_*; a database created on
// upstash.com directly uses UPSTASH_REDIS_REST_*. Accept either.
function createRedis(): Redis | null {
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? new Redis({ url, token }) : null;
}

let cachedStore: ChatLogStore | null | undefined;

export function getChatLogStore(): ChatLogStore | null {
  if (cachedStore !== undefined) return cachedStore;

  const redis = createRedis();
  if (redis) cachedStore = new RedisStore(redis);
  else if (process.env.NODE_ENV !== "production") cachedStore = new MemoryStore();
  else cachedStore = null;
  return cachedStore;
}

function clip(text: string): string {
  return text.length > MAX_TEXT_CHARS ? `${text.slice(0, MAX_TEXT_CHARS)}… [truncated]` : text;
}

interface LogTurnInput {
  conversationId: string;
  userText: string;
  userAt: number;
  assistantText: string;
  leadCaptured: boolean;
  failed: boolean;
}

// Appends one exchange (the visitor's message and the bot's reply) to its
// conversation. The client resends the whole history on every request, but
// only the newest message is new, so that's all that gets appended. Logging
// must never break the chat itself, so every failure is swallowed.
export async function logChatTurn(turn: LogTurnInput): Promise<void> {
  const store = getChatLogStore();
  if (!store) return;

  try {
    const now = Date.now();
    const existing = await store.getConversation(turn.conversationId);
    const messages = [...(existing?.messages ?? [])];

    messages.push({ role: "user", text: clip(turn.userText), at: turn.userAt });
    if (turn.assistantText) {
      messages.push({ role: "assistant", text: clip(turn.assistantText), at: now });
    } else if (turn.failed) {
      messages.push({ role: "assistant", text: "(no reply: the bot hit an error)", at: now });
    }

    await store.saveConversation({
      id: turn.conversationId,
      startedAt: existing?.startedAt ?? turn.userAt,
      updatedAt: now,
      leadCaptured: (existing?.leadCaptured ?? false) || turn.leadCaptured,
      errorCount: (existing?.errorCount ?? 0) + (turn.failed ? 1 : 0),
      messages: messages.slice(-MAX_MESSAGES_PER_CONVERSATION),
    });
  } catch (error) {
    console.error("[chat-log] Failed to log conversation:", error);
  }
}

export const CONVERSATION_TTL_MS = CONVERSATION_TTL_SECONDS * 1000;

"use client";

import { useEffect, useRef, useState, type ComponentPropsWithoutRef } from "react";
import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { AnimatePresence, motion } from "motion/react";
import { MessageCircle, Send, Sparkles, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import clsx from "clsx";
import { profile } from "@/data/profile";

const EASE = [0.16, 1, 0.3, 1] as const;
const firstName = profile.name.split(" ")[0];
const TEASER_DELAY_MS = 2500;
const TEASER_VISIBLE_MS = 10000;
const TEASER_SESSION_KEY = "chat-widget-teaser-shown";
const CHIME_VOLUME = 0.2;

function markTeaserSeen() {
  try {
    sessionStorage.setItem(TEASER_SESSION_KEY, "1");
  } catch {
    // sessionStorage unavailable (private mode, etc.) — safe to no-op.
  }
}

// Lazily created and reused so later beeps don't each spin up a new context.
let sharedAudioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AudioContextCtor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextCtor) return null;
  if (!sharedAudioContext) sharedAudioContext = new AudioContextCtor();
  return sharedAudioContext;
}

// A soft, short chime — not a harsh alert beep. Browsers suspend audio until
// the visitor has interacted with the page at least once, so this silently
// no-ops if that hasn't happened yet by the time the teaser fires.
function playChime() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const fire = () => {
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = 880;
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(CHIME_VOLUME, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);
    oscillator.connect(gain).connect(ctx.destination);
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.4);
  };

  if (ctx.state === "suspended") {
    ctx.resume().then(fire).catch(() => {});
  } else {
    fire();
  }
}

// Compact markdown styling scaled for a narrow chat bubble (text-sm, tight
// spacing) rather than the article-width tokens in mdx-components.tsx.
const markdownComponents = {
  p: (props: ComponentPropsWithoutRef<"p">) => (
    <p className="mt-2 leading-relaxed first:mt-0" {...props} />
  ),
  a: (props: ComponentPropsWithoutRef<"a">) => (
    <a
      className="text-accent underline underline-offset-2 hover:opacity-80"
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    />
  ),
  ul: (props: ComponentPropsWithoutRef<"ul">) => (
    <ul className="mt-2 ml-4 list-disc space-y-1 first:mt-0" {...props} />
  ),
  ol: (props: ComponentPropsWithoutRef<"ol">) => (
    <ol className="mt-2 ml-4 list-decimal space-y-1 first:mt-0" {...props} />
  ),
  blockquote: (props: ComponentPropsWithoutRef<"blockquote">) => (
    <blockquote
      className="mt-2 border-l-2 border-accent/40 pl-3 italic first:mt-0"
      {...props}
    />
  ),
  hr: () => <hr className="my-3 border-border" />,
  pre: (props: ComponentPropsWithoutRef<"pre">) => (
    <pre
      className="mt-2 overflow-x-auto rounded-xl bg-foreground/10 p-3 font-mono text-[0.85em] first:mt-0"
      {...props}
    />
  ),
  code: ({ className, ...props }: ComponentPropsWithoutRef<"code">) =>
    /language-/.test(className ?? "") ? (
      <code className={clsx("font-mono", className)} {...props} />
    ) : (
      <code
        className="rounded bg-foreground/10 px-1 py-0.5 font-mono text-[0.85em]"
        {...props}
      />
    ),
};

function messageText(parts: UIMessage["parts"]): string {
  return parts
    .filter((part): part is Extract<typeof part, { type: "text" }> => part.type === "text")
    .map((part) => part.text)
    .join("");
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 rounded-2xl rounded-bl-md bg-foreground/6 px-3.5 py-3">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="size-1.5 animate-bounce rounded-full bg-muted"
          style={{ animationDelay: `${i * 120}ms` }}
        />
      ))}
    </div>
  );
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [pulse, setPulse] = useState(false);
  const [teaser, setTeaser] = useState(false);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const interactedRef = useRef(false);

  const { messages, sendMessage, status, error } = useChat<UIMessage>({
    messages: [
      {
        id: "greeting",
        role: "assistant",
        parts: [
          {
            type: "text",
            text: `Hey, I'm ${firstName}'s AI assistant. Tell me what you're working on and I'll let you know how he can help.`,
          },
        ],
      },
    ],
  });

  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    if (!open) return;
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  // Browsers won't play audio until the visitor has interacted with the page
  // at least once — warm up the audio context on the first such interaction
  // so it's ready by the time the teaser timer fires.
  useEffect(() => {
    function unlock() {
      getAudioContext()?.resume().catch(() => {});
    }
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  // Nudge first-time visitors once per browser session: pulse the launcher,
  // then pop a small "how can I help?" toast after a short delay — unless
  // they've already seen it this session, or opened the chat before it fired.
  useEffect(() => {
    let alreadySeen = false;
    try {
      alreadySeen = sessionStorage.getItem(TEASER_SESSION_KEY) === "1";
    } catch {
      alreadySeen = true;
    }
    if (alreadySeen) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPulse(true);
    const timer = setTimeout(() => {
      setPulse(false);
      if (!interactedRef.current) {
        setTeaser(true);
        playChime();
        markTeaserSeen();
      }
    }, TEASER_DELAY_MS);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!teaser) return;
    const timer = setTimeout(() => setTeaser(false), TEASER_VISIBLE_MS);
    return () => clearTimeout(timer);
  }, [teaser]);

  function toggleOpen() {
    interactedRef.current = true;
    setPulse(false);
    setTeaser(false);
    markTeaserSeen();
    setOpen((prev) => !prev);
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    sendMessage({ text });
    setInput("");
  }

  return (
    <>
      <div className="fixed right-4 bottom-4 z-50 sm:right-6 sm:bottom-6">
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.96 }}
              transition={{ duration: 0.2, ease: EASE }}
              role="dialog"
              aria-label={`Chat with ${firstName}'s AI assistant`}
              className="mb-3 flex h-128 max-h-[70vh] w-[calc(100vw-2rem)] max-w-sm origin-bottom-right flex-col overflow-hidden rounded-3xl border border-border bg-surface shadow-[0_8px_30px_rgb(0,0,0,0.12)]"
            >
              <div className="flex items-center gap-3 border-b border-border px-5 py-4">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
                  <Sparkles className="size-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Ask {firstName}</p>
                  <p className="text-xs text-muted">AI assistant · trained on his background</p>
                </div>
              </div>

              <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
                <div className="flex min-h-full flex-col justify-end gap-3 px-4 py-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={clsx(
                        "flex",
                        message.role === "user" ? "justify-end" : "justify-start",
                      )}
                    >
                      {message.role === "user" ? (
                        <p className="max-w-[85%] rounded-2xl rounded-br-md bg-accent px-3.5 py-2 text-sm leading-relaxed whitespace-pre-wrap text-accent-foreground">
                          {messageText(message.parts)}
                        </p>
                      ) : (
                        <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-foreground/6 px-3.5 py-2 text-sm text-foreground">
                          <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                            {messageText(message.parts)}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>
                  ))}
                  {busy && (
                    <div className="flex justify-start">
                      <TypingIndicator />
                    </div>
                  )}
                  {error && (
                    <p className="text-xs text-red-500">
                      Something went wrong — please try again.
                    </p>
                  )}
                </div>
              </div>

              <form
                onSubmit={handleSubmit}
                className="flex items-center gap-2 border-t border-border p-3"
              >
                <input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Type a message…"
                  aria-label="Message"
                  className="min-w-0 flex-1 rounded-full border border-border bg-background px-4 py-2 text-sm text-foreground outline-none placeholder:text-muted focus-visible:outline-2 focus-visible:outline-accent"
                />
                <button
                  type="submit"
                  disabled={busy || input.trim().length === 0}
                  aria-label="Send message"
                  className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground transition-opacity disabled:opacity-40"
                >
                  <Send className="size-4" />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {teaser && !open && (
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.25, ease: EASE }}
              role="status"
              className="relative mb-3 ml-auto w-max max-w-[min(18rem,calc(100vw-2rem))] origin-bottom-right"
            >
              <button
                type="button"
                onClick={toggleOpen}
                className="flex w-full items-center gap-3 rounded-3xl border border-border bg-surface py-3 pr-10 pl-3 text-left shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-colors hover:border-accent/40"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
                  <Sparkles className="size-4" />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-foreground">
                    Hi, how can I help?
                  </span>
                  <span className="block text-xs text-muted">
                    {`Ask me about ${firstName}'s work or your project.`}
                  </span>
                </span>
              </button>
              <button
                type="button"
                onClick={() => setTeaser(false)}
                aria-label="Dismiss"
                className="absolute top-2 right-2 inline-flex size-6 items-center justify-center rounded-full text-muted transition-colors hover:bg-foreground/10 hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative ml-auto size-14">
          {pulse && (
            <span className="absolute inset-0 motion-safe:animate-ping rounded-full bg-accent opacity-75" />
          )}
          <button
            type="button"
            onClick={toggleOpen}
            aria-expanded={open}
            aria-label={open ? "Close chat" : `Chat with ${firstName}'s AI assistant`}
            className="relative flex size-14 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-[0_8px_30px_rgb(0,0,0,0.16)] transition-transform hover:scale-105"
          >
            {open ? <X className="size-5" /> : <MessageCircle className="size-5" />}
          </button>
        </div>
      </div>
    </>
  );
}

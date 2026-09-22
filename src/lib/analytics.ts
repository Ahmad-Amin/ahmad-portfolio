import { sendGAEvent } from "@next/third-parties/google";

export type AnalyticsEvent =
  | "book_call_click"
  | "cv_download"
  | "email_click"
  | "hero_cta_click"
  | "chat_open"
  | "newsletter_signup"
  | "testimonial_linkedin_click";

// No-ops when GA isn't configured (no NEXT_PUBLIC_GA_ID), so it's safe to call anywhere.
export function trackEvent(name: AnalyticsEvent, params: Record<string, string> = {}) {
  if (!process.env.NEXT_PUBLIC_GA_ID) return;
  sendGAEvent("event", name, params);
}

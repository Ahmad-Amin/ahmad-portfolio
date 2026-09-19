"use client";

import type { ComponentPropsWithoutRef } from "react";
import { trackEvent, type AnalyticsEvent } from "@/lib/analytics";

type TrackedLinkProps = ComponentPropsWithoutRef<"a"> & {
  event: AnalyticsEvent;
  params?: Record<string, string>;
};

// A plain anchor that reports a click. Exists so server components can track
// links without becoming client components themselves.
export function TrackedLink({ event, params, onClick, ...props }: TrackedLinkProps) {
  return (
    <a
      {...props}
      onClick={(e) => {
        trackEvent(event, params);
        onClick?.(e);
      }}
    />
  );
}

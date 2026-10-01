import { ViewTransition, type ReactNode } from "react";

// Wraps a page's top-level content so the OLD page fades out when you navigate
// away (see `.page-out` in globals.css). Entering is left to each page's own
// Section/BootIn animation, so nothing fades in twice. Browsers without View
// Transitions support just swap pages instantly, as before.
//
// Lives in each page.tsx rather than a layout on purpose: layouts persist across
// navigations, so a ViewTransition there never sees an exit.
export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <ViewTransition exit="page-out" default="none">
      {children}
    </ViewTransition>
  );
}

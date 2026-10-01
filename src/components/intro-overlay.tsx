import { profile } from "@/data/profile";
import { ACCENT_GRADIENT, splitBrand } from "@/components/brand-wordmark";

// Server-rendered and purely CSS-animated (see `.intro-*` in globals.css). It is
// invisible unless the inline script in the root layout marks this load as a
// first visit, so it never blocks or hides content for crawlers or repeat views.
export function IntroOverlay() {
  const [lead, accent] = splitBrand(profile.brand);

  return (
    <div
      aria-hidden="true"
      className="intro-overlay fixed inset-0 z-110 flex items-center justify-center bg-background"
    >
      <span className="inline-flex items-baseline text-[clamp(2.25rem,1.5rem+4vw,4.5rem)] leading-none font-extrabold tracking-[-0.045em]">
        <span className="intro-lead inline-block text-foreground">{lead}</span>
        {accent && (
          <span className="relative">
            <span
              className={`intro-accent inline-block bg-linear-to-r ${ACCENT_GRADIENT} bg-clip-text text-transparent`}
            >
              {accent}
            </span>
            <span className="intro-line absolute inset-x-0 -bottom-2 h-[3px] origin-left rounded-full bg-accent" />
          </span>
        )}
      </span>
    </div>
  );
}

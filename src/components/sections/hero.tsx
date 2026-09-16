import { ArrowUpRight } from "lucide-react";
import { profile } from "@/data/profile";
import { Section } from "@/components/section";

export function Hero() {
  return (
    <Section id="hero" labelledBy="hero-heading" className="pt-32 sm:pt-40">
      <div className="mx-auto max-w-3xl text-center">
        <h1
          id="hero-heading"
          className="text-display font-semibold tracking-tight text-foreground wrap-anywhere"
        >
          {profile.brand}
        </h1>
        <p className="mt-4 text-sm font-medium tracking-wide text-accent">
          {profile.name} · {profile.role}
        </p>

        <p className="mx-auto mt-8 max-w-xl text-lg leading-relaxed text-muted">
          {profile.tagline}
        </p>
        <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-muted">
          {profile.bio[0]}
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <a
            href="#footprint"
            className="inline-flex items-center gap-1.5 rounded-full bg-accent px-6 py-3 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
          >
            View Footprint
          </a>
          <a
            href="#contact"
            className="group inline-flex items-center gap-1 px-2 py-3 text-sm font-medium text-foreground transition-colors hover:text-accent"
          >
            Get in Touch
            <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </div>
      </div>
    </Section>
  );
}

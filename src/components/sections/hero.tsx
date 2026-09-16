import { ArrowUpRight } from "lucide-react";
import { profile } from "@/data/profile";
import { Section } from "@/components/section";

export function Hero() {
  return (
    <Section
      id="hero"
      labelledBy="hero-heading"
      variant="bleed"
      className="pt-40 sm:pt-48"
    >
      <p className="font-mono text-sm tracking-widest text-accent uppercase">
        {profile.role}
      </p>
      <h1
        id="hero-heading"
        className="mt-6 text-display font-serif font-black tracking-tighter text-foreground wrap-anywhere"
      >
        {profile.name}
      </h1>

      <div className="mt-12 flex flex-col gap-8 border-t-2 border-foreground pt-8 lg:flex-row lg:items-end lg:justify-between">
        <p className="max-w-md text-lg text-muted">{profile.tagline}</p>

        <div className="flex flex-wrap items-center gap-8">
          <a
            href="#projects"
            className="group inline-flex items-center gap-1 border-b-2 border-foreground pb-1 text-sm font-medium tracking-wide text-foreground uppercase transition-colors hover:border-accent hover:text-accent"
          >
            View Projects
            <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
          <a
            href="#contact"
            className="group inline-flex items-center gap-1 border-b-2 border-foreground pb-1 text-sm font-medium tracking-wide text-foreground uppercase transition-colors hover:border-accent hover:text-accent"
          >
            Get in Touch
            <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </div>
      </div>
    </Section>
  );
}

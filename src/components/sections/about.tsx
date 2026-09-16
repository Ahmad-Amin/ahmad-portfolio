import { profile } from "@/data/profile";
import { PlaceholderArt } from "@/components/placeholder-art";
import { Section } from "@/components/section";

export function About() {
  return (
    <Section id="about" labelledBy="about-heading">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <h2
            id="about-heading"
            className="text-display-sm font-serif font-black tracking-tighter text-foreground"
          >
            About Me
          </h2>
          <div className="mt-8 space-y-4 text-lg text-muted">
            {profile.bio.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <p className="mt-6 font-mono text-sm tracking-wide text-muted uppercase">
            {profile.location}
          </p>
        </div>

        <div className="lg:col-span-4 lg:col-start-9 lg:mt-20">
          <PlaceholderArt index={2} className="aspect-3/4 w-full max-w-xs" />
        </div>
      </div>
    </Section>
  );
}

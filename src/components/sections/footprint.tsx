import { Section } from "@/components/section";
import { GithubRow } from "@/components/footprint/github-row";
import { NpmRow } from "@/components/footprint/npm-row";
import { YoutubeRow } from "@/components/footprint/youtube-row";

export function Footprint() {
  return (
    <Section id="footprint" labelledBy="footprint-heading">
      <h2
        id="footprint-heading"
        className="text-display-sm font-semibold tracking-tight text-foreground"
      >
        Digital Footprint
      </h2>
      <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted">
        Everywhere I build, ship, and share — pulled live, not just claimed.
      </p>

      <ul className="mt-12 flex list-none flex-col gap-6 sm:gap-8">
        <GithubRow />
        <NpmRow />
        <YoutubeRow />
      </ul>
    </Section>
  );
}

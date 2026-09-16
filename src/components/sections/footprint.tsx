import { Section } from "@/components/section";
import { GithubRow } from "@/components/footprint/github-row";
import { NpmRow } from "@/components/footprint/npm-row";
import { YoutubeRow } from "@/components/footprint/youtube-row";

export function Footprint() {
  return (
    <Section id="footprint" labelledBy="footprint-heading" variant="bleed">
      <h2
        id="footprint-heading"
        className="text-display-sm font-serif font-black tracking-tighter text-foreground"
      >
        Digital Footprint
      </h2>
      <p className="mt-4 max-w-xl text-lg text-muted">
        Everywhere I build, ship, and share — pulled live, not just claimed.
      </p>

      <ol className="-mx-4 mt-12 list-none border-t-2 border-foreground sm:-mx-6 lg:-mx-8">
        <GithubRow index={0} />
        <NpmRow index={1} />
        <YoutubeRow index={2} />
      </ol>
    </Section>
  );
}

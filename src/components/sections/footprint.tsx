import { Section } from "@/components/section";
import { GithubRow } from "@/components/footprint/github-row";
import { NpmRow } from "@/components/footprint/npm-row";
import { YoutubeRow } from "@/components/footprint/youtube-row";
import { LiveProjectsRow } from "@/components/footprint/live-projects-row";
import { StaggerList } from "@/components/footprint/stagger-list";

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

      <StaggerList>
        <GithubRow />
        <NpmRow />
        <YoutubeRow />
        <LiveProjectsRow />
      </StaggerList>
    </Section>
  );
}

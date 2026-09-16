import { experience } from "@/data/experience";
import { Section } from "@/components/section";
import { Panel } from "@/components/panel";

export function Experience() {
  return (
    <Section id="experience" labelledBy="experience-heading">
      <h2
        id="experience-heading"
        className="text-display-sm font-semibold tracking-tight text-foreground"
      >
        Experience
      </h2>

      <ul className="mt-12 flex list-none flex-col gap-6 sm:gap-8">
        {experience.map((job) => (
          <Panel as="li" key={`${job.company}-${job.role}`}>
            <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
              <div>
                <h3 className="text-xl font-semibold text-foreground">{job.role}</h3>
                <p className="text-sm text-muted">
                  {job.company} — {job.location}
                </p>
              </div>
              <p className="text-xs font-medium text-muted">
                {job.startDate} – {job.endDate}
              </p>
            </div>

            <ul className="mt-4 space-y-2">
              {job.highlights.map((point) => (
                <li key={point} className="flex gap-3 leading-relaxed text-muted">
                  <span
                    className="mt-2.5 size-1.5 shrink-0 rounded-full bg-accent"
                    aria-hidden="true"
                  />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </Panel>
        ))}
      </ul>
    </Section>
  );
}

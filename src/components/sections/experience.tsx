import { experience } from "@/data/experience";
import { Section } from "@/components/section";

export function Experience() {
  return (
    <Section id="experience" labelledBy="experience-heading" variant="bleed">
      <h2
        id="experience-heading"
        className="text-display-sm font-serif font-black tracking-tighter text-foreground"
      >
        Experience
      </h2>

      <ol className="-mx-4 mt-12 list-none border-t-2 border-foreground sm:-mx-6 lg:-mx-8">
        {experience.map((job, index) => (
          <li
            key={`${job.company}-${job.role}`}
            className="border-b-2 border-foreground px-4 py-8 sm:px-6 lg:px-8"
          >
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[5rem_1fr] lg:gap-8">
              <span className="font-mono text-sm text-accent">
                {String(index + 1).padStart(2, "0")}
              </span>

              <div>
                <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-foreground">{job.role}</h3>
                    <p className="font-mono text-sm text-muted">
                      {job.company} — {job.location}
                    </p>
                  </div>
                  <p className="font-mono text-xs tracking-wide text-muted uppercase">
                    {job.startDate} – {job.endDate}
                  </p>
                </div>

                <ul className="mt-4 space-y-2">
                  {job.highlights.map((point) => (
                    <li key={point} className="flex gap-3 text-muted">
                      <span
                        className="mt-2.5 size-1 shrink-0 bg-accent"
                        aria-hidden="true"
                      />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
}

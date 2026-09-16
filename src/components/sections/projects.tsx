import { projects } from "@/data/projects";
import { Section } from "@/components/section";
import { ProjectRow } from "@/components/sections/project-row";

export function Projects() {
  return (
    <Section id="projects" labelledBy="projects-heading" variant="bleed">
      <h2
        id="projects-heading"
        className="text-display-sm font-serif font-black tracking-tighter text-foreground"
      >
        Projects
      </h2>

      <ol className="-mx-4 mt-12 list-none border-t-2 border-foreground sm:-mx-6 lg:-mx-8">
        {projects.map((project, index) => (
          <ProjectRow key={project.title} project={project} index={index} />
        ))}
      </ol>
    </Section>
  );
}

import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { GithubIcon } from "@/components/icons";
import { PlaceholderArt } from "@/components/placeholder-art";
import type { Project } from "@/data/projects";

interface ProjectRowProps {
  project: Project;
  index: number;
}

export function ProjectRow({ project, index }: ProjectRowProps) {
  return (
    <li className="group border-b-2 border-foreground px-4 py-8 transition-colors hover:bg-foreground hover:text-background sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[3rem_11rem_1fr_auto] lg:items-center lg:gap-8">
        <span className="font-mono text-sm text-accent group-hover:text-background">
          {String(index + 1).padStart(2, "0")}
        </span>

        <div className="aspect-video w-full overflow-hidden lg:w-44">
          {project.image ? (
            <Image
              src={project.image}
              alt={`${project.title} preview`}
              width={352}
              height={198}
              className="size-full object-cover"
            />
          ) : (
            <PlaceholderArt index={index} className="size-full" />
          )}
        </div>

        <div>
          <h3 className="text-xl font-bold">{project.title}</h3>
          <p className="mt-2 text-muted group-hover:text-background">
            {project.description}
          </p>
          <p className="mt-3 font-mono text-xs tracking-wide text-muted uppercase group-hover:text-background">
            {project.tags.join(" / ")}
          </p>
        </div>

        <div className="flex items-center gap-6 lg:justify-end">
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${project.title} live site`}
              className="inline-flex items-center gap-1.5 font-mono text-xs tracking-wide uppercase group-hover:text-background hover:underline"
            >
              <ExternalLink className="size-3.5" />
              Live
            </a>
          )}
          {project.repoUrl && (
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${project.title} source code`}
              className="inline-flex items-center gap-1.5 font-mono text-xs tracking-wide uppercase group-hover:text-background hover:underline"
            >
              <GithubIcon className="size-3.5" />
              Code
            </a>
          )}
        </div>
      </div>
    </li>
  );
}

import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { liveProjects, type LiveProject } from "@/data/live-projects";

const CASE_STUDIES_DIR = path.join(process.cwd(), "content", "case-studies");

interface CaseStudyFrontmatter {
  title: string;
  tagline: string;
  // Slug of the project in src/data/live-projects.ts. Its stack, links and
  // screenshots are read from there instead of being repeated in the MDX.
  project: string;
  role: string;
  date: string;
}

export interface CaseStudy extends CaseStudyFrontmatter {
  slug: string;
  liveProject: LiveProject;
  content: string;
}

function getSlugs(): string[] {
  if (!fs.existsSync(CASE_STUDIES_DIR)) return [];
  return fs
    .readdirSync(CASE_STUDIES_DIR)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => file.replace(/\.mdx$/, ""));
}

function readCaseStudy(slug: string): CaseStudy | null {
  const filePath = path.join(CASE_STUDIES_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;

  const { data, content } = matter(fs.readFileSync(filePath, "utf8"));
  const frontmatter = data as CaseStudyFrontmatter;

  // Fail the build on a mistyped project instead of rendering a half-empty page.
  const liveProject = liveProjects.find((project) => project.slug === frontmatter.project);
  if (!liveProject) {
    throw new Error(
      `Case study "${slug}" references unknown project "${frontmatter.project}". Check src/data/live-projects.ts.`,
    );
  }

  return { slug, ...frontmatter, liveProject, content };
}

export function getAllCaseStudies(): CaseStudy[] {
  return getSlugs()
    .map((slug) => readCaseStudy(slug))
    .filter((study): study is CaseStudy => study !== null)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getCaseStudyBySlug(slug: string): CaseStudy | null {
  return readCaseStudy(slug);
}

// The case study (if any) written for a given live project, so the project
// modal can link to it without the project data knowing about case studies.
export function getCaseStudySlugForProject(projectSlug: string): string | null {
  return getAllCaseStudies().find((study) => study.project === projectSlug)?.slug ?? null;
}

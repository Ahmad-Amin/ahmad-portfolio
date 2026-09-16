export interface Project {
  title: string;
  description: string;
  tags: string[];
  liveUrl?: string;
  repoUrl?: string;
  image?: string;
}

export const projects: Project[] = [
  {
    title: "Project One",
    description:
      "A short, punchy description of what this project does and the problem it solves for its users.",
    tags: ["Next.js", "TypeScript", "Tailwind"],
    liveUrl: "https://example.com",
    repoUrl: "https://github.com/yourusername/project-one",
  },
  {
    title: "Project Two",
    description:
      "A short, punchy description of what this project does and the problem it solves for its users.",
    tags: ["React", "Node.js", "PostgreSQL"],
    liveUrl: "https://example.com",
    repoUrl: "https://github.com/yourusername/project-two",
  },
  {
    title: "Project Three",
    description:
      "A short, punchy description of what this project does and the problem it solves for its users.",
    tags: ["React Native", "Expo"],
    repoUrl: "https://github.com/yourusername/project-three",
  },
  {
    title: "Project Four",
    description:
      "A short, punchy description of what this project does and the problem it solves for its users.",
    tags: ["Python", "FastAPI", "Docker"],
    liveUrl: "https://example.com",
  },
];

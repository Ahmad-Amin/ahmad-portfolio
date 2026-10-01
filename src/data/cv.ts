// Details from the downloadable CV (public/Ahmad-Amin-front-CV.pdf) that the rest
// of the site doesn't show. The chatbot reads this so it can answer questions about
// them. It is a copy: update it here when the CV changes.

// The About paragraph from the CV: a fuller professional summary than the site's bio.
export const summary =
  "An experienced Full-Stack Developer with expertise in Ruby on Rails, React, Next.js, Nuxt 3, Python, and Applied AI. With 5+ years in the field, I've led projects from concept to deployment, improving system performance and user engagement. I build scalable APIs and polished front-ends, integrate CI/CD and automated testing, and develop AI-powered features by integrating LLMs into existing and new web applications. I ship reliably on AWS/Docker and am comfortable partnering with cross-functional teams to translate requirements into maintainable solutions while championing best practices for clean, efficient code.";

// The CV marks these two roles "(Remote)"; the site's experience section doesn't.
export const remoteRoles = ["Bitrock", "American Contractor Organization"];

export const education = [
  {
    school: "National University of Science & Technology",
    detail: "Student of Bachelor in Software Engineering (2018-22)",
  },
];

export const skills: Record<string, string[]> = {
  Frontend: [
    "JavaScript",
    "HTML/CSS",
    "React",
    "Angular",
    "Vue",
    "Next.js",
    "TailwindCSS",
    "TypeScript",
    "Nuxt.js",
    "Redux",
  ],
  Backend: ["PHP", "Python", "Ruby on Rails", "Node.js", "Express.js"],
  Databases: ["PostgreSQL", "MySQL", "MongoDB", "Supabase", "Firebase Firestore"],
  Other: ["AWS Solution Architect", "GraphQL"],
};

// Only these are certificates; the skills above are not certifications.
// `url` is the verification link printed on the CV.
export const certificates = [
  { name: "System Design Expert (AlgoExpert)", url: "https://certificate.algoexpert.io/SE-07cc5c5265" },
  { name: "React Developer (Udemy)", url: "http://ude.my/UC-18f3d120-0591-437b-95c9-c9f3d120f1af" },
];

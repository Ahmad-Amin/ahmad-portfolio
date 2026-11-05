import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Calendar, Cloud, Database, Mail, Monitor, Server, Sparkles, type LucideIcon } from "lucide-react";
import clsx from "clsx";
import { Section } from "@/components/section";
import { PageTransition } from "@/components/page-transition";
import { Panel } from "@/components/panel";
import { BootIn, BootItem } from "@/components/boot-in";
import { SocialLinks } from "@/components/social-links";
import { profile } from "@/data/profile";
import { experience } from "@/data/experience";
import { liveProjects } from "@/data/live-projects";
import { education, skills } from "@/data/cv";
import { socials } from "@/data/socials";
import { getAllSeries } from "@/lib/blog";
import { getAllCaseStudies } from "@/lib/case-studies";
import { feedPath, siteUrl } from "@/lib/site";

const description = `${profile.name} is a full-stack AI developer and the writer behind ${profile.brand}. What he builds, what he writes about, and where to find him.`;

export const metadata: Metadata = {
  title: `About ${profile.name}`,
  description,
  // Page-level `alternates` replaces the layout's, so the RSS link is repeated here.
  alternates: { canonical: "/about", types: { "application/rss+xml": feedPath } },
  openGraph: {
    title: `About ${profile.name}`,
    description,
    type: "profile",
    url: `${siteUrl}/about`,
    siteName: profile.brand,
  },
};

// One icon per skills group in src/data/cv.ts; an unknown group gets a plain dot-free default.
const SKILL_ICONS: Record<string, LucideIcon> = {
  "AI & LLMs": Sparkles,
  Frontend: Monitor,
  Backend: Server,
  Databases: Database,
  Other: Cloud,
};

// What the posts and channel actually cover, as machine-readable topics.
const KNOWS_ABOUT = [
  "Large language model (LLM) integration",
  "AI-powered applications",
  "PostgreSQL",
  "Apache Kafka",
  "Database indexing",
  "Load balancing",
  "Next.js",
  "React",
  "Ruby on Rails",
  "AWS",
  "AI agents",
  "Cybersecurity",
];

export default function AboutPage() {
  const allSeries = getAllSeries();
  const caseStudyByProject = new Map(
    getAllCaseStudies().map((study) => [study.project, `/case-studies/${study.slug}`]),
  );
  const current = experience.find((job) => job.endDate === "Present") ?? experience[0];

  // Ties this page to the homepage's Person (same @id), so search engines and AI
  // assistants treat the site, the author and the profiles as one entity.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "@id": `${siteUrl}/about#page`,
    url: `${siteUrl}/about`,
    name: `About ${profile.name}`,
    mainEntity: {
      "@type": "Person",
      "@id": `${siteUrl}/#person`,
      name: profile.name,
      alternateName: profile.brand,
      jobTitle: profile.role,
      description: profile.bio[0],
      url: siteUrl,
      image: `${siteUrl}/about/ahmad-amin.jpg`,
      sameAs: socials.map((social) => social.url),
      knowsAbout: KNOWS_ABOUT,
      ...(current.endDate === "Present"
        ? { worksFor: { "@type": "Organization", name: current.company } }
        : {}),
    },
  };

  return (
    <PageTransition>
      <script
        type="application/ld+json"
        // JSON.stringify output of our own data, not user input.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Section id="about" labelledBy="about-heading" className="pt-32 sm:pt-40">
        <BootIn className="mx-auto max-w-4xl">
          <BootItem className="grid items-start gap-8 md:grid-cols-[18rem_1fr] md:gap-12">
            <div className="relative aspect-4/5 w-full max-w-72 overflow-hidden rounded-xl border border-border bg-surface">
              <Image
                src="/about/ahmad-amin.jpg"
                alt={`Portrait of ${profile.name}`}
                fill
                priority
                sizes="(min-width: 768px) 288px, 80vw"
                className="object-cover"
              />
            </div>

            <div>
              <p className="text-xs font-semibold tracking-wide text-accent uppercase">About</p>
              <h1
                id="about-heading"
                className="mt-2 text-display-sm font-semibold tracking-tight text-foreground"
              >
                {profile.name}
              </h1>
              <p className="mt-2 text-lg font-medium text-accent">{profile.role}</p>

              <p className="mt-6 text-lg leading-relaxed text-muted">{profile.bio[0]}</p>
              <p className="mt-4 text-lg leading-relaxed text-muted">
                {profile.brand} is my blog and YouTube channel. I write about how backend
                systems actually work, like PostgreSQL, Kafka and load balancers, and every
                Sunday I cover the security and AI news that matters to developers.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <a
                  href={profile.bookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
                >
                  <Calendar className="size-4" />
                  Book a 15 minute call
                </a>
                <a
                  href={`mailto:${profile.email}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-accent/40 hover:text-accent"
                >
                  <Mail className="size-4" />
                  Email
                </a>
              </div>
            </div>
          </BootItem>

          <BootItem className="mt-16">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              What I write about
            </h2>
            <ul className="mt-6 grid list-none gap-4 sm:grid-cols-3">
              {allSeries.map((entry) => (
                <li key={entry.slug}>
                  <Panel as="div" shadow="subtle" className="h-full p-5 sm:p-5">
                    <h3 className="text-base font-semibold text-foreground">
                      <Link
                        href={`/blog/series/${entry.slug}`}
                        className="transition-colors hover:text-accent"
                      >
                        {entry.title}
                      </Link>
                    </h3>
                    <p className="mt-1 text-xs font-medium text-muted">
                      {entry.posts.length} {entry.posts.length === 1 ? "part" : "parts"}
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-muted">{entry.description}</p>
                  </Panel>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm">
              <Link
                href="/blog"
                className="font-medium text-accent underline underline-offset-4 hover:opacity-80"
              >
                Read all posts
              </Link>
              {" · "}
              <a
                href={socials.find((s) => s.platform === "YouTube")?.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-accent underline underline-offset-4 hover:opacity-80"
              >
                Watch on YouTube
              </a>
            </p>
          </BootItem>

          <BootItem className="mt-16">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              What I&apos;ve built
            </h2>
            <ul className="mt-6 flex list-none flex-col gap-4">
              {liveProjects.map((project) => {
                const caseStudy = caseStudyByProject.get(project.slug);
                return (
                  <li key={project.slug}>
                    <Panel as="div" shadow="subtle" className="p-5 sm:p-6">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <h3 className="text-lg font-semibold text-foreground">{project.title}</h3>
                        <div className="flex items-center gap-4 text-sm font-medium">
                          {caseStudy && (
                            <Link href={caseStudy} className="text-accent hover:underline">
                              Case study
                            </Link>
                          )}
                          <a
                            href={project.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-accent hover:underline"
                          >
                            Visit
                            <ArrowUpRight className="size-3.5" />
                          </a>
                        </div>
                      </div>
                      <p className="mt-2 leading-relaxed text-muted">{project.tagline}</p>
                    </Panel>
                  </li>
                );
              })}
            </ul>
          </BootItem>

          <BootItem className="mt-16">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">Work and skills</h2>
            <p className="mt-4 text-lg leading-relaxed text-muted">
              Currently {current.role} at {current.company} ({current.startDate} to{" "}
              {current.endDate}). See the full{" "}
              <Link
                href="/#experience"
                className="text-accent underline underline-offset-4 hover:opacity-80"
              >
                work history
              </Link>
              .
            </p>
            <p className="mt-4 text-lg leading-relaxed text-muted">
              Outside the day job I build AI-powered products.{" "}
              {caseStudyByProject.get("ai-expense-tracker") ? (
                <Link
                  href={caseStudyByProject.get("ai-expense-tracker")!}
                  className="text-accent underline underline-offset-4 hover:opacity-80"
                >
                  FinScan AI
                </Link>
              ) : (
                "FinScan AI"
              )}{" "}
              uses the OpenAI API to turn receipts and bank messages into structured expense
              records, and the assistant on this site runs on Claude through the Vercel AI SDK,
              with tool calling and streamed replies.
            </p>
            <ul className="mt-8 grid list-none gap-4 sm:grid-cols-2">
              {Object.entries(skills).map(([group, items]) => {
                const Icon = SKILL_ICONS[group] ?? Cloud;
                const featured = group === "AI & LLMs";
                return (
                  <li key={group} className={clsx(featured && "sm:col-span-2")}>
                    <div
                      className={clsx(
                        "h-full rounded-xl border p-5",
                        featured
                          ? "border-accent/30 bg-accent/5"
                          : "border-border bg-surface",
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={clsx(
                            "flex size-9 shrink-0 items-center justify-center rounded-md",
                            featured
                              ? "bg-accent text-accent-foreground"
                              : "bg-accent/10 text-accent",
                          )}
                        >
                          <Icon className="size-4" />
                        </span>
                        <h3 className="text-base font-semibold text-foreground">{group}</h3>
                      </div>
                      <ul className="mt-4 flex list-none flex-wrap gap-2">
                        {items.map((item) => (
                          <li
                            key={item}
                            className={clsx(
                              "rounded-full border px-3 py-1 text-sm",
                              featured
                                ? "border-accent/30 bg-accent/10 text-accent"
                                : "border-border bg-background/60 text-foreground",
                            )}
                          >
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </li>
                );
              })}
            </ul>
            {education[0] && (
              <p className="mt-6 text-sm text-muted">
                Education: {education[0].school}, {education[0].detail}.
              </p>
            )}
          </BootItem>

          <BootItem className="mt-16">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">Find me online</h2>
            <div className="mt-4">
              <SocialLinks variant="text" />
            </div>
          </BootItem>
        </BootIn>
      </Section>
    </PageTransition>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { ArrowUpRight } from "lucide-react";
import { getAllCaseStudies, getCaseStudyBySlug } from "@/lib/case-studies";
import { mdxComponents } from "@/components/mdx-components";
import { mdxOptions } from "@/lib/mdx";
import { Section } from "@/components/section";
import { BootIn, BootItem } from "@/components/boot-in";
import { profile } from "@/data/profile";
import { siteUrl } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllCaseStudies().map((study) => ({ slug: study.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/case-studies/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const study = getCaseStudyBySlug(slug);
  if (!study) return {};

  const title = `${study.title} case study`;
  return {
    title,
    description: study.tagline,
    alternates: { canonical: `${siteUrl}/case-studies/${study.slug}` },
    openGraph: {
      title,
      description: study.tagline,
      type: "article",
      url: `${siteUrl}/case-studies/${study.slug}`,
      siteName: profile.brand,
    },
    twitter: { card: "summary_large_image", title, description: study.tagline },
  };
}

export default async function CaseStudyPage({ params }: PageProps<"/case-studies/[slug]">) {
  const { slug } = await params;
  const study = getCaseStudyBySlug(slug);
  if (!study) notFound();

  const { liveProject } = study;

  return (
    <Section id="case-study" labelledBy="case-study-heading" className="pt-32 sm:pt-40">
      <div className="mx-auto max-w-2xl">
        <BootIn>
          <BootItem>
            <p className="text-xs font-semibold tracking-wide text-accent uppercase">Case study</p>
            <h1
              id="case-study-heading"
              className="mt-2 text-display-sm font-semibold tracking-tight text-foreground"
            >
              {study.title}
            </h1>
          </BootItem>
          <BootItem>
            <p className="mt-4 text-lg leading-relaxed text-muted">{study.tagline}</p>
          </BootItem>

          <BootItem>
            <dl className="mt-8 grid gap-6 border-y border-border py-6 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold tracking-wide text-muted uppercase">Role</dt>
                <dd className="mt-1 text-sm text-foreground">{study.role}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold tracking-wide text-muted uppercase">Live</dt>
                <dd className="mt-1 text-sm">
                  <a
                    href={liveProject.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-accent underline underline-offset-4 hover:opacity-80"
                  >
                    {liveProject.url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                    <ArrowUpRight className="size-3.5" />
                  </a>
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs font-semibold tracking-wide text-muted uppercase">Built with</dt>
                <dd className="mt-2 flex flex-wrap gap-2">
                  {liveProject.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent"
                    >
                      {tech}
                    </span>
                  ))}
                </dd>
              </div>
            </dl>
          </BootItem>
        </BootIn>

        <article>
          <MDXRemote source={study.content} components={mdxComponents} options={{ mdxOptions }} />
        </article>

        <div className="mt-16 border-t border-border pt-8">
          <p className="text-lg font-semibold text-foreground">Building something similar?</p>
          <p className="mt-2 text-muted">
            I take on full-stack and infrastructure work. The quickest way to start is a short call.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <a
              href={profile.bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full bg-accent px-6 py-3 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
            >
              Book a 15 minute call
            </a>
            <Link
              href="/#footprint"
              className="px-2 py-3 text-sm font-medium text-foreground transition-colors hover:text-accent"
            >
              See other projects
            </Link>
          </div>
        </div>
      </div>
    </Section>
  );
}

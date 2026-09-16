import { Suspense } from "react";
import { profile } from "@/data/profile";
import { SocialLinks } from "@/components/social-links";
import { GithubActivity } from "@/components/github-activity";
import { Section } from "@/components/section";

export function Contact() {
  return (
    <Section id="contact" labelledBy="contact-heading">
      <h2
        id="contact-heading"
        className="text-display-sm font-serif font-black tracking-tighter text-foreground"
      >
        Let&apos;s Work Together
      </h2>
      <p className="mt-4 max-w-md text-lg text-muted">
        Have a project in mind or just want to say hello? My inbox is always open.
      </p>
      <a
        href={`mailto:${profile.email}`}
        className="mt-10 block text-display font-serif font-black tracking-tighter text-foreground wrap-anywhere transition-colors hover:text-accent"
      >
        {profile.email}
      </a>

      <div className="mt-12 flex flex-col gap-8 border-t-2 border-foreground pt-8">
        <SocialLinks variant="text" />
        <Suspense fallback={null}>
          <GithubActivity />
        </Suspense>
      </div>
    </Section>
  );
}

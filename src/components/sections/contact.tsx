import { Download } from "lucide-react";
import { profile } from "@/data/profile";
import { SocialLinks } from "@/components/social-links";
import { Section } from "@/components/section";

export function Contact() {
  return (
    <Section id="contact" labelledBy="contact-heading">
      <div className="mx-auto max-w-2xl text-center">
        <h2
          id="contact-heading"
          className="text-display-sm font-semibold tracking-tight text-foreground"
        >
          Let&apos;s Work Together
        </h2>
        <p className="mt-4 text-lg leading-relaxed text-muted">
          Have a project in mind or just want to say hello? My inbox is always open.
        </p>
        <a
          href={`mailto:${profile.email}`}
          className="mt-8 block text-display font-semibold tracking-tight text-foreground wrap-anywhere transition-colors hover:text-accent"
        >
          {profile.email}
        </a>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <a
            href="/ahmad-amin-cv.pdf"
            download
            className="inline-flex items-center gap-1.5 rounded-full bg-accent px-6 py-3 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
          >
            <Download className="size-4" />
            Download CV
          </a>
        </div>

        <div className="mt-10 border-t border-border pt-8">
          <SocialLinks variant="text" className="justify-center" />
        </div>
      </div>
    </Section>
  );
}

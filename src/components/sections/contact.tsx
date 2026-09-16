import { Download } from "lucide-react";
import { profile } from "@/data/profile";
import { SocialLinks } from "@/components/social-links";
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

      <div className="mt-12 flex flex-col gap-6 border-t-2 border-foreground pt-8 sm:flex-row sm:items-center sm:justify-between">
        <SocialLinks variant="text" />
        <a
          href="/ahmad-amin-cv.pdf"
          download
          className="group inline-flex w-fit items-center gap-1.5 border-b-2 border-foreground pb-1 font-mono text-sm tracking-wide text-foreground uppercase transition-colors hover:border-accent hover:text-accent"
        >
          <Download className="size-4" />
          Download CV
        </a>
      </div>
    </Section>
  );
}

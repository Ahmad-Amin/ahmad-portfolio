import type { Metadata } from "next";
import { PageTransition } from "@/components/page-transition";
import { Hero } from "@/components/sections/hero";
import { Footprint } from "@/components/sections/footprint";
import { Experience } from "@/components/sections/experience";
import { Testimonials } from "@/components/sections/testimonials";
import { Contact } from "@/components/sections/contact";
import { profile } from "@/data/profile";
import { socials } from "@/data/socials";
import { feedPath, siteUrl } from "@/lib/site";

// Page-level `alternates` replaces the layout's, so the RSS link is repeated here.
export const metadata: Metadata = {
  alternates: { canonical: "/", types: { "application/rss+xml": feedPath } },
};

// Tells search engines who the site is about and ties the profiles together, which
// helps a search for the name show the right site and links.
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      name: profile.brand,
      url: siteUrl,
      description: profile.tagline,
      inLanguage: "en",
      publisher: { "@id": `${siteUrl}/#person` },
    },
    {
      "@type": "Person",
      "@id": `${siteUrl}/#person`,
      name: profile.name,
      alternateName: profile.brand,
      jobTitle: profile.role,
      url: siteUrl,
      sameAs: socials.map((social) => social.url),
    },
  ],
};

export default function Home() {
  return (
    <PageTransition>
      <script
        type="application/ld+json"
        // JSON.stringify output of our own data, not user input.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Hero />
      <Footprint />
      <Experience />
      <Testimonials />
      <Contact />
    </PageTransition>
  );
}

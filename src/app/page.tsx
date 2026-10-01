import { PageTransition } from "@/components/page-transition";
import { Hero } from "@/components/sections/hero";
import { Footprint } from "@/components/sections/footprint";
import { Experience } from "@/components/sections/experience";
import { Testimonials } from "@/components/sections/testimonials";
import { Contact } from "@/components/sections/contact";

export default function Home() {
  return (
    <PageTransition>
      <Hero />
      <Footprint />
      <Experience />
      <Testimonials />
      <Contact />
    </PageTransition>
  );
}

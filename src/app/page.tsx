import { Hero } from "@/components/sections/hero";
import { Footprint } from "@/components/sections/footprint";
import { Experience } from "@/components/sections/experience";
import { Testimonials } from "@/components/sections/testimonials";
import { Contact } from "@/components/sections/contact";

export default function Home() {
  return (
    <>
      <Hero />
      <Footprint />
      <Experience />
      <Testimonials />
      <Contact />
    </>
  );
}

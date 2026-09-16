import { Hero } from "@/components/sections/hero";
import { Footprint } from "@/components/sections/footprint";
import { Experience } from "@/components/sections/experience";
import { Contact } from "@/components/sections/contact";

export default function Home() {
  return (
    <>
      <Hero />
      <Footprint />
      <Experience />
      <Contact />
    </>
  );
}

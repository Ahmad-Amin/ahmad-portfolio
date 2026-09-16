import { services } from "@/data/services";
import { Section } from "@/components/section";

export function Services() {
  return (
    <Section id="services" labelledBy="services-heading" variant="bleed">
      <h2
        id="services-heading"
        className="text-display-sm font-serif font-black tracking-tighter text-foreground"
      >
        Services
      </h2>

      <ol className="-mx-4 mt-12 list-none border-t-2 border-foreground sm:-mx-6 lg:-mx-8">
        {services.map((service, index) => (
          <li
            key={service.title}
            className="border-b-2 border-foreground px-4 py-8 sm:px-6 lg:px-8"
          >
            <div className="grid grid-cols-1 gap-2 lg:grid-cols-[5rem_16rem_1fr] lg:items-baseline lg:gap-8">
              <span className="font-mono text-sm text-accent">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="text-xl font-bold text-foreground">{service.title}</h3>
              <p className="text-muted lg:max-w-2xl">{service.description}</p>
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
}

import { profile } from "@/data/profile";

// "TechWithSwag" -> ["TechWith", "Swag"]: the last capitalised word gets the accent.
function splitBrand(brand: string): [string, string] {
  const match = brand.match(/^(.*?)([A-Z][a-z]*)$/);
  return match ? [match[1], match[2]] : [brand, ""];
}

// Expects an ancestor with the `group/brand` class so the underline can react to hover.
export function BrandWordmark() {
  const [lead, accent] = splitBrand(profile.brand);

  return (
    <span className="inline-flex items-baseline text-[1.1875rem] leading-none font-extrabold tracking-[-0.045em]">
      <span className="text-foreground">{lead}</span>
      {accent && (
        <span className="relative">
          <span className="bg-linear-to-r from-accent to-[color-mix(in_oklch,var(--accent),oklch(0.78_0.13_205)_50%)] bg-clip-text text-transparent">
            {accent}
          </span>
          <span
            aria-hidden="true"
            className="absolute inset-x-0 -bottom-1.5 h-0.5 origin-left scale-x-0 rounded-full bg-accent transition-transform duration-300 ease-out group-hover/brand:scale-x-100 motion-reduce:transition-none"
          />
        </span>
      )}
    </span>
  );
}

import clsx from "clsx";

const variants = [
  "linear-gradient(135deg, var(--accent) 0%, var(--accent) 45%, var(--surface) 45%, var(--surface) 100%)",
  "linear-gradient(45deg, var(--surface) 0%, var(--surface) 65%, var(--foreground) 65%, var(--foreground) 100%)",
  "linear-gradient(90deg, var(--surface) 0%, var(--surface) 60%, var(--accent) 60%, var(--accent) 100%)",
  "linear-gradient(180deg, var(--accent) 0%, var(--accent) 30%, var(--surface) 30%, var(--surface) 100%)",
];

interface PlaceholderArtProps {
  index?: number;
  className?: string;
}

export function PlaceholderArt({ index = 0, className }: PlaceholderArtProps) {
  const variant = variants[index % variants.length];

  return (
    <div
      aria-hidden="true"
      className={clsx("relative overflow-hidden", className)}
      style={{ backgroundImage: variant }}
    >
      <div
        className="absolute inset-0 opacity-[0.2]"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--foreground) 1px, transparent 1px), linear-gradient(to bottom, var(--foreground) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
    </div>
  );
}

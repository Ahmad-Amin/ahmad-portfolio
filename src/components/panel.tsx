import type { ElementType, ReactNode } from "react";
import clsx from "clsx";

interface PanelProps {
  as?: ElementType;
  className?: string;
  children: ReactNode;
  shadow?: "default" | "subtle" | "none";
}

const shadowClasses = {
  default: "shadow-[0_8px_30px_rgb(0,0,0,0.06)]",
  subtle: "shadow-[0_2px_10px_rgb(0,0,0,0.03)]",
  none: "shadow-none",
};

export function Panel({ as: Tag = "div", className, children, shadow = "default" }: PanelProps) {
  return (
    <Tag
      className={clsx(
        "rounded-3xl border border-border bg-surface p-6 sm:p-8",
        shadowClasses[shadow],
        className,
      )}
    >
      {children}
    </Tag>
  );
}

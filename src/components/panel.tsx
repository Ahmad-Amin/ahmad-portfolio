import type { ElementType, ReactNode } from "react";
import clsx from "clsx";

interface PanelProps {
  as?: ElementType;
  className?: string;
  children: ReactNode;
}

export function Panel({ as: Tag = "div", className, children }: PanelProps) {
  return (
    <Tag
      className={clsx(
        "rounded-3xl bg-surface p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] sm:p-8",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

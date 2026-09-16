import type { ComponentType, SVGProps } from "react";
import { GithubIcon, LinkedinIcon, XIcon } from "@/components/icons";

export interface Social {
  platform: string;
  url: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}

export const socials: Social[] = [
  { platform: "GitHub", url: "https://github.com/Ahmad-Amin", icon: GithubIcon },
  {
    platform: "LinkedIn",
    url: "https://www.linkedin.com/in/ahmad-amin-8561b3173/",
    icon: LinkedinIcon,
  },
  { platform: "X", url: "https://x.com/yourusername", icon: XIcon },
];

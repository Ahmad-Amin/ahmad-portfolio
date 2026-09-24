import type { ComponentType, SVGProps } from "react";
import { GithubIcon, LinkedinIcon, YoutubeIcon } from "@/components/icons";

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
  // Channel ID matches TECHWITHSWAG_CHANNEL_ID in src/lib/youtube.ts.
  {
    platform: "YouTube",
    url: "https://www.youtube.com/channel/UCW5W5TuR0oIPRkW-lqEAs8g",
    icon: YoutubeIcon,
  },
];

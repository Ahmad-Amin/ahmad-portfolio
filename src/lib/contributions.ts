import { getContributionsForYear, type ContributionDay, type YearlyContributions } from "@/lib/github";
import { getGitlabDailyCounts } from "@/lib/gitlab";

// GitHub's own quartile levels no longer apply once GitLab counts are added
// in, so intensity is recomputed relative to the combined data's own range.
function levelFromRatio(count: number, maxCount: number): number {
  if (count === 0 || maxCount <= 0) return 0;
  const ratio = count / maxCount;
  if (ratio > 0.75) return 4;
  if (ratio > 0.5) return 3;
  if (ratio > 0.25) return 2;
  return 1;
}

function mergeWithGitlab(
  days: ContributionDay[],
  gitlabCounts: Record<string, number>,
): ContributionDay[] {
  const merged = days.map((day) => ({
    ...day,
    count: day.count + (gitlabCounts[day.date] ?? 0),
  }));
  const maxCount = Math.max(0, ...merged.map((day) => day.count));
  return merged.map((day) => ({ ...day, level: levelFromRatio(day.count, maxCount) }));
}

// GitLab's calendar can only ever report the current rolling ~12 months (see
// lib/gitlab.ts), so combining is only meaningful for the current year — any
// year explicitly picked from the year selector falls back to GitHub-only,
// which is still correct data, just not merged.
export async function getCombinedContributionsForYear(
  username: string,
  year: number,
): Promise<YearlyContributions | null> {
  const githubData = await getContributionsForYear(username, year);
  if (!githubData) return null;

  const isCurrentYear = year === new Date().getUTCFullYear();
  if (!isCurrentYear) return githubData;

  const gitlabCounts = await getGitlabDailyCounts();
  if (!gitlabCounts) return githubData;

  const days = mergeWithGitlab(githubData.days, gitlabCounts);
  const totalContributions = days.reduce((sum, day) => sum + day.count, 0);
  return { totalContributions, days };
}

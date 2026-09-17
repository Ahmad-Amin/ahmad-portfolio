import { getGithubUsername, MIN_CONTRIBUTION_YEAR } from "@/lib/github";
import { getCombinedContributionsForYear } from "@/lib/contributions";

export async function GET(request: Request) {
  const yearParam = new URL(request.url).searchParams.get("year");
  const year = yearParam ? Number(yearParam) : NaN;
  const currentYear = new Date().getUTCFullYear();

  if (!Number.isInteger(year) || year < MIN_CONTRIBUTION_YEAR || year > currentYear) {
    return new Response("Invalid year.", { status: 400 });
  }

  const username = getGithubUsername();
  if (!username) {
    return new Response("GitHub username not configured.", { status: 503 });
  }

  const contributions = await getCombinedContributionsForYear(username, year);
  if (!contributions) {
    return new Response("GitHub contributions are temporarily unavailable.", { status: 503 });
  }

  return Response.json(contributions);
}

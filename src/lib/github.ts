import { socials } from "@/data/socials";

// Earliest year selectable in the contribution graph's year picker.
export const MIN_CONTRIBUTION_YEAR = 2018;

export interface ContributionDay {
  date: string;
  count: number;
  level: number;
}

export interface TopRepo {
  name: string;
  description: string | null;
  url: string;
  stars: number;
  language: string | null;
}

export interface GithubActivity {
  publicRepos: number;
  followers: number;
  stars: number;
  totalContributions: number;
  days: ContributionDay[];
  topRepos: TopRepo[];
}

export function getGithubUsername(): string | null {
  const github = socials.find((social) => social.platform === "GitHub");
  if (!github) return null;

  try {
    return new URL(github.url).pathname.replaceAll("/", "");
  } catch {
    return null;
  }
}

const CONTRIBUTION_LEVEL: Record<string, number> = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
};

const REPO_FIELDS = `
  name
  description
  url
  stargazerCount
  primaryLanguage {
    name
  }
`;

const BASE_QUERY_FIELDS = `
  followers {
    totalCount
  }
  repositories(first: 100, ownerAffiliations: OWNER, isFork: false) {
    totalCount
    nodes {
      stargazerCount
    }
  }
  contributionsCollection {
    contributionCalendar {
      totalContributions
      weeks {
        contributionDays {
          date
          contributionCount
          contributionLevel
        }
      }
    }
  }
`;

interface RawRepoNode {
  name: string;
  description: string | null;
  url: string;
  stargazerCount: number;
  primaryLanguage: { name: string } | null;
}

function toTopRepo(repo: RawRepoNode): TopRepo {
  return {
    name: repo.name,
    description: repo.description,
    url: repo.url,
    stars: repo.stargazerCount,
    language: repo.primaryLanguage?.name ?? null,
  };
}

// When no explicit list is given, fall back to auto-picking the most-starred
// owned repos rather than showing nothing.
function buildQuery(featuredNames: string[]): string {
  if (featuredNames.length === 0) {
    return `
      query($username: String!) {
        user(login: $username) {
          ${BASE_QUERY_FIELDS}
          topRepos: repositories(
            first: 6
            ownerAffiliations: OWNER
            isFork: false
            orderBy: { field: STARGAZERS, direction: DESC }
          ) {
            nodes {
              ${REPO_FIELDS}
            }
          }
        }
      }
    `;
  }

  const repoVarDefs = featuredNames.map((_, i) => `$repoName${i}: String!`).join(", ");
  const repoFields = featuredNames
    .map(
      (_, i) => `repo${i}: repository(owner: $username, name: $repoName${i}) { ${REPO_FIELDS} }`,
    )
    .join("\n");

  return `
    query($username: String!, ${repoVarDefs}) {
      user(login: $username) {
        ${BASE_QUERY_FIELDS}
      }
      ${repoFields}
    }
  `;
}

interface GraphQLResponse {
  data?: {
    user: {
      followers: { totalCount: number };
      repositories: { totalCount: number; nodes: { stargazerCount: number }[] };
      topRepos?: { nodes: RawRepoNode[] };
      contributionsCollection: {
        contributionCalendar: {
          totalContributions: number;
          weeks: {
            contributionDays: {
              date: string;
              contributionCount: number;
              contributionLevel: string;
            }[];
          }[];
        };
      };
    } | null;
    [key: string]: unknown;
  };
  errors?: { message: string }[];
}

const CONTRIBUTIONS_QUERY = `
  query($username: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $username) {
      contributionsCollection(from: $from, to: $to) {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
              contributionLevel
            }
          }
        }
      }
    }
  }
`;

interface ContributionsOnlyResponse {
  data?: {
    user: {
      contributionsCollection: {
        contributionCalendar: {
          totalContributions: number;
          weeks: {
            contributionDays: {
              date: string;
              contributionCount: number;
              contributionLevel: string;
            }[];
          }[];
        };
      };
    } | null;
  };
}

export interface YearlyContributions {
  totalContributions: number;
  days: ContributionDay[];
}

// A same-calendar-year range (confirmed against the live API: 365/366 days
// back with no errors) — crossing into the next year risks the API's 1-year
// max-range limit for no benefit, since callers already key data by year.
export async function getContributionsForYear(
  username: string,
  year: number,
): Promise<YearlyContributions | null> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return null;

  const from = `${year}-01-01T00:00:00Z`;
  const to = `${year}-12-31T23:59:59Z`;
  const isPastYear = year < new Date().getUTCFullYear();

  try {
    const res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: CONTRIBUTIONS_QUERY, variables: { username, from, to } }),
      // Past years are immutable and can be cached far longer than the
      // current year, which still accrues new contributions daily.
      next: { revalidate: isPastYear ? 60 * 60 * 24 * 30 : 3600 },
    });

    if (!res.ok) return null;

    const json = (await res.json()) as ContributionsOnlyResponse;
    if (!json.data?.user) return null;

    const calendar = json.data.user.contributionsCollection.contributionCalendar;
    const days: ContributionDay[] = calendar.weeks.flatMap((week) =>
      week.contributionDays.map((day) => ({
        date: day.date,
        count: day.contributionCount,
        level: CONTRIBUTION_LEVEL[day.contributionLevel] ?? 0,
      })),
    );

    return { totalContributions: calendar.totalContributions, days };
  } catch {
    return null;
  }
}

export async function getGithubActivity(
  username: string,
  featuredRepoNames: string[] = [],
): Promise<GithubActivity | null> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return null;

  const query = buildQuery(featuredRepoNames);
  const variables: Record<string, string> = { username };
  featuredRepoNames.forEach((name, i) => {
    variables[`repoName${i}`] = name;
  });

  try {
    const res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, variables }),
      next: { revalidate: 3600 },
    });

    if (!res.ok) return null;

    const json = (await res.json()) as GraphQLResponse;
    // A named repo that's missing/renamed only errors that one aliased field —
    // the rest of the response is still valid, so don't bail out entirely.
    if (!json.data?.user) return null;

    const { user } = json.data;
    const stars = user.repositories.nodes.reduce((sum, repo) => sum + repo.stargazerCount, 0);
    const calendar = user.contributionsCollection.contributionCalendar;
    const days: ContributionDay[] = calendar.weeks.flatMap((week) =>
      week.contributionDays.map((day) => ({
        date: day.date,
        count: day.contributionCount,
        level: CONTRIBUTION_LEVEL[day.contributionLevel] ?? 0,
      })),
    );

    let topRepos: TopRepo[];
    if (featuredRepoNames.length > 0) {
      topRepos = featuredRepoNames
        .map((_, i) => json.data?.[`repo${i}`] as RawRepoNode | null | undefined)
        .filter((repo): repo is RawRepoNode => repo != null)
        .map(toTopRepo);
    } else {
      topRepos = (user.topRepos?.nodes ?? []).map(toTopRepo);
    }

    return {
      publicRepos: user.repositories.totalCount,
      followers: user.followers.totalCount,
      stars,
      totalContributions: calendar.totalContributions,
      days,
      topRepos,
    };
  } catch {
    return null;
  }
}

export interface ContributionDay {
  date: string;
  count: number;
  level: number;
}

export interface GithubActivity {
  publicRepos: number;
  followers: number;
  stars: number;
  totalContributions: number;
  days: ContributionDay[];
}

const CONTRIBUTION_LEVEL: Record<string, number> = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
};

const QUERY = `
  query($username: String!) {
    user(login: $username) {
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
    }
  }
`;

interface GraphQLResponse {
  data?: {
    user: {
      followers: { totalCount: number };
      repositories: { totalCount: number; nodes: { stargazerCount: number }[] };
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
  errors?: { message: string }[];
}

export async function getGithubActivity(username: string): Promise<GithubActivity | null> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return null;

  try {
    const res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: QUERY, variables: { username } }),
      next: { revalidate: 3600 },
    });

    if (!res.ok) return null;

    const json = (await res.json()) as GraphQLResponse;
    if (json.errors || !json.data?.user) return null;

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

    return {
      publicRepos: user.repositories.totalCount,
      followers: user.followers.totalCount,
      stars,
      totalContributions: calendar.totalContributions,
      days,
    };
  } catch {
    return null;
  }
}

import { featuredRepos } from "@/data/featured-repos";
import { getGithubActivity, getGithubUsername, MIN_CONTRIBUTION_YEAR } from "@/lib/github";
import { ContributionHeatmap } from "@/components/footprint/contribution-heatmap";
import { Panel } from "@/components/panel";

export async function GithubRow() {
  const username = getGithubUsername();
  const activity = username ? await getGithubActivity(username, featuredRepos) : null;

  return (
    <Panel as="li">
      <h3 className="text-xl font-semibold text-foreground">GitHub</h3>
      <p className="mt-1 text-muted">
        Where the code lives — repos, contribution activity, and what I&apos;ve been building.
      </p>

      {activity ? (
        <>
          <ContributionHeatmap
            repos={activity.publicRepos}
            stars={activity.stars}
            initialYear={new Date().getUTCFullYear()}
            initialDays={activity.days}
            initialTotalContributions={activity.totalContributions}
            minYear={MIN_CONTRIBUTION_YEAR}
          />

          {activity.topRepos.length > 0 && (
            <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {activity.topRepos.map((repo) => (
                <li key={repo.name}>
                  <a
                    href={repo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-2xl border border-border p-4 transition-colors hover:border-accent"
                  >
                    <p className="text-sm font-semibold text-foreground">{repo.name}</p>
                    {repo.description && (
                      <p className="mt-1 line-clamp-2 text-sm text-muted">
                        {repo.description}
                      </p>
                    )}
                    <p className="mt-3 text-xs font-medium text-muted">
                      {repo.language ?? "Code"} · {repo.stars}{" "}
                      {repo.stars === 1 ? "star" : "stars"}
                    </p>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </>
      ) : (
        <p className="mt-6 text-sm text-muted">GitHub activity is temporarily unavailable.</p>
      )}
    </Panel>
  );
}

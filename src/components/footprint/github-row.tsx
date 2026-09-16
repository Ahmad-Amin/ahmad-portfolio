import { socials } from "@/data/socials";
import { featuredRepos } from "@/data/featured-repos";
import { getGithubActivity } from "@/lib/github";
import { ContributionHeatmap } from "@/components/footprint/contribution-heatmap";

function getGithubUsername(): string | null {
  const github = socials.find((social) => social.platform === "GitHub");
  if (!github) return null;

  try {
    return new URL(github.url).pathname.replaceAll("/", "");
  } catch {
    return null;
  }
}

interface GithubRowProps {
  index: number;
}

export async function GithubRow({ index }: GithubRowProps) {
  const username = getGithubUsername();
  const activity = username ? await getGithubActivity(username, featuredRepos) : null;

  return (
    <li className="border-b-2 border-foreground px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[5rem_1fr] lg:gap-8">
        <span className="font-mono text-sm text-accent">
          {String(index + 1).padStart(2, "0")}
        </span>

        <div>
          <h3 className="text-xl font-bold text-foreground">GitHub</h3>
          <p className="mt-1 text-muted">
            Where the code lives — repos, contribution activity, and what I&apos;ve been
            building.
          </p>

          {activity ? (
            <>
              <ul className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2">
                {[
                  { label: "Contributions", value: activity.totalContributions },
                  { label: "Repos", value: activity.publicRepos },
                  { label: "Stars", value: activity.stars },
                  { label: "Followers", value: activity.followers },
                ].map((item) => (
                  <li key={item.label} className="font-mono text-sm">
                    <span className="text-accent">{item.value.toLocaleString()}</span>{" "}
                    <span className="tracking-wide text-muted uppercase">{item.label}</span>
                  </li>
                ))}
              </ul>

              <ContributionHeatmap days={activity.days} />

              {activity.topRepos.length > 0 && (
                <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {activity.topRepos.map((repo) => (
                    <li key={repo.name}>
                      <a
                        href={repo.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block border border-border p-4 transition-colors hover:border-accent"
                      >
                        <p className="font-mono text-sm font-bold text-foreground">
                          {repo.name}
                        </p>
                        {repo.description && (
                          <p className="mt-1 line-clamp-2 text-sm text-muted">
                            {repo.description}
                          </p>
                        )}
                        <p className="mt-3 font-mono text-xs text-muted uppercase">
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
            <p className="mt-6 font-mono text-sm text-muted">
              GitHub activity is temporarily unavailable.
            </p>
          )}
        </div>
      </div>
    </li>
  );
}

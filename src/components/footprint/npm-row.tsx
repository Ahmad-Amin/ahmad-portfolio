import { ExternalLink } from "lucide-react";
import { GithubIcon } from "@/components/icons";
import { profile } from "@/data/profile";
import { getNpmPackages } from "@/lib/npm";
import { Panel } from "@/components/panel";

export async function NpmRow() {
  const packages = await getNpmPackages(profile.npmUsername);

  return (
    <Panel as="li">
      <h3 className="text-xl font-semibold text-foreground">npm</h3>
      <p className="mt-1 text-muted">
        Open-source packages other developers can install straight into their own projects.
      </p>

      {packages === null && (
        <p className="mt-6 text-sm text-muted">Package data is temporarily unavailable.</p>
      )}

      {packages !== null && packages.length === 0 && (
        <p className="mt-6 text-sm text-muted">No published packages yet.</p>
      )}

      {packages !== null && packages.length > 0 && (
        <ul className="mt-6 space-y-6">
          {packages.map((pkg) => (
            <li key={pkg.name}>
              <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                <p className="font-mono text-base font-semibold text-foreground">
                  {pkg.name}
                  <span className="ml-2 font-mono text-sm font-normal tabular-nums text-muted">
                    v{pkg.version}
                  </span>
                </p>
                <p className="text-xs font-medium text-muted">
                  <span className="font-mono tabular-nums text-accent">
                    {pkg.weeklyDownloads.toLocaleString()}
                  </span>{" "}
                  downloads/week
                </p>
              </div>
              {pkg.description && (
                <p className="mt-2 leading-relaxed text-muted">{pkg.description}</p>
              )}
              <div className="mt-3 flex items-center gap-6">
                <a
                  href={pkg.npmUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground hover:underline"
                >
                  <ExternalLink className="size-3.5" />
                  View on npm
                </a>
                {pkg.repoUrl && (
                  <a
                    href={pkg.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground hover:underline"
                  >
                    <GithubIcon className="size-3.5" />
                    Source
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

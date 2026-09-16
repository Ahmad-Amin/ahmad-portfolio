import { ExternalLink } from "lucide-react";
import { GithubIcon } from "@/components/icons";
import { profile } from "@/data/profile";
import { getNpmPackages } from "@/lib/npm";

interface NpmRowProps {
  index: number;
}

export async function NpmRow({ index }: NpmRowProps) {
  const packages = await getNpmPackages(profile.npmUsername);

  return (
    <li className="border-b-2 border-foreground px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[5rem_1fr] lg:gap-8">
        <span className="font-mono text-sm text-accent">
          {String(index + 1).padStart(2, "0")}
        </span>

        <div>
          <h3 className="text-xl font-bold text-foreground">npm</h3>
          <p className="mt-1 text-muted">
            Open-source packages other developers can install straight into their own
            projects.
          </p>

          {packages === null && (
            <p className="mt-6 font-mono text-sm text-muted">
              Package data is temporarily unavailable.
            </p>
          )}

          {packages !== null && packages.length === 0 && (
            <p className="mt-6 font-mono text-sm text-muted">No published packages yet.</p>
          )}

          {packages !== null && packages.length > 0 && (
            <ul className="mt-6 space-y-6">
              {packages.map((pkg) => (
                <li key={pkg.name}>
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                    <p className="font-mono text-base font-bold text-foreground">
                      {pkg.name}
                      <span className="ml-2 text-sm font-normal text-muted">
                        v{pkg.version}
                      </span>
                    </p>
                    <p className="font-mono text-xs tracking-wide text-muted uppercase">
                      {pkg.weeklyDownloads.toLocaleString()} downloads/week
                    </p>
                  </div>
                  {pkg.description && <p className="mt-2 text-muted">{pkg.description}</p>}
                  <div className="mt-3 flex items-center gap-6">
                    <a
                      href={pkg.npmUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 font-mono text-xs tracking-wide text-foreground uppercase hover:underline"
                    >
                      <ExternalLink className="size-3.5" />
                      View on npm
                    </a>
                    {pkg.repoUrl && (
                      <a
                        href={pkg.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 font-mono text-xs tracking-wide text-foreground uppercase hover:underline"
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
        </div>
      </div>
    </li>
  );
}

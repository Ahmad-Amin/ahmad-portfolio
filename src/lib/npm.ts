export interface NpmPackage {
  name: string;
  description: string | null;
  version: string;
  weeklyDownloads: number;
  npmUrl: string;
  repoUrl: string | null;
}

interface RegistryPackageResponse {
  description?: string;
  "dist-tags"?: { latest?: string };
  repository?: { url?: string };
}

function normalizeRepoUrl(url: string | undefined): string | null {
  if (!url) return null;
  return url
    .replace(/^git\+/, "")
    .replace(/\.git$/, "")
    .replace(/^git:\/\//, "https://");
}

export async function getNpmPackages(username: string): Promise<NpmPackage[] | null> {
  try {
    const listRes = await fetch(`https://registry.npmjs.org/-/user/${username}/package`, {
      next: { revalidate: 3600 },
    });
    if (!listRes.ok) return null;

    const packageMap = (await listRes.json()) as Record<string, string>;
    const names = Object.keys(packageMap);
    if (names.length === 0) return [];

    const packages = await Promise.all(
      names.map(async (name) => {
        try {
          const [metaRes, downloadsRes] = await Promise.all([
            fetch(`https://registry.npmjs.org/${encodeURIComponent(name)}`, {
              next: { revalidate: 3600 },
            }),
            fetch(`https://api.npmjs.org/downloads/point/last-week/${encodeURIComponent(name)}`, {
              next: { revalidate: 3600 },
            }),
          ]);

          if (!metaRes.ok) return null;

          const meta = (await metaRes.json()) as RegistryPackageResponse;
          const downloads = downloadsRes.ok
            ? ((await downloadsRes.json()) as { downloads?: number })
            : { downloads: 0 };

          return {
            name,
            description: meta.description ?? null,
            version: meta["dist-tags"]?.latest ?? "0.0.0",
            weeklyDownloads: downloads.downloads ?? 0,
            npmUrl: `https://www.npmjs.com/package/${name}`,
            repoUrl: normalizeRepoUrl(meta.repository?.url),
          };
        } catch {
          return null;
        }
      }),
    );

    return packages.filter((pkg): pkg is NpmPackage => pkg !== null);
  } catch {
    return null;
  }
}

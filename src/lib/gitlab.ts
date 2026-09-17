// GitLab's calendar.json has no date-range parameters (confirmed empirically
// against a real instance — ?year=/?date= are silently ignored), so this
// always returns whatever GitLab considers "the last ~12 months," with no
// way to scope it to a specific past year.
export async function getGitlabDailyCounts(): Promise<Record<string, number> | null> {
  const url = process.env.GITLAB_URL;
  const username = process.env.GITLAB_USERNAME;
  const feedToken = process.env.GITLAB_FEED_TOKEN;
  if (!url || !username || !feedToken) return null;

  try {
    const res = await fetch(
      `${url}/users/${encodeURIComponent(username)}/calendar.json?feed_token=${feedToken}`,
      { next: { revalidate: 3600 } },
    );
    if (!res.ok) return null;

    return (await res.json()) as Record<string, number>;
  } catch {
    return null;
  }
}

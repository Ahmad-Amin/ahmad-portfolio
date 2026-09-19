const rawSiteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000");

// Callers append paths like "/blog", so a trailing slash in the env var would produce "//".
export const siteUrl = rawSiteUrl.replace(/\/+$/, "");

export const feedPath = "/feed.xml";

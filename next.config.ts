import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

// Google Analytics 4 hosts, per Google's CSP guidance for gtag.js.
const googleAnalytics = "https://*.google-analytics.com https://*.googletagmanager.com";

// Static pages can't carry a per-request nonce, and Next, next-themes and the GA
// snippet all inject inline scripts, so script-src needs 'unsafe-inline' (this is
// Next's documented setup for statically rendered sites). The policy still
// blocks scripts, images and connections from any origin not listed here, and
// disallows framing, plugins and <base>/form hijacking.
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' https://*.googletagmanager.com${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  // YouTube thumbnails come from the channel's RSS feed (*.ytimg.com).
  `img-src 'self' blob: data: https://*.ytimg.com ${googleAnalytics} https://*.g.doubleclick.net https://www.google.com`,
  "font-src 'self'",
  `connect-src 'self' ${googleAnalytics} https://*.analytics.google.com https://*.g.doubleclick.net${isDev ? " ws://localhost:* http://localhost:*" : ""}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Legacy equivalent of frame-ancestors 'none', for older browsers.
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;

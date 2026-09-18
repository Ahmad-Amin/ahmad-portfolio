export type ProjectPlatform = 'web' | 'extension' | 'app';

export interface LiveProject {
  slug: string;
  title: string;
  // One line, shown on the card.
  tagline: string;
  // Longer body copy, shown in the modal.
  description: string;
  // Opens in a new tab.
  url: string;
  platform: ProjectPlatform;
  technologies: string[];
  // Thumbnail shown on the card and as the carousel's fallback — independent
  // of `images` so it doesn't have to be whichever one happens to be first.
  cover: string;
  // Paths under /public, e.g. "/projects/reactform/1.png". Empty is fine —
  // the UI falls back to a platform icon when there's nothing to show.
  images: string[];
}

export const liveProjects: LiveProject[] = [
  {
    slug: 'reactform',
    title: 'ReactForm',
    tagline: 'Drag-and-drop form builder for React & Next.js teams — publish a shareable link or export clean, ready-to-use component code.',
    description:
      'A no-code form builder that lets teams design, publish, and manage forms with conditional logic, validation, and a live response dashboard — then export the result as clean, ready-to-use React/Next.js code. Includes Pro plans via Lemon Squeezy billing, white-label embedding for partner platforms, and integrations for lead capture and webhooks.',
    url: 'https://reactform.co/',
    platform: 'web',
    technologies: ['Next.js', 'React', 'Firebase', 'Tailwind CSS', 'Chakra UI', 'Ant Design', 'Lemon Squeezy', 'Resend'],
    cover: '/react-form/image1.png',
    images: ['/react-form/image1.png', '/react-form/image2.png', '/react-form/image3.png', '/react-form/image4.png', '/react-form/image5.png'],
  },
  {
    slug: 'shadowguard',
    title: 'ShadowGuard',
    tagline: 'A local-first Chrome extension that catches secrets and personal data before they reach ChatGPT, Claude, or Gemini.',
    description:
      'ShadowGuard scans what you type into AI chat tools in real time and catches API keys, credentials, and personal data before it ever reaches the model. Detection combines regex pattern matching, checksum validation (Luhn, IBAN, ABA routing), and entropy analysis to catch both known credential formats and unlabeled random-looking secrets, while keeping false positives low. Depending on severity, matches are either auto-redacted in place with reversible, session-local placeholders or blocked outright — and everything runs entirely client-side, so prompt content is never transmitted anywhere except the AI provider itself. Published on the Chrome Web Store as a one-time-purchase extension with Lemon Squeezy-based license activation.',
    url: 'https://chromewebstore.google.com/detail/shadowguard-%E2%80%94-ai-data-pro/bbidfhhclnjijjediipaphngkkecmpab',
    platform: 'extension',
    technologies: ['TypeScript', 'Chrome Extension (Manifest V3)', 'Vite', 'Lemon Squeezy'],
    cover: '/shadow-guard/image1.png',
    images: ['/shadow-guard/image1.png', '/shadow-guard/image2.png', '/shadow-guard/image3.png'],
  },
  {
    slug: 'ai-expense-tracker',
    title: 'AI Expense Tracker',
    tagline: "Track spending automatically — AI reads your receipts and bank SMS so you don't have to.",
    description:
      'FinScan AI is a cross-platform expense tracker built with React Native and Expo. It uses AI to automatically parse spending from two sources: snap a photo of a receipt and GPT-4o-mini extracts the merchant, amount, and category, or let the app read incoming bank SMS alerts in the background (via a native Kotlin broadcast receiver) and auto-log transactions without opening the app. Beyond automatic capture, it supports multi-wallet balance tracking, weekly/monthly spending analytics with category breakdowns, configurable budgets with near-limit alerts, multi-currency support, biometric app lock, and a one-time premium unlock handled through RevenueCat. The backend is a set of serverless functions on Vercel that proxy receipt/SMS text to OpenAI for structured parsing.',
    url: 'https://play.google.com/store/apps/details?id=com.anonymous.aiexpensetracker',
    platform: 'app',
    technologies: ['React Native', 'Expo', 'Expo Router', 'TypeScript', 'SQLite', 'Kotlin', 'OpenAI API', 'RevenueCat', 'Vercel'],
    cover: '/ai-expense-tracker/image0.png',
    images: [
      '/ai-expense-tracker/image1.png',
      '/ai-expense-tracker/image2.png',
      '/ai-expense-tracker/image3.png',
      '/ai-expense-tracker/image4.png',
      '/ai-expense-tracker/image5.png',
      '/ai-expense-tracker/image6.png',
      '/ai-expense-tracker/image7.png',
      '/ai-expense-tracker/image8.png',
    ],
  },
];

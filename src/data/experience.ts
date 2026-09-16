export interface Experience {
  company: string;
  location: string;
  role: string;
  startDate: string;
  endDate: string;
  highlights: string[];
}

export const experience: Experience[] = [
  {
    company: "Bitrock",
    location: "Italy",
    role: "Field Technical Engineer",
    startDate: "Mar 2025",
    endDate: "Present",
    highlights: [
      "Primary liaison between clients and engineering, owning end-to-end support and delivery for backend and frontend systems.",
      "Lead L2 troubleshooting, incident management, and root-cause analysis across multiple applications while upholding SLAs.",
      "Hands-on across full-stack tech including JavaScript/TypeScript, React.js, Node.js, Java, REST APIs, SQL, and AWS deployment.",
      "Use Docker, Postman, Kibana, Grafana, and JIRA for monitoring, diagnostics, ticket workflows, and reporting.",
      "Drive service improvements and 24/7 support processes, ensuring compliance with ISO 27001 and GDPR.",
      "Document technical flows, manage onboarding, and coordinate APAC-aligned remote operations.",
      "Implemented internal tooling and UI improvements in React/TypeScript to streamline incident workflows.",
    ],
  },
  {
    company: "American Contractor Organization",
    location: "United States",
    role: "Senior Software Developer",
    startDate: "Aug 2024",
    endDate: "Feb 2025",
    highlights: [
      "Designed and developed a WordPress plugin for real-time updates and integration with Ontraport CRM, storing data in encrypted format.",
      "Designed and implemented complex, reusable UI components using Vue.js/Nuxt 3 and Vuetify, improving modularity and consistency.",
      "Used advanced TypeScript patterns (utility types, generics, discriminated unions) to enforce type-safe APIs and components.",
      "Built dynamic dashboards in Next.js for data monitoring and graph plotting, using both Server and Client Components.",
      "Optimized client-side performance via lazy-loading, reducing initial load times and improving Lighthouse scores.",
      "Maintained comprehensive test coverage with Jest and Cypress for reliable unit and end-to-end testing.",
      "Ensured WCAG accessibility compliance via semantic HTML, ARIA attributes, and keyboard navigation support.",
    ],
  },
  {
    company: "Devsinc",
    location: "Lahore",
    role: "Software Developer II",
    startDate: "Jul 2022",
    endDate: "Apr 2024",
    highlights: [
      "Implemented UI using Material UI and Chakra UI, and added SEO tags/optimizations that increased overall traffic by 25%.",
      "Created and integrated a GraphQL API to reduce endpoints and avoid unnecessary data transfer.",
      "Migrated the application from Heroku to AWS using ECS, ECR, load balancers, and RDS.",
      "Built end-to-end admin dashboards in React and Next.js for payment transfers using Stripe.",
      "Implemented end-to-end automation with cron jobs, eliminating manual triggers.",
      "Developed multiple web applications using React and Vue with Redux for state management, including TypeScript.",
    ],
  },
];

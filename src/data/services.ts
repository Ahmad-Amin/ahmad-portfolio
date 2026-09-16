export interface Service {
  title: string;
  description: string;
}

export const services: Service[] = [
  {
    title: "Web Development",
    description:
      "Building fast, accessible, and maintainable web applications from the ground up, using modern frameworks and clean architecture.",
  },
  {
    title: "UI/UX Design",
    description:
      "Designing clean, intuitive interfaces that balance visual polish with usability, from wireframes to high-fidelity prototypes.",
  },
  {
    title: "Responsive Design",
    description:
      "Making sure every project looks and works great across devices, from small phones to large desktop displays.",
  },
  {
    title: "Performance & Deployment",
    description:
      "Optimizing for speed and shipping with confidence, with CI/CD pipelines and production-ready deployments.",
  },
];

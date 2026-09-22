export interface Profile {
  brand: string;
  name: string;
  role: string;
  tagline: string;
  bio: string[];
  email: string;
  bookingUrl: string;
  location: string;
  npmUsername: string;
}

export const profile: Profile = {
  brand: 'TechWithSwag',
  name: 'Ahmad Amin',
  role: 'Full-Stack AI Developer',
  tagline:
    "I design and ship production systems end to end APIs, dashboards, AWS infrastructure and I'm usually still the one on call when something breaks.",
  bio: [
    '5+ years shipping with Rails, React, Next.js, and Python, including migrating a Heroku app to AWS ECS and cutting REST sprawl down to one GraphQL API. Outside the day job, I build and ship my own products solo, and write about what I learn as TechWithSwag.',
  ],
  email: 'baigahmad323@gmail.com',
  bookingUrl: 'https://cal.com/ahmad-amin-8p5olr/15min',
  location: 'Remote',
  npmUsername: 'devtech-6700',
};

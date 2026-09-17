export interface Profile {
  brand: string;
  name: string;
  role: string;
  tagline: string;
  bio: string[];
  email: string;
  location: string;
  npmUsername: string;
}

export const profile: Profile = {
  brand: 'TechWithSwag',
  name: 'Ahmad Amin',
  role: 'Full-Stack AI Developer',
  tagline: 'I build scalable APIs and polished front-ends, integrate CI/CD and automated testing, and ship reliably on AWS and Docker.',
  bio: [
    "An experienced full-stack developer with expertise in Ruby on Rails, React, Next.js, Nuxt 3, and Python. With 5+ years in the field, I've led projects from concept to deployment, improving system performance and user engagement.",
  ],
  email: 'baigahmad323@gmail.com',
  location: 'Remote',
  npmUsername: 'devtech-6700',
};

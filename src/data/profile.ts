export interface Profile {
  name: string;
  role: string;
  tagline: string;
  bio: string[];
  email: string;
  location: string;
}

export const profile: Profile = {
  name: 'Ahmad Amin',
  role: 'Full-Stack Developer',
  tagline: 'I build scalable APIs and polished front-ends, integrate CI/CD and automated testing, and ship reliably on AWS and Docker.',
  bio: [
    "An experienced full-stack developer with expertise in Ruby on Rails, React, Next.js, Nuxt 3, and Python. With 4+ years in the field, I've led projects from concept to deployment, improving system performance and user engagement.",
    'I build scalable APIs and polished front-ends, integrate CI/CD and automated testing, and ship reliably on AWS and Docker. Comfortable partnering with cross-functional teams, I translate requirements into maintainable solutions and champion best practices for clean, efficient code.',
  ],
  email: 'baigahmad@gmail.com',
  location: 'Remote',
};

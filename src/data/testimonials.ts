export interface Testimonial {
  name: string;
  role: string;
  company: string;
  // Full profile URL — shown as a link so the quote is checkable, not just a name.
  linkedinUrl: string;
  message: string;
  // Optional headshot, e.g. "/testimonials/jane-doe.jpg". Falls back to
  // initials when empty, so it's fine to leave out.
  avatar?: string;
}

// Add new reviews here as they come in — nothing else needs to change for
// one to show up on the site.
export const testimonials: Testimonial[] = [
  {
    name: 'Andrea Lala',
    role: 'IT Services Director/ITIL,SLA Management & Cross Functional leadership',
    company: 'Bitrock',
    linkedinUrl: 'https://www.linkedin.com/in/andrea-lala-950945a6/',
    message:
      'I had the opportunity to work with Ahmad at Bitrock, where he contributed to one of our projects as a Field Technical Engineer, providing L2 technical support within a highly complex architectural environment. Throughout the engagement, Ahmad demonstrated strong technical expertise, professionalism, and a structured approach to troubleshooting and incident resolution. He was dependable in handling technical issues, collaborating effectively with the broader project team, and ensuring appropriate follow-up through to resolution. I particularly appreciated his sense of ownership, responsiveness, and ability to work effectively in a demanding technical environment. His contribution helped ensure the stability and continuity of the services under his responsibility. It was a pleasure working with Ahmad, and I would confidently recommend him as a reliable and skilled technical professional.',
  },
  {
    name: 'Cecilia De La Rosa',
    role: 'Executive Director',
    company: 'American Contractors Organization, Inc',
    linkedinUrl: 'https://www.linkedin.com/in/cecilia-aco/',
    message:
      'I’ve had the pleasure of working with Ahmad on several projects, and I can confidently say he is an exceptional Senior Software Engineer. Ahmad is focused, driven, and consistently delivers high-quality work on time. What truly sets him apart is his dedication to going above and beyond expectations—he doesn’t just complete tasks, he looks for ways to add value. Beyond his technical expertise, Ahmad is a true team player. He brings a positive attitude to every interaction, making collaboration both productive and enjoyable. His professionalism, problem-solving skills, and commitment to excellence make him a great asset to any team.',
  },
  {
    name: 'Roger Paucar',
    role: 'Field Technical Engineer',
    company: 'Bitrock',
    linkedinUrl: 'https://www.linkedin.com/in/roger-paucar-navarro/',
    message:
      'I had the pleasure of working with Ahmad at Bitrock. He is a committed, reliable, and collaborative professional who was always willing to support the team and share his knowledge. I truly appreciated his professionalism and positive attitude. I would definitely recommend him and wish him continued success in his career.',
  },
  {
    name: 'Abdullah Shahid',
    role: 'Lead Full Stack Developer',
    company: 'Upwork',
    linkedinUrl: 'https://www.linkedin.com/in/abdullahdevelops/',
    message:
      'Ahmad is a clear shooter and a great asset to any team. He owns the features and goes up & beyond to deliver high quality work every time, communicates clearly and has what it takes to solve complex problems. His technical skills and professionalism make working with him a smooth experience. Highly recommended!',
  },
];

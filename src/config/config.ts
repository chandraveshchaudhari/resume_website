// src/config/config.ts

export const getAsset = (path: string) => {
  return `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/${path}`;
};

const siteConfig = {
  personal: {
    name: 'Manmeet Kaur Oberoi',
    title: 'BSc Economics with Data Science | Undergraduate Student',
    image: getAsset('images/manmeet.png'),
    description:
      'I am an undergraduate student pursuing a BSc in Economics with Data Science, with a strong interest in data analysis, programming, and business applications of technology.\n' +
      '\n' +
      'My academic focus lies at the intersection of economics, statistics, and Python-based data science, where I enjoy working with real-world datasets and problem-solving projects.\n' +
      '\n' +
      'I am currently building my skills in data analytics, machine learning foundations, and research-oriented coursework through academic and self-driven projects.',
    tagline: 'Exploring data, economics, and real-world insights.',
    location: 'India',
  },

  seo: {
    title: 'Manmeet Kaur – Economics & Data Science Portfolio',
    description:
      'Portfolio website showcasing academic background, projects, and interests in economics, data science, and business analytics.',
  },

  animatedText: [
    'Economics Student',
    'Data Science Enthusiast',
    'Python Learner',
    'Aspiring Analyst',
  ],

  navigation: [
    { name: 'Home', url: '/' },
    { name: 'Projects', url: '/projects' },
    { name: 'Education', url: '/education' },
    { name: 'Experience', url: '/experience' },
    { name: 'Blogs', url: '/blogs' },
    { name: 'Resume', url: '/resume' },
    { name: 'Contact', url: '/contact' },
  ],

  education: [
    {
      institution: 'Christ University',
      degree: 'BSc Economics with Data Science',
      year: '2025 – Present',
      image: getAsset('images/education/placeholder.png'),
      description: [
        'Coursework includes economics, statistics, Python programming, and data analysis.',
      ],
    },
    {
      institution: 'Christ Academy Junior College',
      degree: 'Class XII(PCMC)-90.2%',
      year: '2023 – 2025',
      image: getAsset('images/education/placeholder.png'),
      description: [
        'Studied Physics, Chemistry, Mathematics, and Computer Science.',
      ],
    },
    {
      institution: 'Christ Academy ICSE School',
      degree: 'Class X-97.4%',
      year: '2015 – 2023',
    },
  ],

  // ✅ Certifications (keep minimal for now
  experience: [
    {
      title: 'Volunteer',
      place: 'Snehasadan Boys Home NGO',
      time: '(2025 – Present)',
    },
  ],

  projects: [
    {
      title: 'Socio-Economic Data Analysis (Punjab)',
      description:
        'Analyzed long-term secondary data on GDP, literacy rate, crime rate, and infant mortality using Excel-based visualizations.',
    },
  ],

  research: [], // Leave empty as a student (this is totally okay)

  books: [], // Not needed at undergraduate level

  contact: {
    email: 'manmeetkaur9777@gmail.com', // replace if you want
    linkedin: 'https://www.linkedin.com/in/manmeet-840355376/',
    github: 'https://github.com/your-username',
    googleScholar: '',
    orcid: '',
  },
};

export default siteConfig;

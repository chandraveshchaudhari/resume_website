// src/types/index.ts


export interface Personal {
  name: string;
  title: string;
  image: string;
  email: string;
  location: string;
}

export interface SEO {
  title: string;
  description: string;
}

export type AnimatedText = string;

export interface Navigation {
  name: string;
  url: string;
}

export interface Education {
  degree: string;
  institution: string;
  year: string;
}

export interface Experience {
  role: string;
  company: string;
  duration: string;
}

export interface Project {
  title: string;
  description: string;
  link: string;
}

export interface Research {
  title: string;
  journal: string;
  link: string;
}

export interface Book {
  title: string;
  description: string;
  image: string;
  link: string;
}

export interface Contact {
  email: string;
  linkedin: string;
  github: string;
}

// STRUCTURAL Certification: specialization = has `certificates`, individual = has `file`
export type Certification =
  | {
      title: string;
      cardImage?: string;
      certificates: { name: string; file: string }[];
    }
  | {
      title: string;
      cardImage?: string;
      file: string;
    };

export interface SiteConfig {
  personal: Personal;
  seo: SEO;
  animatedText: AnimatedText[];
  navigation: Navigation[];
  education: Education[];
  experience: Experience[];
  projects: Project[];
  research: Research[];
  books: Book[];
  contact: Contact;
  certifications: Certification[];
}
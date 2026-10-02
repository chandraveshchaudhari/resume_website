// src/config/config.ts

export const getAsset = (path: string) => {
  return `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/${path}`;
};

/* ==========================================================================
   MARKDOWN CONTENT LOADER
   --------------------------------------------------------------------------
   resume.md (project root) is the user-editable content file. It is parsed
   at build time by scripts/build-resume-content.js into resume-content.json,
   which is merged over the defaults below. Markdown wins when present, so
   non-coders can drive the whole site by editing one file.
   See RESUME_GUIDE.md for the format reference.
   ========================================================================== */

import resumeContent from './resume-content.json';

type RawContent = Record<string, unknown>;

const hasContent = resumeContent && Object.keys(resumeContent).length > 0;

/** Wrap asset paths from markdown with getAsset (public/-relative or URL). */
const asset = (v: unknown): unknown => {
  if (typeof v !== 'string' || !v) return v;
  if (/^https?:\/\//i.test(v)) return v;
  return getAsset(v);
};

const mapAssetFields = (item: Record<string, unknown>, fields: string[]) => {
  const out = { ...item };
  for (const f of fields) if (out[f]) out[f] = asset(out[f]);
  return out;
};

const slug = (s: unknown, max = 60) =>
  String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, max) || 'item';

const TITLE_FIELD: Record<string, string> = {
  experience: 'title',
  projects: 'title',
  publications: 'title',
  patents: 'title',
  education: 'degree',
  certifications: 'title',
  openSource: 'title',
  openSourceContributions: 'project',
  industryEngagements: 'header',
  books: 'title',
  awards: 'title',
  references: 'name',
  copyrights: 'title',
  additionalDesignWork: 'title',
};

const RESUME_META_KEYS = [
  'industryPriority',
  'academicPriority',
  'kind',
  'industryDescription',
  'academicDescription',
  'industryDesp',
  'academicDesp',
  'industryHighlights',
  'academicHighlights',
  'area',
  'keywords',
  'relevance',
  'needsReview',
] as const;

const normalizeItem = (section: string, raw: Record<string, unknown>): Record<string, unknown> => {
  const { __name, __title, ...rest } = raw;
  const titleField = TITLE_FIELD[section] || 'title';
  const title = rest[titleField] || __title || __name;
  const out: Record<string, unknown> = { ...rest, [titleField]: title };
  if (!out.id) out.id = slug(title);
  const meta: Record<string, unknown> = {};
  for (const k of RESUME_META_KEYS) {
    if (out[k] !== undefined) {
      meta[k] = out[k];
      delete out[k];
    }
  }
  if (Object.keys(meta).length) out.resume = meta;
  return out;
};

/** Apply markdown content over the default config values. */
function applyMarkdownContent(cfg: Record<string, unknown>, raw: RawContent): Record<string, unknown> {
  if (!hasContent) return cfg;
  const out = { ...cfg };

  // ---- personal + contact + seo ----
  const p = (raw.personal || {}) as Record<string, unknown>;
  if (Object.keys(p).length) {
    const base = out.personal as Record<string, unknown>;
    const next: Record<string, unknown> = { ...base };
    for (const k of ['name', 'title', 'tagline', 'location', 'phone', 'website']) {
      if (p[k]) next[k] = p[k];
    }
    if (p.image) {
      next.image = asset(p.image) as string;
    }
    out.personal = next;
  }
  const contactKeys: Record<string, string> = {
    email: 'email',
    linkedin: 'linkedin',
    github: 'github',
    googleScholar: 'googleScholar',
    orcid: 'orcid',
  };
  const contactPatch: Record<string, unknown> = {};
  for (const [mk, ck] of Object.entries(contactKeys)) if (p[mk]) contactPatch[ck] = p[mk];
  if (Object.keys(contactPatch).length) out.contact = { ...(out.contact as object), ...contactPatch };
  if (p.seoTitle || p.seoDescription) {
    out.seo = {
      ...(out.seo as object),
      ...(p.seoTitle ? { title: p.seoTitle } : {}),
      ...(p.seoDescription ? { description: p.seoDescription } : {}),
    };
  }
  if (Array.isArray(p.animatedText) && p.animatedText.length) out.animatedText = p.animatedText;

  // ---- item arrays ----
  const arraySpec: Record<string, { assetFields?: string[] }> = {
    experience: { assetFields: ['cardImage'] },
    projects: { assetFields: ['cardImage'] },
    publications: { assetFields: ['image'] },
    patents: {},
    education: { assetFields: ['image'] },
    certifications: { assetFields: ['file'] },
    openSource: {},
    openSourceContributions: {},
    industryEngagements: {},
    books: { assetFields: ['image'] },
    awards: {},
    references: {},
    copyrights: {},
    additionalDesignWork: {},
  };
  for (const [key, spec] of Object.entries(arraySpec)) {
    const items = raw[key];
    if (Array.isArray(items) && items.length) {
      out[key] = items.map((it) => {
        const obj = normalizeItem(key, it as Record<string, unknown>);
        const withAssets = spec.assetFields ? mapAssetFields(obj, spec.assetFields) : obj;
        return withAssets;
      });
    }
  }

  // certifications: nested certificates files
  if (Array.isArray(raw.certifications) && raw.certifications.length) {
    out.certifications = (raw.certifications as Record<string, unknown>[]).map((c) => {
      const n = normalizeItem('certifications', c);
      return {
        ...n,
        ...(n.file ? { file: asset(n.file) } : {}),
        ...(Array.isArray(n.certificates)
          ? { certificates: (n.certificates as Record<string, unknown>[]).map((cc) => ({ ...cc, ...(cc.file ? { file: asset(cc.file) } : {}) })) }
          : {}),
      };
    });
  }

  // education: markdown list entries land in `description`
  if (Array.isArray(raw.education) && raw.education.length) {
    out.education = (raw.education as Record<string, unknown>[]).map((e0) => {
      const e = normalizeItem('education', e0 as Record<string, unknown>);
      const desc = Array.isArray(e.description) ? e.description : e.description ? [e.description] : [];
      return { ...e, description: desc };
    });
  }

  return out;
}

const defaultSiteConfig = {
  personal: {
    name: 'Put your name inside the quote',
    title: 'Your Title | Your Role',
    image: getAsset('images/profile.png'), // Customize or replace with your profile image
    description:
      'Write a short bio here describing your background and focus. Keep it to 2–4 sentences.\n' +
      '\n' +
      'Mention your institution or company, areas of interest, and what you teach or build.\n' +
      '\n' +
      'Summarize your education or certifications briefly and highlight your practical work.\n' +
      '\n' +
      'Optional: Add notable books, workshops, or training you deliver.',
    tagline: 'Add a concise personal tagline here.',
    location: 'Your City, Country',
  },

  seo: {
    title: 'Your Name – Your Title',
    description: "Portfolio website showcasing your education, research, projects, and experience.",
  },

  animatedText: ['Your Role', 'Your Focus', 'Your Interest', 'Builder'],

  navigation: [
    { name: 'Home', url: '/' },
    { name: 'Projects', url: '/projects' },
    { name: 'Research', url: '/research' },
    { name: 'Education', url: '/education' },
    { name: 'Experience', url: '/experience' },
    { name: 'Blogs', url: '/blogs' },
    { name: 'Resume', url: '/resume' },
    { name: 'Contact', url: '/contact' },
  ],

  // Static blog entries. Use getAsset so the URL respects NEXT_PUBLIC_BASE_PATH / next.config.basePath
  // Add more entries here as you add more static HTML blog files under public/static_page/
  blogs: [
    {
      title: 'Your Blog Title',
      url: getAsset('static_page/project_management_blog.html'), // Replace with your static HTML page
    },
  ],


  education: [
    {
      institution: 'Your Institution',
      degree: 'Your Degree',
      year: 'YYYY–YYYY',
      image: getAsset('images/education/placeholder.png'),
      description: ['Brief description of your focus or thesis'],
    },
    {
      institution: 'Another Institution',
      degree: 'Another Degree or Certificate',
      year: 'YYYY–YYYY',
      image: getAsset('images/education/placeholder.png'),
      description: ['Key topics or skills learned'],
    },
  ],

// ✅ Unified MOOC + Certifications Section
  certifications: [
    {
      title: 'Your Certificate or Specialization',
      specialization: true,
      file: getAsset('images/education/Certifications/download.svg'),
      certificates: [
        { name: 'Course 1', file: getAsset('images/education/Certifications/download.svg') },
        { name: 'Course 2', file: getAsset('images/education/Certifications/download.svg') },
      ],
    },
    {
      title: 'Another Certificate',
      file: getAsset('images/education/Certifications/download.svg'),
    },
  ],



  // ✅ Experience section updated
  experience: [
    {
      title: 'Your Role',
      cardImage: getAsset('images/experience/placeholder.png'),
      place: 'Your Organization',
      time: '(MMM YYYY – Present)',
      desp: ['Brief responsibility 1', 'Brief responsibility 2'],
    },
    {
      title: 'Previous Role',
      cardImage: getAsset('images/experience/placeholder.png'),
      place: 'Previous Organization',
      time: '(MMM YYYY – MMM YYYY)',
      desp: ['Key contribution 1', 'Key contribution 2'],
    },
  ],


  // ✅ Projects section updated
  projects: [
    {
      title: 'Project Title 1',
      cardImage: getAsset('images/project/placeholder.png'),
      description: 'Short description of your project and what it does...',
      Githublink: 'https://github.com/your-username/your-project',
    },
    {
      title: 'Project Title 2',
      cardImage: getAsset('images/project/placeholder.png'),
      description: 'Another project summary...',
      Githublink: 'https://github.com/your-username/another-project',
    },
  ],


  research: [
    {
      title: 'Your Paper or Research Title',
      authors: 'Your Name, Collaborator Name',
      conferences: 'Conference or Journal, Publisher',
      researchYr: 2024,
  image: getAsset('images/research/placeholder.png'),
      citation: {
        vancouver:
          'Author A, Author B. Title of the work. Venue, Year. DOI/URL.',
      },
      abstract:
        'One or two sentences summarizing the contribution...',
      link: 'https://example.com/your-publication',
    },
  ],

  books: [
    {
      title: 'Your Book Title',
      description: 'Short description of your book or resource.',
      image: getAsset('images/book_cover_placeholder.png'),
      link: 'https://example.com/your-book',
    },
  ],

  contact: {
    email: 'your.email@example.com',
    linkedin: 'https://www.linkedin.com/in/your-linkedin/',
    github: 'https://github.com/your-username',
    googleScholar: 'https://scholar.google.com/citations?user=YOURID',
    orcid: 'https://orcid.org/0000-0000-0000-0000',
  },
};

/* ==========================================================================
   MERGE MARKDOWN CONTENT
   resume.md (via resume-content.json) overrides the defaults above.
   ========================================================================== */
const siteConfig = applyMarkdownContent(
  defaultSiteConfig as unknown as Record<string, unknown>,
  resumeContent as RawContent
) as unknown as typeof defaultSiteConfig;

export default siteConfig;
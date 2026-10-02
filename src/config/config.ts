// src/config/config.ts

export const getAsset = (path: string) => {
  return `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/${path}`;
};

/* ==========================================================================
   RESUME SYSTEM TYPES
   --------------------------------------------------------------------------
   The /resume page is a data-driven resume builder with multiple versions
   (industry / academic). Everything it renders comes from this file:

   1. Every resume-eligible item (experience, projects, research, patents,
      education, certifications, openSource) carries an `id` and a `resume`
      metadata block (priorities, version-specific descriptions, flags).
   2. Master lists below (resumeSkills, resumeCourses, resumeResearchAreas,
      resumeAiFinance) define structured skills / courses / areas.
   3. `resumeVersions` defines presentation (headline, summary, section order,
      labels, columns) plus AUTOMATIC selection rules per version:
        - maxPriority: items with resume.<version>Priority <= maxPriority are
          included by default (1 = most important, omit/99 = opt-out)
        - teaching / courses / aiFinance / industryEngagement toggles
   To add a new item: append it to the relevant array with an `id` + `resume`
   block — it then appears in the builder and is auto-selected by priority.
   No rendering changes are needed.
   ========================================================================== */

export type ResumeVersionId = 'industry' | 'academic';
export type CourseStatus = 'taught' | 'canTeach' | 'interest';

export type ResumeSectionKey =
  | 'summary'
  | 'skills'
  | 'projects'
  | 'experience'
  | 'teaching'
  | 'publications'
  | 'openSource'
  | 'patents'
  | 'education'
  | 'certifications'
  | 'researchInterests'
  | 'courses'
  | 'aiFinance'
  | 'industryEngagement'
  | 'awards'
  | 'references'
  | 'links';

/** Ordered sections (everything except the header-level `links` toggle). */
export const RESUME_SECTION_KEYS: ResumeSectionKey[] = [
  'summary',
  'skills',
  'projects',
  'experience',
  'teaching',
  'publications',
  'openSource',
  'patents',
  'education',
  'certifications',
  'researchInterests',
  'courses',
  'aiFinance',
  'industryEngagement',
  'awards',
  'references',
];

/** Per-item resume metadata. All fields optional; see resumeVersions rules. */
export interface ResumeItemMeta {
  /** 1 = most important. Items with priority <= version maxPriority are auto-selected. */
  industryPriority?: number;
  academicPriority?: number;
  /** Experience routing: 'teaching' roles go to the Teaching section. */
  kind?: 'industry' | 'faculty' | 'teaching';
  /** Version-specific project description (falls back to `description`). */
  industryDescription?: string;
  academicDescription?: string;
  /** Version-specific experience bullets (fall back to `desp`). */
  industryDesp?: string[];
  academicDesp?: string[];
  /** Version-specific project highlights (fall back to `highlights`). */
  industryHighlights?: string[];
  academicHighlights?: string[];
  /** Publication research area + keywords. */
  area?: string;
  keywords?: string[];
  /** Patent relevance note. */
  relevance?: string;
  /** Flagged in the builder for manual verification before final use. */
  needsReview?: boolean;
}

export interface ResumeSkill {
  id: string;
  name: string;
  /** Set false to exclude from a version (included in both by default). */
  industry?: boolean;
  academic?: boolean;
}

export interface ResumeSkillCategory {
  id: string;
  label: string;
  /** Restrict the whole category to specific versions (default: all). */
  versions?: ResumeVersionId[];
  skills: ResumeSkill[];
}

export interface ResumeCourse {
  id: string;
  name: string;
  area: 'ai-analytics' | 'finance-business';
  /** taught = supported by academic record; canTeach / interest = expertise claim. */
  status: CourseStatus;
}

export interface ResumeResearchArea {
  id: string;
  name: string;
  primary?: boolean;
  /** Set false to exclude from a version (included in both by default). */
  industry?: boolean;
  academic?: boolean;
}

export interface ResumeAiFinanceItem {
  id: string;
  name: string;
}

export interface ResumeAward {
  id: string;
  title: string;
  year?: string;
  description?: string;
}

export interface ResumeReference {
  id: string;
  name: string;
  role: string;
  contact?: string;
}

/** Presentation + automatic-selection rules for one resume version. */
export interface ResumeVersionPresentation {
  label: string;
  shortLabel: string;
  /** Shown in the version picker: target roles for this version. */
  tagline: string;
  /** Headline line under the name (version-specific). */
  headline: string;
  summaryTitle: string;
  summary: string;
  sectionOrder: ResumeSectionKey[];
  sectionLabels: Record<ResumeSectionKey, string>;
  columns: Partial<Record<ResumeSectionKey, 'left' | 'right'>>;
  footerNote: string;
  /** Auto-include items whose resume.<version>Priority <= maxPriority. */
  maxPriority: number;
  /** Include kind:'teaching' experience as a Teaching section. */
  teaching: boolean;
  /** Which course statuses this version shows. */
  courses: Record<CourseStatus, boolean>;
  /** Include the full AI + Finance expertise list. */
  aiFinance: boolean;
  /** Include industry/consultancy engagements. */
  industryEngagement: boolean;
  /** Include open-source contributions to external projects. */
  openSourceContributions: boolean;
  maxHighlights: number;
  showTechInProjects: boolean;
}



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
  // `kind` routes experience items between Experience/Teaching sections and is
  // read at the top level by the derivation layer — keep it accessible there too.
  if (meta.kind) out.kind = meta.kind;
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
    phone: '+00 0000000000',
    website: 'https://your-website.example.com',
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
      id: 'edu1',
      resume: { industryPriority: 1, academicPriority: 1 },
      institution: 'Your Institution',
      degree: 'Your Degree',
      year: 'YYYY–YYYY',
      image: getAsset('images/education/placeholder.png'),
      thesisTitle: 'Your Thesis Title (optional)',
      description: ['Brief description of your focus or thesis'],
    },
    {
      id: 'edu2',
      resume: { industryPriority: 2, academicPriority: 2 },
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
      id: 'cert1',
      resume: { industryPriority: 1, academicPriority: 1 },
      title: 'Your Certificate or Specialization',
      specialization: true,
      file: getAsset('images/education/Certifications/download.svg'),
      certificates: [
        { name: 'Course 1', file: getAsset('images/education/Certifications/download.svg') },
        { name: 'Course 2', file: getAsset('images/education/Certifications/download.svg') },
      ],
    },
    {
      id: 'cert2',
      resume: { industryPriority: 2, academicPriority: 2 },
      title: 'Another Certificate',
      file: getAsset('images/education/Certifications/download.svg'),
    },
  ],



  // ✅ Experience section updated
  experience: [
    {
      id: 'role1',
      resume: { kind: 'industry', industryPriority: 1, academicPriority: 1 },
      title: 'Your Role',
      cardImage: getAsset('images/experience/placeholder.png'),
      place: 'Your Organization',
      time: '(MMM YYYY – Present)',
      desp: ['Brief responsibility 1', 'Brief responsibility 2'],
    },
    {
      id: 'ta1',
      resume: { kind: 'teaching', industryPriority: 99, academicPriority: 1 },
      title: 'Teaching Assistant (optional)',
      cardImage: getAsset('images/experience/placeholder.png'),
      place: 'Your Organization',
      time: '(MMM YYYY – MMM YYYY)',
      desp: ['Supported instruction or mentoring activities.'],
    },
    {
      id: 'role2',
      resume: { kind: 'industry', industryPriority: 2, academicPriority: 2 },
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
      id: 'project1',
      resume: { industryPriority: 1, academicPriority: 1 },
      title: 'Project Title 1',
      cardImage: getAsset('images/project/placeholder.png'),
      description: 'Short description of your project and what it does...',
      Githublink: 'https://github.com/your-username/your-project',
      tech: ['Tech One', 'Tech Two'],
      role: 'Your role',
      highlights: ['Key highlight one', 'Key highlight two'],
    },
    {
      id: 'project2',
      resume: { industryPriority: 2, academicPriority: 2 },
      title: 'Project Title 2',
      cardImage: getAsset('images/project/placeholder.png'),
      description: 'Another project summary...',
      Githublink: 'https://github.com/your-username/another-project',
      tech: ['Tech One', 'Tech Three'],
      role: 'Your role',
      highlights: ['Key highlight one', 'Key highlight two'],
    },
  ],


  research: [
    {
      id: 'paper1',
      resume: { industryPriority: 1, academicPriority: 1 },
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

  patents: [
    {
      id: 'patent1',
      resume: { industryPriority: 1, academicPriority: 1 },
      title: 'Your Patent Title',
      status: 'Patent application status (filed / published / granted)',
      year: 2026,
      applicationNo: '000000000000',
      inventors: ['Your Name'],
    },
  ],

  openSource: [
    {
      id: 'os1',
      resume: { industryPriority: 1, academicPriority: 1 },
      title: 'Your Open Source Project',
      github: 'https://github.com/your-username/your-repo',
      website: 'https://your-project.example.com',
      pip: 'pip install your-package',
      description: 'One-line description of the project.',
      features: ['Feature one', 'Feature two'],
    },
  ],

  openSourceContributions: [
    {
      id: 'osc1',
      project: 'Project name (contribution)',
      repo: 'https://github.com/external/repo',
      note: 'What you contributed.',
    },
  ],

  industryEngagements: [
    {
      id: 'eng1',
      header: 'Company — Consultancy or Engagement (via Organization)',
      desp: ['What you did in this engagement.', 'Outcome or impact.'],
    },
  ],

  thesis: {
    title: 'Your Thesis Title',
    authors: 'Your Name',
    year: 2026,
    institution: 'Your Institution',
    link: 'https://example.com/thesis',
    citation: 'Your Name (2026). Your Thesis Title. PhD Thesis, Institution.',
  },

  contact: {
    email: 'your.email@example.com',
    linkedin: 'https://www.linkedin.com/in/your-linkedin/',
    github: 'https://github.com/your-username',
    googleScholar: 'https://scholar.google.com/citations?user=YOURID',
    orcid: 'https://orcid.org/0000-0000-0000-0000',
  },
  /* ==========================================================================
     RESUME MASTER LISTS
     Structured skills / courses / research areas / AI+Finance expertise.
     `versions` restricts an entry to specific resume versions (default: both).
     ========================================================================== */

  resumeSkills: [
    {
      id: 'programming',
      label: 'Programming',
      skills: [
        { id: 'python', name: 'Python' },
        { id: 'sql', name: 'SQL' },
        { id: 'c', name: 'C' },
        { id: 'java', name: 'Java' },
        { id: 'bash', name: 'Bash' },
        { id: 'typescript', name: 'TypeScript' },
        { id: 'r', name: 'R' },
      ],
    },
    {
      id: 'mlAi',
      label: 'ML / AI',
      skills: [
        { id: 'machineLearning', name: 'Machine Learning' },
        { id: 'deepLearning', name: 'Deep Learning' },
        { id: 'multimodalLearning', name: 'Multimodal Learning' },
        { id: 'automl', name: 'AutoML' },
        { id: 'pytorch', name: 'PyTorch' },
        { id: 'tensorflow', name: 'TensorFlow' },
        { id: 'scikitLearn', name: 'Scikit-learn' },
        { id: 'huggingFace', name: 'Hugging Face' },
        { id: 'featureEngineering', name: 'Feature Engineering' },
        { id: 'fusionModeling', name: 'Fusion Modeling' },
        { id: 'modelEvaluation', name: 'Model Evaluation' },
        { id: 'experimentation', name: 'Experimentation & Ablation' },
      ],
    },
    {
      id: 'llmGenAi',
      label: 'LLM / Generative AI',
      skills: [
        { id: 'llms', name: 'LLMs' },
        { id: 'rag', name: 'RAG' },
        { id: 'localLlms', name: 'Local LLMs (Ollama)' },
        { id: 'langchain', name: 'LangChain' },
        { id: 'agenticAi', name: 'Agentic AI' },
        { id: 'aiEvaluation', name: 'AI Evaluation' },
      ],
    },
    {
      id: 'data',
      label: 'Data',
      skills: [
        { id: 'pandas', name: 'Pandas' },
        { id: 'numpy', name: 'NumPy' },
        { id: 'pyspark', name: 'PySpark' },
        { id: 'timeSeries', name: 'Time Series' },
        { id: 'dataVisualization', name: 'Data Visualization' },
        { id: 'dataProcessing', name: 'Large-Scale Data Processing' },
      ],
    },
    {
      id: 'engineering',
      label: 'Engineering & MLOps',
      skills: [
        { id: 'fastapi', name: 'FastAPI' },
        { id: 'docker', name: 'Docker' },
        { id: 'kubernetes', name: 'Kubernetes' },
        { id: 'airflow', name: 'Apache Airflow' },
        { id: 'mlflow', name: 'MLflow' },
        { id: 'dvc', name: 'DVC' },
        { id: 'git', name: 'Git' },
        { id: 'apis', name: 'APIs' },
        { id: 'pipelineDesign', name: 'Pipeline Design' },
      ],
    },
    {
      id: 'finance',
      label: 'Finance & Analytics',
      skills: [
        { id: 'financialMachineLearning', name: 'Financial Machine Learning' },
        { id: 'stockMarketPrediction', name: 'Stock Market Prediction' },
        { id: 'financialForecasting', name: 'Financial Forecasting' },
        { id: 'volatilityModelling', name: 'Volatility Modelling' },
        { id: 'riskAnalytics', name: 'Financial Risk Analytics' },
        { id: 'portfolioAnalytics', name: 'Portfolio Analytics' },
        { id: 'financialMarkets', name: 'Financial Markets' },
        { id: 'quantitativeAnalytics', name: 'Quantitative Analytics' },
        { id: 'businessAnalytics', name: 'Business Analytics' },
        { id: 'securityAnalysis', name: 'Security Analysis' },
      ],
    },
  ],

  // Courses: status distinguishes what was ACTUALLY taught from what can be taught.
  resumeCourses: [
    // --- Actually taught at CHRIST (Deemed to be University) ---
    { id: 'businessAnalytics', name: 'Business Analytics', area: 'ai-analytics', status: 'taught' },
    { id: 'python', name: 'Python', area: 'ai-analytics', status: 'taught' },
    { id: 'machineLearning', name: 'Machine Learning', area: 'ai-analytics', status: 'taught' },
    { id: 'artificialIntelligence', name: 'Artificial Intelligence', area: 'ai-analytics', status: 'taught' },
    { id: 'predictiveAnalytics', name: 'Predictive Analytics', area: 'ai-analytics', status: 'taught' },
    { id: 'dataAnalytics', name: 'Data Analytics', area: 'ai-analytics', status: 'taught' },
    // --- AI / Analytics — can teach ---
    { id: 'advancedPython', name: 'Advanced Programming in Python', area: 'ai-analytics', status: 'canTeach' },
    { id: 'introAi', name: 'Introduction to Artificial Intelligence', area: 'ai-analytics', status: 'canTeach' },
    { id: 'bigDataAnalytics', name: 'Big Data Analytics', area: 'ai-analytics', status: 'canTeach' },
    { id: 'neuralNetworks', name: 'Neural Networks', area: 'ai-analytics', status: 'canTeach' },
    { id: 'dataVisualizationCourse', name: 'Data Visualization', area: 'ai-analytics', status: 'canTeach' },
    { id: 'rProgramming', name: 'R Programming', area: 'ai-analytics', status: 'canTeach' },
    { id: 'socialMediaAnalytics', name: 'Social Media Analytics', area: 'ai-analytics', status: 'canTeach' },
    // --- Finance / Business — can teach ---
    { id: 'sustainableFinance', name: 'Sustainable Finance & Responsible Investment', area: 'finance-business', status: 'canTeach' },
    { id: 'fixedIncome', name: 'Fixed Income Markets', area: 'finance-business', status: 'canTeach' },
    { id: 'urbanEconomics', name: 'Urban Economics', area: 'finance-business', status: 'canTeach' },
    { id: 'bankingFinTech', name: 'Banking and FinTech', area: 'finance-business', status: 'canTeach' },
    { id: 'mergersAcquisitions', name: 'Mergers and Acquisitions', area: 'finance-business', status: 'canTeach' },
    { id: 'financialRiskManagement', name: 'Financial Risk Management', area: 'finance-business', status: 'canTeach' },
    { id: 'globalBusinessEnvironment', name: 'Global Business Environment', area: 'finance-business', status: 'canTeach' },
    { id: 'projectFinance', name: 'Project Finance and Infrastructure Financing', area: 'finance-business', status: 'canTeach' },
    { id: 'strategicFinancialManagement', name: 'Strategic Financial Management', area: 'finance-business', status: 'canTeach' },
    { id: 'securityAnalysisPortfolio', name: 'Security Analysis and Portfolio Management', area: 'finance-business', status: 'canTeach' },
    { id: 'portfolioManagement', name: 'Portfolio Management', area: 'finance-business', status: 'canTeach' },
    { id: 'managementAccounting', name: 'Management Accounting', area: 'finance-business', status: 'canTeach' },
    { id: 'financialStatementAnalysis', name: 'Financial Statement Analysis', area: 'finance-business', status: 'canTeach' },
    { id: 'econometrics', name: 'Econometrics', area: 'finance-business', status: 'canTeach' },
  ] as ResumeCourse[],

  resumeResearchAreas: [
    { id: 'appliedML', name: 'Applied Machine Learning', primary: true, industry: false },
    { id: 'multimodalML', name: 'Multimodal Machine Learning' },
    { id: 'automl', name: 'AutoML' },
    { id: 'financialML', name: 'Financial Machine Learning' },
    { id: 'financialForecasting', name: 'Financial Forecasting' },
    { id: 'volatilityForecasting', name: 'Financial Volatility Forecasting' },
    { id: 'aiForFinance', name: 'AI for Finance', industry: false },
    { id: 'llms', name: 'Large Language Models (LLMs)' },
    { id: 'rag', name: 'Retrieval-Augmented Generation (RAG)' },
    { id: 'researchIntelligence', name: 'Research Intelligence', industry: false },
    { id: 'aiEvaluation', name: 'AI Evaluation', industry: false },
    { id: 'agenticAi', name: 'Agentic AI', industry: false },
    { id: 'decisionFusion', name: 'Decision-level and meta-fusion for multimodal learning' },
    { id: 'temporalAlignment', name: 'Temporal alignment and multi-scale modeling for financial time-series' },
    { id: 'representationLearning', name: 'Representation learning for heterogeneous tabular data' },
    { id: 'featureSelection', name: 'Hybrid feature selection with LLM-guided priors' },
    { id: 'tabularFoundation', name: 'Tabular foundation models' },
    { id: 'edgeMl', name: 'Efficiency and edge-deployable multimodal systems' },
    { id: 'localLlm', name: 'Local LLM integration' },
    { id: 'fusionTheory', name: 'Information-theoretic analysis of fusion and ensembles', industry: false },
  ] as ResumeResearchArea[],

  resumeAiFinance: [
    { id: 'financialMachineLearning', name: 'Financial Machine Learning' },
    { id: 'stockMarketPrediction', name: 'Stock Market Prediction' },
    { id: 'financialForecasting', name: 'Financial Forecasting' },
    { id: 'volatilityModelling', name: 'Financial Volatility Modelling' },
    { id: 'financialRiskAnalytics', name: 'Financial Risk Analytics' },
    { id: 'portfolioAnalytics', name: 'Portfolio Analytics' },
    { id: 'financialSentimentAnalysis', name: 'Financial Sentiment Analysis' },
    { id: 'aiForFinTech', name: 'AI for FinTech' },
    { id: 'aiFinancialDecisionMaking', name: 'AI-assisted Financial Decision Making' },
    { id: 'mlFinancialMarkets', name: 'Machine Learning for Financial Markets' },
    { id: 'quantitativeAnalytics', name: 'Quantitative Analytics' },
    { id: 'businessAnalytics', name: 'Business Analytics' },
  ] as ResumeAiFinanceItem[],

  // Add verified awards / references here — they appear in the builder automatically.
  resumeAwards: [] as ResumeAward[],
  resumeReferences: [] as ResumeReference[],

  /* ==========================================================================
     RESUME VERSIONS
     Presentation config + automatic selection rules per version.
     maxPriority: items with resume.<version>Priority <= maxPriority are
     auto-selected (1 = most important; 99 = opt-out / only via checkbox).
     ========================================================================== */

  resumeVersions: {
    /* ======================================================================
       VERSION 1 — INDUSTRY (AI Engineering / Applied Scientist)
       ====================================================================== */
    industry: {
      label: 'Industry — AI / Applied Scientist',
      shortLabel: 'Industry',
      tagline:
        'Applied Scientist · Applied Research Scientist · ML Engineer · AI Engineer · Research Engineer. Leads with systems, benchmarks, and engineering evidence.',
      headline: 'Applied Scientist | Multimodal AI · AutoML · LLMs & RAG · Financial ML',
      summaryTitle: 'Professional Summary',
      summary:
        'Applied AI/ML researcher and founder with a PhD in Multimodal Machine Learning. Builds research-driven AI systems end to end: Brain-AI, an open-source multimodal AutoML engine; LitSynth, a RAG-based research-intelligence system; and InstantGrade, an automated evaluation tool on PyPI. Works across PyTorch, LLMs and RAG, agentic workflows, multimodal fusion, and rigorous model evaluation, with reproducible pipelines on Airflow/MLflow. PhD research on stock-price prediction fusing tabular financial indicators, time-series data, and LLM-generated sentiment; publications and patent applications spanning multimodal AutoML, feature selection, and financial machine learning.',
      sectionOrder: [
        'summary',
        'skills',
        'projects',
        'experience',
        'publications',
        'openSource',
        'patents',
        'education',
        'certifications',
        'researchInterests',
      ],
      sectionLabels: {
        summary: 'Professional Summary',
        skills: 'Core Technical Expertise',
        projects: 'Selected AI/ML Research & Systems',
        experience: 'Professional Experience',
        teaching: 'Teaching Experience',
        publications: 'Selected Research',
        openSource: 'Open Source',
        patents: 'Patents',
        education: 'Education',
        certifications: 'Certifications',
        researchInterests: 'Research Interests',
        courses: 'Courses / Teaching Expertise',
        aiFinance: 'AI + Finance',
        industryEngagement: 'Industry Consultancy & Academic–Industry Engagements',
        awards: 'Awards & Achievements',
        references: 'References',
        links: 'Links',
      },
      columns: {
        summary: 'left',
        skills: 'left',
        experience: 'left',
        education: 'left',
        certifications: 'left',
        projects: 'right',
        publications: 'right',
        openSource: 'right',
        patents: 'right',
        researchInterests: 'right',
      },
      footerNote: 'Founder, SolarpunkWorks Pvt Ltd',
      maxPriority: 3,
      teaching: false,
      courses: { taught: false, canTeach: false, interest: false },
      aiFinance: false,
      industryEngagement: false,
      openSourceContributions: true,
      maxHighlights: 2,
      showTechInProjects: true,
    },

    /* ======================================================================
       VERSION 2 — ACADEMIC (AI + Finance / Business Analytics)
       ====================================================================== */
    academic: {
      label: 'Academic — AI + Finance / Business Analytics',
      shortLabel: 'Academic',
      tagline:
        'Assistant Professor · Faculty — AI/ML · Business Analytics · FinTech · Data Science. Leads with the AI × Finance intersection, teaching, and publications.',
      headline: 'AI & Machine Learning Researcher | Financial Analytics | Business Analytics',
      summaryTitle: 'Academic Profile',
      summary:
        'Assistant Professor at CHRIST (Deemed to be University), Bangalore, working at the intersection of Artificial Intelligence, Machine Learning, and Finance. Holds a PhD in Multimodal Machine Learning — thesis on stock-price prediction using multimodal fusion of financial indicators, time-series data, and LLM-generated sentiment — together with a Master of Commerce in Finance. Teaches Business Analytics, Python, Machine Learning, Artificial Intelligence, and Predictive Analytics; publishes research in financial machine learning and volatility forecasting; and mentors student research and industry-linked projects through university–industry consultancy.',
      sectionOrder: [
        'summary',
        'education',
        'experience',
        'researchInterests',
        'publications',
        'projects',
        'teaching',
        'courses',
        'aiFinance',
        'patents',
        'openSource',
        'industryEngagement',
        'certifications',
      ],
      sectionLabels: {
        summary: 'Academic Profile',
        skills: 'Technical Skills',
        projects: 'Research Projects',
        experience: 'Academic & Professional Experience',
        teaching: 'Teaching Experience',
        publications: 'Selected Publications',
        openSource: 'Open Source',
        patents: 'Patents',
        education: 'Education',
        certifications: 'Certifications',
        researchInterests: 'Research Areas',
        courses: 'Courses / Teaching Expertise',
        aiFinance: 'AI + Finance Expertise',
        industryEngagement: 'Industry / Consultancy Engagement',
        awards: 'Awards & Achievements',
        references: 'References',
        links: 'Links',
      },
      columns: {
        summary: 'left',
        education: 'left',
        experience: 'left',
        teaching: 'left',
        courses: 'left',
        certifications: 'left',
        researchInterests: 'right',
        publications: 'right',
        projects: 'right',
        aiFinance: 'right',
        patents: 'right',
        openSource: 'right',
        industryEngagement: 'right',
      },
      footerNote: 'Founder, SolarpunkWorks Pvt Ltd',
      maxPriority: 3,
      teaching: true,
      courses: { taught: true, canTeach: true, interest: false },
      aiFinance: true,
      industryEngagement: true,
      openSourceContributions: true,
      maxHighlights: 3,
      showTechInProjects: true,
    },
  } satisfies Record<ResumeVersionId, ResumeVersionPresentation>,
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
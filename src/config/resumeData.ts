// src/config/resumeData.ts
/* ============================================================================
   RESUME DERIVATION LAYER
   ============================================================================
   All resume content and configuration now lives in `config.ts`:
     - items carry `id` + `resume` metadata (priorities, version descriptions)
     - master lists: resumeSkills, resumeCourses, resumeResearchAreas,
       resumeAiFinance, resumeAwards, resumeReferences
     - resumeVersions: presentation + automatic selection rules

   This file derives the typed master data + per-version default selections
   from siteConfig. Adding a new item to config.ts (with an id + resume block)
   automatically makes it appear in the builder and get selected by priority —
   no changes needed here or in the rendering logic.
   ========================================================================== */

import siteConfig, {
  RESUME_SECTION_KEYS,
  type ResumeVersionId,
  type ResumeVersionPresentation,
  type ResumeSectionKey,
  type CourseStatus,
} from './config';

/* ---------------------------------- types --------------------------------- */

export type { ResumeVersionId, CourseStatus };
export type SectionKey = ResumeSectionKey;
export type ResumeVersionConfig = ResumeVersionPresentation;

/** Ordered sections (everything except the header-level `links` toggle). */
export const ORDERED_SECTION_KEYS = RESUME_SECTION_KEYS;

/** Attach stable IDs to siteConfig arrays (index-aligned; falls back safely). */
const withIds = <T,>(items: readonly T[], ids: string[]): (T & { id: string })[] =>
  items.map((item, i) => ({ ...(item as object), id: ids[i] ?? `item-${i}` })) as (T & { id: string })[];

/* ------------------------------ master arrays ----------------------------- */

type ExperienceBase = (typeof siteConfig.experience)[number];
type ProjectBase = (typeof siteConfig.projects)[number];
type PublicationBase = (typeof siteConfig.research)[number];
type PatentBase = (typeof siteConfig.patents)[number];
type EducationBase = (typeof siteConfig.education)[number];
type CertificationBase = (typeof siteConfig.certifications)[number];
type OpenSourceBase = (typeof siteConfig.openSource)[number];

export type MasterExperience = ExperienceBase & {
  id: string;
  kind: 'industry' | 'faculty' | 'teaching';
  industryDesp?: string[];
  academicDesp?: string[];
};
export type MasterProject = ProjectBase & {
  id: string;
  industryDescription?: string;
  academicDescription?: string;
  industryHighlights?: string[];
  academicHighlights?: string[];
  needsReview?: boolean;
};
export type MasterPublication = PublicationBase & {
  id: string;
  area?: string;
  keywords?: string[];
  needsReview?: boolean;
};
export type MasterPatent = PatentBase & {
  id: string;
  relevance?: string;
  needsReview?: boolean;
};
export type MasterEducation = EducationBase & { id: string };
export type MasterCertification = CertificationBase & { id: string };
export type MasterOpenSource = OpenSourceBase & { id: string };

/** Skill category as stored in config (with optional per-version flags). */
type ResumeSkillCategoryView = (typeof siteConfig.resumeSkills)[number] & {
  versions?: ResumeVersionId[];
  skills: { id: string; name: string; industry?: boolean; academic?: boolean }[];
};

/* --------------------------- synthetic PhD project ------------------------- */

/**
 * The PhD thesis research is resume-eligible but is not a siteConfig.projects
 * entry — it is synthesized here from the education/thesis records.
 */
const phdResearchProject: MasterProject = {
  id: 'phdResearch',
  resume: {
    industryPriority: 1,
    academicPriority: 1,
    industryDescription:
      'Built multimodal fusion pipelines (early, late, hybrid, decision-level) combining tabular financial indicators, time-series data, and LLM-generated sentiment for multi-horizon stock prediction. Reproducible ML pipelines on Apache Airflow with MLflow tracking; local LLM inference on edge devices within hybrid fusion workflows; extensive ablation and feature-importance analysis.',
    academicDescription:
      'Thesis: Advances on Stock Price Prediction Using Machine Learning (CHRIST University, 2025). Developed multimodal representation and fusion techniques — early, late, hybrid, and decision-level — combining tabular financial indicators, time-series data, and LLM-generated sentiment, improving multi-horizon prediction accuracy and robustness. Designed temporal-alignment methods for heterogeneous data sources and conducted extensive ablation studies for model interpretability.',
  },
  title: 'Multimodal Stock Price Prediction (PhD Research)',
  cardImage: siteConfig.education[0]?.image ?? '',
  description:
    'PhD thesis research on stock-price prediction using multimodal machine learning — fusing tabular financial indicators, time-series data, and LLM-generated sentiment.',
  Githublink: 'http://hdl.handle.net/10603/680165',
  tech: ['Python', 'PyTorch', 'Apache Airflow', 'MLflow'],
  role: 'PhD researcher',
  highlights: [
    'Early, late, hybrid, and decision-level fusion of tabular, time-series, and LLM-sentiment modalities',
    'Temporal alignment methods for heterogeneous, multi-time-scale financial data',
    'Reproducible pipelines on Apache Airflow with MLflow experiment tracking',
    'Extensive ablation studies and feature-importance analysis for interpretability',
  ],
} as unknown as MasterProject;

/* ------------------------------ master bundle ----------------------------- */

export const masterData = {
  experience: siteConfig.experience as MasterExperience[],
  projects: [siteConfig.projects[0], siteConfig.projects[1], phdResearchProject, ...siteConfig.projects.slice(2)] as MasterProject[],
  publications: siteConfig.research as MasterPublication[],
  patents: siteConfig.patents as MasterPatent[],
  certifications: siteConfig.certifications as MasterCertification[],
  education: siteConfig.education as MasterEducation[],
  openSource: siteConfig.openSource as MasterOpenSource[],
  openSourceContributions: siteConfig.openSourceContributions,
  industryEngagements: siteConfig.industryEngagements,
  skillCategories: siteConfig.resumeSkills as ResumeSkillCategoryView[],
  courses: siteConfig.resumeCourses,
  researchAreas: siteConfig.resumeResearchAreas,
  aiFinance: siteConfig.resumeAiFinance,
  awards: siteConfig.resumeAwards,
  references: siteConfig.resumeReferences,
  thesis: siteConfig.thesis,
};

/* --------------------------- automatic selection -------------------------- */

/**
 * Auto-select item IDs for a version by priority:
 * an item is included when its `resume.<version>Priority` is defined and
 * <= the version's maxPriority. Order follows the master array order.
 */
const autoSelect = <T extends { id: string; resume?: { industryPriority?: number; academicPriority?: number } }>(
  items: T[],
  version: ResumeVersionId,
  maxPriority: number
): string[] =>
  items
    .filter((item) => {
      const p = item.resume?.[`${version}Priority` as const];
      return typeof p === 'number' && p <= maxPriority;
    })
    .map((item) => item.id);

/** Skills visible to a version (per-skill `industry`/`academic` flags). */
const autoSelectSkills = (version: ResumeVersionId) =>
  (siteConfig.resumeSkills as ResumeSkillCategoryView[])
    .filter((cat) => !cat.versions || cat.versions.includes(version))
    .map((cat) => ({
      id: cat.id,
      skills: cat.skills
        .filter((s) => (s as { industry?: boolean; academic?: boolean })[version] !== false)
        .map((s) => s.id),
    }))
    .filter((cat) => cat.skills.length > 0);

/** Research areas visible to a version (per-area `industry`/`academic` flags). */
const autoSelectResearchAreas = (version: ResumeVersionId) =>
  siteConfig.resumeResearchAreas
    .filter((a) => a[version] !== false)
    .map((a) => a.id);

/* ------------------------------ version configs --------------------------- */

export const resumeVersions: Record<ResumeVersionId, ResumeVersionConfig> = siteConfig.resumeVersions;

/* ------------------------------ lookup maps ------------------------------- */

const toMap = <T extends { id: string }>(list: T[]): Record<string, T> =>
  Object.fromEntries(list.map((item) => [item.id, item])) as Record<string, T>;

export const experienceById = toMap(masterData.experience);
export const projectById = toMap(masterData.projects);
export const publicationById = toMap(masterData.publications);
export const patentById = toMap(masterData.patents);
export const certificationById = toMap(masterData.certifications);
export const educationById = toMap(masterData.education);
export const openSourceById = toMap(masterData.openSource);
export const courseById = toMap(masterData.courses);
export const researchAreaById = toMap(masterData.researchAreas);
export const aiFinanceById = toMap(masterData.aiFinance);

/* --------------------- per-version default UI selections ------------------ */

export interface VersionDefaults {
  experience: string[];
  teaching: string[];
  projects: string[];
  publications: string[];
  patents: string[];
  certifications: string[];
  education: string[];
  openSource: string[];
  researchAreas: string[];
  aiFinance: string[];
  courses: string[];
  skillCategories: { id: string; skills: string[] }[];
}

export const versionDefaults: Record<ResumeVersionId, VersionDefaults> = {
  industry: {
    experience: autoSelect(masterData.experience, 'industry', resumeVersions.industry.maxPriority),
    teaching: resumeVersions.industry.teaching
      ? masterData.experience.filter((e) => e.kind === 'teaching').map((e) => e.id)
      : [],
    projects: autoSelect(masterData.projects, 'industry', resumeVersions.industry.maxPriority),
    publications: autoSelect(masterData.publications, 'industry', resumeVersions.industry.maxPriority),
    patents: autoSelect(masterData.patents, 'industry', resumeVersions.industry.maxPriority),
    certifications: autoSelect(masterData.certifications, 'industry', resumeVersions.industry.maxPriority),
    education: autoSelect(masterData.education, 'industry', resumeVersions.industry.maxPriority),
    openSource: autoSelect(masterData.openSource, 'industry', resumeVersions.industry.maxPriority),
    researchAreas: autoSelectResearchAreas('industry'),
    aiFinance: resumeVersions.industry.aiFinance ? masterData.aiFinance.map((a) => a.id) : [],
    courses: resumeVersions.industry.courses.taught || resumeVersions.industry.courses.canTeach
      ? masterData.courses
          .filter((c) => resumeVersions.industry.courses[c.status as CourseStatus])
          .map((c) => c.id)
      : [],
    skillCategories: autoSelectSkills('industry'),
  },
  academic: {
    experience: autoSelect(masterData.experience, 'academic', resumeVersions.academic.maxPriority),
    teaching: resumeVersions.academic.teaching
      ? masterData.experience.filter((e) => e.kind === 'teaching').map((e) => e.id)
      : [],
    projects: autoSelect(masterData.projects, 'academic', resumeVersions.academic.maxPriority),
    publications: autoSelect(masterData.publications, 'academic', resumeVersions.academic.maxPriority),
    patents: autoSelect(masterData.patents, 'academic', resumeVersions.academic.maxPriority),
    certifications: autoSelect(masterData.certifications, 'academic', resumeVersions.academic.maxPriority),
    education: autoSelect(masterData.education, 'academic', resumeVersions.academic.maxPriority),
    openSource: autoSelect(masterData.openSource, 'academic', resumeVersions.academic.maxPriority),
    researchAreas: autoSelectResearchAreas('academic'),
    aiFinance: resumeVersions.academic.aiFinance ? masterData.aiFinance.map((a) => a.id) : [],
    courses: resumeVersions.academic.courses.taught || resumeVersions.academic.courses.canTeach
      ? masterData.courses
          .filter((c) => resumeVersions.academic.courses[c.status as CourseStatus])
          .map((c) => c.id)
      : [],
    skillCategories: autoSelectSkills('academic'),
  },
};

#!/usr/bin/env node
/* ============================================================================
   resume-content-lib.js
   ----------------------------------------------------------------------------
   Zero-dependency parser + serializer for the website content markdown file
   (resume.md). Used by:
     - scripts/build-resume-content.js   (resume.md -> src/config/resume-content.json)
     - scripts/export-resume-content.js  (config.ts -> resume.md)

   FORMAT (see RESUME_GUIDE.md at the project root for the user-facing docs):
     # Title                          ignored
     <!-- comment -->                 ignored (may span lines)
     ## Section                       starts a section (names below)
     ### Item Title                   starts an item inside the section
     - Key: value                     item metadata (single line)
     Key: value                       item metadata (dash optional)
     Key:                             starts a named list; following "- x" lines
     - plain value                    entry in the section's default list
     Free text                        paragraph (Summary section only)

   List items may carry tags in parentheses:
     - Applied Machine Learning (primary)
     - AI for Finance (academic only)
     - PySpark (industry only)
   ========================================================================== */

'use strict';

/* ------------------------------- utilities -------------------------------- */

const slugify = (text) =>
  String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'item';

const normKey = (k) => String(k || '').trim().toLowerCase().replace(/\s+/g, ' ');

const parseBool = (v) => /^(true|yes|y|x|1|on)$/i.test(String(v || '').trim());

const parsePriority = (v) => {
  const n = parseInt(String(v).replace(/[^0-9]/g, ''), 10);
  return Number.isFinite(n) ? n : undefined;
};

const splitList = (v) =>
  String(v || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

/** Tags allowed at the end of list entries, e.g. "Name (primary, academic only)". */
const parseTags = (text) => {
  const tags = {};
  let name = String(text || '').trim();
  const m = name.match(/\s*\(([^()]*)\)\s*$/);
  if (m) {
    const parts = m[1].split(',').map((s) => s.trim().toLowerCase());
    let matched = false;
    for (const p of parts) {
      if (p === 'primary') { tags.primary = true; matched = true; }
      else if (p === 'industry only' || p === 'industry') { tags.industry = true; matched = true; }
      else if (p === 'academic only' || p === 'academic') { tags.academic = true; matched = true; }
      else { matched = false; break; }
    }
    if (matched) name = name.slice(0, m.index).trim();
  }
  return { name: name.trim(), tags };
};

/* ------------------------------ section map ------------------------------- */

/** Canonical section ids and the aliases users may write after "##". */
const SECTION_ALIASES = {
  personal: 'personal',
  about: 'personal',
  contact: 'personal',
  summary: 'summary',
  profile: 'summary',
  experience: 'experience',
  'work experience': 'experience',
  employment: 'experience',
  projects: 'projects',
  publications: 'publications',
  research: 'publications',
  papers: 'publications',
  patents: 'patents',
  education: 'education',
  certifications: 'certifications',
  certificates: 'certifications',
  'open source': 'openSource',
  opensource: 'openSource',
  'open source contributions': 'openSourceContributions',
  contributions: 'openSourceContributions',
  'industry engagements': 'industryEngagements',
  'industry consultancy': 'industryEngagements',
  consultancy: 'industryEngagements',
  thesis: 'thesis',
  books: 'books',
  skills: 'skills',
  courses: 'courses',
  'research areas': 'researchAreas',
  'research interests': 'researchAreas',
  'ai + finance': 'aiFinance',
  'ai finance': 'aiFinance',
  awards: 'awards',
  'awards & achievements': 'awards',
  references: 'references',
  copyrights: 'copyrights',
  'design work': 'additionalDesignWork',
  'resume versions': 'resumeVersions',
};

const matchSection = (heading) => {
  const key = normKey(heading).replace(/[:*]/g, '');
  return SECTION_ALIASES[key] || null;
};

/**
 * Metadata keys per section. Values map to item fields; special targets:
 *  - "@list:<name>"  the value opens/continues a named list
 *  - "@default"      the value is a plain list entry
 */
const ITEM_KEYS = {
  personal: {
    name: 'name',
    title: 'title',
    tagline: 'tagline',
    location: 'location',
    phone: 'phone',
    website: 'website',
    email: 'email',
    linkedin: 'linkedin',
    github: 'github',
    'google scholar': 'googleScholar',
    scholar: 'googleScholar',
    orcid: 'orcid',
    image: 'image',
    'image fallback': 'imageFallback',
    'seo title': 'seoTitle',
    'seo description': 'seoDescription',
    'animated text': '@list:animatedText',
  },
  experience: {
    place: 'place',
    organisation: 'place',
    organization: 'place',
    company: 'place',
    time: 'time',
    dates: 'time',
    period: 'time',
    kind: 'kind',
    type: 'kind',
    'industry priority': 'industryPriority',
    'academic priority': 'academicPriority',
    image: 'cardImage',
    'card image': 'cardImage',
    logo: 'cardImage',
    'industry bullets': '@list:industryDesp',
    'academic bullets': '@list:academicDesp',
    'needs review': 'needsReview',
    id: 'id',
  },
  projects: {
    role: 'role',
    tech: 'tech',
    technologies: 'tech',
    stack: 'tech',
    link: 'Githublink',
    url: 'Githublink',
    demo: 'Githublink',
    github: 'github',
    repo: 'github',
    'local path': 'localPath',
    'industry priority': 'industryPriority',
    'academic priority': 'academicPriority',
    description: 'description',
    summary: 'description',
    'industry description': 'industryDescription',
    'academic description': 'academicDescription',
    'industry highlights': '@list:industryHighlights',
    'academic highlights': '@list:academicHighlights',
    'needs review': 'needsReview',
    id: 'id',
  },
  publications: {
    authors: 'authors',
    author: 'authors',
    venue: 'conferences',
    conference: 'conferences',
    journal: 'conferences',
    'published in': 'conferences',
    year: 'researchYr',
    link: 'link',
    doi: 'link',
    url: 'link',
    area: 'area',
    'research area': 'area',
    'industry priority': 'industryPriority',
    'academic priority': 'academicPriority',
    abstract: 'abstract',
    citation: 'citation',
    image: 'image',
    'needs review': 'needsReview',
    id: 'id',
  },
  patents: {
    status: 'status',
    year: 'year',
    'application number': 'applicationNo',
    'application no': 'applicationNo',
    inventors: 'inventors',
    inventor: 'inventors',
    reference: 'reference',
    relevance: 'relevance',
    'industry priority': 'industryPriority',
    'academic priority': 'academicPriority',
    'needs review': 'needsReview',
    id: 'id',
  },
  education: {
    institution: 'institution',
    university: 'institution',
    school: 'institution',
    degree: 'degree',
    year: 'year',
    years: 'year',
    department: 'department',
    guide: 'guide',
    advisor: 'guide',
    supervisor: 'guide',
    thesis: 'thesisTitle',
    'thesis title': 'thesisTitle',
    'thesis link': 'thesisLink',
    image: 'image',
    'industry priority': 'industryPriority',
    'academic priority': 'academicPriority',
    id: 'id',
  },
  certifications: {
    specialization: 'specialization',
    file: 'file',
    certificate: 'file',
    year: 'year',
    'industry priority': 'industryPriority',
    'academic priority': 'academicPriority',
    certificates: '@list:certificates',
    id: 'id',
  },
  openSource: {
    github: 'github',
    website: 'website',
    pip: 'pip',
    npm: 'pip',
    description: 'description',
    'industry priority': 'industryPriority',
    'academic priority': 'academicPriority',
    features: '@list:features',
    id: 'id',
  },
  openSourceContributions: {
    project: 'project',
    repo: 'repo',
    note: 'note',
    description: 'note',
    id: 'id',
  },
  industryEngagements: {
    header: 'header',
    organisation: 'header',
    organization: 'header',
    title: 'header',
    id: 'id',
  },
  thesis: {
    title: 'title',
    authors: 'authors',
    author: 'authors',
    year: 'year',
    institution: 'institution',
    link: 'link',
    citation: 'citation',
  },
  books: {
    title: 'title',
    description: 'description',
    link: 'link',
    image: 'image',
    id: 'id',
  },
  awards: {
    year: 'year',
    description: 'description',
    id: 'id',
  },
  references: {
    role: 'role',
    position: 'role',
    contact: 'contact',
    email: 'contact',
    id: 'id',
  },
  copyrights: {
    'diary no': 'diaryNo',
    'diary number': 'diaryNo',
    id: 'id',
  },
  additionalDesignWork: {
    reference: 'reference',
    'filing context': 'filingContext',
    date: 'date',
    status: 'status',
    id: 'id',
  },
  courses: {
    status: 'status',
    area: 'area',
    id: 'id',
  },
  resumeVersions: {
    label: 'label',
    tagline: 'tagline',
    'footer note': 'footerNote',
    headline: 'headline',
    summary: 'summary',
  },
};

/** Where plain "- value" lines go, per section. */
const DEFAULT_LIST_FIELD = {
  experience: 'desp',
  projects: 'highlights',
  education: 'description',
  certifications: 'description',
  openSource: 'features',
  industryEngagements: 'desp',
  awards: 'description',
  skills: 'skills',
  courses: null,
  researchAreas: 'areas',
  aiFinance: 'items',
  publications: null,
  patents: null,
  openSourceContributions: null,
  thesis: null,
  books: null,
  references: null,
  copyrights: null,
  additionalDesignWork: null,
  personal: null,
  summary: null,
  resumeVersions: null,
};

/** Sections whose items are "### Title" based (vs key-only). */
const ITEMIZED_SECTIONS = new Set([
  'experience',
  'projects',
  'publications',
  'patents',
  'education',
  'certifications',
  'openSource',
  'openSourceContributions',
  'industryEngagements',
  'books',
  'awards',
  'references',
  'copyrights',
  'additionalDesignWork',
  'skills',
  'courses',
  'resumeVersions',
]);

/* --------------------------------- parser --------------------------------- */

const emptyContent = () => ({
  personal: {},
  summary: {},
  experience: [],
  projects: [],
  publications: [],
  patents: [],
  education: [],
  certifications: [],
  openSource: [],
  openSourceContributions: [],
  industryEngagements: [],
  thesis: {},
  books: [],
  skills: [],
  courses: [],
  researchAreas: [],
  aiFinance: [],
  awards: [],
  references: [],
  copyrights: [],
  additionalDesignWork: [],
  resumeVersions: {},
});

/**
 * Parse resume.md text into a raw content object.
 * Asset paths stay as written (public/-relative or full URLs); config.ts wraps
 * them with getAsset() at load time.
 */
function parseMarkdown(mdText) {
  const content = emptyContent();
  const lines = String(mdText || '').split(/\r?\n/);

  let section = null; // canonical section id
  let item = null; // current item object
  let listKey = null; // active named list ("desp", "certificates", ...)
  let listTarget = null; // object array the named list appends into
  let paragraph = null; // paragraph buffer (summary blocks)

  const flushParagraph = () => {
    if (paragraph && section === 'summary' && item) {
      item.text = paragraph.join(' ').trim();
    }
    paragraph = null;
  };

  const pushItem = () => {
    flushParagraph();
    if (!section || !item) return;
    if (section === 'summary') {
      // item = { version: 'industry'|'academic', text }
      if (item.version && item.text) content.summary[item.version] = item.text;
    } else if (section === 'personal') {
      Object.assign(content.personal, item);
    } else if (section === 'thesis') {
      Object.assign(content.thesis, item);
    } else if (section === 'researchAreas' || section === 'aiFinance') {
      // List-only sections: the single item object accumulates the entries.
      if (section === 'researchAreas') content.researchAreas = { areas: item.areas || [] };
      else content.aiFinance = { items: item.items || [] };
    } else if (section === 'resumeVersions') {
      const v = normKey(item.__name).startsWith('ind') ? 'industry' : 'academic';
      const { __name, ...rest } = item;
      content.resumeVersions[v] = { ...(content.resumeVersions[v] || {}), ...rest };
    } else if (Array.isArray(content[section])) {
      content[section].push(item);
    }
    item = null;
    listKey = null;
    listTarget = null;
  };

  const startItem = (title) => {
    pushItem();
    listKey = null;
    listTarget = null;
    if (section === 'summary') {
      const v = normKey(title).startsWith('ind') ? 'industry' : 'academic';
      item = { version: v };
      paragraph = [];
      return;
    }
    item = { __name: title };
    if (ITEMIZED_SECTIONS.has(section)) item.__title = title;
  };

  const applyMeta = (key, rawValue) => {
    if (!section || !item) return;
    const schema = ITEM_KEYS[section] || {};
    const nk = normKey(key);
    const target = schema[nk];

    // Version-specific headline in Personal: "headline (industry)"
    if (section === 'personal' && !target) {
      const hm = nk.match(/^headline \((industry|academic)\)$/);
      if (hm) {
        content.headlines = content.headlines || {};
        content.headlines[hm[1]] = String(rawValue).trim();
        return;
      }
      const hm2 = nk.match(/^(industry|academic) headline$/);
      if (hm2) {
        content.headlines = content.headlines || {};
        content.headlines[hm2[1]] = String(rawValue).trim();
        return;
      }
    }

    if (!target) return; // unknown key -> ignore (forward compatible)

    if (target.startsWith('@list:')) {
      const field = target.slice(6);
      listKey = field;
      if (field === 'certificates') {
        listTarget = [];
        item.certificates = listTarget;
      } else if (field === 'animatedText') {
        listTarget = [];
        item.animatedText = listTarget;
      } else {
        listTarget = null; // appended directly onto item[field] below
        item[field] = [];
      }
      if (String(rawValue).trim()) {
        // inline first entry, e.g. "highlights: - nope" is not supported; ignore
      }
      return;
    }

    let value = String(rawValue).trim();
    if (nk === 'specialization' || nk === 'needs review') {
      item[target] = parseBool(value);
    } else if (nk.endsWith('priority')) {
      const p = parsePriority(value);
      if (p !== undefined) item[target] = p;
    } else if (nk === 'year' && section === 'publications') {
      const n = parseInt(value.replace(/[^0-9]/g, ''), 10);
      item[target] = Number.isFinite(n) ? n : value;
    } else if (nk === 'tech' || nk === 'technologies' || nk === 'stack' || nk === 'inventors' || nk === 'inventor') {
      item[target] = splitList(value);
    } else if (nk === 'kind' || nk === 'type') {
      const k = normKey(value);
      item.kind = k.startsWith('teach') ? 'teaching' : k.startsWith('facult') || k.startsWith('academ') ? 'faculty' : 'industry';
    } else if (nk === 'status' && section === 'courses') {
      const s = normKey(value).replace(/\s+/g, '');
      item.status = s.startsWith('taught') ? 'taught' : s.startsWith('interest') ? 'interest' : 'canTeach';
    } else {
      item[target] = value;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const line = raw.trim();

    // Block comments (single- and multi-line)
    if (line.startsWith('<!--')) {
      if (!line.endsWith('-->')) {
        while (i < lines.length && !lines[i].includes('-->')) i++;
      }
      continue;
    }
    if (!line) {
      // blank line ends paragraphs but keeps lists open until next heading/key
      if (paragraph && paragraph.length) flushParagraph();
      continue;
    }

    // Headings
    if (line.startsWith('### ')) {
      if (section) startItem(line.slice(4).trim());
      continue;
    }
    if (line.startsWith('## ')) {
      pushItem();
      const sec = matchSection(line.slice(3));
      section = sec;
      item = null;
      listKey = null;
      listTarget = null;
      paragraph = null;
      // List-only sections hold entries directly under the heading (no ### items).
      if (sec === 'researchAreas' || sec === 'aiFinance') item = {};
      // Key-only sections (Personal, Thesis) hold metadata without ### items.
      if (sec === 'personal' || sec === 'thesis') item = {};
      continue;
    }
    if (line.startsWith('# ')) continue; // document title

    // Named list entries: "- value" while a named list is open
    if (line.startsWith('- ') && listKey) {
      const value = line.slice(2).trim();
      if (listKey === 'certificates') {
        // objects: "- name: X" starts; "- file: Y" attaches
        const m = value.match(/^(name|file)\s*:\s*(.+)$/i);
        if (m && normKey(m[1]) === 'name') {
          listTarget.push({ name: m[2].trim() });
        } else if (m && normKey(m[1]) === 'file') {
          const last = listTarget[listTarget.length - 1];
          if (last) last.file = m[2].trim();
          else listTarget.push({ file: m[2].trim() });
        } else if (value) {
          listTarget.push({ name: value });
        }
      } else if (Array.isArray(item[listKey])) {
        item[listKey].push(value);
      }
      continue;
    }

    // Metadata: "- Key: value" or "Key: value"
    const metaMatch = line.match(/^(?:-\s+)?([^:]+):\s*(.*)$/);
    if (metaMatch) {
      const key = metaMatch[1].trim();
      const value = metaMatch[2].trim();
      // A "- Something: value" line while NO named list is open:
      // treat as metadata if the key is known for the section, else list entry.
      const nk = normKey(key);
      const schema = ITEM_KEYS[section] || {};
      const isKnownKey =
        schema[nk] ||
        (section === 'personal' && /^(headline \((industry|academic)\)|(industry|academic) headline)$/.test(nk));
      // In Summary paragraphs, "Word: word" is prose, not metadata.
      if (section === 'summary' && paragraph && !line.startsWith('- ')) {
        paragraph.push(line);
        continue;
      }
      if (line.startsWith('- ') && !listKey) {
        if (isKnownKey) {
          flushParagraph();
          applyMeta(key, value);
          continue;
        }
        // plain list entry
        const field = DEFAULT_LIST_FIELD[section];
        if (section && item && field) {
          flushParagraph();
          if (!Array.isArray(item[field])) item[field] = [];
          const { name, tags } = parseTags(value);
          item[field].push(tags && Object.keys(tags).length ? { name, ...tags } : name);
          continue;
        }
      }
      if (!line.startsWith('- ')) {
        flushParagraph();
        applyMeta(key, value);
        continue;
      }
    }

    // Plain list entry without open named list (fallback)
    if (line.startsWith('- ')) {
      const field = DEFAULT_LIST_FIELD[section];
      if (section && item && field) {
        flushParagraph();
        if (!Array.isArray(item[field])) item[field] = [];
        const { name, tags } = parseTags(line.slice(2).trim());
        item[field].push(tags && Object.keys(tags).length ? { name, ...tags } : name);
        continue;
      }
    }

    // Paragraph text (Summary section)
    if (section === 'summary' && item && paragraph) {
      paragraph.push(line);
    }
    // anything else is ignored
  }
  pushItem();

  return content;
}

/* -------------------------------- serializer ------------------------------ */

const ASSET_FIELDS = new Set(['image', 'cardImage', 'file']);

const isRemote = (v) => /^https?:\/\//i.test(String(v || ''));

/** Convert an evaluated asset path ("/images/x.png") to markdown form ("images/x.png"). */
const toMdPath = (v) => {
  const s = String(v || '');
  if (!s || isRemote(s)) return s;
  return s.replace(/^\//, '');
};

const mdEscape = (s) => String(s ?? '');

const asArray = (v) => (Array.isArray(v) ? v : v ? [v] : []);

/**
 * Config items store resume metadata under `item.resume.*` (priorities,
 * version descriptions/bullets, needsReview). The serializer expects them at
 * the top level, so flatten before serializing.
 */
const flattenResumeMeta = (item) => {
  if (!item || typeof item !== 'object' || !item.resume) return item;
  const { resume, ...rest } = item;
  return { ...rest, ...resume };
};

function serializeItem(section, item, opts) {
  const out = [];
  const title = item.__title || item.title || item.name || item.header || item.project || item.institution || item.degree || 'Untitled';
  out.push(`### ${mdEscape(title)}`);
  const kv = (k, v) => {
    if (v === undefined || v === null || v === '' || v === false) return;
    out.push(`${k}: ${typeof v === 'boolean' ? 'true' : v}`);
  };

  if (section === 'experience') {
    kv('Place', item.place);
    kv('Time', item.time);
    if (item.kind) kv('Kind', item.kind === 'teaching' ? 'teaching' : item.kind === 'faculty' ? 'faculty' : 'industry');
    kv('Industry priority', item.industryPriority);
    kv('Academic priority', item.academicPriority);
    kv('Card image', toMdPath(item.cardImage));
    if (item.needsReview) kv('Needs review', 'true');
    asArray(item.desp).forEach((d) => out.push(`- ${d}`));
    if ((item.industryDesp || []).length) {
      out.push('Industry bullets:');
      item.industryDesp.forEach((d) => out.push(`- ${d}`));
    }
    if ((item.academicDesp || []).length) {
      out.push('Academic bullets:');
      item.academicDesp.forEach((d) => out.push(`- ${d}`));
    }
  } else if (section === 'projects') {
    kv('Role', item.role);
    if ((item.tech || []).length) kv('Tech', item.tech.join(', '));
    kv('Link', item.Githublink);
    kv('Github', item.github);
    kv('Local path', item.localPath);
    kv('Industry priority', item.industryPriority);
    kv('Academic priority', item.academicPriority);
    kv('Description', item.description);
    kv('Industry description', item.industryDescription);
    kv('Academic description', item.academicDescription);
    if (item.needsReview) kv('Needs review', 'true');
    if ((item.highlights || []).length) {
      out.push('Highlights:');
      item.highlights.forEach((h) => out.push(`- ${typeof h === 'string' ? h : h.name}`));
    }
    if ((item.industryHighlights || []).length) {
      out.push('Industry highlights:');
      item.industryHighlights.forEach((h) => out.push(`- ${h}`));
    }
    if ((item.academicHighlights || []).length) {
      out.push('Academic highlights:');
      item.academicHighlights.forEach((h) => out.push(`- ${h}`));
    }
  } else if (section === 'publications') {
    kv('Authors', item.authors);
    kv('Venue', item.conferences);
    kv('Year', item.researchYr);
    kv('Link', item.link);
    kv('Area', item.area);
    kv('Industry priority', item.industryPriority);
    kv('Academic priority', item.academicPriority);
    kv('Abstract', item.abstract);
    kv('Citation', item.citation && item.citation.vancouver ? item.citation.vancouver : item.citation);
    kv('Image', toMdPath(item.image));
    if (item.needsReview) kv('Needs review', 'true');
  } else if (section === 'patents') {
    kv('Status', item.status);
    kv('Year', item.year);
    kv('Application number', item.applicationNo);
    if ((item.inventors || []).length) kv('Inventors', item.inventors.join(', '));
    kv('Reference', item.reference);
    kv('Relevance', item.relevance);
    kv('Industry priority', item.industryPriority);
    kv('Academic priority', item.academicPriority);
    if (item.needsReview) kv('Needs review', 'true');
  } else if (section === 'education') {
    kv('Institution', item.institution);
    kv('Degree', item.degree);
    kv('Year', item.year);
    kv('Department', item.department);
    kv('Guide', item.guide);
    kv('Thesis', item.thesisTitle);
    kv('Thesis link', item.thesisLink);
    kv('Image', toMdPath(item.image));
    kv('Industry priority', item.industryPriority);
    kv('Academic priority', item.academicPriority);
    asArray(item.description).forEach((d) => out.push(`- ${d}`));
    asArray(item.keyContributions).forEach((d) => out.push(`- ${d}`));
  } else if (section === 'certifications') {
    if (item.specialization) kv('Specialization', 'true');
    kv('File', toMdPath(item.file));
    kv('Year', item.year);
    kv('Industry priority', item.industryPriority);
    kv('Academic priority', item.academicPriority);
    asArray(item.description).forEach((d) => out.push(`- ${d}`));
    if ((item.certificates || []).length) {
      out.push('Certificates:');
      item.certificates.forEach((c) => {
        out.push(`- name: ${c.name}`);
        if (c.file) out.push(`- file: ${toMdPath(c.file)}`);
      });
    }
  } else if (section === 'openSource') {
    kv('Github', item.github);
    kv('Website', item.website);
    kv('Pip', item.pip);
    kv('Description', item.description);
    kv('Industry priority', item.industryPriority);
    kv('Academic priority', item.academicPriority);
    asArray(item.features).forEach((f) => out.push(`- ${f}`));
  } else if (section === 'openSourceContributions') {
    kv('Project', item.project);
    kv('Repo', item.repo);
    kv('Note', item.note);
  } else if (section === 'industryEngagements') {
    kv('Header', item.header);
    asArray(item.desp).forEach((d) => out.push(`- ${d}`));
  } else if (section === 'books') {
    kv('Title', item.title);
    kv('Description', item.description);
    kv('Link', item.link);
    kv('Image', toMdPath(item.image));
  } else if (section === 'awards') {
    kv('Year', item.year);
    kv('Description', Array.isArray(item.description) ? item.description.join(' ') : item.description);
  } else if (section === 'references') {
    kv('Role', item.role);
    kv('Contact', item.contact);
  } else if (section === 'copyrights') {
    kv('Diary no', item.diaryNo);
  } else if (section === 'additionalDesignWork') {
    kv('Reference', item.reference);
    kv('Filing context', item.filingContext);
    kv('Date', item.date);
    kv('Status', item.status);
  } else if (section === 'skills') {
    asArray(item.skills).forEach((s) => {
      const name = typeof s === 'string' ? s : s.name;
      const flags = [];
      if (typeof s === 'object') {
        if (s.primary) flags.push('primary');
        if (s.industry === true && s.academic === false) flags.push('industry only');
        else if (s.industry === false && s.academic === true) flags.push('academic only');
      }
      out.push(`- ${name}${flags.length ? ` (${flags.join(', ')})` : ''}`);
    });
  } else if (section === 'courses') {
    kv('Status', item.status === 'canTeach' ? 'can teach' : item.status);
    if (item.area) kv('Area', item.area);
  } else if (section === 'researchAreas') {
    asArray(item.areas).forEach((a) => {
      const name = typeof a === 'string' ? a : a.name;
      const flags = [];
      if (typeof a === 'object') {
        if (a.primary) flags.push('primary');
        if (a.industry === false) flags.push('academic only');
        else if (a.academic === false) flags.push('industry only');
      }
      out.push(`- ${name}${flags.length ? ` (${flags.join(', ')})` : ''}`);
    });
  } else if (section === 'aiFinance') {
    asArray(item.items).forEach((a) => out.push(`- ${typeof a === 'string' ? a : a.name}`));
  } else if (section === 'resumeVersions') {
    kv('Label', item.label);
    kv('Tagline', item.tagline);
    kv('Footer note', item.footerNote);
  }
  return out;
}

/**
 * Serialize a siteConfig-like object into resume.md text.
 * `cfg` should be the MERGED config (markdown content already applied).
 */
function serializeToMarkdown(cfg) {
  const out = [];
  const H = (s) => out.push('', `## ${s}`, '');

  out.push('# Website Content');
  out.push('');
  out.push('<!-- This file is the content source for the website and resume builder.');
  out.push('     Edit it, then run: npm run content:build   (or just rebuild the site).');
  out.push('     See RESUME_GUIDE.md for the full format reference. -->');

  // Personal
  H('Personal');
  const p = cfg.personal || {};
  [
    ['Name', p.name],
    ['Title', p.title],
    ['Tagline', p.tagline],
    ['Location', p.location],
    ['Phone', p.phone],
    ['Website', p.website],
    ['Email', cfg.contact && cfg.contact.email],
    ['LinkedIn', cfg.contact && cfg.contact.linkedin],
    ['GitHub', cfg.contact && cfg.contact.github],
    ['Google Scholar', cfg.contact && cfg.contact.googleScholar],
    ['Orcid', cfg.contact && cfg.contact.orcid],
  ].forEach(([k, v]) => {
    if (v) out.push(`- ${k}: ${v}`);
  });
  const img = p.image;
  if (typeof img === 'string' && img) out.push(`- Image: ${toMdPath(img)}`);
  else if (img && img.src) {
    out.push(`- Image: ${toMdPath(img.src)}`);
    if (img.fallback) out.push(`- Image fallback: ${img.fallback}`);
  }
  if (cfg.seo) {
    if (cfg.seo.title) out.push(`- SEO title: ${cfg.seo.title}`);
    if (cfg.seo.description) out.push(`- SEO description: ${cfg.seo.description}`);
  }
  if ((cfg.animatedText || []).length) {
    out.push('- Animated text:');
    cfg.animatedText.forEach((t) => out.push(`  - ${t}`));
  }
  const rv = cfg.resumeVersions || {};
  if (rv.industry && rv.industry.headline) out.push(`- Headline (Industry): ${rv.industry.headline}`);
  if (rv.academic && rv.academic.headline) out.push(`- Headline (Academic): ${rv.academic.headline}`);

  // Summary
  H('Summary');
  if (rv.industry && rv.industry.summary) out.push('### Industry', '', rv.industry.summary, '');
  if (rv.academic && rv.academic.summary) out.push('### Academic', '', rv.academic.summary, '');

  // Item sections
  const sections = [
    ['Experience', 'experience'],
    ['Projects', 'projects'],
    ['Publications', 'research'],
    ['Patents', 'patents'],
    ['Education', 'education'],
    ['Certifications', 'certifications'],
    ['Open Source', 'openSource'],
    ['Open Source Contributions', 'openSourceContributions'],
    ['Industry Engagements', 'industryEngagements'],
    ['Thesis', 'thesis'],
    ['Books', 'books'],
    ['Skills', 'skills'],
    ['Courses', 'courses'],
    ['Research Areas', 'researchAreas'],
    ['AI + Finance', 'aiFinance'],
    ['Awards', 'awards'],
    ['References', 'references'],
    ['Copyrights', 'copyrights'],
    ['Design Work', 'additionalDesignWork'],
  ];
  for (const [heading, key] of sections) {
    const value = cfg[key];
    if (!value) continue;
    if (Array.isArray(value)) {
      if (!value.length) continue;
      H(heading);
      value.forEach((item) => out.push(...serializeItem(key === 'research' ? 'publications' : key, flattenResumeMeta(item)), ''));
    } else if (key === 'thesis') {
      if (!value || !value.title) continue;
      H('Thesis');
      [
        ['Title', value.title],
        ['Authors', value.authors],
        ['Year', value.year],
        ['Institution', value.institution],
        ['Link', value.link],
        ['Citation', value.citation],
      ].forEach(([k, v]) => {
        if (v) out.push(`- ${k}: ${v}`);
      });
    } else if (key === 'skills') {
      // handled via array above when present
    }
  }

  // Skills (categories)
  if ((cfg.resumeSkills || []).length) {
    H('Skills');
    cfg.resumeSkills.forEach((cat) => {
      out.push(`### ${cat.label}`);
      (cat.skills || []).forEach((s) => {
        const flags = [];
        if (s.industry === true && s.academic === false) flags.push('industry only');
        else if (s.industry === false && s.academic === true) flags.push('academic only');
        out.push(`- ${s.name}${flags.length ? ` (${flags.join(', ')})` : ''}`);
      });
      out.push('');
    });
  }

  // Courses
  if ((cfg.resumeCourses || []).length) {
    H('Courses');
    cfg.resumeCourses.forEach((c) => {
      out.push(`### ${c.name}`);
      out.push(`- Status: ${c.status === 'canTeach' ? 'can teach' : c.status}`);
      if (c.area) out.push(`- Area: ${c.area}`);
      out.push('');
    });
  }

  // Research areas
  if ((cfg.resumeResearchAreas || []).length) {
    H('Research Areas');
    cfg.resumeResearchAreas.forEach((a) => {
      const flags = [];
      if (a.primary) flags.push('primary');
      if (a.industry === false) flags.push('academic only');
      else if (a.academic === false) flags.push('industry only');
      out.push(`- ${a.name}${flags.length ? ` (${flags.join(', ')})` : ''}`);
    });
    out.push('');
  }

  // AI + Finance
  if ((cfg.resumeAiFinance || []).length) {
    H('AI + Finance');
    cfg.resumeAiFinance.forEach((a) => out.push(`- ${a.name}`));
    out.push('');
  }

  // Resume version presentation overrides
  if (rv.industry && (rv.industry.label || rv.industry.tagline || rv.industry.footerNote)) {
    H('Resume Versions');
    for (const v of ['industry', 'academic']) {
      const c = rv[v];
      if (!c) continue;
      out.push(`### ${v === 'industry' ? 'Industry' : 'Academic'}`);
      if (c.label) out.push(`- Label: ${c.label}`);
      if (c.tagline) out.push(`- Tagline: ${c.tagline}`);
      if (c.footerNote) out.push(`- Footer note: ${c.footerNote}`);
      out.push('');
    }
  }

  return out.join('\n').replace(/\n{3,}/g, '\n\n').trimStart() + '\n';
}

module.exports = {
  slugify,
  parseMarkdown,
  serializeToMarkdown,
  parseTags,
  ASSET_FIELDS,
  isRemote,
};

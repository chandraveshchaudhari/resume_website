'use client';

import React, { useMemo, useRef, useState } from 'react';
import siteConfig from '@/config/config';
import {
  masterData,
  resumeVersions,
  versionDefaults,
  ORDERED_SECTION_KEYS,
  researchAreaById,
  aiFinanceById,
  type ResumeVersionId,
  type ResumeVersionConfig,
  type SectionKey,
  type CourseStatus,
} from '@/config/resumeData';
import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';

type ResumeFormat = 'one-page' | 'double-sided';

/* ------------------------------ UI state types ----------------------------- */

/** Per-version UI state: section visibility/order/columns + item selection. */
interface VersionUiState {
  visible: Record<SectionKey, boolean>;
  order: SectionKey[];
  column: Record<SectionKey, 'left' | 'right'>;
  /** Item-level selection keyed by section, holding enabled item IDs. */
  items: Record<string, string[]>;
  /** Skill-category selection: category id -> enabled skill ids. */
  skills: Record<string, string[]>;
  /** Course classification filter for the Courses section. */
  courseStatuses: Record<CourseStatus, boolean>;
}

const makeInitialUi = (versionId: ResumeVersionId): VersionUiState => {
  const version = resumeVersions[versionId];
  const defaults = versionDefaults[versionId];
  const visible = {} as Record<SectionKey, boolean>;
  const column = {} as Record<SectionKey, 'left' | 'right'>;
  for (const key of ORDERED_SECTION_KEYS) {
    visible[key] = version.sectionOrder.includes(key);
    column[key] = version.columns[key] ?? 'left';
  }
  const items: Record<string, string[]> = {
    experience: [...defaults.experience],
    teaching: [...defaults.teaching],
    projects: [...defaults.projects],
    publications: [...defaults.publications],
    patents: [...defaults.patents],
    certifications: [...defaults.certifications],
    education: [...defaults.education],
    openSource: [...defaults.openSource],
    researchAreas: [...defaults.researchAreas],
    aiFinance: [...defaults.aiFinance],
    courses: [...defaults.courses],
  };
  const skills: Record<string, string[]> = {};
  for (const cat of defaults.skillCategories) skills[cat.id] = [...cat.skills];
  return {
    visible,
    order: [...version.sectionOrder],
    column,
    items,
    skills,
    courseStatuses: {
      taught: version.courses.taught,
      canTeach: version.courses.canTeach,
      interest: version.courses.interest,
    },
  };
};

const makeUiForVersion = (versionId: ResumeVersionId): VersionUiState =>
  makeInitialUi(versionId);

/* ------------------------------ small helpers ------------------------------ */

const fontClassFor = (scale: number) =>
  scale <= 0.8 ? 'text-[10px]' : scale <= 0.9 ? 'text-[11px]' : 'text-xs';

const COURSE_STATUS_LABELS: Record<CourseStatus, string> = {
  taught: 'Taught',
  canTeach: 'Can Teach',
  interest: 'Teaching Interest',
};

/* ================================ component ================================ */

export default function ResumePage() {
  const resumeRef = useRef<HTMLDivElement>(null);
  const [format, setFormat] = useState<ResumeFormat>('one-page');
  const [showCustomize, setShowCustomize] = useState(false);
  const [versionId, setVersionId] = useState<ResumeVersionId>('industry');
  const [fontScale, setFontScale] = useState(1);
  const [leftWidth, setLeftWidth] = useState(50);
  const [isGenerating, setIsGenerating] = useState(false);

  // Per-version UI state — switching versions never mutates master data.
  const [uiByVersion, setUiByVersion] = useState<Record<ResumeVersionId, VersionUiState>>({
    industry: makeUiForVersion('industry'),
    academic: makeUiForVersion('academic'),
  });

  const version = resumeVersions[versionId];
  const ui = uiByVersion[versionId];
  const fontClass = fontClassFor(fontScale);

  const setUi = (patch: Partial<VersionUiState>) =>
    setUiByVersion((prev) => ({ ...prev, [versionId]: { ...prev[versionId], ...patch } }));

  const toggleSection = (key: SectionKey) =>
    setUi({ visible: { ...ui.visible, [key]: !ui.visible[key] } });

  const setSectionColumn = (key: SectionKey, col: 'left' | 'right') =>
    setUi({ column: { ...ui.column, [key]: col } });

  const moveSection = (key: SectionKey, dir: -1 | 1) =>
    setUi({
      order: (() => {
        const next = [...ui.order];
        const idx = next.indexOf(key);
        const target = idx + dir;
        if (idx < 0 || target < 0 || target >= next.length) return next;
        [next[idx], next[target]] = [next[target], next[idx]];
        return next;
      })(),
    });

  const toggleItem = (section: string, id: string) => {
    const current = ui.items[section] ?? [];
    const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
    setUi({ items: { ...ui.items, [section]: next } });
  };

  const toggleSkill = (categoryId: string, skillId: string) => {
    const current = ui.skills[categoryId] ?? [];
    const next = current.includes(skillId) ? current.filter((x) => x !== skillId) : [...current, skillId];
    setUi({ skills: { ...ui.skills, [categoryId]: next } });
  };

  const toggleCourseStatus = (status: CourseStatus) =>
    setUi({ courseStatuses: { ...ui.courseStatuses, [status]: !ui.courseStatuses[status] } });

  const resetVersion = () =>
    setUiByVersion((prev) => ({ ...prev, [versionId]: makeUiForVersion(versionId) }));

  /* ------------------------------ derived data ----------------------------- */

  const orderedSections = ui.order.filter((k) => ui.visible[k]);
  const leftSections = orderedSections.filter((k) => ui.column[k] === 'left');
  const rightSections = orderedSections.filter((k) => ui.column[k] === 'right');

  const enabled = (section: string) => ui.items[section] ?? [];

  const experience = masterData.experience.filter((e) => enabled('experience').includes(e.id));
  const teaching = masterData.experience.filter((e) => enabled('teaching').includes(e.id));
  const projects = masterData.projects.filter((p) => enabled('projects').includes(p.id));
  const publications = masterData.publications
    .filter((p) => enabled('publications').includes(p.id))
    .sort((a, b) => (b.researchYr ?? 0) - (a.researchYr ?? 0));
  const patents = masterData.patents.filter((p) => enabled('patents').includes(p.id));
  const certifications = masterData.certifications.filter((c) => enabled('certifications').includes(c.id));
  const education = masterData.education.filter((e) => enabled('education').includes(e.id));
  const openSource = masterData.openSource.filter((o) => enabled('openSource').includes(o.id));
  const researchAreas = masterData.researchAreas
    .filter((a) => a.industry !== false || versionId !== 'industry')
    .filter((a) => a.academic !== false || versionId !== 'academic')
    .filter((r) => enabled('researchAreas').includes(r.id));
  const aiFinanceItems = masterData.aiFinance.filter((a) => enabled('aiFinance').includes(a.id));

  const skillCategories = masterData.skillCategories
    .map((cat) => {
      const selected = ui.skills[cat.id] ?? [];
      const skills = cat.skills.filter((s) => selected.includes(s.id));
      return skills.length > 0 ? { ...cat, skills } : null;
    })
    .filter(Boolean) as { id: string; label: string; skills: { id: string; name: string }[] }[];

  const courses = useMemo(() => {
    const byStatus = (status: CourseStatus) =>
      masterData.courses.filter(
        (c) => c.status === status && ui.courseStatuses[status] && enabled('courses').includes(c.id)
      );
    return {
      taught: byStatus('taught'),
      canTeach: byStatus('canTeach'),
      interest: byStatus('interest'),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ui.courseStatuses, ui.items.courses, versionId]);

  const hasCourses = courses.taught.length + courses.canTeach.length + courses.interest.length > 0;

  /* ------------------------------- PDF export ------------------------------ */

  const handleDownloadPdf = async () => {
    const node = resumeRef.current;
    if (!node || isGenerating) return;
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(node, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const margin = 12;
      const maxW = pageW - margin * 2;
      const imgH = (canvas.height * maxW) / canvas.width;

      if (imgH <= pageH - margin * 2) {
        pdf.addImage(imgData, 'PNG', margin, margin, maxW, imgH);
      } else {
        const pxPerMm = canvas.width / maxW;
        const sliceHpx = Math.floor((pageH - margin * 2) * pxPerMm);
        let y = 0;
        while (y < canvas.height) {
          const h = Math.min(sliceHpx, canvas.height - y);
          const slice = document.createElement('canvas');
          slice.width = canvas.width;
          slice.height = h;
          const ctx = slice.getContext('2d')!;
          ctx.drawImage(canvas, 0, y, canvas.width, h, 0, 0, canvas.width, h);
          if (y > 0) pdf.addPage();
          pdf.addImage(slice.toDataURL('image/png'), 'PNG', margin, margin, maxW, h / pxPerMm);
          y += h;
        }
      }
      pdf.save(
        `${siteConfig.personal.name}-Resume-${version.shortLabel}-${format === 'one-page' ? 'OnePage' : 'DoubleSided'}.pdf`
      );
    } finally {
      setIsGenerating(false);
    }
  };

  /* ------------------------------ item editors ----------------------------- */

  const ItemCheckboxList = ({ section, entries }: {
    section: string;
    entries: { id: string; label: string; needsReview?: boolean }[];
  }) => (
    <div className="space-y-1">
      {entries.map((e) => (
        <label key={e.id} className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            checked={enabled(section).includes(e.id)}
            onChange={() => toggleItem(section, e.id)}
            className="accent-blue-600 mt-0.5"
          />
          <span>
            {e.label}
            {e.needsReview && (
              <span
                className="ml-1 text-[10px] uppercase text-amber-600 dark:text-amber-400"
                title="Verify this item before final use"
              >
                ⚠ review
              </span>
            )}
          </span>
        </label>
      ))}
    </div>
  );

  const SectionEditor = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <details className="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 p-2">
      <summary className="text-sm font-medium cursor-pointer select-none">{title}</summary>
      <div className="mt-2">{children}</div>
    </details>
  );

  /* --------------------------------- render -------------------------------- */

  return (
    <div className="py-12 max-w-4xl mx-auto px-4">
      <h1 className="text-4xl font-bold text-center mb-8">Resume</h1>

      {/* Version selector + actions */}
      <div className="flex flex-col items-center gap-4 mb-6">
        <div className="w-full max-w-2xl p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
            Resume Version
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {(Object.keys(resumeVersions) as ResumeVersionId[]).map((vid) => (
              <button
                key={vid}
                onClick={() => setVersionId(vid)}
                className={`text-left p-3 rounded-lg border transition ${
                  versionId === vid
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:border-blue-400'
                }`}
              >
                <span className="block text-sm font-semibold">{resumeVersions[vid].label}</span>
                <span
                  className={`block text-xs mt-1 ${
                    versionId === vid ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {resumeVersions[vid].tagline}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <div className="flex rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
            <button
              onClick={() => setFormat('one-page')}
              className={`px-4 py-2 text-sm font-medium transition ${
                format === 'one-page'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              One-Page
            </button>
            <button
              onClick={() => setFormat('double-sided')}
              className={`px-4 py-2 text-sm font-medium transition ${
                format === 'double-sided'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Double-Sided
            </button>
          </div>

          <button
            onClick={() => setShowCustomize((s) => !s)}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            {showCustomize ? 'Hide Customization' : 'Customize'}
          </button>

          <button
            onClick={handleDownloadPdf}
            disabled={isGenerating}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isGenerating ? 'Generating PDF…' : 'Download PDF'}
          </button>
        </div>
      </div>

      {/* ===================== CUSTOMIZATION PANEL ===================== */}
      {showCustomize && (
        <div className="mb-8 p-5 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Customize — {version.label}</h2>
            <button
              onClick={resetVersion}
              className="text-xs px-3 py-1 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Reset to version defaults
            </button>
          </div>

          {/* Font size */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Font Size: {fontScale === 1 ? 'Default' : fontScale <= 0.8 ? 'Small' : 'Medium'}
            </label>
            <div className="flex gap-2">
              {[0.8, 0.9, 1].map((s) => (
                <button
                  key={s}
                  onClick={() => setFontScale(s)}
                  className={`px-3 py-1 text-sm rounded border ${
                    fontScale === s
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600'
                  }`}
                >
                  {s === 1 ? 'Default' : s === 0.9 ? 'Medium' : 'Small'}
                </button>
              ))}
            </div>
          </div>

          {/* Column width (double-sided only) */}
          {format === 'double-sided' && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Left Column Width: {leftWidth}%</label>
              <input
                type="range"
                min="35"
                max="65"
                value={leftWidth}
                onChange={(e) => setLeftWidth(Number(e.target.value))}
                className="w-full"
              />
            </div>
          )}

          {/* Section toggles + column assignment + priority */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Section Order (top = shown first)</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {ui.order.map((key, idx) => (
                <div
                  key={key}
                  className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 w-4">{idx + 1}</span>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={ui.visible[key]}
                        onChange={() => toggleSection(key)}
                        className="accent-blue-600"
                      />
                      {version.sectionLabels[key]}
                    </label>
                  </div>
                  <div className="flex items-center gap-1">
                    {format === 'double-sided' && ui.visible[key] && (
                      <select
                        value={ui.column[key]}
                        onChange={(e) => setSectionColumn(key, e.target.value as 'left' | 'right')}
                        className="text-xs bg-gray-100 dark:bg-gray-700 rounded px-1 py-0.5"
                      >
                        <option value="left">Left</option>
                        <option value="right">Right</option>
                      </select>
                    )}
                    <button
                      onClick={() => moveSection(key, -1)}
                      disabled={idx === 0}
                      className="px-1.5 py-0.5 text-xs rounded bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Move up"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => moveSection(key, 1)}
                      disabled={idx === ui.order.length - 1}
                      className="px-1.5 py-0.5 text-xs rounded bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Move down"
                    >
                      ↓
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Item-level editors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <SectionEditor title={`Experience (${enabled('experience').length} shown)`}>
              <ItemCheckboxList
                section="experience"
                entries={masterData.experience.map((e) => ({
                  id: e.id,
                  label: `${e.title} — ${e.place}`,
                }))}
              />
            </SectionEditor>

            <SectionEditor title={`Teaching Experience (${enabled('teaching').length} shown)`}>
              <ItemCheckboxList
                section="teaching"
                entries={masterData.experience
                  .filter((e) => e.kind === 'teaching' || e.kind === 'faculty')
                  .map((e) => ({ id: e.id, label: `${e.title} — ${e.place}` }))}
              />
            </SectionEditor>

            <SectionEditor title={`Projects (${enabled('projects').length} shown)`}>
              <ItemCheckboxList
                section="projects"
                entries={masterData.projects.map((p) => ({
                  id: p.id,
                  label: p.title,
                  needsReview: p.needsReview,
                }))}
              />
            </SectionEditor>

            <SectionEditor title={`Publications (${enabled('publications').length} shown)`}>
              <ItemCheckboxList
                section="publications"
                entries={masterData.publications.map((p) => ({
                  id: p.id,
                  label: `${p.title} (${p.researchYr})`,
                  needsReview: p.needsReview,
                }))}
              />
            </SectionEditor>

            <SectionEditor title={`Patents (${enabled('patents').length} shown)`}>
              <ItemCheckboxList
                section="patents"
                entries={masterData.patents.map((p) => ({
                  id: p.id,
                  label: p.title,
                  needsReview: p.needsReview,
                }))}
              />
            </SectionEditor>

            <SectionEditor title={`Education (${enabled('education').length} shown)`}>
              <ItemCheckboxList
                section="education"
                entries={masterData.education.map((e) => ({
                  id: e.id,
                  label: `${e.degree} — ${e.institution}`,
                }))}
              />
            </SectionEditor>

            <SectionEditor title={`Open Source (${enabled('openSource').length} shown)`}>
              <ItemCheckboxList
                section="openSource"
                entries={masterData.openSource.map((o) => ({ id: o.id, label: o.title }))}
              />
              <label className="flex items-center gap-2 text-sm mt-2">
                <input
                  type="checkbox"
                  checked={version.openSourceContributions}
                  readOnly
                  className="accent-blue-600"
                />
                <span className="text-gray-500">Contributions to external projects (version config)</span>
              </label>
            </SectionEditor>

            <SectionEditor title={`Certifications (${enabled('certifications').length} shown)`}>
              <ItemCheckboxList
                section="certifications"
                entries={masterData.certifications.map((c) => ({
                  id: c.id,
                  label: c.title,
                }))}
              />
            </SectionEditor>

            <SectionEditor title={`Skills (${skillCategories.length} categories shown)`}>
              <div className="space-y-2">
                {masterData.skillCategories.map((cat) => {
                  const selected = ui.skills[cat.id] ?? [];
                  return (
                    <details key={cat.id} className="border border-gray-200 dark:border-gray-700 rounded p-1.5">
                      <summary className="text-xs font-medium cursor-pointer">
                        {cat.label} ({selected.length}/{cat.skills.length})
                      </summary>
                      <div className="mt-1 grid grid-cols-2 gap-1">
                        {cat.skills.map((s) => (
                          <label key={s.id} className="flex items-center gap-1.5 text-xs">
                            <input
                              type="checkbox"
                              checked={selected.includes(s.id)}
                              onChange={() => toggleSkill(cat.id, s.id)}
                              className="accent-blue-600"
                            />
                            {s.name}
                          </label>
                        ))}
                      </div>
                    </details>
                  );
                })}
              </div>
            </SectionEditor>

            <SectionEditor title={`Courses (${hasCourses ? 'mixed statuses' : 'none shown'})`}>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-3">
                  {(['taught', 'canTeach', 'interest'] as CourseStatus[]).map((st) => (
                    <label key={st} className="flex items-center gap-1.5 text-xs">
                      <input
                        type="checkbox"
                        checked={ui.courseStatuses[st]}
                        onChange={() => toggleCourseStatus(st)}
                        className="accent-blue-600"
                      />
                      {COURSE_STATUS_LABELS[st]}
                    </label>
                  ))}
                </div>
                {(['taught', 'canTeach', 'interest'] as CourseStatus[]).map((st) => {
                  const list = masterData.courses.filter((c) => c.status === st);
                  if (list.length === 0) return null;
                  return (
                    <details key={st} className="border border-gray-200 dark:border-gray-700 rounded p-1.5">
                      <summary className="text-xs font-medium cursor-pointer">
                        {COURSE_STATUS_LABELS[st]} (
                        {list.filter((c) => enabled('courses').includes(c.id)).length}/{list.length})
                      </summary>
                      <div className="mt-1 space-y-1">
                        {list.map((c) => (
                          <label key={c.id} className="flex items-center gap-1.5 text-xs">
                            <input
                              type="checkbox"
                              checked={enabled('courses').includes(c.id)}
                              onChange={() => toggleItem('courses', c.id)}
                              className="accent-blue-600"
                            />
                            {c.name}
                          </label>
                        ))}
                      </div>
                    </details>
                  );
                })}
              </div>
            </SectionEditor>

            <SectionEditor title={`Research Areas (${enabled('researchAreas').length} shown)`}>
              <div className="space-y-1">
                {masterData.researchAreas.map((area) => {
                  return (
                    <label key={area.id} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={enabled('researchAreas').includes(area.id)}
                        onChange={() => toggleItem('researchAreas', area.id)}
                        className="accent-blue-600"
                      />
                      {area.name}
                    </label>
                  );
                })}
              </div>
            </SectionEditor>

            <SectionEditor title={`AI + Finance (${enabled('aiFinance').length} shown)`}>
              <div className="space-y-1">
                {masterData.aiFinance.map((item) => {
                  return (
                    <label key={item.id} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={enabled('aiFinance').includes(item.id)}
                        onChange={() => toggleItem('aiFinance', item.id)}
                        className="accent-blue-600"
                      />
                      {item.name}
                    </label>
                  );
                })}
              </div>
            </SectionEditor>
          </div>

          <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
            ⚠ review = verify this item (status, venue, or authorship) before final use. Master data is never
            modified by these controls — each version keeps its own selection state.
          </p>
        </div>
      )}

      {/* ===================== PRINT RESUME ===================== */}
      <div
        ref={resumeRef}
        id="resume-print"
        className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md print:bg-white print:text-black print:shadow-none print:p-0"
      >
        {/* Header */}
        <header className="text-center mb-3">
          <h1 className="text-2xl font-bold tracking-tight">{siteConfig.personal.name}</h1>
          <p className="text-sm text-gray-700 dark:text-gray-300">{version.headline}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {siteConfig.personal.location} · {siteConfig.personal.phone} · {siteConfig.contact.email}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            <a href={siteConfig.contact.linkedin} className="text-blue-700">LinkedIn</a>
            {' · '}
            <a href={siteConfig.contact.github} className="text-blue-700">GitHub</a>
            {' · '}
            <a href={siteConfig.contact.googleScholar} className="text-blue-700">Google Scholar</a>
            {' · '}
            <a href={siteConfig.personal.website || 'https://solarpunkworks.com'} className="text-blue-700">Website</a>
          </p>
        </header>

        {format === 'one-page' ? (
          <div>
            {orderedSections.map((key) => (
              <SectionRenderer key={key} sectionKey={key} />
            ))}
          </div>
        ) : (
          <div
            className="resume-two-col grid gap-x-6"
            style={{ gridTemplateColumns: `${leftWidth}% ${100 - leftWidth}%` }}
          >
            <div className="space-y-4">
              {leftSections.map((key) => (
                <SectionRenderer key={key} sectionKey={key} />
              ))}
            </div>
            <div className="space-y-4">
              {rightSections.map((key) => (
                <SectionRenderer key={key} sectionKey={key} />
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="text-center mt-3">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Explore my products &amp; research at{' '}
            <a href="https://solarpunkworks.com" className="text-blue-700">solarpunkworks.com</a>
            {' '}· {version.footerNote}
          </p>
        </footer>
      </div>
    </div>
  );

  /* ------------------------- section render function ----------------------- */

  function SectionRenderer({ sectionKey }: { sectionKey: SectionKey }) {
    const heading = (label: string) => (
      <h2 className="text-sm font-bold uppercase tracking-wide border-b border-gray-300 pb-0.5">{label}</h2>
    );

    switch (sectionKey) {
      /* ------------------------------- summary ------------------------------ */
      case 'summary':
        return (
          <section className="mb-3">
            {heading(version.summaryTitle)}
            <p className={`${fontClass} leading-snug mt-1`}>{version.summary}</p>
          </section>
        );

      /* -------------------------------- skills ------------------------------ */
      case 'skills':
        return skillCategories.length > 0 ? (
          <section className="mb-3">
            {heading(version.sectionLabels.skills)}
            <div className={`${fontClass} leading-snug mt-1 space-y-0.5`}>
              {skillCategories.map((cat) => (
                <p key={cat.id}>
                  <span className="font-semibold">{cat.label}:</span> {cat.skills.map((s) => s.name).join(', ')}
                </p>
              ))}
            </div>
          </section>
        ) : null;

      /* ------------------------------ experience ---------------------------- */
      case 'experience':
        return experience.length > 0 ? (
          <section className="mb-3">
            {heading(version.sectionLabels.experience)}
            {experience.map((exp) => {
              const bullets =
                versionId === 'industry' && exp.industryDesp ? exp.industryDesp : exp.academicDesp ?? exp.desp;
              return (
                <div key={exp.id} className="mt-1">
                  <div className="flex justify-between">
                    <h3 className="text-sm font-semibold">{exp.title} — {exp.place}</h3>
                    <span className="text-xs text-gray-600">{exp.time}</span>
                  </div>
                  <ul className={`list-disc list-inside ${fontClass} text-gray-700 leading-snug ml-4`}>
                    {bullets.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </section>
        ) : null;

      /* ------------------------------- teaching ----------------------------- */
      case 'teaching':
        return teaching.length > 0 ? (
          <section className="mb-3">
            {heading(version.sectionLabels.teaching)}
            {teaching.map((exp) => {
              const bullets = exp.academicDesp ?? exp.desp;
              return (
                <div key={exp.id} className="mt-1">
                  <div className="flex justify-between">
                    <h3 className="text-sm font-semibold">{exp.title} — {exp.place}</h3>
                    <span className="text-xs text-gray-600">{exp.time}</span>
                  </div>
                  <ul className={`list-disc list-inside ${fontClass} text-gray-700 leading-snug ml-4`}>
                    {bullets.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </section>
        ) : null;

      /* ------------------------------- projects ----------------------------- */
      case 'projects':
        return projects.length > 0 ? (
          <section className="mb-3">
            {heading(version.sectionLabels.projects)}
            {projects.map((project) => {
              const description =
                versionId === 'industry'
                  ? project.industryDescription ?? project.description
                  : project.academicDescription ?? project.description;
              const highlights =
                versionId === 'industry'
                  ? project.industryHighlights ?? project.highlights
                  : project.academicHighlights ?? project.highlights;
              return (
                <div key={project.id} className="mt-1">
                  <div className="flex justify-between">
                    <h3 className="text-sm font-semibold">{project.title}</h3>
                    <span className="text-xs text-gray-600">{project.role}</span>
                  </div>
                  <p className={`${fontClass} text-gray-700 leading-snug`}>{description}</p>
                  {version.showTechInProjects && project.tech && (
                    <p className={`${fontClass} text-gray-500 mt-0.5`}>
                      <span className="font-semibold">Tech:</span> {project.tech.join(', ')}
                    </p>
                  )}
                  {highlights && (
                    <ul className={`list-disc list-inside ${fontClass} text-gray-700 leading-snug ml-4`}>
                      {highlights.slice(0, version.maxHighlights).map((h, i) => (
                        <li key={i}>{h}</li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </section>
        ) : null;

      /* ----------------------------- publications --------------------------- */
      case 'publications':
        return publications.length > 0 || masterData.thesis ? (
          <section className="mb-3">
            {heading(version.sectionLabels.publications)}
            {publications.map((res) => (
              <div key={res.id} className="mt-1">
                <p className={`${fontClass} leading-snug`}>
                  <span className="font-semibold">{res.title}</span> — {res.authors} ({res.researchYr}).{' '}
                  {res.conferences}.
                </p>
              </div>
            ))}
            {masterData.thesis && (
              <div className="mt-1">
                <p className={`${fontClass} leading-snug`}>
                  <span className="font-semibold">PhD Thesis:</span> {masterData.thesis.citation}
                </p>
              </div>
            )}
          </section>
        ) : null;

      /* ------------------------------ open source --------------------------- */
      case 'openSource':
        return openSource.length > 0 ? (
          <section className="mb-3">
            {heading(version.sectionLabels.openSource)}
            {openSource.map((os) => (
              <div key={os.id} className="mt-1">
                <div className="flex justify-between">
                  <h3 className="text-sm font-semibold">{os.title}</h3>
                  {os.pip && <span className="text-xs text-gray-600">{os.pip}</span>}
                </div>
                {os.description && (
                  <p className={`${fontClass} text-gray-700 leading-snug`}>{os.description}</p>
                )}
                {os.features && (
                  <ul className={`list-disc list-inside ${fontClass} text-gray-700 leading-snug ml-4`}>
                    {os.features.slice(0, version.maxHighlights).map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
            {version.openSourceContributions && masterData.openSourceContributions.length > 0 && (
              <div className="mt-1">
                <h3 className="text-sm font-semibold">Contributions to external projects</h3>
                <ul className={`list-disc list-inside ${fontClass} text-gray-700 leading-snug ml-4`}>
                  {masterData.openSourceContributions.map((c, i) => (
                    <li key={i}>{c.project} — {c.note}</li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        ) : null;

      /* -------------------------------- patents ----------------------------- */
      case 'patents':
        return patents.length > 0 ? (
          <section className="mb-3">
            {heading(version.sectionLabels.patents)}
            {patents.map((p) => (
              <div key={p.id} className="mt-1">
                <p className={`${fontClass} leading-snug`}>
                  <span className="font-semibold">{p.title}</span>
                  {p.applicationNo ? ` (${p.applicationNo})` : ''} ({p.year}) — {p.status}
                </p>
              </div>
            ))}
          </section>
        ) : null;

      /* ------------------------------- education ---------------------------- */
      case 'education':
        return education.length > 0 ? (
          <section className="mb-3">
            {heading(version.sectionLabels.education)}
            {education.map((edu) => (
              <div key={edu.id} className="mt-1">
                <div className="flex justify-between">
                  <h3 className="text-sm font-semibold">{edu.degree}</h3>
                  <span className="text-xs text-gray-600">{edu.year}</span>
                </div>
                <p className={`${fontClass} text-gray-700`}>{edu.institution}</p>
                {edu.id === 'phd' && edu.thesisTitle && (
                  <p className={`${fontClass} text-gray-600`}>Thesis: {edu.thesisTitle}</p>
                )}
              </div>
            ))}
          </section>
        ) : null;

      /* ----------------------------- certifications ------------------------- */
      case 'certifications':
        return certifications.length > 0 ? (
          <section className="mb-3">
            {heading(version.sectionLabels.certifications)}
            <ul className={`list-disc list-inside ${fontClass} text-gray-700 leading-snug ml-4`}>
              {certifications.map((c) => (
                <li key={c.id}>{c.title}</li>
              ))}
            </ul>
          </section>
        ) : null;

      /* --------------------------- research interests ----------------------- */
      case 'researchInterests':
        return researchAreas.length > 0 ? (
          <section className="mb-3">
            {heading(version.sectionLabels.researchInterests)}
            <p className={`${fontClass} leading-snug mt-1`}>{researchAreas.map((r) => r.name).join(' · ')}</p>
          </section>
        ) : null;

      /* -------------------------------- courses ----------------------------- */
      case 'courses':
        return hasCourses ? (
          <section className="mb-3">
            {heading(version.sectionLabels.courses)}
            {courses.taught.length > 0 && (
              <p className={`${fontClass} leading-snug mt-1`}>
                <span className="font-semibold">Courses Taught:</span>{' '}
                {courses.taught.map((c) => c.name).join(', ')}
              </p>
            )}
            {courses.canTeach.length > 0 && (
              <p className={`${fontClass} leading-snug mt-1`}>
                <span className="font-semibold">Teaching Areas / Courses I Can Teach:</span>{' '}
                {courses.canTeach.map((c) => c.name).join(', ')}
              </p>
            )}
            {courses.interest.length > 0 && (
              <p className={`${fontClass} leading-snug mt-1`}>
                <span className="font-semibold">Teaching Interests:</span>{' '}
                {courses.interest.map((c) => c.name).join(', ')}
              </p>
            )}
          </section>
        ) : null;

      /* ------------------------------- aiFinance ---------------------------- */
      case 'aiFinance':
        return aiFinanceItems.length > 0 ? (
          <section className="mb-3">
            {heading(version.sectionLabels.aiFinance)}
            <p className={`${fontClass} leading-snug mt-1`}>{aiFinanceItems.map((a) => a.name).join(' · ')}</p>
          </section>
        ) : null;

      /* -------------------------- industryEngagement ------------------------ */
      case 'industryEngagement':
        return version.industryEngagement && masterData.industryEngagements.length > 0 ? (
          <section className="mb-3">
            {heading(version.sectionLabels.industryEngagement)}
            {masterData.industryEngagements.map((eng, i) => (
              <div key={i} className="mt-1">
                <h3 className="text-sm font-semibold">{eng.header}</h3>
                <ul className={`list-disc list-inside ${fontClass} text-gray-700 leading-snug ml-4`}>
                  {eng.desp.map((d, j) => (
                    <li key={j}>{d}</li>
                  ))}
                </ul>
              </div>
            ))}
          </section>
        ) : null;

      /* -------------------------------- awards ------------------------------ */
      case 'awards':
        return masterData.awards.length > 0 ? (
          <section className="mb-3">
            {heading(version.sectionLabels.awards)}
            <ul className={`list-disc list-inside ${fontClass} text-gray-700 leading-snug ml-4`}>
              {masterData.awards.map((a) => (
                <li key={a.id}>
                  {a.title}
                  {a.year ? ` (${a.year})` : ''}
                  {a.description ? ` — ${a.description}` : ''}
                </li>
              ))}
            </ul>
          </section>
        ) : null;

      /* ------------------------------ references ---------------------------- */
      case 'references':
        return masterData.references.length > 0 ? (
          <section className="mb-3">
            {heading(version.sectionLabels.references)}
            <ul className={`list-disc list-inside ${fontClass} text-gray-700 leading-snug ml-4`}>
              {masterData.references.map((r) => (
                <li key={r.id}>
                  {r.name} — {r.role}
                  {r.contact ? ` · ${r.contact}` : ''}
                </li>
              ))}
            </ul>
          </section>
        ) : null;

      default:
        return null;
    }
  }
}

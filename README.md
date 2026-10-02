<div align="center">
<h1>⚡ Instant Personal Portfolio & Academic Profile Template</h1>
<p><strong>Launch a modern, fast, responsive portfolio + resume + academic showcase in minutes — without writing code.</strong></p>
<p>All content lives in ONE file. Export static pages for GitHub Pages. Auto-generate a printable PDF resume. Dark mode, mobile-ready, SEO-friendly.</p>
<p><em>Fork → Edit → Deploy → Share.</em></p>
</div>

---

## 🏆 What This Template Gives You (Features)

| Category | Feature | Why it Matters |
|----------|---------|----------------|
| Identity | **One markdown file** (`resume.md`) | Change everything (name, projects, research, education, contact) by editing plain text — no code |
| Resume | "Download PDF" button | One click printable/exportable resume (uses in-browser PDF print) |
| Portfolio Sections | Projects, Research, Education, Experience, Books, Certifications, Blog | Structured professional presence |
| Branding | Animated role text | Eye-catching hero animation for your roles/interests |
| Design | Dark / Light mode toggle | Automatic theme control; user choice preserved |
| Performance | Static export ready | Deploy to GitHub Pages or any static host easily |
| Assets | Auto path resolution | Works under subfolder deployments (basePath support) |
| Certifications | Thumbnail generator script | Prepares image index for cert cards automatically |
| SEO | Title + description in config | Improve discoverability with quick edits |
| Accessibility | Semantic HTML + Tailwind | Clean structure, responsive layout |
| No Backend | Pure static build | Zero server maintenance, just host the files |
| Tech Stack | Next.js 15, TypeScript, Tailwind | Modern, future-proof foundation |

---

## 🎯 Who Is It For?

Non‑technical professionals, students, researchers, indie builders, educators — anyone who wants a polished web presence fast.

If you can edit text, you can publish this site.

---

## 🚀 3 Ways to Get Started (Easiest First)

### OPTION 1: Use as a GitHub Template (Fastest)
1. Click "Use this template" on the repository page.
2. Name your new repo (e.g., `my-portfolio`).
3. Open `resume.md` directly in GitHub and replace placeholders (see `RESUME_GUIDE.md`).
4. Enable GitHub Pages (Settings → Pages → Deploy from GitHub Actions or `gh-pages` branch if you use an action).
5. Share your live URL: `https://your-username.github.io/my-portfolio/`.

### OPTION 2: Download ZIP (No Git Needed)
1. Click "Code" → "Download ZIP".
2. Unzip and open the folder.
3. Edit `resume.md` in any text editor (VS Code, Notepad, etc.) — see `RESUME_GUIDE.md`.
4. (Optional) Deploy by uploading the built `out/` folder later (see Deployment section).

### OPTION 3: Fork & Customize Locally
1. Fork the repo.
2. Clone: `git clone https://github.com/your-username/my-portfolio.git`
3. Run install + dev server (see Setup below).
4. Edit config and push changes — auto build.

---

## ✨ What You Change (One File Only)

Open: `resume.md` (format reference: `RESUME_GUIDE.md`)

You only have to change the text inside the quotes. Example:

```ts
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
```

- Keep the keys and structure as is; just replace the quoted text.
- Do the same for sections like `education`, `experience`, `projects`, `research`, `books`, `certifications`, and `contact`.
- Optional: Swap images in `public/images/...`. `getAsset()` ensures paths work even if deployed under `/REPO_NAME`.
---

### How to remove sections or pages (easy, via config)

You can hide entire sections by clearing their arrays in `src/config/config.ts`, or remove pages from the navbar by editing the `navigation` array.

Example: remove Research and Blogs pages from the top navigation, and hide the Experience section site‑wide.

```ts
// src/config/config.ts
const siteConfig = {
	// Remove pages from navbar by deleting items from this array
	navigation: [
		{ name: 'Home', url: '/' },
		{ name: 'Projects', url: '/projects' },
		// { name: 'Research', url: '/research' }, // ⬅️ removed
		{ name: 'Education', url: '/education' },
		// { name: 'Blogs', url: '/blogs' },       // ⬅️ removed
		{ name: 'Resume', url: '/resume' },
		{ name: 'Contact', url: '/contact' },
	],

	// Hide a section by making its array empty
	experience: [], // ⬅️ no cards will render

	// You can also hide other sections similarly
	projects: [
		// keep some or clear entirely: []
	],
	research: [],
	education: [ /* ...your entries... */ ],
	blogs: [],
	certifications: [],
	books: [],
};
```

- Clearing the array means the page or section renders nothing (or the UI will skip it if coded to check length).
- Removing an item from `navigation` hides the link from the navbar. The page route may still exist; clearing the data arrays prevents content from showing.
- If you want to fully remove a page route, delete or rename the corresponding folder under `src/app/` (e.g., `src/app/research/`). Optional and only needed if you want to remove the route entirely.

---

## 📝 Built-In Resume Generator

Go to the Resume page → Click "Download PDF".

This uses in-browser print to produce a clean PDF including:

- Profile header (name, title, location, email)
- Education
- Experience
- Projects
- Research
- Books

Edit any content in `resume.md` and it updates instantly. No external service required.

Tip: After printing, review margins and save. Works in all major browsers.

---

## 🌗 Dark / Light Mode
Every page supports theme switching. Your visitors can toggle; their preference persists.

---

## 🖼 Certification Thumbnails (Optional)
The script `scripts/generate-cert-thumbnails.js` builds an index for certifications. If you add images under `public/images/education/Certifications/thumbnails/`, run the build and they’re auto-listed.

---

## 🔐 No Secrets Needed
This is a pure static site. No database, API keys, or backend setup. Just content.

---

## 📦 Local Setup (If You Want to Run It)

```bash
git clone https://github.com/your-username/my-portfolio.git
cd my-portfolio
npm install
npm run dev
```

Visit: http://localhost:3000

Edit `resume.md` → `npm run dev` (or rebuild) → see changes.

---

## 🚢 Deployment

### GitHub Pages (Static Export)
1. (Optional) Set `basePath`/`assetPrefix` in `next.config.ts` to `'/my-portfolio'`.
2. Run: `npm run build` (exports static site if configured with `output: 'export'`).
3. Deploy the `out/` folder via Action or manual upload.

### Vercel (Zero Config)
1. Import repo in Vercel.
2. Deploy → Done.

### Any Static Host
Use the exported `out/` directory.

---

## 🔧 Tech Stack Summary
- Next.js App Router
- TypeScript
- Tailwind CSS utility styling
- Theme management (`next-themes`)
- React Query (optional for future data fetching)
- PDF print via `react-to-print`

---

## 🛠 Advanced (Optional Enhancements)
- Add analytics (Plausible / Google Analytics)
- Replace placeholder images with your own avatar/logo
- Extend sections (Awards, Talks, Skills)
- Connect a blog engine later if needed

---

## 🧪 Maintenance & Editing Tips
- Keep entries short and scannable
- Use consistent tense and formatting
- Remove sections you don’t use to declutter

---

## ❓ FAQ
**Do I need to know React?** No — just edit text in the config file.

**Can I deploy without installing Node locally?** Yes — edit on GitHub and use GitHub Pages.

**How do I change colors?** Edit Tailwind classes in components or extend a Tailwind config.

## ✅ Quick Checklist Before Sharing
| Step | Done? |
|------|-------|
| Name, title, tagline updated | ☐ |
| Projects added | ☐ |
| Research / Publications added | ☐ |
| Experience entries added | ☐ |
| Contact links verified | ☐ |
| Resume PDF test printed | ☐ |
| Deployment URL live | ☐ |

---

## 🔍 For Developers (Deep Dive)
This template still supports typical Next.js workflows: dynamic routing, component reuse, environment variables (`NEXT_PUBLIC_BASE_PATH` for assets). Tailwind + dark mode out of the box. Extend easily.

---

## Customize your template (one file)

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Customize your template (one file)

All content (name, title, projects, research, certifications, contact, etc.) lives in `src/config/config.ts`.

Replace the placeholders with your own:

- `personal.name`: Put your name inside the quote
- `personal.title`: Your Title | Your Role
- `personal.tagline`: Short tagline
- `personal.location`: Your City, Country
- `seo.title` and `seo.description`: Your portfolio SEO
- `animatedText`: Words you want animated on the homepage
- `education`, `experience`, `projects`, `research`, `books`, `certifications`: Fill with your own entries. Keep the shapes the same.
- `contact`: Update email, LinkedIn, GitHub, Google Scholar, ORCID

Images are referenced via `getAsset()` which respects `NEXT_PUBLIC_BASE_PATH`. Replace the placeholder images with your own under `public/images/...`.

Optional: Set `NEXT_PUBLIC_BASE_PATH` in your environment or configure `basePath` in `next.config.ts` if deploying under a subpath (e.g., GitHub Pages).

## Learn More (Official Docs)

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Original Next.js Docs & Deployment Guides

For GitHub Pages, ensure:

- `next.config.ts` sets `output: 'export'` and appropriate `basePath`/`assetPrefix`.
- Use a workflow to build and publish `./out`.

For Vercel, deploy directly; static export settings are optional.



---

## Notes

This repository is intended to be used as a template. Replace placeholders and remove sections you don’t need. If deploying under a subpath (e.g., GitHub Pages), set `NEXT_PUBLIC_BASE_PATH` and/or `basePath` in `next.config.ts` so all asset URLs resolve correctly.



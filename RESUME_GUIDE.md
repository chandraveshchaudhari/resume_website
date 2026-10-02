# Website Content Guide (resume.md)

Everything on this website — including the multi-version resume builder at
`/resume` — is driven by **one file: `resume.md`** in the project root.
You do **not** need to touch any code.

```
resume.md                      ← edit this
scripts/build-resume-content.js ← runs automatically on npm run dev / build
src/config/resume-content.json  ← generated (do not edit)
src/config/config.ts            ← defaults + rendering config (rarely edited)
```

## Quick start

```bash
npm run dev          # edits to resume.md are picked up on rebuild
npm run content:build   # regenerate JSON without starting a server
npm run content:export  # write current site content back to resume.md
```

## Format

- `## Section` starts a section (names below).
- `### Item Title` starts an item inside a section.
- `Key: value` lines set item fields (the `- ` dash is optional).
- `- value` lines are list entries (bullets, features, skills...).
- `<!-- comments -->` are ignored.
- Unknown keys are ignored, so extra notes never break the build.

### Tags on list entries

List entries may end with a tag in parentheses:

```
- Applied Machine Learning (primary)
- AI for Finance (academic only)
- PySpark (industry only)
```

`primary` marks the item as a primary research area; `industry only` /
`academic only` restrict a skill or area to one resume version.

---

## Sections

### Personal

Name, contact, and site metadata. All keys optional.

```
## Personal

- Name: Dr. Chandravesh Chaudhari
- Title: Assistant Professor | Founder, SolarpunkWorks Pvt Ltd | Multimodal AI Researcher
- Tagline: Empowering business through data-driven intelligence.
- Location: Bangalore, India
- Phone: +91 8006966608
- Website: https://solarpunkworks.com
- Email: you@example.com
- LinkedIn: https://www.linkedin.com/in/you/
- GitHub: https://github.com/you
- Google Scholar: https://scholar.google.com/citations?user=ID
- Orcid: https://orcid.org/0000-0000-0000-0000
- Image: images/profile.png
- Image fallback: https://... (optional, used if the profile image fails)
- SEO title: Your Name – Your Title
- SEO description: Portfolio website showcasing ...
- Animated text:
  - Multimodal Machine Learning
  - Decision Fusion
- Headline (Industry): Applied Scientist | ...
- Headline (Academic): AI & ML Researcher | ...
```

### Summary

Version-specific professional summaries. Free text under each heading.

```
## Summary

### Industry

Applied AI/ML researcher ... (free text, multiple lines OK)

### Academic

Assistant Professor at ... (free text)
```

### Experience

```
## Experience

### Founder
Place: SolarpunkWorks Pvt Ltd
Time: (Present)
Kind: industry            ← industry | faculty | teaching (routes to Teaching section)
Industry priority: 1      ← 1 = most important; 99 = hidden by default
Academic priority: 2
Card image: images/experience/logo.png
- Bullet one
- Bullet two
Industry bullets:         ← optional, replaces bullets on the industry resume
- Industry-specific bullet
Academic bullets:         ← optional, replaces bullets on the academic resume
- Academic-specific bullet
```

### Projects

```
## Projects

### Brain-AI / BMMA: Multimodal AutoML
Role: Lead author & architect
Tech: Python, PyTorch, Scikit-learn, MLflow, Airflow
Link: https://... (demo/product page)
Github: https://github.com/you/repo
Local path: projects/... (optional, internal)
Industry priority: 1
Academic priority: 1
Description: one-line summary
Industry description: engineering-focused paragraph (industry resume)
Academic description: research-focused paragraph (academic resume)
Highlights:
- Highlight one
- Highlight two
Industry highlights:      ← optional
- ...
Academic highlights:      ← optional
- ...
Needs review: true        ← shows a ⚠ flag in the builder
```

### Publications

```
## Publications

### Paper Title
Authors: A. Author, B. Author
Venue: Conference or Journal, Publisher
Year: 2026
Link: https://doi.org/...
Area: Financial Volatility Forecasting
Industry priority: 1
Academic priority: 1
Abstract: one or two sentences
Citation: full Vancouver-style citation string
Image: images/research/paper.png
Needs review: true        ← optional
```

### Patents

```
## Patents

### Patent Title
Status: Indian patent application published on 01 August 2025
Year: 2025
Application number: 202541071889
Inventors: Name One, Name Two
Reference: 496269-001
Relevance: Multimodal AutoML — hybrid fusion
Industry priority: 1
Academic priority: 1
Needs review: true        ← optional
```

### Education

```
## Education

### Christ University, Bangalore
Institution: Christ University, Bangalore
Degree: Doctor of Philosophy (PhD) — Multimodal Machine Learning
Year: June 2020 – September 2025
Department: Multimodal Machine Learning
Guide: Dr. Guide Name
Thesis: Thesis Title
Thesis link: http://hdl.handle.net/...
Image: images/education/logo.png
Industry priority: 1
Academic priority: 1
- Description line one
- Description line two
```

### Certifications

```
## Certifications

### Deep Learning Specialization (DeepLearning.AI)
Specialization: true
File: images/education/Certifications/spec.pdf
Industry priority: 1
Academic priority: 2
Certificates:
- name: Neural Networks and Deep Learning
- file: images/education/Certifications/nn.pdf
- name: Improving Deep Neural Networks
- file: images/education/Certifications/improving.pdf
```

### Open Source

```
## Open Source

### brain-ai (Multimodal AutoML Framework)
Github: https://github.com/you/repo
Website: https://...
Pip: pip install brain-automl
Description: one-line description
Industry priority: 1
Academic priority: 1
- Feature one
- Feature two
```

### Open Source Contributions

```
## Open Source Contributions

### pyodide-editable (MyST plugin)
Project: pyodide-editable (MyST plugin)
Repo: https://github.com/...
Note: Authored the ...
```

### Industry Engagements

```
## Industry Engagements

### Rooman Technologies — Industry–Academia Consultancy
Header: Rooman Technologies — Industry–Academia Consultancy (via CHRIST)
- Bullet one
- Bullet two
```

### Thesis

```
## Thesis

- Title: Advances on Stock Price Prediction Using Machine Learning
- Authors: Chaudhari, C.
- Year: 2025
- Institution: CHRIST University
- Link: http://hdl.handle.net/...
- Citation: Chaudhari, C. (2025). ...
```

### Books

```
## Books

### Your Book Title
Description: short description
Link: https://...
Image: images/book_cover.png
```

### Skills

Categories with skills. Tags control version visibility.

```
## Skills

### Programming
- Python
- SQL
- R (academic only)

### ML / AI
- Machine Learning
- Deep Learning
- AutoML (industry only)
```

### Courses

Distinguishes what you **actually taught** from what you **can teach**.

```
## Courses

### Business Analytics
Status: taught
Area: ai-analytics        ← ai-analytics | finance-business

### Sustainable Finance & Responsible Investment
Status: can teach
Area: finance-business

### Econometrics
Status: teaching interest
Area: finance-business
```

Statuses: `taught` (supported by your record), `can teach` (expertise claim),
`teaching interest`.

### Research Areas

```
## Research Areas

- Applied Machine Learning (primary)
- Multimodal Machine Learning
- AI for Finance (academic only)
- AutoML (industry only)
```

### AI + Finance

```
## AI + Finance

- Financial Machine Learning
- Stock Market Prediction
- AI for FinTech
```

### Awards / References / Copyrights / Design Work

```
## Awards

### Award Title
Year: 2026
Description: what it was

## References

### Dr. Referee Name
Role: Professor, XYZ University
Contact: referee@example.com

## Copyrights

### Screening Research Documents and Citations from Multiple Databases
Diary no: 7645/2022-CO/L

## Design Work

### Card Display Device / GoDest Cards
Reference: 496269-001
Filing context: Design representation filed with ...
Date: 26 March 2026
Status: Design representation / filing documentation
```

### Resume Versions

Optional presentation overrides per version.

```
## Resume Versions

### Industry
Label: Industry — AI / Applied Scientist
Tagline: Applied Scientist · ML Engineer · ...
Footer note: Founder, SolarpunkWorks Pvt Ltd

### Academic
Label: Academic — AI + Finance / Business Analytics
Tagline: Assistant Professor · Faculty ...
Footer note: Founder, SolarpunkWorks Pvt Ltd
```

---

## Priorities and how versions select content

Each resume version auto-selects items whose priority for that version is
**≤ the version's `maxPriority` (default 3)**:

| Priority | Meaning |
|---|---|
| 1 | Always include (top evidence) |
| 2–3 | Include by default |
| 4+ | Off by default — enable via checkbox in the builder |
| 99 | Hidden by default (e.g. routine items) |

Omitting a priority hides the item from that version's auto-selection.

## Images

- Paths are relative to `public/` (`images/profile.png` → `public/images/profile.png`).
- Full URLs (`https://...`) are used as-is.
- Missing images fall back to placeholders — the site never breaks.

## Adding a new item

1. Open `resume.md`.
2. Add a `### Title` block under the right `## Section` with the keys you need.
3. Run `npm run dev` (or `npm run build`). Done — the item appears on the site
   and in the resume builder, auto-selected by its priorities.

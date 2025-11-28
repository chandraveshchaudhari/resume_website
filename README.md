This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

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

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.



Perfect 🔥 — since you already have a **blank GitHub repo opened in PyCharm**, let’s now **initialize a clean Next.js + TypeScript + Tailwind project** (ideal for GitHub Pages static deployment).

The commands below will **create all required folders, config files, and dependencies** automatically.
Just copy-paste and run them **in PyCharm’s terminal** inside your repository root.

---

## 🧰 1️⃣ Create Next.js + TypeScript + Tailwind project

```bash
# Step 1: Initialize Next.js (with TypeScript + Tailwind)
npx create-next-app@latest . --typescript --tailwind --eslint
```

When it asks you questions:

* ✅ Would you like to use `App Router` → **Yes**
* ✅ Would you like to customize `src/` directory → **No**
* ✅ Import alias → Press **Enter**
* (Rest defaults are fine)

---

## 🧩 2️⃣ Install stable add-ons

```bash
npm install framer-motion lucide-react next-themes react-hook-form zod @tanstack/react-query
```

These give you:

* ⚡ Animations (Framer Motion)
* 🎨 Icons (Lucide)
* 🌙 Dark/Light Mode (Next Themes)
* 🧾 Forms + Validation (React Hook Form + Zod)
* 🔁 Data fetching (TanStack Query)

---

## 🧱 3️⃣ Create GitHub Pages–compatible Next.js config

In your root folder, open (or create) **`next.config.mjs`** and replace all content with:

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // static export for GitHub Pages
  images: {
    unoptimized: true,
  },
  basePath: '/<REPO_NAME>',   // ⚠️ replace with your repo name, e.g. '/my-portfolio'
  assetPrefix: '/<REPO_NAME>/', // same as above
};

export default nextConfig;
```

---

## 🧰 4️⃣ Add a GitHub Actions workflow

Create a new file:

```
.github/workflows/deploy.yml
```

Paste this content:

```yaml
name: Deploy Next.js site to GitHub Pages

on:
  push:
    branches: [ "main" ]

permissions:
  contents: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install dependencies
        run: npm ci

      - name: Build static site
        run: npm run build

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./out
```

---

## 🪶 5️⃣ Add build script for static export

In your `package.json`, ensure these lines exist:

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start"
}

```

---

## 🎨 6️⃣ Optional: Create example hero section

In `app/page.tsx`, replace the content with:

```tsx
"use client";
import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";

export default function Home() {
  const { theme, setTheme } = useTheme();

  return (
    <main className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-b from-gray-100 to-gray-300 dark:from-gray-900 dark:to-gray-800 text-center p-8">
      <motion.h1
        className="text-4xl md:text-6xl font-bold mb-4"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        Hi, I’m <span className="text-blue-500">Chandravesh Chaudhari</span>
      </motion.h1>

      <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
        Assistant Professor | Multimodal AI | Python Automation
      </p>

      <button
        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        className="flex items-center gap-2 border rounded-lg px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-700"
      >
        {theme === "light" ? <Sun size={20} /> : <Moon size={20} />}
        Toggle Theme
      </button>
    </main>
  );
}
```

---

## 🚀 7️⃣ Test locally

```bash
npm run dev
```

Visit → [http://localhost:3000](http://localhost:3000)

If it works fine, commit and push:

```bash
git add .
git commit -m "Initial Next.js site setup"
git push origin main
```

The GitHub Action will automatically:

* Build your static site (`next build && next export`)
* Deploy it to the `gh-pages` branch
* Make it live at
  👉 `https://<your-username>.github.io/<REPO_NAME>/`

---

Would you like me to extend this setup with a **ready-made folder structure** (components, hero, navbar, about, projects) so you can start editing directly?
I can give you the `app/` + `components/` layout with Tailwind and TypeScript defaults prewired for your portfolio.



| Category                                     | Library / Component                                             | Purpose                                                                  | Stability                           |
| -------------------------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------ | ----------------------------------- |
| 🎨 **Styling**                               | **Tailwind CSS**                                                | Utility-first CSS for fast, responsive layouts                           | ⭐ Extremely stable                  |
| 🧱 **Layout & Typography**                   | Built using **Tailwind classes** (no third-party layout system) | You can control all spacing, color, font sizes via Tailwind              | ⭐ Stable                            |
| 🌀 **Animation**                             | **Framer Motion**                                               | Handles animations like fade, slide, or stagger transitions              | ⭐ Stable, widely used in production |
| 🌗 **Theme Handling**                        | **next-themes**                                                 | Manages dark/light mode and system theme preference                      | ⭐ Stable                            |
| 🖋️ **Icons**                                | **lucide-react**                                                | Clean, lightweight SVG icons (open-source replacement for Feather Icons) | ⭐ Stable                            |
| 🧾 **Forms & Validation** (optional install) | **react-hook-form** + **zod**                                   | Build forms with schema-based validation                                 | ⭐ Stable                            |
| 🔁 **Data Fetching** (optional install)      | **@tanstack/react-query**                                       | Handles API calls, caching, refetching                                   | ⭐ Stable                            |



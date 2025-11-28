
import fs from 'fs';
import path from 'path';
import siteConfig from '@/config/config';

type BlogConfig = {
  title?: string;
  url: string;
};

export default async function BlogsPage() {
  // Look for static HTML blog files under public/static_page or public/website/static_page
  const publicDir = path.join(process.cwd(), 'public');
  const candidates = [
    path.join(publicDir, 'static_page'),
    path.join(publicDir, 'website', 'static_page'),
  ];

  let foundDir: string | null = null;
  for (const c of candidates) {
    if (fs.existsSync(c) && fs.statSync(c).isDirectory()) {
      foundDir = c;
      break;
    }
  }

  if (!foundDir) {
    return (
      <div className="py-16 max-w-4xl mx-auto px-4">
        <h1 className="text-2xl font-bold">Blogs</h1>
        <p className="mt-4">No static blog folder found in <code>public/static_page</code>.</p>
        <p className="mt-2">Create HTML files in <code>public/static_page/</code> (or <code>public/website/static_page/</code> when using a basePath) and they will be listed here.</p>
      </div>
    );
  }

  // If siteConfig.blogs is provided, prefer it — it already contains correct URLs via getAsset
  const configBlogs: BlogConfig[] = Array.isArray((siteConfig as { blogs?: unknown }).blogs)
    ? (siteConfig as { blogs: BlogConfig[] }).blogs
    : [];

  const files: (string | BlogConfig)[] =
    configBlogs.length > 0
      ? configBlogs.map((b) => ({ filename: b.title || path.basename(b.url), url: b.url }))
      : fs.readdirSync(foundDir).filter((f) => f.toLowerCase().endsWith('.html'));

  // Determine URL base for links (handles basePath like /website)
  const urlBase = (() => {
    const rel = path.relative(publicDir, foundDir).replace(/\\/g, '/');
    // if rel starts with 'website/', prefix with '/website', otherwise ''
    if (rel.startsWith('website/')) return '/website';
    return '';
  })();

  const prettyTitle = (item: string | BlogConfig | { filename?: string; title?: string }): string => {
    if (typeof item === 'object' && 'title' in item && item.title) return item.title;
    let filename = '';
    if (typeof item === 'string') filename = item;
    else if ('filename' in item && item.filename) filename = item.filename;
    const name = filename.replace(/\.html$/i, '');
    return name
      .replace(/[-_]+/g, ' ')
      .split(' ')
      .map((s: string) => (s.length ? s[0].toUpperCase() + s.slice(1) : ''))
      .join(' ');
  };

  return (
    <div className="py-12 max-w-6xl mx-auto px-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Blogs</h1>
        </div>
      </div>

      <div className="mt-8 grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
  {files.map((f) => {
    const isConfigItem = typeof f === 'object' && 'url' in f;
    const href = isConfigItem ? (f as BlogConfig).url : `${urlBase}/static_page/${f}`;
    const displayName = prettyTitle(f);
    const raw = isConfigItem ? (f as BlogConfig).url : f;
    return (
      <div key={raw as string} className="border rounded-lg p-4 bg-white/5 hover:shadow-lg">
        <h2 className="text-lg font-semibold">{displayName}</h2>
        <div className="mt-4">
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-500"
          >
            Open
          </a>
        </div>
      </div>
    );
  })}
      </div>
    </div>
  );
}

// src/lib/cert-thumbnails.ts
/**
 * Loads the thumbnail index mapping for certificate files.
 * Maps original source filename -> generated thumbnail path
 */

let thumbnailMap: Record<string, string> | null = null;

export function getThumbnailMap(): Record<string, string> {
  if (thumbnailMap !== null) return thumbnailMap;

  try {
    // Import the generated index.json at build time
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    thumbnailMap = require('../../public/images/education/Certifications/thumbnails/index.json');
  } catch {
    // If index.json doesn't exist yet (first build), return empty map
    thumbnailMap = {};
  }

  return thumbnailMap as Record<string, string>;
}

export function getThumbnailPath(sourceFilename: string | undefined): string | undefined {
  if (!sourceFilename) return undefined;
  const map = getThumbnailMap();
  return map[sourceFilename];
}

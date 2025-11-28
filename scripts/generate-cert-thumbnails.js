#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function run() {
  const sharp = require('sharp');
  const inputDir = path.join(process.cwd(), 'public', 'images', 'education', 'Certifications');
  const outDir = path.join(inputDir, 'thumbnails');

  if (!fs.existsSync(inputDir)) {
    console.error('Certifications folder not found:', inputDir);
    process.exit(1);
  }

  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const files = fs.readdirSync(inputDir).filter(f => f.toLowerCase() !== 'thumbnails');
  let created = 0;
  let skipped = 0;
  let errors = 0;
  const indexMap = {}; // Maps original filename -> generated thumbnail path

  // check for pdftoppm availability
  let hasPdftoppm = true;
  try {
    execSync('pdftoppm -v', { stdio: 'ignore' });
  } catch (e) {
    hasPdftoppm = false;
  }

  for (const file of files) {
    try {
      const ext = path.extname(file).toLowerCase();
      const name = path.basename(file, ext).replace(/\s+/g, '_');
      const inputPath = path.join(inputDir, file);
      const outFile = path.join(outDir, `${name}.webp`);
      const thumbPath = `images/education/Certifications/thumbnails/${name}.webp`;

      if (fs.existsSync(outFile)) {
        skipped++;
        indexMap[file] = thumbPath;
        continue;
      }

      if (['.png', '.jpg', '.jpeg', '.webp', '.avif', '.svg'].includes(ext)) {
        await sharp(inputPath)
          .resize({ width: 640, withoutEnlargement: true })
          .webp({ quality: 80 })
          .toFile(outFile);
        created++;
        indexMap[file] = thumbPath;
        console.log('Created thumbnail for image', file);
        continue;
      }

      if (ext === '.pdf') {
        if (!hasPdftoppm) {
          console.warn('pdftoppm not found; skipping PDF thumbnail for', file, '\nInstall poppler (e.g. `brew install poppler`) to enable PDF thumbnails.');
          errors++;
          continue;
        }

        const tmpPrefix = path.join(outDir, `tmp_${name}`);
        // pdftoppm will create tmpPrefix.png
        try {
          execSync(`pdftoppm -png -f 1 -singlefile "${inputPath}" "${tmpPrefix}"`, { stdio: 'ignore' });
          const tmpPng = `${tmpPrefix}.png`;
          if (fs.existsSync(tmpPng)) {
            await sharp(tmpPng)
              .resize({ width: 640, withoutEnlargement: true })
              .webp({ quality: 80 })
              .toFile(outFile);
            fs.unlinkSync(tmpPng);
            created++;
            indexMap[file] = thumbPath;
            console.log('Created thumbnail for PDF', file);
            continue;
          } else {
            console.warn('pdftoppm did not produce expected output for', file);
            errors++;
            continue;
          }
        } catch (e) {
          console.error('Error running pdftoppm for', file, e.message || e);
          errors++;
          continue;
        }
      }

      // unknown type: skip
      skipped++;
    } catch (e) {
      console.error('Error processing', file, e.message || e);
      errors++;
    }
  }

  // Write the index map to index.json for runtime lookup
  const indexPath = path.join(outDir, 'index.json');
  fs.writeFileSync(indexPath, JSON.stringify(indexMap, null, 2), 'utf-8');
  console.log(`Index map written to ${indexPath}`);

  console.log('\nSummary: created=%d skipped=%d errors=%d', created, skipped, errors);
  if (!hasPdftoppm) console.log('\nNote: pdftoppm (poppler) not found. Install via `brew install poppler` on macOS to enable PDF thumbnails.');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});

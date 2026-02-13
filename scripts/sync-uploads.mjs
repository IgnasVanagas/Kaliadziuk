import { cp, mkdir, readFile, rm, stat } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const projectRoot = process.cwd();
const uploadsRoot = path.resolve(projectRoot, 'uploads');
const publicUploadsRoot = path.resolve(projectRoot, 'public', 'uploads');

const SOURCE_FILES = [
  path.join(projectRoot, 'src', 'App.jsx'),
  path.join(projectRoot, 'src', 'pages', 'GiftCard.jsx'),
  path.join(projectRoot, 'src', 'components', 'SiteHeader.jsx'),
  path.join(projectRoot, 'src', 'components', 'Seo.jsx'),
  path.join(projectRoot, 'src', 'lib', 'productImages.js'),
];

const ALWAYS_INCLUDE = [
  'logo-light.svg',
  'image.png',
  'atsiliepimai/_thumbs',
  '_optimized',
];

const collectReferencedUploads = async () => {
  const results = new Set();

  for (const filePath of SOURCE_FILES) {
    const content = await readFile(filePath, 'utf8');

    const fromUploadsRegex = /fromUploads\('([^']+)'\)/g;
    let match;
    while ((match = fromUploadsRegex.exec(content))) {
      results.add(match[1]);
    }

    const uploadsRegex = /\/uploads\/([^`'"\s)]+\.(?:png|jpe?g|svg|webp|avif))/gi;
    while ((match = uploadsRegex.exec(content))) {
      results.add(match[1]);
    }
  }

  return Array.from(results).map((relPath) => relPath.replace(/^\/+/, ''));
};

const copyItem = async (relPath) => {
  const src = path.join(uploadsRoot, relPath);
  const dest = path.join(publicUploadsRoot, relPath);

  try {
    const srcStat = await stat(src);
    if (srcStat.isDirectory()) {
      await mkdir(dest, { recursive: true });
      await cp(src, dest, { recursive: true, force: true });
      return;
    }
  } catch {
    console.warn(`[sync-uploads] Missing source: ${relPath}`);
    return;
  }

  await mkdir(path.dirname(dest), { recursive: true });
  await cp(src, dest, { force: true });
};

async function main() {
  await rm(publicUploadsRoot, { recursive: true, force: true });
  await mkdir(publicUploadsRoot, { recursive: true });

  const referenced = await collectReferencedUploads();
  const targets = new Set([...referenced, ...ALWAYS_INCLUDE]);

  for (const relPath of targets) {
    await copyItem(relPath);
  }

  console.log(`[sync-uploads] Copied ${targets.size} item(s) into ${publicUploadsRoot}`);
}

main().catch((err) => {
  console.error('[sync-uploads] Failed:', err);
  process.exitCode = 1;
});

import { cp, mkdir } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const uploadsRoot = path.resolve(process.cwd(), 'uploads');
const distUploadsRoot = path.resolve(process.cwd(), 'dist', 'uploads');

const brandingSrcDir = path.join(uploadsRoot, 'Branding');
const brandingDestDir = path.join(distUploadsRoot, 'Branding');

const extraFiles = ['logo-light.svg', 'image.png'];

async function main() {
  try {
    await mkdir(distUploadsRoot, { recursive: true });

    await cp(brandingSrcDir, brandingDestDir, { recursive: true, force: true });
    console.log(`[copy-branding] Copied ${brandingSrcDir} -> ${brandingDestDir}`);

    for (const file of extraFiles) {
      const src = path.join(uploadsRoot, file);
      const dest = path.join(distUploadsRoot, file);
      try {
        await cp(src, dest, { force: true });
        console.log(`[copy-branding] Copied ${src} -> ${dest}`);
      } catch {
        // Optional assets; ignore if missing.
      }
    }
  } catch (err) {
    console.warn('[copy-branding] Skipped (missing source or copy failed):', err?.message ?? err);
  }
}

await main();

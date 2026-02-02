import { cp, mkdir } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const srcDir = path.resolve(process.cwd(), 'uploads', 'Branding');
const destDir = path.resolve(process.cwd(), 'dist', 'uploads', 'Branding');

async function main() {
  try {
    await mkdir(path.dirname(destDir), { recursive: true });
    await cp(srcDir, destDir, { recursive: true, force: true });
    console.log(`[copy-branding] Copied ${srcDir} -> ${destDir}`);
  } catch (err) {
    console.warn('[copy-branding] Skipped (missing source or copy failed):', err?.message ?? err);
  }
}

await main();

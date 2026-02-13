import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const projectRoot = process.cwd();
const sourceDir = path.join(projectRoot, 'uploads', 'atsiliepimai');
const outDir = path.join(sourceDir, '_thumbs');

const AVATAR_FILES = [
  '470469671_9420998764591504_1367316031802033160_n-e1743524043787.jpg',
  '485767155_2433248600372198_5450357866485351546_n-e1743523994763.jpg',
  '394284740_6710013242385928_5528573044851569625_n.jpg',
  'Picture1 (1).jpg',
  'Picture2-1.jpg',
  'Picture3 (1).jpg',
  '373064400_6180419855414750_1227222582074733444_n.jpg',
  '367460586_6616155658420913_6885742354305016905_n.jpg',
  'Screenshot-2025-03-19-at-5.40.07 PM.png',
  '459630769_10230433925305293_4458957318428687233_n.jpg',
  '302925805_5629860167034966_3216542933912186510_n.jpg',
  'image00001 (2).jpeg',
];

const THUMB_SIZE = 160;

const fileExists = async (filePath) => {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
};

const statSafe = async (filePath) => {
  try {
    return await fs.stat(filePath);
  } catch {
    return null;
  }
};

const buildThumb = async (srcPath, outPath) => {
  const ext = path.extname(srcPath).toLowerCase();
  let pipeline = sharp(srcPath)
    .rotate()
    .resize(THUMB_SIZE, THUMB_SIZE, { fit: 'cover', position: 'centre' });

  if (ext === '.png') {
    pipeline = pipeline.png({ compressionLevel: 9, adaptiveFiltering: true });
  } else {
    pipeline = pipeline.jpeg({ quality: 72, mozjpeg: true });
  }

  await pipeline.toFile(outPath);
};

const main = async () => {
  await fs.mkdir(outDir, { recursive: true });

  let generated = 0;
  let skipped = 0;

  for (const fileName of AVATAR_FILES) {
    const srcPath = path.join(sourceDir, fileName);
    const outPath = path.join(outDir, fileName);

    const srcStat = await statSafe(srcPath);
    if (!srcStat) {
      console.warn(`[thumbs] Missing source: ${path.relative(projectRoot, srcPath)}`);
      continue;
    }

    const outStat = await statSafe(outPath);
    const upToDate = outStat && outStat.mtimeMs >= srcStat.mtimeMs;

    if (upToDate) {
      skipped += 1;
      continue;
    }

    await buildThumb(srcPath, outPath);
    generated += 1;
    console.log(`[thumbs] Wrote ${path.relative(projectRoot, outPath)}`);
  }

  console.log(`[thumbs] Done. generated=${generated} skipped=${skipped}`);
};

main().catch((err) => {
  console.error('[thumbs] Failed:', err);
  process.exitCode = 1;
});

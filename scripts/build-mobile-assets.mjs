import { copyFile, mkdir, readdir, rm, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'dist');

const baseFiles = [
  'index.html',
  'manifest.json',
  'sw.js',
  'v2362-ui.css',
  'v2362-ui.js',
  'privacy.html',
  'support.html',
  'proposal_logo_light_transparent.png'
];

await rm(outDir, { recursive: true, force: true });
await mkdir(outDir, { recursive: true });

const rootEntries = await readdir(root);
const iconFiles = rootEntries.filter(name => /^icon-.+\.png$/i.test(name));
const files = [...baseFiles, ...iconFiles];

for (const file of files) {
  const source = path.join(root, file);
  try {
    const info = await stat(source);
    if (info.isFile()) {
      await copyFile(source, path.join(outDir, file));
    }
  } catch (error) {
    throw new Error(`Required mobile asset is missing: ${file}`, { cause: error });
  }
}

console.log(`Copied ${files.length} files to dist/`);

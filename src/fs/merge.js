import fs from 'fs/promises';
import path from 'path';

const workspaceDir = path.join(process.cwd(), 'workspace');
const partsDir = path.join(workspaceDir, 'parts');
const mergedPath = path.join(workspaceDir, 'merged.txt');

const getFilesArg = () => {
  const idx = process.argv.indexOf('--files');
  if (idx === -1 || !process.argv[idx + 1]) return null;
  return process.argv[idx + 1].split(',').map((s) => s.trim());
};

const merge = async () => {
  try {
    await fs.access(partsDir);
  } catch {
    throw new Error('FS operation failed');
  }
  const filesArg = getFilesArg();
  let files;
  if (filesArg && filesArg.length > 0) {
    files = filesArg;
    for (const f of files) {
      try {
        await fs.access(path.join(partsDir, f));
      } catch {
        throw new Error('FS operation failed');
      }
    }
  } else {
    const items = await fs.readdir(partsDir, { withFileTypes: true });
    files = items.filter((i) => i.isFile() && path.extname(i.name) === '.txt').map((i) => i.name).sort();
    if (files.length === 0) throw new Error('FS operation failed');
  }
  const chunks = [];
  for (const name of files) {
    const content = await fs.readFile(path.join(partsDir, name), 'utf8');
    chunks.push(content);
  }
  await fs.writeFile(mergedPath, chunks.join(''), 'utf8');
};

await merge();

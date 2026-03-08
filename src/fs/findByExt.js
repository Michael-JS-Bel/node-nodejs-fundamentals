import fs from 'fs/promises';
import path from 'path';

const workspaceDir = path.join(process.cwd(), 'workspace');

const getExt = () => {
  const idx = process.argv.indexOf('--ext');
  if (idx === -1 || !process.argv[idx + 1]) return '.txt';
  const ext = process.argv[idx + 1];
  return ext.startsWith('.') ? ext : `.${ext}`;
};

const findFiles = async (dirPath, basePath, ext, list) => {
  const items = await fs.readdir(dirPath, { withFileTypes: true });
  for (const item of items) {
    const relativePath = basePath ? path.join(basePath, item.name) : item.name;
    const normalized = relativePath.replace(/\\/g, '/');
    if (item.isDirectory()) {
      await findFiles(path.join(dirPath, item.name), relativePath, ext, list);
    } else if (path.extname(item.name) === ext) {
      list.push(normalized);
    }
  }
};

const findByExt = async () => {
  try {
    await fs.access(workspaceDir);
  } catch {
    throw new Error('FS operation failed');
  }
  const ext = getExt();
  const list = [];
  await findFiles(workspaceDir, '', ext, list);
  list.sort();
  for (const p of list) {
    console.log(p);
  }
};

await findByExt();

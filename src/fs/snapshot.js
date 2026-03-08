import fs from 'fs/promises';
import path from 'path';

const workspaceDir = path.join(process.cwd(), 'workspace');

const scanDir = async (dirPath, basePath) => {
  const entries = [];
  const items = await fs.readdir(dirPath, { withFileTypes: true });
  for (const item of items) {
    const relativePath = basePath ? path.join(basePath, item.name) : item.name;
    if (item.isDirectory()) {
      entries.push({ path: relativePath.replace(/\\/g, '/'), type: 'directory' });
      const subEntries = await scanDir(path.join(dirPath, item.name), relativePath);
      entries.push(...subEntries);
    } else {
      const fullPath = path.join(dirPath, item.name);
      const stat = await fs.stat(fullPath);
      const content = await fs.readFile(fullPath);
      entries.push({
        path: relativePath.replace(/\\/g, '/'),
        type: 'file',
        size: stat.size,
        content: content.toString('base64'),
      });
    }
  }
  return entries;
};

const snapshot = async () => {
  try {
    await fs.access(workspaceDir);
  } catch {
    throw new Error('FS operation failed');
  }
  const rootPath = path.resolve(workspaceDir);
  const entries = await scanDir(workspaceDir, '');
  const snapshotPath = path.join(process.cwd(), 'snapshot.json');
  await fs.writeFile(
    snapshotPath,
    JSON.stringify({ rootPath, entries }, null, 2),
    'utf8'
  );
};

await snapshot();

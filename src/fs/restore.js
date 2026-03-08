import fs from 'fs/promises';
import path from 'path';

const snapshotPath = path.join(process.cwd(), 'snapshot.json');
const restoreDir = path.join(process.cwd(), 'workspace_restored');

const restore = async () => {
  let data;
  try {
    data = await fs.readFile(snapshotPath, 'utf8');
  } catch {
    throw new Error('FS operation failed');
  }
  try {
    await fs.access(restoreDir);
    throw new Error('FS operation failed');
  } catch (err) {
    if (err.message === 'FS operation failed') throw err;
  }
  const snapshot = JSON.parse(data);
  const dirs = snapshot.entries.filter((e) => e.type === 'directory').sort((a, b) => a.path.localeCompare(b.path));
  const files = snapshot.entries.filter((e) => e.type === 'file');
  await fs.mkdir(restoreDir, { recursive: true });
  for (const d of dirs) {
    await fs.mkdir(path.join(restoreDir, d.path.replace(/\//g, path.sep)), { recursive: true });
  }
  for (const f of files) {
    const filePath = path.join(restoreDir, f.path.replace(/\//g, path.sep));
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    const buf = Buffer.from(f.content, 'base64');
    await fs.writeFile(filePath, buf);
  }
};

await restore();

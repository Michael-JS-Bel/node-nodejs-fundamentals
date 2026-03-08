import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';
import zlib from 'zlib';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';

const workspaceDir = path.join(process.cwd(), 'workspace');
const toCompressDir = path.join(workspaceDir, 'toCompress');
const compressedDir = path.join(workspaceDir, 'compressed');
const archivePath = path.join(compressedDir, 'archive.br');

const collectEntries = async (dirPath, basePath) => {
  const entries = [];
  const items = await fsp.readdir(dirPath, { withFileTypes: true });
  for (const item of items) {
    const relativePath = basePath ? path.join(basePath, item.name) : item.name;
    const normalized = relativePath.replace(/\\/g, '/');
    if (item.isDirectory()) {
      entries.push({ path: normalized, type: 'directory' });
      const sub = await collectEntries(path.join(dirPath, item.name), relativePath);
      entries.push(...sub);
    } else {
      const fullPath = path.join(dirPath, item.name);
      const stat = await fsp.stat(fullPath);
      entries.push({ path: normalized, type: 'file', size: stat.size, fullPath });
    }
  }
  return entries;
};

const compressDir = async () => {
  try {
    await fsp.access(toCompressDir);
  } catch {
    throw new Error('FS operation failed');
  }
  await fsp.mkdir(compressedDir, { recursive: true });
  const entries = await collectEntries(toCompressDir, '');
  const manifest = entries.map((e) => (e.type === 'directory' ? { path: e.path, type: 'directory' } : { path: e.path, type: 'file', size: e.size }));
  const header = JSON.stringify(manifest) + '\n';
  const fileEntries = entries.filter((e) => e.type === 'file');
  const concatStream = Readable.from(
    (async function* () {
      yield Buffer.from(header, 'utf8');
      for (const e of fileEntries) {
        const chunks = [];
        for await (const chunk of fs.createReadStream(e.fullPath)) chunks.push(chunk);
        yield Buffer.concat(chunks);
      }
    })()
  );
  const brotli = zlib.createBrotliCompress();
  const out = fs.createWriteStream(archivePath);
  await pipeline(concatStream, brotli, out);
};

await compressDir();

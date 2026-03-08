import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';
import zlib from 'zlib';
import { pipeline } from 'stream/promises';
import { Writable } from 'stream';

const workspaceDir = path.join(process.cwd(), 'workspace');
const compressedDir = path.join(workspaceDir, 'compressed');
const archivePath = path.join(compressedDir, 'archive.br');
const decompressedDir = path.join(workspaceDir, 'decompressed');

const decompressDir = async () => {
  try {
    await fsp.access(compressedDir);
    await fsp.access(archivePath);
  } catch {
    throw new Error('FS operation failed');
  }
  await fsp.mkdir(decompressedDir, { recursive: true });
  const chunks = [];
  const collect = new Writable({
    write(chunk, enc, cb) {
      chunks.push(chunk);
      cb();
    },
  });
  const readStream = fs.createReadStream(archivePath);
  const brotli = zlib.createBrotliDecompress();
  await pipeline(readStream, brotli, collect);
  const all = Buffer.concat(chunks);
  const newlineIdx = all.indexOf('\n');
  const header = all.subarray(0, newlineIdx).toString('utf8');
  const body = all.subarray(newlineIdx + 1);
  const manifest = JSON.parse(header);
  let offset = 0;
  for (const entry of manifest) {
    const destPath = path.join(decompressedDir, entry.path.replace(/\//g, path.sep));
    if (entry.type === 'directory') {
      await fsp.mkdir(destPath, { recursive: true });
    } else {
      await fsp.mkdir(path.dirname(destPath), { recursive: true });
      const fileData = body.subarray(offset, offset + entry.size);
      offset += entry.size;
      await fsp.writeFile(destPath, fileData);
    }
  }
};

await decompressDir();

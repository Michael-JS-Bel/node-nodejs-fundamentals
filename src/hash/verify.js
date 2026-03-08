import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';
import { createHash } from 'crypto';

const checksumsPath = path.join(process.cwd(), 'checksums.json');

const hashFile = (filePath) => {
  return new Promise((resolve, reject) => {
    const hash = createHash('sha256');
    const stream = fs.createReadStream(filePath);
    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', reject);
  });
};

const verify = async () => {
  let data;
  try {
    data = await fsp.readFile(checksumsPath, 'utf8');
  } catch {
    throw new Error('FS operation failed');
  }
  const checksums = JSON.parse(data);
  const baseDir = path.dirname(checksumsPath);
  for (const [filename, expected] of Object.entries(checksums)) {
    const filePath = path.join(baseDir, filename);
    try {
      const actual = await hashFile(filePath);
      console.log(`${filename} — ${actual === expected ? 'OK' : 'FAIL'}`);
    } catch {
      console.log(`${filename} — FAIL`);
    }
  }
};

await verify();

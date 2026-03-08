import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';

const sourcePath = path.join(process.cwd(), 'source.txt');

const getLinesArg = () => {
  const idx = process.argv.indexOf('--lines');
  if (idx === -1 || !process.argv[idx + 1]) return 10;
  return parseInt(process.argv[idx + 1], 10) || 10;
};

const split = async () => {
  const maxLines = getLinesArg();
  return new Promise((resolve, reject) => {
    const chunks = [];
    let current = [];
    let lineCount = 0;
    let remainder = '';
    const stream = fs.createReadStream(sourcePath);
    stream.on('error', (err) => reject(err));
    stream.on('data', (chunk) => {
      const str = remainder + chunk.toString();
      const lines = str.split(/\r?\n/);
      remainder = lines.pop() || '';
      for (const line of lines) {
        current.push(line);
        lineCount++;
        if (lineCount >= maxLines) {
          chunks.push(current.join('\n') + (current.length ? '\n' : ''));
          current = [];
          lineCount = 0;
        }
      }
    });
    stream.on('end', async () => {
      if (remainder) current.push(remainder);
      if (current.length) {
        chunks.push(current.join('\n') + (current.length ? '\n' : ''));
      }
      const dir = path.dirname(sourcePath);
      for (let i = 0; i < chunks.length; i++) {
        await fsp.writeFile(path.join(dir, `chunk_${i + 1}.txt`), chunks[i], 'utf8');
      }
      resolve();
    });
  });
};

await split();

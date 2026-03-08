import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { Worker } from 'worker_threads';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.join(process.cwd(), 'data.json');
const workerPath = path.join(__dirname, 'worker.js');

const mergeSorted = (arrays) => {
  const indices = arrays.map(() => 0);
  const result = [];
  const total = arrays.reduce((s, a) => s + a.length, 0);
  while (result.length < total) {
    let minVal = Infinity;
    let minIdx = -1;
    for (let i = 0; i < arrays.length; i++) {
      if (indices[i] < arrays[i].length && arrays[i][indices[i]] < minVal) {
        minVal = arrays[i][indices[i]];
        minIdx = i;
      }
    }
    result.push(minVal);
    indices[minIdx]++;
  }
  return result;
};

const main = async () => {
  const data = JSON.parse(await fs.readFile(dataPath, 'utf8'));
  const N = os.cpus().length;
  const chunkSize = Math.ceil(data.length / N);
  const chunks = [];
  for (let i = 0; i < N; i++) {
    chunks.push(data.slice(i * chunkSize, (i + 1) * chunkSize));
  }
  const workers = chunks.map(
    (chunk) =>
      new Promise((resolve, reject) => {
        const worker = new Worker(workerPath, { workerData: null });
        worker.on('message', (msg) => {
          worker.terminate();
          resolve(msg);
        });
        worker.on('error', reject);
        worker.postMessage(chunk);
      })
  );
  const sortedChunks = await Promise.all(workers);
  const merged = mergeSorted(sortedChunks);
  console.log(JSON.stringify(merged));
};

await main();

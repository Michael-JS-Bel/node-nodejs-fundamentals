import { Transform } from 'stream';

const getPattern = () => {
  const idx = process.argv.indexOf('--pattern');
  return idx !== -1 && process.argv[idx + 1] ? process.argv[idx + 1] : '';
};

const filter = () => {
  const pattern = getPattern();
  let buffer = '';
  const transform = new Transform({
    transform(chunk, enc, cb) {
      buffer += chunk.toString();
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';
      for (const line of lines) {
        if (line.includes(pattern)) this.push(line + '\n');
      }
      cb();
    },
    flush(cb) {
      if (buffer !== '' && buffer.includes(pattern)) this.push(buffer + '\n');
      cb();
    },
  });
  process.stdin.pipe(transform).pipe(process.stdout);
};

filter();

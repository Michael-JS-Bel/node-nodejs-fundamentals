import { Transform } from 'stream';

const lineNumberer = () => {
  let lineNum = 1;
  let buffer = '';
  const transform = new Transform({
    transform(chunk, enc, cb) {
      buffer += chunk.toString();
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';
      for (const line of lines) {
        this.push(`${lineNum} | ${line}\n`);
        lineNum++;
      }
      cb();
    },
    flush(cb) {
      if (buffer !== '') {
        this.push(`${lineNum} | ${buffer}`);
      }
      cb();
    },
  });
  process.stdin.pipe(transform).pipe(process.stdout);
};

lineNumberer();

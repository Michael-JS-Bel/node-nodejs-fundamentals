const parseArgs = () => {
  const args = process.argv.slice(2);
  const opts = { duration: 5000, interval: 100, length: 30, color: null };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--duration' && args[i + 1]) opts.duration = parseInt(args[i + 1], 10) || 5000;
    if (args[i] === '--interval' && args[i + 1]) opts.interval = parseInt(args[i + 1], 10) || 100;
    if (args[i] === '--length' && args[i + 1]) opts.length = parseInt(args[i + 1], 10) || 30;
    if (args[i] === '--color' && args[i + 1]) {
      const hex = args[i + 1];
      if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        opts.color = `\x1b[38;2;${r};${g};${b}m`;
      }
    }
  }
  return opts;
};

const progress = () => {
  const { duration, interval, length, color } = parseArgs();
  const start = Date.now();
  const timer = setInterval(() => {
    const elapsed = Date.now() - start;
    const pct = Math.min(100, Math.floor((elapsed / duration) * 100));
    const filled = Math.round((pct / 100) * length);
    const bar = '█'.repeat(filled) + ' '.repeat(length - filled);
    const colorReset = color ? '\x1b[0m' : '';
    const prefix = color ? color : '';
    process.stdout.write(`\r[${prefix}${bar}${colorReset}] ${pct}%`);
    if (pct >= 100) {
      clearInterval(timer);
      console.log('\nDone!');
      process.exit(0);
    }
  }, interval);
};

progress();

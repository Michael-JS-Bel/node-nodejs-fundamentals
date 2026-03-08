import readline from 'readline';

const startTime = Date.now();

const interactive = () => {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const prompt = () => rl.question('> ', (line) => {
    if (line === null || line === undefined) {
      console.log('Goodbye!');
      rl.close();
      process.exit(0);
      return;
    }
    const cmd = line.trim().toLowerCase();
    switch (cmd) {
      case 'uptime':
        console.log(`Uptime: ${((Date.now() - startTime) / 1000).toFixed(2)}s`);
        break;
      case 'cwd':
        console.log(process.cwd());
        break;
      case 'date':
        console.log(new Date().toISOString());
        break;
      case 'exit':
        console.log('Goodbye!');
        rl.close();
        process.exit(0);
        return;
      case '':
        break;
      default:
        console.log('Unknown command');
    }
    prompt();
  });
  rl.on('close', () => {
    console.log('Goodbye!');
    process.exit(0);
  });
  rl.on('SIGINT', () => {
    console.log('\nGoodbye!');
    rl.close();
    process.exit(0);
  });
  prompt();
};

interactive();

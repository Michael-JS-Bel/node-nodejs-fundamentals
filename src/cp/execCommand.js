import { spawn } from 'child_process';

const execCommand = () => {
  const cmdStr = process.argv[2];
  if (!cmdStr) process.exit(1);
  const isWin = process.platform === 'win32';
  const child = spawn(isWin ? 'cmd' : 'sh', [isWin ? '/c' : '-c', cmdStr], {
    stdio: 'inherit',
    env: process.env,
  });
  child.on('exit', (code) => process.exit(code ?? 0));
};

execCommand();

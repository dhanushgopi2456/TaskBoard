import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

const isWindows = process.platform === 'win32';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';

console.log('\x1b[35m%s\x1b[0m', '═══════════════════════════════════════════════════════════');
console.log('\x1b[36m%s\x1b[0m', '🚀 Launching TaskBoard Backend (port 5000) & Frontend (port 3000)...');
console.log('\x1b[35m%s\x1b[0m', '═══════════════════════════════════════════════════════════');

const backend = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.join(rootDir, 'backend'),
  stdio: 'inherit',
  shell: true,
});

const frontend = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.join(rootDir, 'frontend'),
  stdio: 'inherit',
  shell: true,
});

const cleanExit = () => {
  console.log('\n\x1b[33m%s\x1b[0m', 'Shutting down TaskBoard servers...');
  try {
    if (isWindows) {
      spawn('taskkill', ['/pid', backend.pid.toString(), '/f', '/t'], { shell: true });
      spawn('taskkill', ['/pid', frontend.pid.toString(), '/f', '/t'], { shell: true });
    } else {
      backend.kill('SIGTERM');
      frontend.kill('SIGTERM');
    }
  } catch {}
  process.exit(0);
};

process.on('SIGINT', cleanExit);
process.on('SIGTERM', cleanExit);


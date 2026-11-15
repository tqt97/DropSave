import { environmentStatus, isWindows, WINDOWS_TARGET } from './build-env.mjs';

const status = environmentStatus();
const row = (ok, label, detail = '') => {
  const marker = ok ? '[OK]' : '[MISSING]';
  console.log(`${marker.padEnd(10)} ${label}${detail ? `: ${detail}` : ''}`);
};

console.log('\nDropSave Build Environment\n');
row(isWindows(), 'Windows', `${status.platform}/${status.arch}`);
row(Boolean(status.node), 'Node.js', status.node);
row(status.npm, 'npm');
row(status.rustc, 'Rust compiler', status.rustHost ?? 'not found');
row(status.cargo, 'Cargo');
row(status.rustup, 'rustup');
row(status.rustHost === WINDOWS_TARGET, 'Rust MSVC host', status.rustHost ?? 'not found');
if (isWindows()) {
  row(status.visualCppBuildTools, 'Visual Studio C++ Build Tools');
  row(status.winget, 'winget', status.winget ? 'available' : 'optional; bootstrap has official-download fallback');
} else {
  console.log('[N/A]'.padEnd(10) + ' Visual Studio C++ Build Tools: Windows only');
  console.log('[N/A]'.padEnd(10) + ' winget: Windows only');
}

const ready = isWindows()
  && status.rustc
  && status.cargo
  && status.rustup
  && status.rustHost === WINDOWS_TARGET
  && status.visualCppBuildTools;

console.log(ready
  ? '\nEnvironment is ready to build DropSave.\n'
  : '\nEnvironment is not ready. Run: npm run bootstrap\n');

process.exitCode = ready ? 0 : 1;

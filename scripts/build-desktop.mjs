import { spawnSync } from 'node:child_process';

const npmCommand = process.platform === 'win32' ? 'npx.cmd' : 'npx';
let bundles;
if (process.platform === 'win32') bundles = 'nsis';
else if (process.platform === 'darwin') bundles = 'dmg';
else throw new Error('DropSave release build currently supports Windows and macOS.');

console.log(`[build] platform=${process.platform}, bundles=${bundles}`);
const result = spawnSync(npmCommand, ['tauri', 'build', '--bundles', bundles], {
  stdio: 'inherit',
  shell: false,
});
if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status ?? 1);

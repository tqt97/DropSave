import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const tauriCli = resolve(root, 'node_modules', '@tauri-apps', 'cli', 'tauri.js');

let bundles;
if (process.platform === 'win32') bundles = 'nsis';
else if (process.platform === 'darwin') bundles = 'dmg';
else throw new Error('DropSave release build currently supports Windows and macOS.');

if (!existsSync(tauriCli)) {
  throw new Error('Tauri CLI entrypoint was not found. Run npm install before desktop:build.');
}

console.log(`[build] platform=${process.platform}, bundles=${bundles}`);

const result = spawnSync(
  process.execPath,
  [tauriCli, 'build', '--bundles', bundles],
  {
    cwd: root,
    stdio: 'inherit',
    windowsHide: true,
  },
);

if (result.error) {
  throw new Error(`Unable to run Tauri build: ${result.error.message}`);
}

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const iconsDir = resolve(root, 'src-tauri', 'icons');
const sourceIcon = resolve(iconsDir, 'icon-512.png');
const tauriCli = resolve(root, 'node_modules', '@tauri-apps', 'cli', 'tauri.js');

const commonIcons = [
  resolve(iconsDir, '32x32.png'),
  resolve(iconsDir, '128x128.png'),
  resolve(iconsDir, '128x128@2x.png'),
];

const platformIcons = process.platform === 'win32'
  ? [resolve(iconsDir, 'icon.ico')]
  : process.platform === 'darwin'
    ? [resolve(iconsDir, 'icon.icns')]
    : [];

const requiredIcons = [...commonIcons, ...platformIcons];
const missing = requiredIcons.filter((path) => !existsSync(path));

if (missing.length === 0) {
  console.log(`[assets] App icons are ready for ${process.platform}.`);
  process.exit(0);
}

console.log('[assets] Missing platform app icons. Regenerating automatically...');
for (const path of missing) {
  console.log(`[assets] missing: ${path}`);
}

if (!existsSync(sourceIcon)) {
  throw new Error(
    'Source icon is missing: src-tauri/icons/icon-512.png. Restore this tracked source asset and run the build again.',
  );
}

if (!existsSync(tauriCli)) {
  throw new Error(
    'Tauri CLI entrypoint was not found in node_modules. Run npm install before preparing app assets.',
  );
}

const result = spawnSync(
  process.execPath,
  [tauriCli, 'icon', sourceIcon],
  {
    cwd: root,
    stdio: 'inherit',
    windowsHide: true,
  },
);

if (result.error) {
  throw new Error(`Unable to run Tauri icon generator: ${result.error.message}`);
}

if (result.status !== 0) {
  throw new Error(`Tauri icon generation failed with exit code ${result.status}.`);
}

const stillMissing = requiredIcons.filter((path) => !existsSync(path));
if (stillMissing.length > 0) {
  throw new Error(
    `Icon generation finished but required platform files are still missing: ${stillMissing.join(', ')}`,
  );
}

console.log(`[assets] App icons generated successfully for ${process.platform}.`);

import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const sourceIcon = resolve(root, 'src-tauri', 'icons', 'icon-512.png');
const requiredIcons = [
  resolve(root, 'src-tauri', 'icons', '32x32.png'),
  resolve(root, 'src-tauri', 'icons', '128x128.png'),
  resolve(root, 'src-tauri', 'icons', '128x128@2x.png'),
  resolve(root, 'src-tauri', 'icons', 'icon.ico'),
  resolve(root, 'src-tauri', 'icons', 'icon.icns'),
];

const missing = requiredIcons.filter((path) => !existsSync(path));

if (missing.length === 0) {
  console.log('[assets] App icons are ready.');
  process.exit(0);
}

console.log('[assets] Missing generated app icons. Regenerating automatically...');

if (!existsSync(sourceIcon)) {
  throw new Error(
    'Source icon is missing: src-tauri/icons/icon-512.png. Restore this tracked source asset and run the build again.',
  );
}

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const result = spawnSync(
  npmCommand,
  ['run', 'tauri', '--', 'icon', sourceIcon],
  {
    cwd: root,
    stdio: 'inherit',
    shell: false,
  },
);

if (result.error) {
  throw result.error;
}

if (result.status !== 0) {
  throw new Error(`Tauri icon generation failed with exit code ${result.status}.`);
}

const stillMissing = requiredIcons.filter((path) => !existsSync(path));
if (stillMissing.length > 0) {
  throw new Error(`Icon generation finished but required files are still missing: ${stillMissing.join(', ')}`);
}

console.log('[assets] App icons generated successfully.');

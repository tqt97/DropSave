import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

export const WINDOWS_TARGET = 'x86_64-pc-windows-msvc';

export const isWindows = () => process.platform === 'win32';

export const run = (command, args = [], options = {}) => {
  const result = spawnSync(command, args, {
    encoding: 'utf8',
    stdio: options.capture ? 'pipe' : 'inherit',
    shell: false,
    ...options,
  });

  return {
    ok: !result.error && result.status === 0,
    status: result.status,
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
    error: result.error,
  };
};

export const commandExists = (command) => {
  const checker = isWindows() ? 'where.exe' : 'which';
  return run(checker, [command], { capture: true }).ok;
};

export const refreshCargoPath = () => {
  if (!isWindows()) return;
  const cargoBin = join(process.env.USERPROFILE ?? '', '.cargo', 'bin');
  const current = process.env.PATH ?? '';
  if (cargoBin && !current.toLowerCase().includes(cargoBin.toLowerCase())) {
    process.env.PATH = `${cargoBin};${current}`;
  }
};

export const findVsWhere = () => {
  const candidates = [
    join(process.env['ProgramFiles(x86)'] ?? '', 'Microsoft Visual Studio', 'Installer', 'vswhere.exe'),
    join(process.env.ProgramFiles ?? '', 'Microsoft Visual Studio', 'Installer', 'vswhere.exe'),
  ];
  return candidates.find((candidate) => candidate && existsSync(candidate)) ?? null;
};

export const hasVisualCppBuildTools = () => {
  if (!isWindows()) return true;
  const vswhere = findVsWhere();
  if (!vswhere) return false;

  const result = run(vswhere, [
    '-latest',
    '-products', '*',
    '-requires', 'Microsoft.VisualStudio.Component.VC.Tools.x86.x64',
    '-property', 'installationPath',
  ], { capture: true });

  return result.ok && result.stdout.trim().length > 0;
};

export const rustHost = () => {
  refreshCargoPath();
  if (!commandExists('rustc')) return null;
  try {
    const output = execFileSync('rustc', ['-vV'], { encoding: 'utf8' });
    return output.match(/^host:\s+(.+)$/m)?.[1]?.trim() ?? null;
  } catch {
    return null;
  }
};

export const environmentStatus = () => {
  refreshCargoPath();
  return {
    platform: process.platform,
    arch: process.arch,
    node: process.version,
    npm: commandExists('npm'),
    rustc: commandExists('rustc'),
    cargo: commandExists('cargo'),
    rustup: commandExists('rustup'),
    rustHost: rustHost(),
    visualCppBuildTools: hasVisualCppBuildTools(),
    winget: isWindows() ? commandExists('winget') : false,
  };
};

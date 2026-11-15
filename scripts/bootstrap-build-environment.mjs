import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  WINDOWS_TARGET,
  commandExists,
  environmentStatus,
  hasVisualCppBuildTools,
  isWindows,
  refreshCargoPath,
  run,
  rustHost,
} from './build-env.mjs';

const fail = (message) => {
  console.error(`\n[bootstrap] ERROR: ${message}\n`);
  process.exit(1);
};

const step = (message) => console.log(`\n[bootstrap] ${message}`);

if (!isWindows()) {
  step('Windows auto-bootstrap is not required on this platform. Verifying Rust/Cargo only...');
  if (!commandExists('rustc') || !commandExists('cargo')) {
    fail('Rust/Cargo are required on this platform before running Tauri.');
  }
  step('Rust/Cargo are ready. Continuing.');
  process.exit(0);
}

if (process.arch !== 'x64') {
  fail(`V1 release automation currently targets Windows x64. Detected architecture: ${process.arch}.`);
}

const powershell = process.env.SystemRoot
  ? join(process.env.SystemRoot, 'System32', 'WindowsPowerShell', 'v1.0', 'powershell.exe')
  : 'powershell.exe';

const downloadFile = (url, destination) => {
  const script = [
    "$ProgressPreference='SilentlyContinue'",
    `[Net.ServicePointManager]::SecurityProtocol=[Net.SecurityProtocolType]::Tls12`,
    `Invoke-WebRequest -Uri '${url}' -OutFile '${destination.replaceAll("'", "''")}' -UseBasicParsing`,
  ].join('; ');
  const result = run(powershell, ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', script]);
  if (!result.ok || !existsSync(destination)) {
    fail(`Could not download ${url}`);
  }
};

const installRust = () => {
  refreshCargoPath();
  if (commandExists('rustc') && commandExists('cargo') && commandExists('rustup')) {
    step('Rust toolchain already installed.');
    return;
  }

  step('Rust is missing. Installing automatically...');

  if (commandExists('winget')) {
    const result = run('winget', [
      'install', '--id', 'Rustlang.Rustup', '-e',
      '--silent',
      '--accept-package-agreements',
      '--accept-source-agreements',
      '--disable-interactivity',
    ]);
    if (!result.ok) {
      console.warn('[bootstrap] winget Rust install failed; falling back to official rustup-init.exe.');
    }
  }

  refreshCargoPath();
  if (!commandExists('rustup')) {
    const installer = join(tmpdir(), 'dropsave-rustup-init.exe');
    downloadFile(
      'https://static.rust-lang.org/rustup/dist/x86_64-pc-windows-msvc/rustup-init.exe',
      installer,
    );
    const result = run(installer, [
      '-y',
      '--default-host', WINDOWS_TARGET,
      '--default-toolchain', 'stable',
      '--profile', 'minimal',
    ]);
    rmSync(installer, { force: true });
    if (!result.ok) fail('Rust installation failed.');
  }

  refreshCargoPath();
  if (!commandExists('rustup')) fail('rustup was installed but is not available to the current build process.');

  step('Selecting the stable MSVC Rust toolchain...');
  if (!run('rustup', ['default', 'stable-msvc']).ok) fail('Could not select stable-msvc Rust toolchain.');
  if (!run('rustup', ['target', 'add', WINDOWS_TARGET]).ok) fail(`Could not install Rust target ${WINDOWS_TARGET}.`);

  refreshCargoPath();
  if (!commandExists('rustc') || !commandExists('cargo')) fail('Rust installation completed but rustc/cargo are still unavailable.');
};

const installVisualCppBuildTools = () => {
  if (hasVisualCppBuildTools()) {
    step('Visual Studio C++ Build Tools already installed.');
    return;
  }

  step('Visual Studio C++ Build Tools are missing. Installing automatically...');
  console.log('[bootstrap] Windows may show one UAC confirmation. Approve it so the C++ toolchain can be installed.');

  const installer = join(tmpdir(), 'dropsave-vs-buildtools.exe');
  downloadFile('https://aka.ms/vs/17/release/vs_buildtools.exe', installer);

  const installPath = join(process.env['ProgramFiles(x86)'] ?? 'C:\\Program Files (x86)', 'Microsoft Visual Studio', '2022', 'BuildTools');
  const args = [
    '--quiet', '--wait', '--norestart', '--nocache',
    '--installPath', installPath,
    '--add', 'Microsoft.VisualStudio.Workload.VCTools',
    '--includeRecommended',
  ];

  const quotedArgs = args.map((value) => `'${value.replaceAll("'", "''")}'`).join(',');
  const elevateScript = [
    `$p=Start-Process -FilePath '${installer.replaceAll("'", "''")}' -ArgumentList @(${quotedArgs}) -Verb RunAs -Wait -PassThru`,
    'if ($p.ExitCode -eq 0 -or $p.ExitCode -eq 3010) { exit 0 } else { exit $p.ExitCode }',
  ].join('; ');

  const result = run(powershell, ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', elevateScript]);
  rmSync(installer, { force: true });
  if (!result.ok) fail(`Visual Studio Build Tools installation failed (exit ${result.status ?? 'unknown'}).`);

  if (!hasVisualCppBuildTools()) {
    fail('Visual Studio Build Tools installer finished, but the required C++ workload could not be verified. A Windows restart may be required.');
  }
};

step('Checking DropSave build prerequisites...');
installRust();
installVisualCppBuildTools();

const host = rustHost();
if (host !== WINDOWS_TARGET) {
  step(`Rust host is ${host ?? 'unknown'}; enforcing ${WINDOWS_TARGET}...`);
  if (!run('rustup', ['default', 'stable-msvc']).ok) fail('Could not enforce the MSVC Rust toolchain.');
  if (!run('rustup', ['target', 'add', WINDOWS_TARGET]).ok) fail('Could not add the Windows x64 Rust target.');
}

const finalStatus = environmentStatus();
if (!finalStatus.rustc || !finalStatus.cargo || !finalStatus.visualCppBuildTools) {
  fail('Automatic bootstrap finished but the environment is still incomplete. Run npm run doctor for details.');
}

step('Build environment is ready. Continuing automatically.');

import { execFileSync, spawnSync } from 'node:child_process';
import {
  chmodSync,
  copyFileSync,
  createReadStream,
  createWriteStream,
  existsSync,
  mkdirSync,
  readdirSync,
  renameSync,
  rmSync,
  statSync,
  readFileSync,
} from 'node:fs';
import { createHash } from 'node:crypto';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pipeline } from 'node:stream/promises';
import { Transform } from 'node:stream';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const binDir = join(root, 'src-tauri', 'binaries');
const cacheDir = join(root, '.cache', 'sidecars');
const manifest = JSON.parse(readFileSync(join(here, 'toolchain-manifest.json'), 'utf8'));
mkdirSync(binDir, { recursive: true });
mkdirSync(cacheDir, { recursive: true });

const rustc = execFileSync('rustc', ['-vV'], { encoding: 'utf8' });
const target = rustc.match(/^host:\s+(.+)$/m)?.[1]?.trim();
if (!target) throw new Error('Không xác định được Rust host target. Hãy kiểm tra rustc -vV.');

const isWindows = process.platform === 'win32';
const isMac = process.platform === 'darwin';
const ext = isWindows ? '.exe' : '';
const ytAsset = isWindows ? 'yt-dlp.exe' : isMac ? 'yt-dlp_macos' : 'yt-dlp';
const ytDest = join(binDir, `yt-dlp-${target}${ext}`);
const ffDest = join(binDir, `ffmpeg-${target}${ext}`);

const download = async (url, destination, label = basename(destination)) => {
  const temp = `${destination}.download`;
  const response = await fetch(url, { redirect: 'follow' });
  if (!response.ok || !response.body) throw new Error(`Download failed (${response.status}) ${url}`);

  const total = Number(response.headers.get('content-length') ?? 0);
  let received = 0;
  let lastPercent = -10;
  const progress = new Transform({
    transform(chunk, _encoding, callback) {
      received += chunk.length;
      if (total > 0) {
        const percent = Math.floor((received / total) * 100);
        if (percent >= lastPercent + 10 || percent === 100) {
          lastPercent = percent;
          process.stdout.write(`[sidecar] ${label}: ${percent}%\n`);
        }
      }
      callback(null, chunk);
    },
  });

  try {
    await pipeline(response.body, progress, createWriteStream(temp));
    if (existsSync(destination)) rmSync(destination, { force: true });
    renameSync(temp, destination);
  } catch (error) {
    rmSync(temp, { force: true });
    throw error;
  }
};

const downloadText = async (url) => {
  const response = await fetch(url, { redirect: 'follow' });
  if (!response.ok) throw new Error(`Download failed (${response.status}) ${url}`);
  return response.text();
};

const sha256 = async (filePath) => {
  const hash = createHash('sha256');
  await pipeline(createReadStream(filePath), hash);
  return hash.digest('hex');
};

const verifySha256 = async (filePath, expected, label) => {
  const actual = await sha256(filePath);
  if (actual.toLowerCase() !== expected.toLowerCase()) {
    rmSync(filePath, { force: true });
    throw new Error(`${label} SHA-256 verification failed. Expected ${expected}, got ${actual}.`);
  }
  console.log(`[sidecar] ${label} SHA-256 verified.`);
};

const findFileRecursive = (folder, filename) => {
  for (const entry of readdirSync(folder, { withFileTypes: true })) {
    const fullPath = join(folder, entry.name);
    if (entry.isFile() && entry.name.toLowerCase() === filename.toLowerCase()) return fullPath;
    if (entry.isDirectory()) {
      const nested = findFileRecursive(fullPath, filename);
      if (nested) return nested;
    }
  }
  return null;
};

const quotePowerShellLiteral = (value) => value.replaceAll("'", "''");
const extractZipWindows = (archive, destination) => {
  rmSync(destination, { recursive: true, force: true });
  mkdirSync(destination, { recursive: true });
  const command = `Expand-Archive -LiteralPath '${quotePowerShellLiteral(archive)}' -DestinationPath '${quotePowerShellLiteral(destination)}' -Force`;
  execFileSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-Command', command], { stdio: 'inherit' });
};

const commandPath = (command) => {
  const checker = isWindows ? 'where.exe' : 'which';
  const result = spawnSync(checker, [command], { encoding: 'utf8', stdio: 'pipe' });
  if (result.status !== 0) return null;
  return result.stdout.split(/\r?\n/).map((line) => line.trim()).find(Boolean) ?? null;
};

const prepareYtDlp = async () => {
  const { version, baseUrl, checksumFile } = manifest.ytDlp;
  const checksumText = await downloadText(`${baseUrl}/${checksumFile}`);
  const checksumLine = checksumText.split(/\r?\n/).find((line) => line.trim().endsWith(`  ${ytAsset}`) || line.trim().endsWith(` *${ytAsset}`));
  const expectedHash = checksumLine?.match(/^[a-fA-F0-9]{64}/)?.[0];
  if (!expectedHash) throw new Error(`Không tìm thấy checksum cho ${ytAsset} trong yt-dlp ${version}.`);

  const cacheFile = join(cacheDir, `${version}-${ytAsset}`);
  if (!existsSync(cacheFile)) {
    console.log(`[sidecar] downloading yt-dlp ${version} (${ytAsset})...`);
    await download(`${baseUrl}/${ytAsset}`, cacheFile, 'yt-dlp');
  }
  await verifySha256(cacheFile, expectedHash, `yt-dlp ${version}`);
  copyFileSync(cacheFile, ytDest);
  if (!isWindows) chmodSync(ytDest, 0o755);
  execFileSync(ytDest, ['--version'], { stdio: 'ignore' });
  console.log(`[sidecar] yt-dlp ready: ${basename(ytDest)}`);
};

const prepareWindowsFfmpeg = async () => {
  const cfg = manifest.ffmpeg.windows;
  const archive = join(cacheDir, `ffmpeg-${cfg.version}-windows.zip`);
  const extractDir = join(cacheDir, `ffmpeg-${cfg.version}-windows`);

  console.log(`[sidecar] resolving pinned FFmpeg ${cfg.version} Windows build...`);
  const checksumText = await downloadText(cfg.checksumUrl);
  const expectedHash = checksumText.match(/\b[a-fA-F0-9]{64}\b/)?.[0];
  if (!expectedHash) throw new Error('Không đọc được SHA-256 của FFmpeg Windows archive.');
  if (!existsSync(archive)) await download(cfg.url, archive, 'FFmpeg');
  await verifySha256(archive, expectedHash, `FFmpeg ${cfg.version}`);

  extractZipWindows(archive, extractDir);
  const extracted = findFileRecursive(extractDir, 'ffmpeg.exe');
  if (!extracted) throw new Error('Đã giải nén FFmpeg nhưng không tìm thấy ffmpeg.exe.');
  copyFileSync(extracted, ffDest);
  if (statSync(ffDest).size < 1_000_000) throw new Error('FFmpeg sidecar không hợp lệ.');
  execFileSync(ffDest, ['-version'], { stdio: 'ignore' });
  console.log(`[sidecar] FFmpeg ready: ${basename(ffDest)}`);
};

const prepareMacFfmpeg = () => {
  const cfg = manifest.ffmpeg.macos;
  let ffmpeg = commandPath('ffmpeg');
  if (!ffmpeg) {
    const brew = commandPath('brew') ?? ['/opt/homebrew/bin/brew', '/usr/local/bin/brew'].find(existsSync);
    if (!brew) throw new Error('FFmpeg chưa có và Homebrew không được tìm thấy. Cài Homebrew hoặc chạy CI macOS để build tự động.');
    console.log(`[sidecar] FFmpeg missing. Installing ${cfg.formula} with Homebrew...`);
    execFileSync(brew, ['install', cfg.formula], { stdio: 'inherit' });
    ffmpeg = commandPath('ffmpeg') ?? (process.arch === 'arm64' ? '/opt/homebrew/bin/ffmpeg' : '/usr/local/bin/ffmpeg');
  }
  if (!ffmpeg || !existsSync(ffmpeg)) throw new Error('Không tìm thấy ffmpeg sau bước chuẩn bị macOS.');

  const versionOutput = execFileSync(ffmpeg, ['-version'], { encoding: 'utf8' });
  const version = versionOutput.match(/^ffmpeg version\s+([^\s]+)/)?.[1] ?? 'unknown';
  if (cfg.expectedMajor && !version.includes(cfg.expectedMajor)) {
    console.warn(`[sidecar] FFmpeg version is ${version}; manifest expects major ${cfg.expectedMajor}. Continuing but recording the difference.`);
  }
  copyFileSync(ffmpeg, ffDest);
  chmodSync(ffDest, 0o755);
  execFileSync(ffDest, ['-version'], { stdio: 'ignore' });
  console.log(`[sidecar] FFmpeg ready: ${basename(ffDest)} (${version})`);
};

console.log(`[sidecar] target: ${target}`);
await prepareYtDlp();
if (isWindows) prepareWindowsFfmpeg();
else if (isMac) prepareMacFfmpeg();
else throw new Error('DropSave release automation currently supports Windows and macOS builds.');
console.log('[sidecar] ready');

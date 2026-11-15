const WINDOWS_RESERVED_NAMES = new Set([
  'con', 'prn', 'aux', 'nul',
  ...Array.from({ length: 9 }, (_, index) => `com${index + 1}`),
  ...Array.from({ length: 9 }, (_, index) => `lpt${index + 1}`)
]);

export const slugifyFilename = (input: string, fallback = 'video'): string => {
  const normalized = input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, ' ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 120)
    .replace(/-$/g, '');

  const safe = normalized || fallback;
  return WINDOWS_RESERVED_NAMES.has(safe) ? `${safe}-file` : safe;
};

export const filenameFromTitle = (title?: string): string => slugifyFilename(title ?? 'video');

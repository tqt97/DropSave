const SUPPORTED_PROTOCOLS = new Set(['http:', 'https:']);

export const validateMediaUrl = (value: string): { valid: boolean; message?: string } => {
  const input = value.trim();
  if (!input) return { valid: false, message: 'Hãy dán liên kết video.' };

  try {
    const url = new URL(input);
    if (!SUPPORTED_PROTOCOLS.has(url.protocol)) {
      return { valid: false, message: 'Liên kết phải bắt đầu bằng http:// hoặc https://.' };
    }
    if (!url.hostname || !url.hostname.includes('.')) {
      return { valid: false, message: 'Tên miền trong liên kết chưa hợp lệ.' };
    }
    return { valid: true };
  } catch {
    return { valid: false, message: 'Liên kết chưa đúng định dạng.' };
  }
};

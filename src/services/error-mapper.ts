import type { FriendlyError } from '../domain/types';

export const mapDownloaderError = (raw: string): FriendlyError => {
  const message = raw.toLowerCase();

  if (message.includes('login') || message.includes('sign in') || message.includes('cookies')) {
    return {
      title: 'Video cần đăng nhập',
      message: 'Nguồn này yêu cầu phiên đăng nhập hoặc quyền truy cập bổ sung.',
      suggestion: 'DropSave hiện ưu tiên URL công khai. Browser cookies/private content sẽ nằm trong Advanced Mode để tránh truy cập phiên đăng nhập ngoài ý muốn.',
      technical: raw,
      code: 'generic'
    };
  }

  if (message.includes('unsupported url')) {
    return {
      title: 'Chưa hỗ trợ liên kết này',
      message: 'Nguồn video hoặc dạng liên kết hiện chưa được bộ tải nhận diện.',
      suggestion: 'Hãy mở đúng video trong trình duyệt và sao chép liên kết trực tiếp.',
      technical: raw,
      code: 'generic'
    };
  }

  if (message.includes('requested format is not available')) {
    return {
      title: 'Không có định dạng phù hợp',
      message: 'Nguồn không cung cấp định dạng tương ứng với chất lượng đã chọn.',
      suggestion: 'Chọn “Tốt nhất tương thích” để DropSave ưu tiên MP4 H.264/AAC rồi tự fallback khi cần.',
      technical: raw,
      code: 'generic'
    };
  }

  if (message.includes('private video') || message.includes('video unavailable') || message.includes('not available')) {
    return {
      title: 'Không thể truy cập video',
      message: 'Video có thể đã bị xóa, đặt riêng tư hoặc giới hạn theo khu vực.',
      suggestion: 'Kiểm tra video trong trình duyệt trước. Nội dung private sẽ chỉ được hỗ trợ qua Advanced Mode có xác nhận.',
      technical: raw,
      code: 'generic'
    };
  }

  if (
    message.includes('network')
    || message.includes('timed out')
    || message.includes('timeout')
    || message.includes('connection')
    || message.includes('temporary failure')
    || message.includes('http error 429')
    || message.includes('http error 5')
  ) {
    return {
      title: 'Kết nối bị gián đoạn',
      message: 'DropSave đã tự thử lại nhưng vẫn chưa thể tải ổn định từ nguồn.',
      suggestion: 'Kiểm tra Internet hoặc thử lại sau một lúc.',
      technical: raw,
      code: 'network'
    };
  }

  return {
    title: 'Không thể hoàn tất',
    message: 'Đã xảy ra lỗi khi xử lý media.',
    suggestion: 'Thử lại với “Tốt nhất tương thích”. Nếu vẫn lỗi, kiểm tra URL trên trình duyệt.',
    technical: raw,
    code: 'generic'
  };
};

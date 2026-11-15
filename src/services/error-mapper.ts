import type { FriendlyError } from '../domain/types';

export const mapDownloaderError = (raw: string): FriendlyError => {
  const message = raw.toLowerCase();

  if (message.includes('login') || message.includes('sign in') || message.includes('cookies')) {
    return {
      title: 'Video cần đăng nhập',
      message: 'Nguồn video yêu cầu phiên đăng nhập hoặc quyền truy cập mà ứng dụng V1 chưa có.',
      suggestion: 'Hãy thử một video công khai. Hỗ trợ phiên đăng nhập trình duyệt sẽ được bổ sung ở phiên bản sau.',
      technical: raw
    };
  }

  if (message.includes('unsupported url')) {
    return {
      title: 'Chưa hỗ trợ liên kết này',
      message: 'Nguồn video hoặc định dạng liên kết hiện chưa được bộ tải nhận diện.',
      suggestion: 'Hãy mở video trong trình duyệt và sao chép lại liên kết trực tiếp của video.',
      technical: raw
    };
  }

  if (message.includes('requested format is not available')) {
    return {
      title: 'Không có chất lượng đã chọn',
      message: 'Video này không cung cấp chất lượng tương ứng.',
      suggestion: 'Chọn “Tốt nhất” để ứng dụng tự chọn định dạng phù hợp.',
      technical: raw
    };
  }

  if (message.includes('private video') || message.includes('video unavailable') || message.includes('not available')) {
    return {
      title: 'Không thể truy cập video',
      message: 'Video có thể đã bị xóa, đặt riêng tư hoặc giới hạn theo khu vực.',
      suggestion: 'Kiểm tra xem video có mở được bình thường trên trình duyệt hay không.',
      technical: raw
    };
  }

  if (message.includes('network') || message.includes('timed out') || message.includes('connection')) {
    return {
      title: 'Kết nối bị gián đoạn',
      message: 'Ứng dụng không thể tải dữ liệu ổn định từ nguồn video.',
      suggestion: 'Kiểm tra Internet rồi thử lại.',
      technical: raw
    };
  }

  return {
    title: 'Không thể hoàn tất',
    message: 'Đã xảy ra lỗi khi xử lý video.',
    suggestion: 'Thử lại với “Tốt nhất”. Nếu lỗi vẫn còn, hãy kiểm tra video trên trình duyệt.',
    technical: raw
  };
};

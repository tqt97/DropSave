import { Clock3, FolderOpen, Trash2 } from 'lucide-react';
import type { DownloadHistoryItem } from '../services/history';

interface Props {
  items: DownloadHistoryItem[];
  onReveal: (item: DownloadHistoryItem) => void;
  onClear: () => void;
}

const formatDate = (value: string): string => {
  try {
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(value));
  } catch {
    return value;
  }
};

export const DownloadHistory = ({ items, onReveal, onClear }: Props) => {
  if (items.length === 0) return null;

  return (
    <section className="history-panel" aria-label="Lịch sử tải gần đây">
      <div className="history-head">
        <div>
          <Clock3 size={16} />
          <strong>Gần đây</strong>
          <span>{items.length}</span>
        </div>
        <button className="history-clear" type="button" onClick={onClear}>
          <Trash2 size={14} /> Xóa lịch sử
        </button>
      </div>

      <div className="history-list">
        {items.slice(0, 5).map((item) => (
          <div className="history-item" key={item.id}>
            <div>
              <strong title={item.title}>{item.title}</strong>
              <span>{item.filename} · {formatDate(item.completedAt)}</span>
            </div>
            <button type="button" onClick={() => onReveal(item)} title="Mở vị trí tệp">
              <FolderOpen size={16} />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};

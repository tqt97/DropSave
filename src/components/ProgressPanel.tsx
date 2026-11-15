import { CheckCircle2, RefreshCw, X } from 'lucide-react';
import type { DownloadProgress } from '../domain/types';

interface Props {
  progress: DownloadProgress;
  completed: boolean;
  onCancel: () => void;
}

const phaseLabel = (progress: DownloadProgress, completed: boolean): string => {
  if (completed || progress.phase === 'completed') return 'Đã xong';
  if (progress.phase === 'checking-space') return 'Kiểm tra';
  if (progress.phase === 'retrying') return 'Đang thử lại';
  if (progress.phase === 'postprocessing') return 'Xử lý';
  if (progress.phase === 'preparing') return 'Chuẩn bị';
  return 'Đang tải';
};

export const ProgressPanel = ({ progress, completed, onCancel }: Props) => (
  <section className="progress-panel" aria-live="polite">
    <div className="progress-head">
      <div>
        <span className="eyebrow">{phaseLabel(progress, completed)}</span>
        <strong>{completed ? 'Tệp đã sẵn sàng' : progress.statusText}</strong>
      </div>
      {!completed && (
        <button className="icon-button" type="button" onClick={onCancel} aria-label="Hủy tải">
          <X size={18} />
        </button>
      )}
    </div>

    <div className="progress-track" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress.percent)}>
      <div className="progress-fill" style={{ width: `${progress.percent}%` }} />
    </div>

    <div className="progress-meta">
      <span>
        {completed
          ? <><CheckCircle2 size={15} /> Hoàn tất</>
          : progress.phase === 'retrying'
            ? <><RefreshCw size={14} className="spin-soft" /> Retry tự động</>
            : `${progress.percent.toFixed(1)}%`}
      </span>
      {!completed && progress.phase === 'downloading' && (
        <span>{[progress.speed, progress.eta ? `còn ${progress.eta}` : ''].filter(Boolean).join(' · ')}</span>
      )}
    </div>
  </section>
);

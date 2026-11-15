import { Clock3, Film } from 'lucide-react';
import type { VideoMetadata } from '../domain/types';

const formatDuration = (seconds?: number): string => {
  if (!seconds) return 'Không rõ thời lượng';
  const minutes = Math.floor(seconds / 60);
  const rest = Math.floor(seconds % 60);
  return `${minutes}:${rest.toString().padStart(2, '0')}`;
};

export const VideoPreview = ({ metadata }: { metadata: VideoMetadata }) => (
  <section className="preview-card" aria-label="Xem trước video">
    <div className="thumbnail-wrap">
      {metadata.thumbnail ? <img src={metadata.thumbnail} alt="Ảnh xem trước của video" /> : <Film size={34} aria-hidden />}
      <span className="duration-badge"><Clock3 size={13} /> {formatDuration(metadata.duration)}</span>
    </div>
    <div className="preview-copy">
      <span className="source-label">{metadata.extractor ?? 'Video'}</span>
      <h2>{metadata.title}</h2>
      {metadata.uploader && <p>{metadata.uploader}</p>}
    </div>
  </section>
);

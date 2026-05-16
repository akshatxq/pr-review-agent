import { useNavigate } from 'react-router-dom';
import StatusBadge from './StatusBadge.jsx';

const ReviewCard = ({ review }) => {
  const navigate = useNavigate();

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (mins > 0) return `${mins}m ago`;
    return 'just now';
  };

  return (
    <div
      onClick={() => navigate(`/reviews/${review.id}`)}
      style={{
        backgroundColor: '#141414',
        border: '1px solid #1e1e1e',
        borderRadius: '10px',
        padding: '20px 24px',
        cursor: 'pointer',
        transition: 'border-color 0.15s',
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = '#333'}
      onMouseLeave={e => e.currentTarget.style.borderColor = '#1e1e1e'}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div style={{ flex: 1, marginRight: '16px' }}>
          <p style={{ fontSize: '15px', fontWeight: '500', color: '#ffffff', marginBottom: '4px' }}>
            {review.pr_title ?? 'Untitled PR'}
          </p>
          <p style={{ fontSize: '13px', color: '#555' }}>
            {review.repos?.repo_full_name ?? 'unknown repo'}
          </p>
        </div>
        <StatusBadge status={review.status} />
      </div>

      <div style={{ display: 'flex', gap: '20px', fontSize: '13px', color: '#555' }}>
        <span>#{review.pr_number}</span>
        <span>by {review.pr_author}</span>
        <span>{timeAgo(review.created_at)}</span>
        {review.comment_posted && (
          <span style={{ color: '#4ade80' }}>✓ comment posted</span>
        )}
      </div>
    </div>
  );
};

export default ReviewCard;
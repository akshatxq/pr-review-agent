import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchReviewById } from '../services/api.js';
import StatusBadge from '../components/StatusBadge.jsx';
import AgentLogPanel from '../components/AgentLogPanel.jsx';

const ReviewDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReviewById(id)
      .then(setReview)
      .catch(() => setError('Failed to load review'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div style={{ padding: '40px 24px', color: '#555', fontSize: '14px' }}>
      Loading...
    </div>
  );

  if (error) return (
    <div style={{ padding: '40px 24px', color: '#f87171', fontSize: '14px' }}>
      {error}
    </div>
  );

  const agentOrder = ['code_quality', 'security', 'dependency', 'summarizer'];
  const sortedRuns = [...(review.agent_runs ?? [])].sort(
    (a, b) => agentOrder.indexOf(a.agent_name) - agentOrder.indexOf(b.agent_name)
  );

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 24px' }}>

      <button
        onClick={() => navigate('/')}
        style={{
          background: 'none',
          border: '1px solid #1e1e1e',
          color: '#555',
          padding: '6px 14px',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '13px',
          marginBottom: '28px',
        }}
      >
        ← Back
      </button>

      <div style={{
        backgroundColor: '#141414',
        border: '1px solid #1e1e1e',
        borderRadius: '10px',
        padding: '24px',
        marginBottom: '24px',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '16px',
        }}>
          <h1 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#ffffff',
            flex: 1,
            marginRight: '16px',
          }}>
            {review.pr_title}
          </h1>
          <StatusBadge status={review.status} />
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
          fontSize: '13px',
        }}>
          {[
            { label: 'Repo',    value: review.repos?.repo_full_name },
            { label: 'Author',  value: review.pr_author },
            { label: 'PR',      value: `#${review.pr_number}` },
            { label: 'Comment', value: review.comment_posted ? '✓ Posted' : '✗ Not posted' },
          ].map(({ label, value }) => (
            <div key={label}>
              <p style={{ color: '#555', marginBottom: '2px' }}>{label}</p>
              <p style={{ color: '#e0e0e0' }}>{value}</p>
            </div>
          ))}
        </div>

        {review.pr_url && (
          <a
            href={review.pr_url}
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'inline-block',
              marginTop: '16px',
              fontSize: '13px',
              color: '#6366f1',
              border: '1px solid #2a2a3e',
              padding: '6px 14px',
              borderRadius: '6px',
            }}
          >
            View on GitHub ↗
          </a>
        )}
      </div>

      <h2 style={{
        fontSize: '15px',
        fontWeight: '500',
        color: '#ffffff',
        marginBottom: '14px',
      }}>
        Agent Logs
      </h2>

      {sortedRuns.length === 0 ? (
        <p style={{ color: '#555', fontSize: '14px' }}>No agent runs recorded.</p>
      ) : (
        sortedRuns.map(run => (
          <AgentLogPanel key={run.id} run={run} />
        ))
      )}

    </div>
  );
};

export default ReviewDetail;
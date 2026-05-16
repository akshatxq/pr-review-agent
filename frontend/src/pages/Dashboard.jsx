import { useState, useEffect } from 'react';
import { fetchReviews } from '../services/api.js';
import ReviewCard from '../components/ReviewCard.jsx';

const Dashboard = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReviews()
      .then(setReviews)
      .catch(() => setError('Failed to load reviews'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 24px' }}>

      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '600', color: '#ffffff', marginBottom: '6px' }}>
          PR Reviews
        </h1>
        <p style={{ fontSize: '14px', color: '#555' }}>
          All pull requests reviewed by the agent
        </p>
      </div>

      {/* stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '32px' }}>
        {[
          { label: 'Total Reviews', value: reviews.length },
          { label: 'Completed',     value: reviews.filter(r => r.status === 'completed').length },
          { label: 'Failed',        value: reviews.filter(r => r.status === 'failed').length },
        ].map(({ label, value }) => (
          <div key={label} style={{
            backgroundColor: '#141414',
            border: '1px solid #1e1e1e',
            borderRadius: '10px',
            padding: '16px 20px',
          }}>
            <p style={{ fontSize: '13px', color: '#555', marginBottom: '6px' }}>{label}</p>
            <p style={{ fontSize: '28px', fontWeight: '600', color: '#ffffff' }}>{value}</p>
          </div>
        ))}
      </div>

      {/* reviews list */}
      {loading && (
        <p style={{ color: '#555', fontSize: '14px' }}>Loading reviews...</p>
      )}

      {error && (
        <p style={{ color: '#f87171', fontSize: '14px' }}>{error}</p>
      )}

      {!loading && !error && reviews.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '60px 0',
          color: '#555',
          fontSize: '14px',
        }}>
          <p style={{ fontSize: '32px', marginBottom: '12px' }}>🤖</p>
          <p>No reviews yet. Open a PR on a connected repo.</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {reviews.map(review => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>

    </div>
  );
};

export default Dashboard;
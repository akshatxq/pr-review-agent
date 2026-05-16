const colors = {
  completed: { bg: '#0d2b1a', text: '#4ade80', border: '#166534' },
  pending:   { bg: '#2b2100', text: '#facc15', border: '#854d0e' },
  failed:    { bg: '#2b0d0d', text: '#f87171', border: '#991b1b' },
};

const StatusBadge = ({ status }) => {
  const style = colors[status] ?? colors.pending;

  return (
    <span style={{
      backgroundColor: style.bg,
      color: style.text,
      border: `1px solid ${style.border}`,
      padding: '2px 10px',
      borderRadius: '999px',
      fontSize: '12px',
      fontWeight: '500',
      textTransform: 'capitalize',
    }}>
      {status}
    </span>
  );
};

export default StatusBadge;
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav style={{
      borderBottom: '1px solid #1e1e1e',
      padding: '0 32px',
      height: '56px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: '#0f0f0f',
      position: 'sticky',
      top: 0,
      zIndex: 10,
    }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '20px' }}>🤖</span>
        <span style={{ fontWeight: '600', fontSize: '16px', color: '#ffffff' }}>
          PR Review Agent
        </span>
      </Link>
      <span style={{ fontSize: '13px', color: '#555' }}>
        Automated code review
      </span>
    </nav>
  );
};

export default Navbar;
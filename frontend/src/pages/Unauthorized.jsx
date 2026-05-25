import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

const Unauthorized = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      if (user.role === 'Admin') {
        navigate('/admin/dashboard');
        return;
      }
    }
    navigate('/tasks');
  };

  return (
    <div className="unauthorized-container">
      <div className="unauthorized-card">
        <ShieldAlert size={64} className="unauthorized-icon" />
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '12px' }}>403</h1>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '16px' }}>Access Denied</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
          You do not have the necessary permissions to access this page. Please contact an administrator or return to your dashboard.
        </p>
        <button className="btn btn-secondary" onClick={handleGoBack}>
          <ArrowLeft size={16} />
          Go to Dashboard
        </button>
      </div>
    </div>
  );
};

export default Unauthorized;

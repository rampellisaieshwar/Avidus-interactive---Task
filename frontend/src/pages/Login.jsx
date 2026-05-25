import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, LogIn, Lock, Mail } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('All fields are required');
      return;
    }

    setSubmitting(true);
    const result = await login(email, password);

    if (result.success) {
      // Re-read current state to route properly
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        const user = JSON.parse(savedUser);
        if (user.role === 'Admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/tasks');
        }
      }
    } else {
      setError(result.error || 'Invalid credentials');
      setSubmitting(false);
    }
  };

  const handleDemoLogin = async (demoEmail, demoPassword) => {
    setError('');
    setEmail(demoEmail);
    setPassword(demoPassword);
    setSubmitting(true);
    const result = await login(demoEmail, demoPassword);

    if (result.success) {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        const user = JSON.parse(savedUser);
        if (user.role === 'Admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/tasks');
        }
      }
    } else {
      setError(result.error || 'Invalid credentials');
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2 className="auth-title">Welcome Back</h2>
          <p className="auth-subtitle">Sign in to manage tasks and roles</p>
        </div>

        {error && (
          <div className="form-error" style={{ 
            backgroundColor: 'rgba(239, 68, 68, 0.1)', 
            border: '1px solid var(--accent-danger)', 
            padding: '12px', 
            borderRadius: 'var(--border-radius-sm)', 
            marginBottom: '20px',
            color: 'var(--accent-danger)',
            fontSize: '0.9rem'
          }}>
            <AlertCircle size={16} style={{ marginRight: '6px' }} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email-input">Email or Username</label>
            <div style={{ position: 'relative' }}>
              <input
                id="email-input"
                type="text"
                className="form-input"
                placeholder="Enter email or username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={submitting}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password-input">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="password-input"
                type="password"
                className="form-input"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={submitting}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ marginTop: '10px' }} disabled={submitting}>
            <LogIn size={18} />
            {submitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account? <Link to="/register">Create Account</Link>
        </div>

        {/* Demo Accounts Section */}
        <div style={{
          marginTop: '24px',
          paddingTop: '20px',
          borderTop: '1px solid var(--border-color)'
        }}>
          <p style={{
            fontSize: '0.8rem',
            fontWeight: 600,
            color: 'var(--text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '12px',
            textAlign: 'center'
          }}>
            Demo Accounts (One-Click)
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => handleDemoLogin('testuser_prod@example.com', 'password123')}
              disabled={submitting}
              style={{
                padding: '8px 12px',
                fontSize: '0.8rem',
                flexDirection: 'column',
                gap: '2px',
                alignItems: 'center',
                backgroundColor: 'rgba(168, 85, 247, 0.05)',
                borderColor: 'rgba(168, 85, 247, 0.2)'
              }}
            >
              <strong style={{ color: 'hsl(270, 85%, 65%)' }}>Login as Admin</strong>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>testuser_prod</span>
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => handleDemoLogin('regular_user@gmail.com', 'password123')}
              disabled={submitting}
              style={{
                padding: '8px 12px',
                fontSize: '0.8rem',
                flexDirection: 'column',
                gap: '2px',
                alignItems: 'center',
                backgroundColor: 'rgba(59, 130, 246, 0.05)',
                borderColor: 'rgba(59, 130, 246, 0.2)'
              }}
            >
              <strong style={{ color: 'hsl(217, 91%, 60%)' }}>Login as User</strong>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>regular_user</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

import React, { useState, useEffect } from 'react';
import { useAuth, API_BASE_URL } from '../context/AuthContext';
import { 
  Users, 
  Trash2, 
  Loader2, 
  AlertCircle,
  Shield,
  User,
  CheckCircle,
  XCircle
} from 'lucide-react';

const AdminUsers = () => {
  const { checkToken, user: currentUser } = useAuth();
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/users`, {
        headers: {
          'Authorization': `Bearer ${checkToken()}`
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch users');
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (user) => {
    const newStatus = user.status === 'Active' ? 'Inactive' : 'Active';
    
    // Prevent Admin from deactivating themselves
    if (user._id === currentUser.id && newStatus === 'Inactive') {
      alert('You cannot deactivate your own admin account.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/users/${user._id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${checkToken()}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to update status');
      
      // Update local state instead of refetching everything
      setUsers(users.map(u => u._id === user._id ? { ...u, status: newStatus } : u));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteUser = async (user) => {
    if (user._id === currentUser.id) {
      alert('You cannot delete your own admin account.');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete user "${user.username}" and all of their tasks?`)) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/users/${user._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${checkToken()}`
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to delete user');
      
      setUsers(users.filter(u => u._id !== user._id));
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="main-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Users Management</h1>
          <p className="page-subtitle">Control and manage user status, roles and authorization</p>
        </div>
      </div>

      {error && (
        <div className="form-error" style={{
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid var(--accent-danger)',
          padding: '16px',
          borderRadius: 'var(--border-radius-sm)',
          marginBottom: '24px',
          color: 'var(--accent-danger)'
        }}>
          <AlertCircle size={20} style={{ marginRight: '8px' }} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
          <Loader2 size={36} className="spinner" style={{ animation: 'spin 1.5s linear infinite' }} />
        </div>
      ) : (
        <div className="dashboard-card">
          <div className="card-title-bar">
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Registered Users</h2>
            <span className="badge badge-admin">{users.length} Users</span>
          </div>

          <div className="table-wrapper">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Toggle Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {user.role === 'Admin' ? (
                          <Shield size={16} color="var(--accent-primary)" />
                        ) : (
                          <User size={16} className="text-muted" />
                        )}
                        <span style={{ fontWeight: 600 }}>{user.username}</span>
                        {user._id === currentUser.id && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>(You)</span>
                        )}
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`badge badge-${user.role.toLowerCase()}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge-${user.status === 'Active' ? 'active' : 'inactive'}`}>
                        {user.status === 'Active' ? (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <CheckCircle size={12} /> Active
                          </span>
                        ) : (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <XCircle size={12} /> Inactive
                          </span>
                        )}
                      </span>
                    </td>
                    <td>
                      <label className="switch">
                        <input 
                          type="checkbox" 
                          checked={user.status === 'Active'} 
                          onChange={() => handleToggleStatus(user)}
                          disabled={user._id === currentUser.id}
                        />
                        <span className="slider"></span>
                      </label>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        className="action-btn delete"
                        onClick={() => handleDeleteUser(user)}
                        title="Delete User"
                        disabled={user._id === currentUser.id}
                        style={{ opacity: user._id === currentUser.id ? 0.3 : 1 }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Dynamic spinner keyframes styling injection */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default AdminUsers;

import React, { useState, useEffect } from 'react';
import { useAuth, API_BASE_URL } from '../context/AuthContext';
import { 
  History, 
  Loader2, 
  AlertCircle,
  Clock,
  Terminal,
  Search
} from 'lucide-react';

const AdminLogs = () => {
  const { checkToken } = useAuth();
  
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/activity-logs`, {
        headers: {
          'Authorization': `Bearer ${checkToken()}`
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch logs');
      setLogs(data);
      setFilteredLogs(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    const term = searchTerm.toLowerCase();
    const filtered = logs.filter(log => 
      log.username.toLowerCase().includes(term) ||
      log.action.toLowerCase().includes(term) ||
      log.details.toLowerCase().includes(term) ||
      (log.ipAddress && log.ipAddress.toLowerCase().includes(term))
    );
    setFilteredLogs(filtered);
  }, [searchTerm, logs]);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getActionBadgeColor = (action) => {
    switch (action) {
      case 'Login': return 'badge-user';
      case 'Task Creation': return 'badge-active';
      case 'Task Update': return 'badge-pending';
      case 'Task Deletion': return 'badge-inactive';
      default: return 'badge-user';
    }
  };

  return (
    <div className="main-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Activity Logs</h1>
          <p className="page-subtitle">Inspect audit records and track actions in real time</p>
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

      <div className="dashboard-card" style={{ marginBottom: '24px', padding: '16px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'var(--bg-tertiary)', padding: '10px 16px', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--border-color)' }}>
          <Search size={18} className="text-muted" style={{ marginRight: '10px' }} />
          <input 
            type="text" 
            placeholder="Search logs by user, action, details or IP..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', background: 'transparent', border: 'none', color: 'var(--text-primary)', outline: 'none', fontFamily: 'inherit', fontSize: '0.95rem' }}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
          <Loader2 size={36} className="spinner" style={{ animation: 'spin 1.5s linear infinite' }} />
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="empty-state">
          <History size={48} className="empty-state-icon" />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>No activity logs found</h3>
          <p>We couldn't find any logs matching your criteria.</p>
        </div>
      ) : (
        <div className="dashboard-card">
          <div className="card-title-bar">
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Audit Logs</h2>
            <span className="badge badge-admin">{filteredLogs.length} Records</span>
          </div>

          <div className="table-wrapper">
            <table className="custom-table" style={{ fontSize: '0.9rem' }}>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>User</th>
                  <th>Action</th>
                  <th>Details</th>
                  <th>IP Address</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr key={log._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                        <Clock size={12} />
                        {formatDate(log.timestamp)}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{log.username}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {log.user ? log.user.role : 'User'}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${getActionBadgeColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Terminal size={12} className="text-muted" />
                        <span style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{log.details}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                      {log.ipAddress || 'unknown'}
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

export default AdminLogs;

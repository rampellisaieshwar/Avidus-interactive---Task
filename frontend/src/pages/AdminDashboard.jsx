import React, { useState, useEffect } from 'react';
import { useAuth, API_BASE_URL } from '../context/AuthContext';
import { 
  Users, 
  CheckSquare, 
  Clock, 
  CheckCircle, 
  Trash2, 
  Loader2, 
  AlertCircle,
  Inbox,
  Calendar,
  User
} from 'lucide-react';

const AdminDashboard = () => {
  const { checkToken } = useAuth();
  
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0
  });
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const headers = {
        'Authorization': `Bearer ${checkToken()}`
      };

      // Fetch analytics
      const analyticsRes = await fetch(`${API_BASE_URL}/api/admin/analytics`, { headers });
      const analyticsData = await analyticsRes.json();
      if (!analyticsRes.ok) throw new Error(analyticsData.message || 'Failed to fetch analytics');

      // Fetch all tasks
      const tasksRes = await fetch(`${API_BASE_URL}/api/admin/tasks`, { headers });
      const tasksData = await tasksRes.json();
      if (!tasksRes.ok) throw new Error(tasksData.message || 'Failed to fetch tasks');

      setAnalytics(analyticsData);
      setTasks(tasksData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task as an Administrator?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${checkToken()}`
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to delete task');
      
      // Refresh dashboard data
      fetchDashboardData();
    } catch (err) {
      alert(err.message);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="main-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-subtitle">Overview of system activities, tasks and analytics</p>
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
        <>
          {/* Analytics Cards Grid */}
          <div className="analytics-grid">
            <div className="analytics-card purple">
              <div className="analytics-info">
                <span className="analytics-label">Total Users</span>
                <span className="analytics-value">{analytics.totalUsers}</span>
              </div>
              <div className="analytics-icon-wrapper">
                <Users size={24} />
              </div>
            </div>

            <div className="analytics-card blue">
              <div className="analytics-info">
                <span className="analytics-label">Total Tasks</span>
                <span className="analytics-value">{analytics.totalTasks}</span>
              </div>
              <div className="analytics-icon-wrapper">
                <CheckSquare size={24} />
              </div>
            </div>

            <div className="analytics-card green">
              <div className="analytics-info">
                <span className="analytics-label">Completed Tasks</span>
                <span className="analytics-value">{analytics.completedTasks}</span>
              </div>
              <div className="analytics-icon-wrapper">
                <CheckCircle size={24} />
              </div>
            </div>

            <div className="analytics-card yellow">
              <div className="analytics-info">
                <span className="analytics-label">Pending Tasks</span>
                <span className="analytics-value">{analytics.pendingTasks}</span>
              </div>
              <div className="analytics-icon-wrapper">
                <Clock size={24} />
              </div>
            </div>
          </div>

          {/* Task Monitoring Section */}
          <div className="dashboard-card">
            <div className="card-title-bar">
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Task Monitoring</h2>
              <span className="badge badge-user">{tasks.length} Active Tasks</span>
            </div>

            {tasks.length === 0 ? (
              <div className="empty-state" style={{ padding: '32px 16px' }}>
                <Inbox size={36} className="empty-state-icon" />
                <p>No tasks found in the database.</p>
              </div>
            ) : (
              <div className="table-wrapper">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Task Title</th>
                      <th>Created By</th>
                      <th>Status</th>
                      <th>Created Date</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map((task) => (
                      <tr key={task._id}>
                        <td>
                          <div style={{ fontWeight: 600 }}>{task.title}</div>
                          {task.description && (
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {task.description}
                            </div>
                          )}
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <User size={14} className="text-muted" />
                            <div>
                              <div>{task.user ? task.user.username : 'Unknown User'}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                {task.user ? task.user.email : ''}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`badge badge-${task.status.toLowerCase()}`}>
                            {task.status}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                            <Calendar size={14} />
                            {formatDate(task.createdAt)}
                          </div>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button 
                            className="action-btn delete"
                            onClick={() => handleDeleteTask(task._id)}
                            title="Delete this task (Admin)"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
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

export default AdminDashboard;

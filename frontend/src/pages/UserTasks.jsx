import React, { useState, useEffect } from 'react';
import { useAuth, API_BASE_URL } from '../context/AuthContext';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle, 
  Clock, 
  Loader2,
  AlertCircle,
  Inbox
} from 'lucide-react';

const UserTasks = () => {
  const { checkToken, user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modals / forms state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [selectedTask, setSelectedTask] = useState(null);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [users, setUsers] = useState([]);
  const [assignedTo, setAssignedTo] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = async () => {
    if (user && user.role === 'Admin') {
      try {
        const response = await fetch(`${API_BASE_URL}/api/admin/users`, {
          headers: {
            'Authorization': `Bearer ${checkToken()}`
          }
        });
        const data = await response.json();
        if (response.ok) {
          setUsers(data);
        }
      } catch (err) {
        console.error('Failed to fetch users', err);
      }
    }
  };

  const fetchTasks = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/tasks`, {
        headers: {
          'Authorization': `Bearer ${checkToken()}`
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch tasks');
      setTasks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchUsers();
  }, [user]);

  const openCreateModal = () => {
    setModalMode('create');
    setTitle('');
    setDescription('');
    setAssignedTo(user ? user.id : '');
    setSelectedTask(null);
    setIsModalOpen(true);
  };

  const openEditModal = (task) => {
    setModalMode('edit');
    setTitle(task.title);
    setDescription(task.description || '');
    setAssignedTo(task.user ? (task.user._id || task.user) : '');
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleSaveTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSubmitting(true);
    try {
      let response;
      const url = modalMode === 'create' 
        ? `${API_BASE_URL}/api/tasks`
        : `${API_BASE_URL}/api/tasks/${selectedTask._id}`;
      
      const method = modalMode === 'create' ? 'POST' : 'PUT';
      
      response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${checkToken()}`
        },
        body: JSON.stringify({
          title,
          description,
          status: modalMode === 'edit' ? selectedTask.status : 'Pending',
          user: user && user.role === 'Admin' ? assignedTo : undefined
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to save task');

      setIsModalOpen(false);
      fetchTasks();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${checkToken()}`
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to delete task');
      
      fetchTasks();
    } catch (err) {
      alert(err.message);
    }
  };

  const toggleTaskStatus = async (task) => {
    const newStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
    try {
      const response = await fetch(`${API_BASE_URL}/api/tasks/${task._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${checkToken()}`
        },
        body: JSON.stringify({
          status: newStatus
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to update task status');
      
      fetchTasks();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="main-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Tasks</h1>
          <p className="page-subtitle">Manage, track and update your tasks</p>
        </div>
        <button className="btn btn-primary" onClick={openCreateModal} style={{ width: 'auto' }}>
          <Plus size={18} />
          Create Task
        </button>
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
      ) : tasks.length === 0 ? (
        <div className="empty-state">
          <Inbox size={48} className="empty-state-icon" />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>No tasks found</h3>
          <p>Create a task to get started on your to-do list.</p>
          <button className="btn btn-primary" onClick={openCreateModal} style={{ width: 'auto' }}>
            Create Your First Task
          </button>
        </div>
      ) : (
        <div className="tasks-grid">
          {tasks.map((task) => (
            <div key={task._id} className={`task-card ${task.status}`}>
              <div className="task-header">
                <h3 className="task-title" style={{ textDecoration: task.status === 'Completed' ? 'line-through' : 'none', opacity: task.status === 'Completed' ? 0.6 : 1 }}>
                  {task.title}
                </h3>
                <span className={`badge badge-${task.status.toLowerCase()}`}>
                  {task.status}
                </span>
              </div>
              
              <p className="task-description" style={{ opacity: task.status === 'Completed' ? 0.5 : 0.8 }}>
                {task.description || 'No description provided.'}
              </p>

              {task.user && (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                  Assigned to: <strong style={{ color: 'var(--accent-primary)' }}>{task.user.username}</strong>
                </div>
              )}

              <div className="task-actions">
                <button 
                  className="action-btn" 
                  onClick={() => toggleTaskStatus(task)}
                  title={task.status === 'Completed' ? 'Mark Pending' : 'Mark Completed'}
                >
                  {task.status === 'Completed' ? <Clock size={16} /> : <CheckCircle size={16} />}
                </button>
                <button 
                  className="action-btn" 
                  onClick={() => openEditModal(task)}
                  title="Edit Task"
                  disabled={task.status === 'Completed'}
                  style={{ opacity: task.status === 'Completed' ? 0.3 : 1 }}
                >
                  <Edit3 size={16} />
                </button>
                <button 
                  className="action-btn delete" 
                  onClick={() => handleDeleteTask(task._id)}
                  title="Delete Task"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3 className="modal-title">
              {modalMode === 'create' ? 'Create Task' : 'Edit Task'}
            </h3>
            <form onSubmit={handleSaveTask}>
              <div className="form-group">
                <label className="form-label" htmlFor="task-title-input">Task Title</label>
                <input
                  id="task-title-input"
                  type="text"
                  className="form-input"
                  placeholder="What needs to be done?"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  disabled={submitting}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="task-desc-input">Description</label>
                <textarea
                  id="task-desc-input"
                  className="form-input"
                  placeholder="Enter details (optional)"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={submitting}
                  style={{ resize: 'vertical' }}
                />
              </div>

              {user && user.role === 'Admin' && (
                <div className="form-group">
                  <label className="form-label" htmlFor="task-assignee-select">Assign To</label>
                  <select
                    id="task-assignee-select"
                    className="form-input"
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                    disabled={submitting}
                  >
                    <option value="">Select user...</option>
                    {users.map((u) => (
                      <option key={u._id} value={u._id}>
                        {u.username} ({u.role})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setIsModalOpen(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  disabled={submitting}
                >
                  {submitting ? 'Saving...' : 'Save Task'}
                </button>
              </div>
            </form>
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

export default UserTasks;

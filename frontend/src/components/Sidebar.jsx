import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  CheckSquare, 
  Users, 
  History, 
  LogOut, 
  LayoutDashboard,
  ShieldCheck
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <ShieldCheck size={28} color="var(--accent-primary)" />
        <span>Avidus Task</span>
      </div>

      <nav className="sidebar-menu">
        {/* User Specific Links */}
        {user.role === 'User' && (
          <NavLink 
            to="/tasks" 
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <CheckSquare size={20} />
            <span>My Tasks</span>
          </NavLink>
        )}

        {/* Admin Specific Links */}
        {user.role === 'Admin' && (
          <>
            <NavLink 
              to="/admin/dashboard" 
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <LayoutDashboard size={20} />
              <span>Dashboard</span>
            </NavLink>
            <NavLink 
              to="/admin/users" 
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Users size={20} />
              <span>Users Management</span>
            </NavLink>
            <NavLink 
              to="/admin/logs" 
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <History size={20} />
              <span>Activity Logs</span>
            </NavLink>
          </>
        )}
      </nav>

      <div className="sidebar-footer">
        <div className="user-info-card">
          <span className="user-info-name">{user.username}</span>
          <span className="user-info-role">{user.role}</span>
        </div>
        <button className="btn-logout" onClick={handleLogout}>
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

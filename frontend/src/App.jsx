import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Unauthorized from './pages/Unauthorized';
import UserTasks from './pages/UserTasks';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminLogs from './pages/AdminLogs';

const AppContent = () => {
  const { user } = useAuth();

  return (
    <div className={user ? "app-layout" : "auth-layout"}>
      {user && <Sidebar />}
      
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={!user ? <Login /> : <Navigate to={user.role === 'Admin' ? '/admin/dashboard' : '/tasks'} replace />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to="/tasks" replace />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* User Protected Routes */}
        <Route 
          path="/tasks" 
          element={
            <ProtectedRoute>
              <UserTasks />
            </ProtectedRoute>
          } 
        />

        {/* Admin Protected Routes */}
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/users" 
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminUsers />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/logs" 
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminLogs />
            </ProtectedRoute>
          } 
        />

        {/* Default / Fallback Route */}
        <Route 
          path="*" 
          element={
            user 
              ? <Navigate to={user.role === 'Admin' ? '/admin/dashboard' : '/tasks'} replace />
              : <Navigate to="/login" replace />
          } 
        />
      </Routes>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

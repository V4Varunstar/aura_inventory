
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Inward from './pages/Inward';
import Outward from './pages/Outward';
import Adjustments from './pages/Adjustments';
import Warehouses from './pages/Warehouses';
import Users from './pages/Users';
import Reports from './pages/Reports';
import NotFound from './pages/NotFound';
import { Role } from './types';

// ProtectedRoute component defined here to use useAuth hook
const ProtectedRoute: React.FC<{ children: React.ReactElement; roles: Role[] }> = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />; // Or an unauthorized page
  }

  return children;
};


const AppRoutes: React.FC = () => {
    const { user } = useAuth();

    return(
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={user ? <Layout><Dashboard /></Layout> : <Navigate to="/login" />} />
            
            <Route path="/dashboard" element={<ProtectedRoute roles={[Role.Admin, Role.Manager, Role.WarehouseStaff, Role.Viewer]}><Layout><Dashboard /></Layout></ProtectedRoute>} />
            <Route path="/products" element={<ProtectedRoute roles={[Role.Admin, Role.Manager, Role.Viewer]}><Layout><Products /></Layout></ProtectedRoute>} />
            <Route path="/inward" element={<ProtectedRoute roles={[Role.Admin, Role.Manager, Role.WarehouseStaff]}><Layout><Inward /></Layout></ProtectedRoute>} />
            <Route path="/outward" element={<ProtectedRoute roles={[Role.Admin, Role.Manager, Role.WarehouseStaff]}><Layout><Outward /></Layout></ProtectedRoute>} />
            <Route path="/adjustments" element={<ProtectedRoute roles={[Role.Admin, Role.Manager, Role.WarehouseStaff]}><Layout><Adjustments /></Layout></ProtectedRoute>} />
            <Route path="/warehouses" element={<ProtectedRoute roles={[Role.Admin, Role.Manager]}><Layout><Warehouses /></Layout></ProtectedRoute>} />
            <Route path="/users" element={<ProtectedRoute roles={[Role.Admin]}><Layout><Users /></Layout></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute roles={[Role.Admin, Role.Manager, Role.Viewer]}><Layout><Reports /></Layout></ProtectedRoute>} />
            
            <Route path="*" element={<NotFound />} />
        </Routes>
    )
}

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
          <HashRouter>
             <AppRoutes />
          </HashRouter>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;

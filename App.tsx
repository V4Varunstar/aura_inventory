
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CompanyProvider } from './context/CompanyContext';
import { ToastProvider } from './context/ToastContext';

import Layout from './components/layout/Layout';
import Landing from './pages/Landing';
import Pricing from './pages/Pricing';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Terms from './pages/Terms';
import RefundPolicy from './pages/RefundPolicy';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Inward from './pages/Inward';
import Outward from './pages/Outward';
import Adjustments from './pages/Adjustments';
import Audit from './pages/Audit';
import Warehouses from './pages/Warehouses';
import Users from './pages/Users';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import FbaShipments from './pages/amazon-fba';
import CreateAmazonFbaShipment from './pages/amazon-fba/create';
import FlipkartFbfShipments from './pages/flipkart-fbf';
import CreateFlipkartFbfShipment from './pages/flipkart-fbf/create';
import MyntraSjitShipments from './pages/myntra-sjit';
import CreateMyntraSjitShipment from './pages/myntra-sjit/create';
import ZeptoPoShipments from './pages/zepto-po';
import CreateZeptoPoShipment from './pages/zepto-po/create';
import NykaaPoShipments from './pages/nykaa-po';
import CreateNykaaPoShipment from './pages/nykaa-po/create';
import ProductMapping from './pages/ProductMapping';
import Sources from './pages/settings/Sources';
import Demo from './pages/Demo';
import NotFound from './pages/NotFound';
import ExpiringProducts from './pages/ExpiringProducts';

// ProtectedRoute component - simplified since we're using PermissionGate components in pages
const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
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

  return children;
};


const AppRoutes: React.FC = () => {
    const { user } = useAuth();

    return(
        <Routes>
            {/* Public Routes */}
            <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Landing />} />
            <Route path="/demo" element={<Demo />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/refund" element={<RefundPolicy />} />
            <Route path="/login" element={<Login />} />
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
            <Route path="/products" element={<ProtectedRoute><Layout><Products /></Layout></ProtectedRoute>} />
            <Route path="/inward" element={<ProtectedRoute><Layout><Inward /></Layout></ProtectedRoute>} />
            <Route path="/outward" element={<ProtectedRoute><Layout><Outward /></Layout></ProtectedRoute>} />
            <Route path="/adjustments" element={<ProtectedRoute><Layout><Adjustments /></Layout></ProtectedRoute>} />
            <Route path="/audit" element={<ProtectedRoute><Layout><Audit /></Layout></ProtectedRoute>} />
            <Route path="/warehouses" element={<ProtectedRoute><Layout><Warehouses /></Layout></ProtectedRoute>} />
            <Route path="/amazon-fba" element={<ProtectedRoute><Layout><FbaShipments /></Layout></ProtectedRoute>} />
            <Route path="/amazon-fba/create" element={<ProtectedRoute><Layout><CreateAmazonFbaShipment /></Layout></ProtectedRoute>} />
            <Route path="/flipkart-fbf" element={<ProtectedRoute><Layout><FlipkartFbfShipments /></Layout></ProtectedRoute>} />
            <Route path="/flipkart-fbf/create" element={<ProtectedRoute><Layout><CreateFlipkartFbfShipment /></Layout></ProtectedRoute>} />
            <Route path="/myntra-sjit" element={<ProtectedRoute><Layout><MyntraSjitShipments /></Layout></ProtectedRoute>} />
            <Route path="/myntra-sjit/create" element={<ProtectedRoute><Layout><CreateMyntraSjitShipment /></Layout></ProtectedRoute>} />
            <Route path="/zepto-po" element={<ProtectedRoute><Layout><ZeptoPoShipments /></Layout></ProtectedRoute>} />
            <Route path="/zepto-po/create" element={<ProtectedRoute><Layout><CreateZeptoPoShipment /></Layout></ProtectedRoute>} />
            <Route path="/nykaa-po" element={<ProtectedRoute><Layout><NykaaPoShipments /></Layout></ProtectedRoute>} />
            <Route path="/nykaa-po/create" element={<ProtectedRoute><Layout><CreateNykaaPoShipment /></Layout></ProtectedRoute>} />
            <Route path="/product-mapping" element={<ProtectedRoute><Layout><ProductMapping /></Layout></ProtectedRoute>} />
            <Route path="/users" element={<ProtectedRoute><Layout><Users /></Layout></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><Layout><Reports /></Layout></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Layout><Settings /></Layout></ProtectedRoute>} />
            <Route path="/settings/sources" element={<ProtectedRoute><Layout><Sources /></Layout></ProtectedRoute>} />
            <Route path="/expiring-products" element={<ProtectedRoute><Layout><ExpiringProducts /></Layout></ProtectedRoute>} />
            
            <Route path="*" element={<NotFound />} />
        </Routes>
    )
}

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <CompanyProvider>
          <HashRouter>
             <AppRoutes />
          </HashRouter>
        </CompanyProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;

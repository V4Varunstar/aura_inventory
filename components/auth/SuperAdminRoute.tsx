import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Role } from '../../types';

interface SuperAdminRouteProps {
  children: React.ReactElement;
}

const SuperAdminRoute: React.FC<SuperAdminRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  console.log('SuperAdminRoute: user=', user, 'loading=', loading);

  if (loading) {
    console.log('SuperAdminRoute: Still loading...');
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
          <div className="mt-4 text-gray-600">Loading Super Admin...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('SuperAdminRoute: No user, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  if (user.role !== Role.SuperAdmin) {
    console.log('SuperAdminRoute: User is not SuperAdmin, redirecting to dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  console.log('SuperAdminRoute: Rendering children for SuperAdmin user');
  return children;
};

export default SuperAdminRoute;
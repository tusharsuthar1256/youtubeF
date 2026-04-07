import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute = () => {
  const { status } = useAuth();

  return status ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;

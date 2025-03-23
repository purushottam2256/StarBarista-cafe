import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const location = useLocation();
  
  // Updated authentication check to include security key
  const checkAuth = () => {
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    const securityKey = localStorage.getItem('adminSecurityKey') === 'barista-secured-dashboard-key';
    
    // Check both conditions
    if (!isAdmin || !securityKey) {
      return false;
    }
    
    return true;
  };
  
  if (!checkAuth()) {
    // Redirect to login page with information that we came from a protected route
    return <Navigate to="/admin" state={{ fromProtected: true, from: location.pathname }} replace />;
  }
  
  return <>{children}</>;
};

export default AuthGuard;
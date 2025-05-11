import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import { Box, CircularProgress, Typography } from '@mui/material';

const ProtectedRoute = ({ adminOnly = true }) => {
  const { user, loading, isAuthenticated, isAdmin } = useAuth();
  
  // Show loading spinner while auth state is being determined
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }
  
  // Not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // If admin access is required and user is not admin
  if (adminOnly && user?.role !== 'admin') {
    return (
      <Box 
        display="flex" 
        flexDirection="column"
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
        sx={{ 
          p: 3, 
          textAlign: 'center', 
          backgroundColor: '#f8f9fa' 
        }}
      >
        <Typography variant="h5" color="error" gutterBottom>
          Admin Access Required
        </Typography>
        <Typography variant="body1">
          You don't have permission to access this page.
        </Typography>
        <Box mt={3}>
          <button 
            onClick={() => window.location.href = '/login'} 
            style={{ 
              padding: '8px 16px', 
              backgroundColor: '#FF9500', 
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Back to Login
          </button>
        </Box>
      </Box>
    );
  }
  
  // User is authenticated and has proper permissions
  return <Outlet />;
};

export default ProtectedRoute; 
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/authContext';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Layout
import AdminLayout from './layouts/AdminLayout';

// Auth components
import Login from './components/auth/Login';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Dashboard
import Dashboard from './components/dashboard/Dashboard';

// Products
import ProductsList from './components/products/ProductsList';
import ProductDetail from './components/products/ProductDetail';
import CreateProduct from './components/products/CreateProduct';

// Categories
import CategoriesList from './components/categories/CategoriesList';
import CategoryDetail from './components/categories/CategoryDetail';
import CreateCategory from './components/categories/CreateCategory';

// Orders
import OrdersList from './components/orders/OrdersList';
import OrderDetail from './components/orders/OrderDetail';

// Users
import UsersList from './components/users/UsersList';
import UserDetail from './components/users/UserDetail';

// Create theme with Om Creations brand colors
const theme = createTheme({
  palette: {
    primary: {
      main: '#FF9500',
      light: '#FFB84D',
      dark: '#CC7A00',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#1E1E2D',
      light: '#2D2D42',
      dark: '#151521',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F5F5F9',
    },
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 10,
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            
            {/* Protected admin routes */}
            <Route element={<ProtectedRoute adminOnly={true} />}>
              <Route element={<AdminLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                
                <Route path="/products" element={<ProductsList />} />
                <Route path="/products/new" element={<CreateProduct />} />
                <Route path="/products/:id" element={<ProductDetail />} />
                <Route path="/products/:id/edit" element={<ProductDetail editMode={true} />} />
                
                <Route path="/categories" element={<CategoriesList />} />
                <Route path="/categories/new" element={<CreateCategory />} />
                <Route path="/categories/:id" element={<CategoryDetail />} />
                
                <Route path="/orders" element={<OrdersList />} />
                <Route path="/orders/:id" element={<OrderDetail />} />
                
                <Route path="/users" element={<UsersList />} />
                <Route path="/users/:id" element={<UserDetail />} />
              </Route>
            </Route>
            
            {/* Redirect from / to /dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* Catch all - redirect to dashboard */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  CircularProgress,
  Alert,
  Avatar,
  Divider,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  ArrowBack as BackIcon,
  AdminPanelSettings as AdminIcon,
  Person as UserIcon,
  Verified as VerifiedIcon
} from '@mui/icons-material';
import userService from '../../services/userService';
import orderService from '../../services/orderService';
import styles from '../../styles/UserDetail.module.css';
import { useAuth } from '../../context/authContext';

const UserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  
  // States
  const [user, setUser] = useState(null);
  const [userOrders, setUserOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'user',
    isActive: true
  });
  
  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const response = await userService.getUserById(id);
        setUser(response.data);
        
        // Initialize form data
        setFormData({
          name: response.data.name || '',
          email: response.data.email || '',
          phone: response.data.phone || '',
          role: response.data.role || 'user',
          isActive: response.data.isActive !== false
        });
        
        setError('');
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to fetch user details. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [id]);
  
  // Fetch user orders when orders tab is selected
  useEffect(() => {
    if (tabValue === 1 && user && userOrders.length === 0) {
      const fetchUserOrders = async () => {
        setOrdersLoading(true);
        try {
          const response = await orderService.getUserOrders(id);
          setUserOrders(response.data.orders || []);
        } catch (err) {
          console.error('Error fetching user orders:', err);
        } finally {
          setOrdersLoading(false);
        }
      };
      
      fetchUserOrders();
    }
  }, [tabValue, id, user, userOrders.length]);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Handle form field change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  // Toggle edit mode
  const toggleEditMode = () => {
    if (editMode) {
      // Reset form data when canceling edit
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        role: user.role || 'user',
        isActive: user.isActive !== false
      });
    }
    setEditMode(!editMode);
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await userService.updateUser(id, formData);
      setUser(response.data);
      setEditMode(false);
      setError('');
    } catch (err) {
      console.error('Error updating user:', err);
      setError('Failed to update user. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };
  
  // Status chip colors
  const statusColors = {
    pending: 'warning',
    processing: 'info',
    shipped: 'primary',
    delivered: 'success',
    cancelled: 'error',
    refunded: 'default'
  };
  
  // Render loading state
  if (loading && !user) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="70vh">
        <CircularProgress />
      </Box>
    );
  }
  
  // Render error state
  if (error && !user) {
    return (
      <Box mt={3}>
        <Alert severity="error">{error}</Alert>
        <Button 
          variant="outlined" 
          onClick={() => navigate('/users')}
          sx={{ mt: 2 }}
        >
          Back to Users
        </Button>
      </Box>
    );
  }
  
  return (
    <div className={styles.userDetailContainer}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center">
          <Button
            startIcon={<BackIcon />}
            onClick={() => navigate('/users')}
            sx={{ mr: 2 }}
          >
            Back
          </Button>
          <Typography variant="h5" component="h1">
            User Details
          </Typography>
        </Box>
        
        <Box>
          {currentUser?._id !== user?._id && (
            <Button
              variant={editMode ? "outlined" : "contained"}
              color={editMode ? "secondary" : "primary"}
              startIcon={editMode ? <CancelIcon /> : <EditIcon />}
              onClick={toggleEditMode}
              sx={{ mr: 1 }}
            >
              {editMode ? 'Cancel' : 'Edit'}
            </Button>
          )}
          
          {editMode && currentUser?._id !== user?._id && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              onClick={handleSubmit}
            >
              Save
            </Button>
          )}
        </Box>
      </Box>
      
      {/* Error alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="User Information" />
          <Tab label="Orders" />
        </Tabs>
      </Paper>
      
      {/* User Detail Content */}
      {tabValue === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Avatar
                src={user?.avatar}
                alt={user?.name}
                sx={{ width: 120, height: 120, mx: 'auto', mb: 2 }}
              >
                {user?.name[0]}
              </Avatar>
              
              <Typography variant="h5" gutterBottom>
                {user?.name}
              </Typography>
              
              <Box display="flex" justifyContent="center" alignItems="center" mb={1}>
                {user?.role === 'admin' ? (
                  <Box display="flex" alignItems="center" sx={{ color: 'primary.main' }}>
                    <AdminIcon sx={{ mr: 0.5 }} fontSize="small" />
                    <Typography variant="body2">Admin</Typography>
                  </Box>
                ) : (
                  <Box display="flex" alignItems="center" sx={{ color: 'text.secondary' }}>
                    <UserIcon sx={{ mr: 0.5 }} fontSize="small" />
                    <Typography variant="body2">User</Typography>
                  </Box>
                )}
              </Box>
              
              <Box display="flex" justifyContent="center">
                <Chip
                  label={user?.isActive ? 'Active' : 'Inactive'}
                  color={user?.isActive ? 'success' : 'error'}
                  size="small"
                />
              </Box>
              
              <Box mt={2} display="flex" justifyContent="center" className={styles.userVerified}>
                {user?.emailVerified ? (
                  <Box display="flex" alignItems="center" sx={{ color: 'success.main' }}>
                    <VerifiedIcon sx={{ mr: 0.5 }} fontSize="small" />
                    <Typography variant="body2">Email Verified</Typography>
                  </Box>
                ) : (
                  <Box display="flex" alignItems="center" sx={{ color: 'text.secondary' }}>
                    <Typography variant="body2">Email Not Verified</Typography>
                  </Box>
                )}
              </Box>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              {editMode ? (
                <form>
                  <TextField
                    fullWidth
                    label="Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    margin="normal"
                    variant="outlined"
                    required
                  />
                  
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    margin="normal"
                    variant="outlined"
                    required
                  />
                  
                  <TextField
                    fullWidth
                    label="Phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    margin="normal"
                    variant="outlined"
                  />
                  
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Role</InputLabel>
                    <Select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      label="Role"
                    >
                      <MenuItem value="user">User</MenuItem>
                      <MenuItem value="admin">Admin</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.isActive}
                        onChange={handleChange}
                        name="isActive"
                        color="primary"
                      />
                    }
                    label="Active"
                    sx={{ mt: 2 }}
                  />
                </form>
              ) : (
                <div>
                  <Typography variant="h6" gutterBottom>
                    User Information
                  </Typography>
                  
                  <Divider sx={{ mb: 2 }} />
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="textSecondary">
                        Email
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        {user?.email}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="textSecondary">
                        Phone
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        {user?.phone || '—'}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="textSecondary">
                        Member Since
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        {formatDate(user?.createdAt)}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="textSecondary">
                        Last Login
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        {user?.lastLoginAt ? formatDate(user.lastLoginAt) : '—'}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="h6" gutterBottom>
                        Address
                      </Typography>
                      
                      {user?.address ? (
                        <>
                          <Typography variant="body1">
                            {user.address.addressLine1}
                          </Typography>
                          {user.address.addressLine2 && (
                            <Typography variant="body1">
                              {user.address.addressLine2}
                            </Typography>
                          )}
                          <Typography variant="body1">
                            {user.address.city}, {user.address.state} {user.address.postalCode}
                          </Typography>
                          <Typography variant="body1">
                            {user.address.country}
                          </Typography>
                        </>
                      ) : (
                        <Typography variant="body1" color="textSecondary">
                          No address provided
                        </Typography>
                      )}
                    </Grid>
                  </Grid>
                </div>
              )}
            </Paper>
          </Grid>
        </Grid>
      )}
      
      {/* Orders Tab */}
      {tabValue === 1 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Order History
          </Typography>
          
          <Divider sx={{ mb: 2 }} />
          
          {ordersLoading ? (
            <Box display="flex" justifyContent="center" padding={4}>
              <CircularProgress size={30} />
            </Box>
          ) : userOrders.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Order ID</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {userOrders.map((order) => (
                    <TableRow key={order._id} hover>
                      <TableCell className={styles.orderIdCell}>
                        {order._id.slice(-8).toUpperCase()}
                      </TableCell>
                      <TableCell>{formatDate(order.createdAt)}</TableCell>
                      <TableCell>{formatCurrency(order.totalAmount)}</TableCell>
                      <TableCell>
                        <Chip
                          label={order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          color={statusColors[order.status] || 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => navigate(`/orders/${order._id}`)}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box textAlign="center" py={4}>
              <Typography color="textSecondary">
                This user hasn't placed any orders yet.
              </Typography>
            </Box>
          )}
        </Paper>
      )}
    </div>
  );
};

export default UserDetail; 
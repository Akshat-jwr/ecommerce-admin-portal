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
  Divider,
  Chip,
  Stepper,
  Step,
  StepLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  LocalShipping as ShippingIcon,
  Person as PersonIcon,
  Receipt as ReceiptIcon,
  LocalMall as ProductIcon
} from '@mui/icons-material';
import orderService from '../../services/orderService';
import styles from '../../styles/OrderDetail.module.css';

// Order status workflow
const ORDER_STATUS_STEPS = ['pending', 'processing', 'shipped', 'delivered'];

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // States
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  
  // Fetch order on component mount
  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      try {
        const response = await orderService.getOrderById(id);
        setOrder(response.data);
        setError('');
      } catch (err) {
        console.error('Error fetching order:', err);
        setError('Failed to fetch order details. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrder();
  }, [id]);
  
  // Status chip colors
  const statusColors = {
    pending: 'warning',
    processing: 'info',
    shipped: 'primary',
    delivered: 'success',
    cancelled: 'error',
    refunded: 'default'
  };
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };
  
  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Get active step for stepper
  const getActiveStep = (status) => {
    if (status === 'cancelled') return -1;
    if (status === 'refunded') return -1;
    return Math.max(ORDER_STATUS_STEPS.indexOf(status), 0);
  };
  
  // Handle status change
  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    setUpdatingStatus(true);
    
    try {
      const response = await orderService.updateOrderStatus(id, newStatus);
      setOrder(response.data);
    } catch (err) {
      console.error('Error updating order status:', err);
      setError('Failed to update order status. Please try again.');
    } finally {
      setUpdatingStatus(false);
    }
  };
  
  // Render loading state
  if (loading && !order) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="70vh">
        <CircularProgress />
      </Box>
    );
  }
  
  // Render error state
  if (error && !order) {
    return (
      <Box mt={3}>
        <Alert severity="error">{error}</Alert>
        <Button 
          variant="outlined" 
          onClick={() => navigate('/orders')}
          sx={{ mt: 2 }}
        >
          Back to Orders
        </Button>
      </Box>
    );
  }
  
  return (
    <div className={styles.orderDetailContainer}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center">
          <Button
            startIcon={<BackIcon />}
            onClick={() => navigate('/orders')}
            sx={{ mr: 2 }}
          >
            Back
          </Button>
          <Typography variant="h5" component="h1">
            Order #{order?._id.slice(-8).toUpperCase()}
          </Typography>
        </Box>
        
        <Box>
          <Chip
            label={order?.status.charAt(0).toUpperCase() + order?.status.slice(1)}
            color={statusColors[order?.status] || 'default'}
          />
        </Box>
      </Box>
      
      {/* Error alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Order Progress Stepper */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Order Status</Typography>
          
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Update Status</InputLabel>
            <Select
              value={order?.status || ''}
              onChange={handleStatusChange}
              label="Update Status"
              disabled={updatingStatus}
            >
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="processing">Processing</MenuItem>
              <MenuItem value="shipped">Shipped</MenuItem>
              <MenuItem value="delivered">Delivered</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
              <MenuItem value="refunded">Refunded</MenuItem>
            </Select>
          </FormControl>
        </Box>
        
        {order?.status !== 'cancelled' && order?.status !== 'refunded' ? (
          <Stepper activeStep={getActiveStep(order?.status)} alternativeLabel>
            {ORDER_STATUS_STEPS.map((label) => (
              <Step key={label}>
                <StepLabel>{label.charAt(0).toUpperCase() + label.slice(1)}</StepLabel>
              </Step>
            ))}
          </Stepper>
        ) : (
          <Alert severity={order?.status === 'refunded' ? 'info' : 'warning'}>
            This order has been {order?.status}
          </Alert>
        )}
        
        <Box mt={2} textAlign="right">
          <Typography variant="caption" color="textSecondary">
            Last updated: {formatDate(order?.updatedAt)}
          </Typography>
        </Box>
      </Paper>
      
      {/* Order Information */}
      <Grid container spacing={3}>
        {/* Customer Information */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box display="flex" alignItems="center" mb={2}>
              <PersonIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Customer Information</Typography>
            </Box>
            
            <Divider sx={{ mb: 2 }} />
            
            {order?.user ? (
              <Box>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {order.user.name}
                </Typography>
                <Typography variant="body2">
                  {order.user.email}
                </Typography>
                <Typography variant="body2">
                  {order.user.phone || 'No phone provided'}
                </Typography>
              </Box>
            ) : (
              <Typography>Guest Order</Typography>
            )}
          </Paper>
        </Grid>
        
        {/* Shipping Information */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box display="flex" alignItems="center" mb={2}>
              <ShippingIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Shipping Information</Typography>
            </Box>
            
            <Divider sx={{ mb: 2 }} />
            
            {order?.shippingAddress ? (
              <Box>
                <Typography variant="body1">
                  {order.shippingAddress.fullName}
                </Typography>
                <Typography variant="body2">
                  {order.shippingAddress.addressLine1}
                </Typography>
                {order.shippingAddress.addressLine2 && (
                  <Typography variant="body2">
                    {order.shippingAddress.addressLine2}
                  </Typography>
                )}
                <Typography variant="body2">
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                </Typography>
                <Typography variant="body2">
                  {order.shippingAddress.country}
                </Typography>
                {order.shippingAddress.phone && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Phone: {order.shippingAddress.phone}
                  </Typography>
                )}
              </Box>
            ) : (
              <Typography>No shipping address provided</Typography>
            )}
          </Paper>
        </Grid>
        
        {/* Order Items */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" mb={2}>
              <ProductIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Order Items</Typography>
            </Box>
            
            <Divider sx={{ mb: 2 }} />
            
            {order?.items && order.items.length > 0 ? (
              <TableContainer>
                <Table className={styles.orderItemsTable}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Product</TableCell>
                      <TableCell>Price</TableCell>
                      <TableCell>Quantity</TableCell>
                      <TableCell align="right">Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {order.items.map((item) => (
                      <TableRow key={item._id}>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <Box
                              component="img"
                              src={item.product?.images?.[0]?.url || '/placeholder-product.png'}
                              alt={item.product?.name}
                              className={styles.productThumbnail}
                            />
                            <Box ml={2}>
                              <Typography variant="body1">
                                {item.product?.name || 'Unknown Product'}
                              </Typography>
                              {item.variant && (
                                <Typography variant="caption" color="textSecondary">
                                  {item.variant}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>{formatCurrency(item.price)}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell align="right">
                          {formatCurrency(item.price * item.quantity)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography>No items in this order</Typography>
            )}
          </Paper>
        </Grid>
        
        {/* Payment Information */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" mb={2}>
              <ReceiptIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Payment Information</Typography>
            </Box>
            
            <Divider sx={{ mb: 2 }} />
            
            <Box className={styles.paymentDetails}>
              <Box className={styles.paymentRow}>
                <Typography variant="body2">Payment Method:</Typography>
                <Typography variant="body2">
                  {order?.paymentMethod || 'Not specified'}
                </Typography>
              </Box>
              
              <Box className={styles.paymentRow}>
                <Typography variant="body2">Payment Status:</Typography>
                <Chip 
                  size="small"
                  label={order?.paymentStatus || 'Unknown'}
                  color={order?.paymentStatus === 'paid' ? 'success' : 'warning'}
                />
              </Box>
              
              {order?.paymentId && (
                <Box className={styles.paymentRow}>
                  <Typography variant="body2">Payment ID:</Typography>
                  <Typography variant="body2" className={styles.paymentId}>
                    {order.paymentId}
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>
        
        {/* Order Summary */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Order Summary
            </Typography>
            
            <Divider sx={{ mb: 2 }} />
            
            <Box className={styles.summaryRow}>
              <Typography variant="body2">Subtotal:</Typography>
              <Typography variant="body2">
                {formatCurrency(order?.subtotal || 0)}
              </Typography>
            </Box>
            
            <Box className={styles.summaryRow}>
              <Typography variant="body2">Shipping:</Typography>
              <Typography variant="body2">
                {formatCurrency(order?.shippingCost || 0)}
              </Typography>
            </Box>
            
            <Box className={styles.summaryRow}>
              <Typography variant="body2">Tax:</Typography>
              <Typography variant="body2">
                {formatCurrency(order?.tax || 0)}
              </Typography>
            </Box>
            
            <Box className={styles.summaryRow}>
              <Typography variant="body2">Discount:</Typography>
              <Typography variant="body2" sx={{ color: 'green' }}>
                -{formatCurrency(order?.discount || 0)}
              </Typography>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Box className={styles.summaryRow}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                Total:
              </Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                {formatCurrency(order?.totalAmount || 0)}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
};

export default OrderDetail; 
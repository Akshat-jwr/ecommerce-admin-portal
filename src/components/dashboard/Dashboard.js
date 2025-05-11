import React, { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Button,
  ButtonGroup
} from '@mui/material';
import {
  ShoppingBag as ProductIcon,
  People as UserIcon,
  AttachMoney as RevenueIcon,
  LocalShipping as OrderIcon
} from '@mui/icons-material';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';

import dashboardService from '../../services/dashboardService';
import styles from '../../styles/Dashboard.module.css';

// Colors for the charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#a83cdf'];

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [orderStats, setOrderStats] = useState(null);
  const [revenueData, setRevenueData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [revenuePeriod, setRevenuePeriod] = useState('week');
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch all dashboard data
        const [statsResponse, orderStatsResponse, revenueResponse] = await Promise.all([
          dashboardService.getDashboardStats(),
          dashboardService.getOrderStats(),
          dashboardService.getRevenueChartData(revenuePeriod)
        ]);
        
        setStats(statsResponse.data);
        setOrderStats(orderStatsResponse.data);
        setRevenueData(revenueResponse.data);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
        
        // Just set empty states
        setStats(null);
        setOrderStats(null);
        setRevenueData(null);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [revenuePeriod]);
  
  // Handle revenue period change
  const handlePeriodChange = (period) => {
    setRevenuePeriod(period);
  };
  
  // Loading state
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="70vh">
        <CircularProgress />
      </Box>
    );
  }
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };
  
  // Stats card data
  const statsCards = [
    {
      title: 'Total Revenue',
      value: formatCurrency(stats?.revenue?.totalRevenue || 0),
      icon: <RevenueIcon />,
      color: '#0088FE',
    },
    {
      title: 'Total Orders',
      value: stats?.counts?.orders || 0,
      icon: <OrderIcon />,
      color: '#00C49F',
    },
    {
      title: 'Total Products',
      value: stats?.counts?.products || 0,
      icon: <ProductIcon />,
      color: '#FFBB28',
    },
    {
      title: 'Total Users',
      value: stats?.counts?.users || 0,
      icon: <UserIcon />,
      color: '#FF8042',
    },
  ];
  
  // Empty state component
  const EmptyState = ({ message }) => (
    <Box display="flex" justifyContent="center" alignItems="center" height="100%" minHeight="200px">
      <Typography color="textSecondary">{message}</Typography>
    </Box>
  );
  
  return (
    <div className={styles.dashboardContainer}>
      {/* Stats Cards */}
      <Grid container spacing={3} className={styles.statsContainer}>
        {statsCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card className={styles.statsCard}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <div>
                    <Typography variant="subtitle2" className={styles.cardTitle}>
                      {card.title}
                    </Typography>
                    <Typography variant="h5" className={styles.cardValue}>
                      {card.value}
                    </Typography>
                  </div>
                  <Box
                    className={styles.iconContainer}
                    sx={{ backgroundColor: `${card.color}22` }}
                  >
                    <Box sx={{ color: card.color }}>{card.icon}</Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      {/* Revenue Chart */}
      <Grid container spacing={3} className={styles.chartContainer}>
        <Grid item xs={12} md={8}>
          <Paper className={styles.chartPaper}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Revenue Overview</Typography>
              <ButtonGroup size="small">
                <Button
                  onClick={() => handlePeriodChange('week')}
                  variant={revenuePeriod === 'week' ? 'contained' : 'outlined'}
                >
                  Week
                </Button>
                <Button
                  onClick={() => handlePeriodChange('month')}
                  variant={revenuePeriod === 'month' ? 'contained' : 'outlined'}
                >
                  Month
                </Button>
                <Button
                  onClick={() => handlePeriodChange('year')}
                  variant={revenuePeriod === 'year' ? 'contained' : 'outlined'}
                >
                  Year
                </Button>
              </ButtonGroup>
            </Box>
            
            {revenueData && revenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#FF9500"
                    strokeWidth={2}
                    activeDot={{ r: 8 }}
                    name="Revenue"
                  />
                  <Line
                    type="monotone"
                    dataKey="orders"
                    stroke="#8884d8"
                    strokeWidth={2}
                    name="Orders"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState message="No revenue data available" />
            )}
          </Paper>
        </Grid>
        
        {/* Order Status Distribution */}
        <Grid item xs={12} md={4}>
          <Paper className={styles.chartPaper}>
            <Typography variant="h6" gutterBottom>
              Order Status
            </Typography>
            {orderStats?.statusDistribution && orderStats.statusDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={orderStats.statusDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {orderStats.statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => value} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState message="No order status data available" />
            )}
          </Paper>
        </Grid>
        
        {/* Top Selling Products */}
        <Grid item xs={12}>
          <Paper className={styles.chartPaper}>
            <Typography variant="h6" gutterBottom>
              Top Selling Products
            </Typography>
            {stats?.recentActivity?.lowStockProducts && stats.recentActivity.lowStockProducts.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.recentActivity.lowStockProducts}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="stock" fill="#8884d8" name="Remaining Stock" />
                  <Bar dataKey="price" fill="#FF9500" name="Price" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState message="No product data available" />
            )}
          </Paper>
        </Grid>
      </Grid>

      {error && (
        <Box mt={2} p={2} bgcolor="#fff3cd" color="#856404" borderRadius={1}>
          <Typography variant="body2">
            {error}
          </Typography>
        </Box>
      )}
    </div>
  );
};

export default Dashboard; 
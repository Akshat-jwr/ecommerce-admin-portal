import api from './api';

const dashboardService = {
  // Get dashboard statistics
  getDashboardStats: async () => {
    try {
      const response = await api.get('/admin/dashboard/stats');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch dashboard stats' };
    }
  },
  
  // Get order statistics
  getOrderStats: async () => {
    try {
      const response = await api.get('/admin/dashboard/orders-stats');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch order statistics' };
    }
  },
  
  // Get revenue chart data
  getRevenueChartData: async (period = 'week') => {
    try {
      const response = await api.get(`/admin/dashboard/revenue-chart?period=${period}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch revenue chart data' };
    }
  },
};

export default dashboardService; 
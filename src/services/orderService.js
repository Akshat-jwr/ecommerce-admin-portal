import api from './api';

const orderService = {
  // Get all orders with pagination
  getAllOrders: async (page = 1, limit = 10, status = null, search = '') => {
    try {
      let url = `/admin/orders?page=${page}&limit=${limit}`;
      if (status) url += `&status=${status}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch orders' };
    }
  },
  
  // Get order by ID
  getOrderById: async (id) => {
    try {
      const response = await api.get(`/admin/orders/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch order' };
    }
  },
  
  // Update order status
  updateOrderStatus: async (id, status) => {
    try {
      const response = await api.patch(`/admin/orders/${id}/status`, { status });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update order status' };
    }
  },
  
  // Delete order
  deleteOrder: async (id) => {
    try {
      const response = await api.delete(`/admin/orders/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete order' };
    }
  },
};

export default orderService;
import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle authorization errors (e.g. redirect to login)
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (credentials: any) => {
    const response = await API.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify({
        username: response.data.username,
        role: response.data.role,
        firstName: response.data.firstName,
        lastName: response.data.lastName,
      }));
    }
    return response.data;
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
};

export const itemService = {
  getAll: () => API.get('/items'),
  getById: (id: number | string) => API.get(`/items/${id}`),
  create: (data: any) => API.post('/items', data),
  update: (id: number | string, data: any) => API.put(`/items/${id}`, data),
  delete: (id: number | string) => API.delete(`/items/${id}`),
};

export const inventoryService = {
  getAll: () => API.get('/inventory'),
  getById: (itemId: number | string) => API.get(`/inventory/${itemId}`),
  adjust: (itemId: number | string, adjustment: number) => 
    API.put(`/inventory/${itemId}/adjust`, null, { params: { adjustment } }),
};

export const supplierService = {
  getAll: () => API.get('/suppliers'),
  getById: (id: number | string) => API.get(`/suppliers/${id}`),
  create: (data: any) => API.post('/suppliers', data),
  update: (id: number | string, data: any) => API.put(`/suppliers/${id}`, data),
  delete: (id: number | string) => API.delete(`/suppliers/${id}`),
  linkItem: (supplierId: number | string, data: any) => API.post(`/suppliers/${supplierId}/items`, data),
  unlinkItem: (supplierId: number | string, itemId: number | string) => 
    API.delete(`/suppliers/${supplierId}/items/${itemId}`),
};

export const customerService = {
  getAll: () => API.get('/customers'),
  getById: (id: number | string) => API.get(`/customers/${id}`),
  create: (data: any) => API.post('/customers', data),
  update: (id: number | string, data: any) => API.put(`/customers/${id}`, data),
  delete: (id: number | string) => API.delete(`/customers/${id}`),
};

export const salesRepService = {
  getAll: () => API.get('/sales-reps'),
  getById: (id: number | string) => API.get(`/sales-reps/${id}`),
  create: (data: any) => API.post('/sales-reps', data),
  update: (id: number | string, data: any) => API.put(`/sales-reps/${id}`, data),
  delete: (id: number | string) => API.delete(`/sales-reps/${id}`),
};

export const goodsReceivingService = {
  getAllLogs: () => API.get('/goods-receiving/logs'),
  getById: (id: number | string) => API.get(`/goods-receiving/${id}`),
  uploadExcel: (formData: FormData) => API.post('/goods-receiving/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  verifyItem: (receivingItemId: number | string, status: string) => 
    API.put(`/goods-receiving/items/${receivingItemId}/verify`, null, { params: { status } }),
  decideBatch: (receivingId: number | string, decision: string) => 
    API.post(`/goods-receiving/${receivingId}/decision`, null, { params: { decision } }),
};

export const orderService = {
  getAll: () => API.get('/orders'),
  getById: (id: number | string) => API.get(`/orders/${id}`),
  submit: (data: any) => API.post('/orders', data),
  getPending: () => API.get('/orders/pending'),
  approve: (id: number | string) => API.post(`/orders/${id}/approve`),
  reject: (id: number | string, remarks: string) => API.post(`/orders/${id}/reject`, { remarks }),
};

export const priceApprovalService = {
  getPending: () => API.get('/price-approvals/pending'),
  requestPriceChange: (data: any) => API.post('/price-approvals/request', data),
  approve: (id: number | string) => API.post(`/price-approvals/${id}/approve`),
  reject: (id: number | string) => API.post(`/price-approvals/${id}/reject`),
};

export default API;

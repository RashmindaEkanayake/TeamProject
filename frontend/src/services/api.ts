import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api",
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to attach JWT token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token && config.headers && !config.url?.endsWith("/auth/login")) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor to handle authorization errors (e.g. redirect to login)
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response &&
      error.response.status === 401 &&
      !error.config?.url?.endsWith("/auth/login")
    ) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export const authService = {
  login: async (credentials: any) => {
    const response = await API.post("/auth/login", credentials);
    if (response.data.token) {
      const fullName: string = response.data.fullName || "";
      const parts = fullName.trim().split(" ");
      const firstName = parts[0] || "";
      const lastName = parts.slice(1).join(" ") || "";
      localStorage.setItem("token", response.data.token);
      localStorage.setItem(
        "user",
        JSON.stringify({
          id: response.data.id,
          username: response.data.username,
          email: response.data.email,
          role: response.data.role,
          fullName: fullName || response.data.username || "Administrator",
          firstName,
          lastName,
          associatedRepId: response.data.associatedRepId,
        }),
      );
    }
    return response.data;
  },
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  },
  getCurrentUser: () => {
    try {
      const user = localStorage.getItem("user");
      const token = localStorage.getItem("token");
      if (!user || !token) return null;
      const payload = JSON.parse(
        atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")),
      );
      if (!payload.exp || payload.exp * 1000 <= Date.now()) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        return null;
      }
      return JSON.parse(user);
    } catch {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return null;
    }
  },
};

export const itemService = {
  getAll: () => API.get("/items"),
  getById: (id: number | string) => API.get(`/items/${id}`),
  create: (data: any) => API.post("/items", data),
  update: (id: number | string, data: any) => API.put(`/items/${id}`, data),
  delete: (id: number | string) => API.delete(`/items/${id}`),
};

export const inventoryService = {
  getAll: () => API.get("/inventory"),
  getById: (itemId: number | string) => API.get(`/inventory/${itemId}`),
  adjust: (itemId: number | string, adjustment: number) =>
    API.put(`/inventory/${itemId}/adjust`, null, { params: { adjustment } }),
};

export const supplierService = {
  getAll: () => API.get("/suppliers"),
  getById: (id: number | string) => API.get(`/suppliers/${id}`),
  create: (data: any) => API.post("/suppliers", data),
  update: (id: number | string, data: any) => API.put(`/suppliers/${id}`, data),
  delete: (id: number | string) => API.delete(`/suppliers/${id}`),
  linkItem: (supplierId: number | string, data: any) =>
    API.post(`/suppliers/${supplierId}/items`, data),
  unlinkItem: (supplierId: number | string, itemId: number | string) =>
    API.delete(`/suppliers/${supplierId}/items/${itemId}`),
};

export const customerService = {
  getAll: () => API.get("/customers"),
  getById: (id: number | string) => API.get(`/customers/${id}`),
  create: (data: any) => API.post("/customers", data),
  update: (id: number | string, data: any) => API.put(`/customers/${id}`, data),
  delete: (id: number | string) => API.delete(`/customers/${id}`),
};

export const salesRepService = {
  getAll: () => API.get("/sales-reps"),
  getById: (id: number | string) => API.get(`/sales-reps/${id}`),
  create: (data: any) => API.post("/sales-reps", data),
  update: (id: number | string, data: any) =>
    API.put(`/sales-reps/${id}`, data),
  setStatus: (id: number | string, status: string, reassignToRepId?: number) =>
    API.patch(`/sales-reps/${id}/status`, { status, reassignToRepId }),
};

export const goodsReceivingService = {
  getAllLogs: () => API.get("/goods-receiving/logs"),
  getById: (id: number | string) => API.get(`/goods-receiving/${id}`),
  uploadExcel: (formData: FormData) =>
    API.post("/goods-receiving/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
  verifyItem: (receivingItemId: number | string, status: string) =>
    API.put(`/goods-receiving/items/${receivingItemId}/verify`, null, {
      params: { status },
    }),
  decideBatch: (receivingId: number | string, decision: string) =>
    API.post(`/goods-receiving/${receivingId}/decision`, null, {
      params: { decision },
    }),
};

export const orderService = {
  getAll: () => API.get("/orders"),
  getById: (id: number | string) => API.get(`/orders/${id}`),
  submit: (data: any) => API.post("/orders", data),
  getPending: () => API.get("/orders/pending"),
  approve: (id: number | string) => API.post(`/orders/${id}/approve`),
  reject: (id: number | string, remarks: string) =>
    API.post(`/orders/${id}/reject`, { remarks }),
};

export const priceApprovalService = {
  getMine: () => API.get("/price-approvals/mine"),
  getPending: () => API.get("/price-approvals/pending"),
  getHistory: (id: number | string) =>
    API.get(`/price-approvals/history/${id}`),
  requestPriceChange: (data: any) => API.post("/price-approvals/request", data),
  approve: (id: number | string) => API.post(`/price-approvals/${id}/approve`),
  reject: (id: number | string) => API.post(`/price-approvals/${id}/reject`),
};

export const reportService = {
  summary: () => API.get("/reports/summary"),
  movements: (id: number | string) => API.get(`/reports/movements/${id}`),
};
export function errorMessage(error: any) {
  return (
    error?.response?.data?.message ||
    (error?.code === "ECONNABORTED"
      ? "The request timed out. Please retry."
      : "Unable to contact the server. Please retry.")
  );
}
export default API;

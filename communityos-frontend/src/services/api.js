import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:3000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

/*
 * Add authentication automatically to every request.
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("co_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/*
 * Handle common API errors in one place.
 */
api.interceptors.response.use(
  (response) => response,

  (error) => {
    if (!error.response) {
      return Promise.reject({
        message: "Unable to connect to CommunityOS.",
        originalError: error,
      });
    }

    const status = error.response.status;

    console.error(`API Error ${status}:`, error.response.data);

    if (status === 401) {
      localStorage.removeItem("co_token");
      localStorage.removeItem("co_user");

      // Prevent redirect loop when already on login page
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }

      return Promise.reject({
        message: "Your session has expired. Please log in again.",
        status: 401,
      });
    }

    return Promise.reject(
      error.response.data || {
        message: "Something went wrong.",
        status,
      }
    );
  }
);

/* Authentication */
export const login = (credentials) =>
  api.post("/auth/login", credentials);

export const register = (data) =>
  api.post("/auth/register", data);

/* Communities */
export const getCommunities = () =>
  api.get("/communities");

/* Services */
export const getServices = (params = {}) =>
  api.get("/services", { params });

export const getService = (serviceId) =>
  api.get(`/services/${serviceId}`);

/* Orders */
export const getOrders = (params = {}) =>
  api.get("/orders", { params });

export const getOrder = (orderId) =>
  api.get(`/orders/${orderId}`);

export const createOrder = (data) =>
  api.post("/orders", data);

export const updateOrder = (orderId, data) =>
  api.patch(`/orders/${orderId}`, data);

/* Providers */
export const getProviders = (params = {}) =>
  api.get("/providers", { params });

/* Incidents */
export const getIncidents = (params = {}) =>
  api.get("/incidents", { params });

export const createIncident = (data) =>
  api.post("/incidents", data);

/* Notifications */
export const getNotifications = () =>
  api.get("/notifications");

export default api;
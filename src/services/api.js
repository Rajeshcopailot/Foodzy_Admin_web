import axiosInstance from "../config/axios";

export const commonAPI = {
  uploadImage: (data) => {
    return axiosInstance.post("/upload/image", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};

export const adminAPI = {
  login: (credentials) => {
    return axiosInstance.post("/admins/login", credentials);
  },
  // Add other admin-related API calls here
  logout: () => {
    return axiosInstance.post("/admins/logout");
  },
  getProfile: () => {
    return axiosInstance.get("/admins/profile");
  },
};

export const restaurantAPI = {
  login: (credentials) => {
    return axiosInstance.post("/restaurants/login", credentials);
  },
  register: (data) => {
    return axiosInstance.post("/restaurants/register", data);
  },
  verifyEmail: (data) => {
    return axiosInstance.post("/restaurants/verify-email", data);
  },
  resendEmailOTP: (data) => {
    return axiosInstance.post("/restaurants/resend-otp", data);
  },
  forgotPassword: (data) => {
    return axiosInstance.post("/restaurants/forgot-password", data);
  },
  resetPassword: (data) => {
    return axiosInstance.post("/restaurants/reset-password", data);
  },
  restaurantStats: (data) => {
    return axiosInstance.get(`/restaurants/stats/${data.restaurantId}`);
  },
  restaurantProfile: (data) => {
    return axiosInstance.post(`/restaurants/profile`, data);
  },
  // Add restaurant-related API calls here
  // getAll: () => {
  //   return axiosInstance.get("/restaurants");
  // },
  // create: (data) => {
  //   return axiosInstance.post("/restaurants", data);
  // },
  // update: (id, data) => {
  //   return axiosInstance.put(`/restaurants/${id}`, data);
  // },
  // delete: (id) => {
  //   return axiosInstance.delete(`/restaurants/${id}`);
  // },
};

export const orderAPI = {
  // Add order-related API calls here
  getAll: () => {
    return axiosInstance.get("/orders");
  },
  getById: (id) => {
    return axiosInstance.get(`/orders/${id}`);
  },
  updateStatus: (id, status) => {
    return axiosInstance.put(`/orders/${id}/status`, { status });
  },
};

export const menuAPI = {
  getMenu: (restaurantId, searchParams) => {
    return axiosInstance.get(`/menu/${restaurantId}`, {
      params: searchParams,
    });
  },
  addMenuItem: (data) => {
    return axiosInstance.post(`/menu/add-menu`, data);
  },
  updateMenuItem: (itemId, data) => {
    return axiosInstance.put(`/menu/${itemId}`, data);
  },
  deleteMenuItem: (itemId) => {
    return axiosInstance.delete(`/menu/${itemId}`);
  },
  updateItemAvailability: (itemId, isAvailable) => {
    return axiosInstance.patch(`/menu/${itemId}/isAvailable`, isAvailable);
  },
  searchMenu: (restaurantId, searchParams) => {
    return axiosInstance.get(`/menu/search/${restaurantId}`, {
      params: searchParams,
    });
  },
};

import apiClient from '../apiClient';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("jwtToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("401 Unauthorized received in productService, but preventing automatic logout.");
    }
    return Promise.reject(error);
  }
);

export const productService = {
  getAllProducts: async () => {
    const response = await api.get(
      `/api/manufacturer/products?manufacturerId=${localStorage.getItem("roleId")}`
    );
    return response.data;
  },

  getProductById: async (productId) => {
    const manufacturerId = localStorage.getItem("roleId");
    const response = await apiClient.get(`/api/manufacturer/product?manufacturerId=${manufacturerId}&productId=${productId}`);
    const p = response.data;

    // Normalize data if it comes in backend format
    if (p && p.productName) {
      return {
        name: p.productName,
        category: p.category,
        price: p.price,
        warranty: p.warrantyType || p.warranty,
        description: p.description,
        quantity: p.quantity ?? '',
        id: p.productId || p.id
      };
    }
    return p;
  },

  addProduct: async (data) => {
    const payload = {
      productName: data.name,
      category: data.category,
      price: data.price,
      warrantyType: data.warranty,
      description: data.description,
      quantity: data.quantity ? Number(data.quantity) : 0,
      manufacturerId: localStorage.getItem("roleId")
    };

    try {
      const response = await apiClient.post(`/api/manufacturer/create-product`, payload);
      return response.data || { success: true, product: payload };
    } catch (error) {
      const errorData = error.response?.data;
      throw new Error(
        (errorData?.errors ? Object.values(errorData.errors).join(", ") : undefined) ||
        errorData?.message ||
        'Failed to create product'
      );
    }
  },

  updateProduct: async (id, data) => {
    try {
      const payload = {
        productId: id,
        productName: data.name,
        category: data.category,
        price: data.price,
        warrantyType: data.warranty,
        description: data.description,
        quantity: data.quantity ? Number(data.quantity) : 0,
        manufacturerId: localStorage.getItem("roleId")
      };
      const response = await apiClient.put(`/api/manufacturer/update-product?manufacturerId=${localStorage.getItem("roleId")}&productId=${id}`, payload);
      return response.data || { success: true };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update product');
    }
  }
};


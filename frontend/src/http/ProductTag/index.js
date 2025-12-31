import axios from "axios";
import api from "../api";

// ================== ✅ PRODUCT TAG ROUTES ==================

export const createProductTag = (data) => api.post("/api/producttags", data);
export const getProductTags = (params) => {
  const queryString = params ? `?${new URLSearchParams(params).toString()}` : "";
  return api.get(`/api/producttags${queryString}`);
};
export const getProductTag = (id) => api.get(`/api/producttags/${id}`);
export const updateProductTag = (id, data) => api.put(`/api/producttags/${id}`, data);
export const deleteProductTag = (id) => api.delete(`/api/producttags/${id}`);

// Product association routes
export const addProductsToTag = (id, productIds) => 
  api.post(`/api/producttags/${id}/products`, { productIds });
export const removeProductsFromTag = (id, productIds) => 
  api.post(`/api/producttags/${id}/products/remove`, { productIds });

export default api;


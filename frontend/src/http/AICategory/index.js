import axios from "axios";
import api from "../api";

// ================== ✅ AI CATEGORY ROUTES ==================

export const createAICategory = (data) => api.post("/api/aicategories", data);
export const getAICategories = (params) => {
  const queryString = params ? `?${new URLSearchParams(params).toString()}` : "";
  return api.get(`/api/aicategories${queryString}`);
};
export const getAICategory = (id) => api.get(`/api/aicategories/${id}`);
export const updateAICategory = (id, data) => api.put(`/api/aicategories/${id}`, data);
export const deleteAICategory = (id) => api.delete(`/api/aicategories/${id}`);

export default api;


import axios from "axios";
import api from "../api";

// ================== ✅ PUBLISHER ROUTES ==================

export const createPublisher = (data) => api.post("/api/publishers", data);
export const getPublishers = (params) => {
  const queryString = params ? `?${new URLSearchParams(params).toString()}` : "";
  return api.get(`/api/publishers${queryString}`);
};
export const getPublisher = (id) => api.get(`/api/publishers/${id}`);
export const updatePublisher = (id, data) => api.put(`/api/publishers/${id}`, data);
export const deletePublisher = (id) => api.delete(`/api/publishers/${id}`);

export default api;


import axios from "axios";
import api from "../api";

// ================== ✅ DELIVERY METHOD ROUTES ==================

export const createDeliveryMethod = (data) => api.post("/api/deliverymethods", data);
export const getDeliveryMethods = (params) => {
  const queryString = params ? `?${new URLSearchParams(params).toString()}` : "";
  return api.get(`/api/deliverymethods${queryString}`);
};
export const getDeliveryMethod = (id) => api.get(`/api/deliverymethods/${id}`);
export const updateDeliveryMethod = (id, data) => api.put(`/api/deliverymethods/${id}`, data);
export const deleteDeliveryMethod = (id) => api.delete(`/api/deliverymethods/${id}`);

export default api;


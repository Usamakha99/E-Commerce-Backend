import axios from "axios";
import api from "../api";

// ================== ✅ PRODUCT INQUIRY ROUTES ==================

export const createProductInquiry = (data) => 
  api.post("/api/productinquiries", data);

export const getProductInquiries = (params) => {
  const queryString = params ? `?${new URLSearchParams(params).toString()}` : "";
  return api.get(`/api/productinquiries${queryString}`);
};

export const getProductInquiry = (id) => 
  api.get(`/api/productinquiries/${id}`);

export const updateProductInquiry = (id, data) => 
  api.put(`/api/productinquiries/${id}`, data);

export const deleteProductInquiry = (id) => 
  api.delete(`/api/productinquiries/${id}`);

export const getInquiryStats = () => 
  api.get("/api/productinquiries/stats");

export default api;


import axios from "axios";
import api from "../api";

// ================== ✅ AI AGENT ROUTES ==================

// Create AI Agent
export const createAIAgent = (data) => api.post("/api/aiagents", data);

// Get all AI Agents with filters, search, and pagination
export const getAIAgents = (params) => {
  const queryString = params ? `?${new URLSearchParams(params).toString()}` : "";
  return api.get(`/api/aiagents${queryString}`);
};

// Get single AI Agent by ID or slug
export const getAIAgent = (id) => api.get(`/api/aiagents/${id}`);

// Update AI Agent
export const updateAIAgent = (id, data) => api.put(`/api/aiagents/${id}`, data);

// Delete AI Agent
export const deleteAIAgent = (id) => api.delete(`/api/aiagents/${id}`);

// Get categories with counts
export const getCategoriesWithCounts = () => api.get("/api/aiagents/categories/counts");

// Get delivery methods with counts
export const getDeliveryMethodsWithCounts = () => api.get("/api/aiagents/delivery-methods/counts");

// Get publishers with counts
export const getPublishersWithCounts = () => api.get("/api/aiagents/publishers/counts");

export default api;


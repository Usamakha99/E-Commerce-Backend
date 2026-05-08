// import axios from 'axios';
// const api = axios.create({
//   baseURL: "http://localhost:5000", // 👈 point to your backend
//   withCredentials: true, // only if you’re using cookies
//   headers: {
//     "Content-Type": "application/json",
//     Accept: "application/json",
//   },
// });

// function HttpClient() {
  
//   return {
//     get: axios.get,
//     post: axios.post,
//     patch: axios.patch,
//     put: axios.put,
//     delete: axios.delete
//   };
// }
// export default HttpClient();
// src/helpers/httpClient.js


import axios from "axios";
import { getBackendBaseUrl } from "@/helpers/backendBaseUrl";

const api = axios.create({
  baseURL: getBackendBaseUrl(),
  withCredentials: false, // set true if you use cookies; false for pure JWT auth
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Attach JWT token automatically from localStorage key "auth"
api.interceptors.request.use(
  (config) => {
    try {
      const raw = localStorage.getItem("auth");
      if (raw) {
        const parsed = JSON.parse(raw);
        const token = parsed?.token || parsed?.accessToken || null;
        if (token) config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (err) {
      // ignore parse errors
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Optional: global 401 handler
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      // Clear auth silently (app can redirect based on context)
      localStorage.removeItem("auth");
    }
    return Promise.reject(err);
  }
);

function HttpClient() {
  return {
    get: (url, config) => api.get(url, config),
    post: (url, data, config) => api.post(url, data, config),
    patch: (url, data, config) => api.patch(url, data, config),
    put: (url, data, config) => api.put(url, data, config),
    delete: (url, config) => api.delete(url, config),
    instance: api, // if you need direct access for interceptors in tests
  };
}

export default HttpClient();

// Re-export single auth layer (httpOnly cookies + profile bootstrap; see AuthContext.jsx)
export { AuthProvider, useAuth as useAuthContext } from "./AuthContext";

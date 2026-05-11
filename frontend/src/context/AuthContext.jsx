import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import httpClient from "@/helpers/httpClient";

// Create the context
const AuthContext = createContext();

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const clearAuth = useCallback(() => {
    localStorage.removeItem("auth");
    setUser(null);
    setToken(null);
  }, []);

  // Restore from localStorage + validate httpOnly cookie / Bearer with server
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const authData = localStorage.getItem("auth");
        if (authData) {
          const parsed = JSON.parse(authData);
          if (parsed?.user) {
            setUser(parsed.user);
            if (parsed.token) setToken(parsed.token);
          } else {
            clearAuth();
          }
        }
      } catch {
        clearAuth();
      }

      try {
        const res = await httpClient.get("/api/users/profile");
        if (cancelled) return;
        if (res.data?.success && res.data?.data) {
          const u = res.data.data;
          setUser(u);
          const raw = localStorage.getItem("auth");
          let prev = {};
          try {
            prev = raw ? JSON.parse(raw) : {};
          } catch {
            prev = {};
          }
          localStorage.setItem(
            "auth",
            JSON.stringify({
              ...prev,
              user: u,
              timestamp: Date.now(),
            })
          );
        }
      } catch (e) {
        if (cancelled) return;
        if (e?.response?.status === 401) {
          clearAuth();
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [clearAuth]);

  // Save session after login (JWT may live only in httpOnly cookies; user is cached in localStorage)
  const saveSession = (sessionData) => {
    if (!sessionData?.user) {
      return false;
    }

    const authData = {
      user: sessionData.user,
      timestamp: Date.now(),
    };
    if (sessionData.token) {
      authData.token = sessionData.token;
    }

    localStorage.setItem("auth", JSON.stringify(authData));
    setUser(sessionData.user);
    setToken(sessionData.token || null);

    return true;
  };

  // Check if user is authenticated (tokens can be httpOnly cookies only)
  const isAuthenticated = !!user;

  // Context value
  const value = {
    user,
    token,
    isAuthenticated,
    isLoading,
    saveSession,
    clearAuth,
    clearSession: clearAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
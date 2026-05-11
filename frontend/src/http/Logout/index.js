import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { logout } from "../services/authService";

const useLogout = () => {
  const { clearAuth } = useAuth();
  const mutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      clearAuth();
      localStorage.removeItem("token");
      console.log("Logged out");
    },
    onError: (error) => {
      console.error("Logout failed", error.response?.data || error.message);
    },
  });

  return {
    logout: mutation.mutate,
    loading: mutation.isPending,
  };
};

export default useLogout;

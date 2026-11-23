import {
  createContext,
  useContext,
  useState,
} from "react";

import API from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  const [admin, setAdmin] = useState(() => {
    const savedAdmin = sessionStorage.getItem("admin");

    return savedAdmin ? JSON.parse(savedAdmin) : null;
  });

  const [token, setToken] = useState(
    () => sessionStorage.getItem("token")
  );

  const [loading, setLoading] = useState(false);

  // Administrator login
  const login = async (email, password) => {

    setLoading(true);

    try {

      const response = await API.post("/api/auth/login", {
        email,
        password,
      });

      const { token, admin } = response.data;

      sessionStorage.setItem("token", token);

      sessionStorage.setItem(
        "admin",
        JSON.stringify(admin)
      );

      setToken(token);
      setAdmin(admin);

      return {
        success: true,
      };

    } catch (error) {

      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Unable to login. Please try again.",
      };

    } finally {

      setLoading(false);

    }
  };

  // Administrator logout
  const logout = () => {

    sessionStorage.removeItem("token");
    sessionStorage.removeItem("admin");

    setToken(null);
    setAdmin(null);

  };

  return (
    <AuthContext.Provider
      value={{
        admin,
        token,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom authentication hook
export const useAuth = () => {
  return useContext(AuthContext);
};
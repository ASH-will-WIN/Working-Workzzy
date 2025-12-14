import React, { createContext, useState, useEffect, useContext } from "react";
import { loginUser, registerUser } from "../api/authApi";
import { apiClient } from "../api/apiClient";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      // Set the auth token for all future requests
      apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      // Fetch user data from local storage or an API endpoint if needed
      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (storedUser) {
        setUser(storedUser);
      }
    }
    setLoading(false);
  }, [token]);

  const login = async (email, password) => {
    const { user, session } = await loginUser({ email, password });
    localStorage.setItem("token", session.access_token);
    localStorage.setItem("user", JSON.stringify(user));
    setToken(session.access_token);
    setUser(user);
    apiClient.defaults.headers.common[
      "Authorization"
    ] = `Bearer ${session.access_token}`;

    // Note: Onboarding status will be checked on Dashboard load
  };

  const register = async (name, email, password, role, phone) => {
    const { user, session } = await registerUser({
      name,
      email,
      password,
      role,
      phone,
    });
    localStorage.setItem("token", session.access_token);
    localStorage.setItem("user", JSON.stringify(user));
    setToken(session.access_token);
    setUser(user);
    apiClient.defaults.headers.common[
      "Authorization"
    ] = `Bearer ${session.access_token}`;

    // Note: Onboarding status will be checked on Dashboard load
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    delete apiClient.defaults.headers.common["Authorization"];
  };

  const value = {
    user,
    token,
    login,
    register,
    logout,
    isAuthenticated: !!token,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};

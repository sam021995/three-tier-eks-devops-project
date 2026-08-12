import React, { createContext, useContext, useState } from "react";
import { getToken, clearToken, login as loginApi } from "./api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(getToken());

  const login = async (username, password) => {
    const data = await loginApi(username, password);
    setTokenState(data.token);
  };

  const logout = () => {
    clearToken();
    setTokenState(null);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn: Boolean(token), login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

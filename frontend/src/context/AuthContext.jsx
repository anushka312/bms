import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Initially no user

  const login = (userData) => {
    setUser(userData);
    // Optional: localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    // Optional: localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

import React, { createContext, useState, useContext, useEffect } from "react";

const AdminAuthContext = createContext();

export const AdminAuthProvider = ({ children }) => {
    const [employee, setEmployee] = useState(null);

    useEffect(() => {
        const storedEmployee = localStorage.getItem("employee");

        if (storedEmployee && storedEmployee !== "undefined") {
            try {
                setEmployee(JSON.parse(storedEmployee));
            } catch (err) {
                console.error("Invalid employee JSON in localStorage:", err);
                localStorage.removeItem("employee"); // Optional: clean bad data
            }
        }
    }, []);

    const login = (adminData) => {
        setEmployee(adminData);
        localStorage.setItem("employee", JSON.stringify(adminData));
    };

    const logout = () => {
        setEmployee(null);
        localStorage.removeItem("employee");
    };

    return (
        <AdminAuthContext.Provider value={{ employee, login, logout }}>
            {children}
        </AdminAuthContext.Provider>
    );
};

export const useAdminAuth = () => useContext(AdminAuthContext);

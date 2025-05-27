import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
    // Initialize token and username from localStorage
    const [token, setToken] = useState(() => localStorage.getItem('token'));
    const [user, setUser] = useState(() => {
        const u = localStorage.getItem('username');
        return u ? { username: u } : null;
    });

    useEffect(() => {
        // Set axios defaults whenever token changes
        axios.defaults.baseURL = '/api';   // proxy to Django
        if (token) {
            localStorage.setItem('token', token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            localStorage.removeItem('token');
            delete axios.defaults.headers.common['Authorization'];
        }
    }, [token]);

    const login = async (username, password) => {
        const res = await axios.post('/login/', { username, password });
        setToken(res.data.access);
        setUser({ username });
        localStorage.setItem('username', username);
    };

    const register = async (username, password) => {
        await axios.post('/register/', { username, password });
        // auto-login
        return login(username, password);
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('username');
    };

    return (
        <AuthContext.Provider value={{ token, user, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

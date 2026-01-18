import { useState, useEffect } from 'react';
import { User } from '../types';
import apiClient from '../services/apiClient';

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Check if user is logged in on mount
    useEffect(() => {
        const checkAuth = async () => {
            if (!apiClient.isAuthenticated()) {
                setLoading(false);
                return;
            }

            try {
                const currentUser = await apiClient.getCurrentUser();
                setUser(currentUser);
            } catch (err) {
                console.error('Auth check failed:', err);
                apiClient.logout();
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    const register = async (email: string, password: string) => {
        setError(null);
        try {
            const response = await apiClient.register(email, password);
            setUser(response.user);
            return response;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Registration failed';
            setError(message);
            throw err;
        }
    };

    const login = async (email: string, password: string) => {
        setError(null);
        try {
            const response = await apiClient.login(email, password);
            setUser(response.user);
            return response;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Login failed';
            setError(message);
            throw err;
        }
    };

    const logout = async () => {
        try {
            await apiClient.logout();
            setUser(null);
        } catch (err) {
            console.error('Logout error:', err);
        }
    };

    return {
        user,
        loading,
        error,
        register,
        login,
        logout,
        isAuthenticated: !!user,
    };
}

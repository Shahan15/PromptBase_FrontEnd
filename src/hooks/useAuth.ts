import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '@/api/client';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });
  const navigate = useNavigate();

  // Check for existing token on mount
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    setAuthState({
      isAuthenticated: !!token,
      isLoading: false,
      error: null,
    });
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await authApi.login(username, password);
      console.log("Full Response: ",response);
      
      localStorage.setItem('access_token', response.access_token);
      setAuthState({
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      navigate('/dashboard');
      return { success: true };
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Login failed. Please check your credentials.';
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        error: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  }, [navigate]);

  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    setAuthState({
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
    navigate('/login');
  }, [navigate]);

  return {
    ...authState,
    login,
    logout,
  };
}

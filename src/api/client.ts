import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: async (email: string, password: string) => {
    const params = new URLSearchParams()
    params.append('username', email); // backend expects 'username' for the email field
    params.append('password', password);

    // 2. Send as x-www-form-urlencoded
    const response = await apiClient.post('auth/login', params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    return response.data;
  },
  signup: async (data: {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
  }) => {
    const response = await apiClient.post('/register', data);
    return response.data;
  },
};

// Prompts API
export const promptsApi = {
  createPrompt: async (prompt: string) => {
    const response = await apiClient.post('/refine', { 
      original_prompt: prompt 
    });
    return response.data;
  },
  getPrompts: async () => {
    const response = await apiClient.get('/prompts');
    return response.data;
  },
  deletePrompt: async (promptId: string) => {
    const response = await apiClient.delete(`/prompts/${promptId}`);
    return response.data;
  },
  updatePrompt: async (promptId: string, data: { is_private?: boolean; tags?: string }) => {
    const response = await apiClient.patch(`/prompts/${promptId}`, data);
    return response.data;
  },
};

// Favourites API
export const favouritesApi = {
  getAll: async () => {
    const response = await apiClient.get('/favourites');
    return response.data;
  },
  create: async (originalPrompt: string, optimisedPrompt: string) => {
    const response = await apiClient.post('/favourites', { 
      original_prompt: originalPrompt,
      optimised_prompt: optimisedPrompt 
    });
    return response.data;
  },
  delete: async (favouriteId: string) => {
    const response = await apiClient.delete(`/favourites/${favouriteId}`);
    return response.data;
  },
};

// Users API
export const usersApi = {
  getProfile: async () => {
    const response = await apiClient.get('/users/me');
    return response.data;
  },
  update: async (userId: string, data: {
    first_name?: string;
    last_name?: string;
    email?: string;
    password?: string;
  }) => {
    const response = await apiClient.patch(`/users/${userId}`, data);
    return response.data;
  },
  delete: async () => {
    const response = await apiClient.delete('/users/me');
    return response.data;
  },
};

export default apiClient;

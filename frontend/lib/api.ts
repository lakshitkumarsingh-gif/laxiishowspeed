import axios from 'axios';
import { useStore } from './store';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = useStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  google: (token: string) => api.post('/auth/google', { token }),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
};

export const conversationAPI = {
  list: () => api.get('/conversations'),
  create: (title: string, subject?: string) =>
    api.post('/conversations', { title, subject }),
  get: (id: string) => api.get(`/conversations/${id}`),
  sendMessage: (id: string, content: string) =>
    api.post(`/conversations/${id}/messages`, { content }),
  delete: (id: string) => api.delete(`/conversations/${id}`),
};

export const memoryAPI = {
  list: () => api.get('/memories'),
  create: (type: string, content: string, importance: number) =>
    api.post('/memories', { type, content, importance }),
  update: (id: string, type: string, content: string, importance: number) =>
    api.put(`/memories/${id}`, { type, content, importance }),
  delete: (id: string) => api.delete(`/memories/${id}`),
};

export const settingsAPI = {
  get: () => api.get('/settings'),
  update: (data: any) => api.put('/settings', data),
};

export const documentAPI = {
  list: () => api.get('/documents'),
  upload: (file: File, title: string, description?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    if (description) formData.append('description', description);
    return api.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  delete: (id: string) => api.delete(`/documents/${id}`),
};

export default api;

// Dentro de web/src/lib/api.ts
import axios from 'axios';

// Isso lê a variável VITE_API_BASE_URL do seu arquivo .env
const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export const apiClient = axios.create({
  baseURL: VITE_API_BASE_URL, // Ex: 'http://localhost:3001'
  headers: {
    'Content-Type': 'application/json',
  }
  // Aqui você pode adicionar interceptors para tokens JWT, etc.
});

// adicionar interceptors depois de criar a instância
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    // garantir que headers exista e usar cast para evitar erros de tipagem
    if (!config.headers) {
      config.headers = {} as any;
    }
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      // token inválido/expirado: remover e redirecionar
      localStorage.removeItem('token');
      if (window.location.pathname !== '/auth') {
        window.location.href = '/auth';
      }
    }
  }
);

// Gerenciamento de refresh token para evitar múltiplos requests simultâneos
let isRefreshing = false as boolean;
let pendingRequests: Array<(token: string) => void> = [];

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error?.config || {};
    const status = error?.response?.status;

    if (status === 401 && !(originalRequest as any)._retry) {
      (originalRequest as any)._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        if (isRefreshing) {
          return new Promise((resolve) => {
            pendingRequests.push((newToken) => {
              if (!originalRequest.headers) originalRequest.headers = {};
              (originalRequest.headers as any).Authorization = `Bearer ${newToken}`;
              resolve(apiClient(originalRequest));
            });
          });
        }

        isRefreshing = true;
        try {
          const resp = await apiClient.post('/auth/refresh', { refreshToken });
          const newToken = resp.data?.token as string | undefined;
          if (newToken) {
            localStorage.setItem('token', newToken);
            pendingRequests.forEach((cb) => cb(newToken));
            pendingRequests = [];
            return apiClient(originalRequest);
          }
        } catch (_) {
          // segue para logout forçado
        } finally {
          isRefreshing = false;
        }
      }

      // sem refreshToken válido: limpar e redirecionar
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      if (typeof window !== 'undefined') {
        window.location.href = '/auth';
      }
    }

    return Promise.reject(error);
  }
);

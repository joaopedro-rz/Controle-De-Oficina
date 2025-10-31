// Dentro de web/src/lib/api.ts
import axios from 'axios';

// Isso lê a variável VITE_API_BASE_URL do seu arquivo .env
const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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
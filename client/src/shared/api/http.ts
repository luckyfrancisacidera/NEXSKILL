import axios from '@shared/vendor/axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5062';
let csrfToken: string | null = null;

export const http = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export const setCsrfToken = (token: string | null) => {
  csrfToken = token;
};

export const fetchCsrfToken = async () => {
  const response = await http.get<{ csrfToken: string }>('/api/auth/csrf');
  setCsrfToken(response.data.csrfToken);
};

http.interceptors.request.use((config) => {
  const method = config.method?.toLowerCase();
  if (csrfToken && method && ['post', 'put', 'patch', 'delete'].includes(method)) {
    config.headers['X-CSRF-TOKEN'] = csrfToken;
  }

  return config;
});

import axios from 'axios';
import { User } from 'oidc-client-ts';
import { env } from '../utils/env';

const api = axios.create({
  baseURL: env.apiBaseUrl,
});

api.interceptors.request.use((config) => {
  const storageKey = `oidc.user:${env.authAuthority}:${env.authClientId}`;
  const userData = localStorage.getItem(storageKey);
  if (userData) {
    const user = User.fromStorageString(userData);
    if (user?.access_token) {
      config.headers.Authorization = `Bearer ${user.access_token}`;
    }
  }

  // Multi-tenancy header
  const tenantId = localStorage.getItem('__tenant');
  if (tenantId) {
    config.headers['__tenant'] = tenantId;
  }

  // Localization — ABP uses Accept-Language or culture cookie
  const lang = localStorage.getItem('ce-language');
  if (lang) {
    config.headers['Accept-Language'] = lang;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const storageKey = `oidc.user:${env.authAuthority}:${env.authClientId}`;
      localStorage.removeItem(storageKey);
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default api;

export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'https://localhost:44305',
  appName: import.meta.env.VITE_APP_NAME || 'CoreApp',
  authAuthority: import.meta.env.VITE_AUTH_AUTHORITY || 'https://localhost:44305',
  authClientId: import.meta.env.VITE_AUTH_CLIENT_ID || 'CoreApp_App',
  authRedirectUri: import.meta.env.VITE_AUTH_REDIRECT_URI || 'http://localhost:5173/callback',
  authPostLogoutUri: import.meta.env.VITE_AUTH_POST_LOGOUT_URI || 'http://localhost:5173',
};

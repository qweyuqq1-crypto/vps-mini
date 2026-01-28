
const BASE_URL = '/api';

export const getAuthToken = () => localStorage.getItem('aurora_token');
export const setAuthToken = (token: string) => localStorage.setItem('aurora_token', token);
export const removeAuthToken = () => localStorage.removeItem('aurora_token');

export async function apiFetch(endpoint: string, options: any = {}) {
  const token = getAuthToken();
  const headers = { ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${endpoint.startsWith('/') ? '' : BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    removeAuthToken();
    window.location.reload();
  }
  return response;
}

export async function loginRequest(credentials: URLSearchParams) {
  return fetch('/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: credentials,
  });
}

export const updatePassword = (data: any) => apiFetch('/settings/password', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
});

export const restartService = () => apiFetch('/settings/restart', { method: 'POST' });


// 获取存储的后端地址，默认为相对路径
export const getBackendUrl = () => localStorage.getItem('aurora_backend_url') || '';
export const setBackendUrl = (url: string) => localStorage.setItem('aurora_backend_url', url);

export const getAuthToken = () => localStorage.getItem('aurora_token');
export const setAuthToken = (token: string) => localStorage.setItem('aurora_token', token);
export const removeAuthToken = () => localStorage.removeItem('aurora_token');

export async function apiFetch(endpoint: string, options: any = {}) {
  const token = getAuthToken();
  const baseUrl = getBackendUrl();
  const headers = { ...options.headers };
  
  if (token) headers['Authorization'] = `Bearer ${token}`;

  // 拼接完整地址
  const url = endpoint.startsWith('http') 
    ? endpoint 
    : `${baseUrl}${endpoint.startsWith('/') ? '' : '/api/'}${endpoint}`;

  const response = await fetch(url, {
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
  const baseUrl = getBackendUrl();
  return fetch(`${baseUrl}/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: credentials,
  });
}

export const updatePassword = (data: any) => apiFetch('settings/password', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
});

export const restartService = () => apiFetch('settings/restart', { method: 'POST' });

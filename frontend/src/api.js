const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export function getApiUrl(path) {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE}${cleanPath}`;
}

export async function apiFetch(path, options = {}) {
  const url = getApiUrl(path);
  return fetch(url, options);
}

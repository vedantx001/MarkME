const DEFAULT_BASE_URL = 'http://localhost:5000/api';

function getBaseUrl() {
  return (import.meta?.env?.VITE_API_BASE_URL || DEFAULT_BASE_URL).replace(/\/+$/, '');
}

function getStoredToken() {
  return localStorage.getItem('accessToken');
}

function getStoredRefreshToken() {
  return localStorage.getItem('refreshToken');
}

function storeAuthTokens({ accessToken, refreshToken }) {
  if (accessToken) localStorage.setItem('accessToken', accessToken);
  if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
}

function clearAuthTokens() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
}

async function parseResponse(res) {
  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const body = isJson ? await res.json().catch(() => null) : await res.text().catch(() => '');
  return body;
}

async function apiFetch(path, { method = 'GET', headers, body, auth = true, retryOn401 = true } = {}) {
  const url = `${getBaseUrl()}${path.startsWith('/') ? path : `/${path}`}`;

  const finalHeaders = {
    ...(body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    ...(headers || {}),
  };

  if (auth) {
    const token = getStoredToken();
    if (token) finalHeaders.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    method,
    headers: finalHeaders,
    credentials: 'include',
    body: body instanceof FormData ? body : body != null ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401 && retryOn401) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      return apiFetch(path, { method, headers, body, auth, retryOn401: false });
    }
  }

  const data = await parseResponse(res);
  if (!res.ok) {
    const message = (data && typeof data === 'object' && (data.message || data.error)) ? (data.message || data.error) : `Request failed (${res.status})`;
    const err = new Error(message);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

async function tryRefreshToken() {
  const refreshToken = getStoredRefreshToken();

  // Server supports refresh via cookie OR body. We send body if we have it.
  try {
    const data = await apiFetch('/auth/refresh-token', {
      method: 'POST',
      auth: false,
      retryOn401: false,
      body: refreshToken ? { refreshToken } : undefined,
    });

    if (data?.token) {
      storeAuthTokens({ accessToken: data.token, refreshToken: data.refreshToken });
      return true;
    }

    return false;
  } catch {
    return false;
  }
}

export { apiFetch, getStoredToken, getStoredRefreshToken, storeAuthTokens, clearAuthTokens };

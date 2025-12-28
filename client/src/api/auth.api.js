import { apiFetch, storeAuthTokens, clearAuthTokens, getStoredRefreshToken } from './http';

export async function loginApi({ email, password }) {
  const data = await apiFetch('/auth/login', {
    method: 'POST',
    auth: false,
    body: { email, password },
  });

  // server returns: { success, token, refreshToken, user }
  storeAuthTokens({ accessToken: data.token, refreshToken: data.refreshToken });
  localStorage.setItem('authUser', JSON.stringify(data.user || null));

  return data;
}

export async function registerAdminApi(payload) {
  return apiFetch('/auth/register-admin', {
    method: 'POST',
    auth: false,
    body: payload,
  });
}

export async function logoutApi() {
  const refreshToken = getStoredRefreshToken();
  try {
    await apiFetch('/auth/logout', {
      method: 'POST',
      auth: false,
      body: refreshToken ? { refreshToken } : undefined,
      retryOn401: false,
    });
  } finally {
    clearAuthTokens();
    localStorage.removeItem('authUser');
  }
}

export async function getMeApi() {
  // server: GET /api/users/me
  return apiFetch('/users/me', { method: 'GET', auth: true });
}

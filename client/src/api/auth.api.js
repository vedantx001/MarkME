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

/* ================= OTP / PASSWORD FLOW ================= */

// Send OTP (resend)
export async function sendOtpApi(payload) {
  return apiFetch('/auth/send-otp', {
    method: 'POST',
    auth: false,
    body: payload,
  });
}

// Forgot password
export async function forgotPasswordApi(payload) {
  return apiFetch('/auth/forgot-password', {
    method: 'POST',
    auth: false,
    body: payload,
  });
}

// Verify OTP
export async function verifyOtpApi(payload) {
  const data = await apiFetch('/auth/verify-otp', {
    method: 'POST',
    auth: false,
    body: payload,
  });

  // If server auto-logs-in (admin verify), persist tokens for subsequent /users/me calls.
  if (data?.token || data?.refreshToken) {
    storeAuthTokens({ accessToken: data.token, refreshToken: data.refreshToken });
  }
  if (data?.user) {
    localStorage.setItem('authUser', JSON.stringify(data.user));
  }

  return data;
}

// Reset password (token-based from forgot password email)
export async function resetPasswordApi(payload) {
  return apiFetch('/auth/reset-password-token', {
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

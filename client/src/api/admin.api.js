import { apiFetch } from './http';

export async function createSchoolUserApi({ name, email, password, role }) {
  return apiFetch('/admin/users', {
    method: 'POST',
    auth: true,
    body: { name, email, password, role },
  });
}

export async function listSchoolUsersApi({ role, page = 1, limit = 50 } = {}) {
  const params = new URLSearchParams();
  if (role) params.set('role', role);
  if (page) params.set('page', String(page));
  if (limit) params.set('limit', String(limit));

  const qs = params.toString();
  return apiFetch(`/admin/users${qs ? `?${qs}` : ''}`, {
    method: 'GET',
    auth: true,
  });
}

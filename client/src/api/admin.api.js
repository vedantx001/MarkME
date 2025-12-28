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

export async function updateSchoolUserApi(userId, payload) {
  return apiFetch(`/admin/users/${userId}`, {
    method: 'PUT',
    auth: true,
    body: payload,
  });
}

export async function deleteSchoolUserApi(userId) {
  return apiFetch(`/admin/users/${userId}`, {
    method: 'DELETE',
    auth: true,
  });
}

export async function listClassesApi() {
  return apiFetch('/classes', { method: 'GET', auth: true });
}

export async function createClassApi({ educationalYear, std, division, classTeacherId, name }) {
  return apiFetch('/classes', {
    method: 'POST',
    auth: true,
    body: { educationalYear, std, division, classTeacherId, name },
  });
}

export async function updateClassApi(classId, payload) {
  return apiFetch(`/classes/${classId}`, {
    method: 'PUT',
    auth: true,
    body: payload,
  });
}

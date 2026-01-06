import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from './authContext';
import {
  createSchoolUserApi,
  listSchoolUsersApi,
  updateSchoolUserApi,
  deleteSchoolUserApi,
  listClassesApi,
  createClassApi,
  updateClassApi,
  updateAdminProfileApi,
} from '../api/admin.api';
import { fetchClassroomStudentsCount } from '../api/student.api';

const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
  const { user, refreshProfile } = useAuth();

  const [teachers, setTeachers] = useState([]);
  const [principal, setPrincipal] = useState(null);
  const [classrooms, setClassrooms] = useState([]);
  const [studentsCount, setStudentsCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Lightweight polling for "real-time" dashboard updates.
  const pollRef = useRef(null);

  // Prefer real school details from /users/me (schoolId may be populated or just id)
  const schoolDetails = useMemo(() => {
    const s = user?.school;
    return {
      name: s?.name || 'School Dashboard',
      index: s?.schoolIdx || (user?.schoolId ? String(user.schoolId).slice(-8).toUpperCase() : '—'),
      address: s?.address || '',
    };
  }, [user?.school?.name, user?.school?.schoolIdx, user?.school?.address, user?.schoolId]);

  const adminProfile = useMemo(
    () => ({
      id: user?.id,
      name: user?.name || 'Admin',
      email: user?.email || '—',
      avatar: `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(user?.name || 'Admin')}`,
    }),
    [user?.id, user?.name, user?.email]
  );

  const updateAdminProfile = async ({ admin, school }) => {
    const res = await updateAdminProfileApi({ admin, school });

    // Refresh auth profile to keep navbar/sidebar consistent.
    try {
      await refreshProfile();
    } catch {
      // ignore
    }

    return res;
  };

  const normalizeUser = (u) => ({
    id: u?._id || u?.id,
    name: u?.name || '—',
    email: u?.email || '—',
    status: u?.isActive ? 'Active' : 'Disabled',
  });

  const refreshTeachers = async () => {
    const res = await listSchoolUsersApi({ role: 'TEACHER', limit: 200 });
    const list = Array.isArray(res?.data) ? res.data : [];
    setTeachers(list.map((u) => ({ ...normalizeUser(u), subject: '—' })));
  };

  const refreshPrincipal = async () => {
    const res = await listSchoolUsersApi({ role: 'PRINCIPAL', limit: 1 });
    const list = Array.isArray(res?.data) ? res.data : [];
    const p = list[0];
    setPrincipal(p ? normalizeUser(p) : null);
  };

  const normalizeClassroom = (c) => ({
    id: c?._id || c?.id,
    year: c?.educationalYear || c?.year || '—',
    std: String(c?.std ?? '').trim(),
    div: String(c?.division ?? c?.div ?? '').trim(),
    name: c?.name || (c?.std && c?.division && c?.educationalYear ? `${c.std}-${c.division} (${c.educationalYear})` : '—'),
    classTeacherId: c?.classTeacherId?._id || c?.classTeacherId || null,
    classTeacherName: c?.classTeacherId?.name || c?.classTeacherName || '—',
  });

  const refreshClassrooms = async () => {
    const res = await listClassesApi();
    const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
    const normalized = list.map(normalizeClassroom);
    setClassrooms(normalized);
    return normalized;
  };

  const refreshStudentsCount = async (rooms) => {
    const list = Array.isArray(rooms) ? rooms : Array.isArray(classrooms) ? classrooms : [];
    const ids = list.map((c) => c?.id).filter(Boolean);

    if (ids.length === 0) {
      setStudentsCount(0);
      return 0;
    }

    const results = await Promise.allSettled(ids.map((id) => fetchClassroomStudentsCount(id)));
    const total = results.reduce((sum, r) => sum + (r.status === 'fulfilled' ? Number(r.value || 0) : 0), 0);
    setStudentsCount(total);
    return total;
  };

  const refreshAll = async () => {
    // Ensure we have classrooms before counting students.
    const [_, __, rooms] = await Promise.all([refreshTeachers(), refreshPrincipal(), refreshClassrooms()]);
    await refreshStudentsCount(rooms);
  };

  const createTeacher = async ({ name, email, password }) => {
    await createSchoolUserApi({ name, email, password, role: 'TEACHER' });
    await refreshTeachers();
  };

  const createPrincipal = async ({ name, email, password }) => {
    // Client enforces single principal.
    if (principal) return;
    await createSchoolUserApi({ name, email, password, role: 'PRINCIPAL' });
    await refreshPrincipal();
  };

  const createClassroom = async ({ year, std, div, classTeacherId, name }) => {
    await createClassApi({
      educationalYear: year,
      std,
      division: div,
      classTeacherId,
      name,
    });
    await refreshClassrooms();
  };

  const updateTeacher = async (teacherId, payload) => {
    await updateSchoolUserApi(teacherId, payload);
    await refreshTeachers();
  };

  const deleteTeacher = async (teacherId) => {
    await deleteSchoolUserApi(teacherId);
    await refreshTeachers();
  };

  const updatePrincipal = async (payload) => {
    if (!principal?.id) return;
    await updateSchoolUserApi(principal.id, payload);
    await refreshPrincipal();
  };

  const updateClassroom = async (classId, payload) => {
    const trimmedName = typeof payload.name === 'string' ? payload.name.trim() : '';
    const nameToSend = trimmedName ? trimmedName : undefined;

    await updateClassApi(classId, {
      educationalYear: payload.year,
      std: payload.std,
      division: payload.div,
      classTeacherId: payload.classTeacherId,
      name: nameToSend,
    });

    // Update local state immediately so UI (e.g., dashboard) reflects changes without waiting.
    setClassrooms((prev) => {
      const list = Array.isArray(prev) ? prev : [];
      const teacherName = (Array.isArray(teachers) ? teachers : []).find((t) => t.id === payload.classTeacherId)?.name;

      return list.map((c) => {
        if (c?.id !== classId) return c;

        const nextStd = String(payload.std ?? '').trim();
        const nextDiv = String(payload.div ?? '').trim();
        const nextYear = payload.year ?? c.year;
        const nextName = String(payload.name ?? '').trim();
        const computed = `${nextStd}-${String(nextDiv || '').toUpperCase()} (${nextYear})`;

        return {
          ...c,
          year: nextYear,
          std: nextStd,
          div: nextDiv,
          classTeacherId: payload.classTeacherId ?? c.classTeacherId,
          classTeacherName: teacherName ?? c.classTeacherName,
          name: nextName ? nextName : computed,
        };
      });
    });

    // Reconcile with server state (also updates teacher name / any server-side computed fields).
    await refreshClassrooms();
  };

  const deleteClassroom = async () => {};

  useEffect(() => {
    let alive = true;

    const stopPolling = () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };

    const role = String(user?.role || '').toUpperCase();
    const canReadDashboard = !!user && (role === 'ADMIN' || role === 'PRINCIPAL');

    if (!canReadDashboard) {
      stopPolling();
      return;
    }

    (async () => {
      setLoading(true);
      setError('');
      try {
        await refreshAll();
      } catch (e) {
        if (!alive) return;
        setError(e?.message || 'Failed to load dashboard data');
      } finally {
        if (alive) setLoading(false);
      }
    })();

    // Polling causes disruptive auto-refresh while browsing pages.
    // Keep polling only for ADMIN; PRINCIPAL gets initial load and then updates on navigation / reload.
    stopPolling();
    if (role === 'ADMIN') {
      pollRef.current = setInterval(() => {
        refreshAll().catch(() => {});
      }, 15000);
    }

    return () => {
      alive = false;
      stopPolling();
    };
  }, [user?.id, user?.role]);

  return (
    <AdminContext.Provider
      value={{
        teachers,
        createTeacher,
        refreshTeachers,
        updateTeacher,
        deleteTeacher,

        principal,
        createPrincipal,
        refreshPrincipal,
        updatePrincipal,

        classrooms,
        refreshClassrooms,
        createClassroom,
        updateClassroom,
        deleteClassroom,

        studentsCount,
        refreshStudentsCount,
        schoolDetails,
        adminProfile,
        updateAdminProfile,
        loading,
        error,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => useContext(AdminContext);
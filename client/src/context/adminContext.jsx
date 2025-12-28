import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  createSchoolUserApi,
  listSchoolUsersApi,
  updateSchoolUserApi,
  deleteSchoolUserApi,
  listClassesApi,
  createClassApi,
  updateClassApi,
} from '../api/admin.api';
import { useAuth } from './authContext';

const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
  const { user } = useAuth();

  const [teachers, setTeachers] = useState([]);
  const [principal, setPrincipal] = useState(null);
  const [classrooms, setClassrooms] = useState([]);
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
    };
  }, [user?.school?.name, user?.school?.schoolIdx, user?.schoolId]);

  const adminProfile = useMemo(
    () => ({
      name: user?.name || 'Admin',
      email: user?.email || '—',
      avatar: `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(user?.name || 'Admin')}`,
    }),
    [user?.name, user?.email]
  );

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
    setClassrooms(list.map(normalizeClassroom));
  };

  const refreshAll = async () => {
    await Promise.all([refreshTeachers(), refreshPrincipal(), refreshClassrooms()]);
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
    await updateClassApi(classId, {
      educationalYear: payload.year,
      std: payload.std,
      division: payload.div,
      classTeacherId: payload.classTeacherId,
      name: payload.name,
    });
    await refreshClassrooms();
  };

  const deleteClassroom = async () => {};

  const studentsCount = 0;

  useEffect(() => {
    let alive = true;

    const stopPolling = () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };

    if (!user || user.role !== 'ADMIN') {
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
        setError(e?.message || 'Failed to load admin data');
      } finally {
        if (alive) setLoading(false);
      }
    })();

    // Poll every 15s to approximate realtime without sockets.
    stopPolling();
    pollRef.current = setInterval(() => {
      refreshAll().catch(() => {});
    }, 15000);

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
        schoolDetails,
        adminProfile,
        loading,
        error,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => useContext(AdminContext);
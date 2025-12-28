import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { createSchoolUserApi, listSchoolUsersApi } from '../api/admin.api';
import { useAuth } from './authContext';

const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
  const { user } = useAuth();

  const [teachers, setTeachers] = useState([]);
  const [principal, setPrincipal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Keep existing UI placeholders (backend currently has no school details endpoint).
  const schoolDetails = useMemo(
    () => ({
      name: 'School Dashboard',
      index: user?.schoolId ? String(user.schoolId).slice(-8).toUpperCase() : '—',
    }),
    [user?.schoolId]
  );

  const adminProfile = useMemo(
    () => ({
      name: user?.name || 'Admin',
      email: user?.email || '—',
      avatar: `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(user?.name || 'Admin')}`,
    }),
    [user?.name, user?.email]
  );

  // Existing classroom UI is still mock/local for now.
  const [classrooms, setClassrooms] = useState([
    { id: 101, year: '2025-26', std: '10', div: 'A', classTeacher: '—' },
  ]);

  const addClassroom = (classroomInput) => {
    const newClassroom = {
      id: Date.now(),
      year: (classroomInput?.year || '').trim(),
      std: (classroomInput?.std || '').trim(),
      div: (classroomInput?.div || '').trim(),
      classTeacher: (classroomInput?.classTeacher || '').trim(),
    };

    if (!newClassroom.year || !newClassroom.std || !newClassroom.div) return;
    setClassrooms((prev) => [newClassroom, ...prev]);
  };

  const studentsCount = 0;

  const refreshTeachers = async () => {
    const res = await listSchoolUsersApi({ role: 'TEACHER' });
    const list = Array.isArray(res?.data) ? res.data : [];
    setTeachers(
      list.map((u) => ({
        id: u._id || u.id,
        name: u.name,
        email: u.email,
        status: u.isActive ? 'Active' : 'Disabled',
        subject: '—',
      }))
    );
  };

  const refreshPrincipal = async () => {
    const res = await listSchoolUsersApi({ role: 'PRINCIPAL', limit: 1 });
    const list = Array.isArray(res?.data) ? res.data : [];
    const p = list[0];
    setPrincipal(
      p
        ? {
            id: p._id || p.id,
            name: p.name,
            email: p.email,
            status: p.isActive ? 'Active' : 'Disabled',
          }
        : null
    );
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

  // Editing principal is not supported by backend right now (no update endpoint).
  const updatePrincipal = async () => {
    return;
  };

  useEffect(() => {
    let alive = true;
    if (!user || user.role !== 'ADMIN') return;

    (async () => {
      setLoading(true);
      setError('');
      try {
        await Promise.all([refreshTeachers(), refreshPrincipal()]);
      } catch (e) {
        if (!alive) return;
        setError(e?.message || 'Failed to load admin data');
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [user?.id, user?.role]);

  return (
    <AdminContext.Provider
      value={{
        teachers,
        createTeacher,
        refreshTeachers,
        principal,
        createPrincipal,
        refreshPrincipal,
        updatePrincipal,
        classrooms,
        addClassroom,
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
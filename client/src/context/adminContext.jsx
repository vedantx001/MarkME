import React, { createContext, useContext, useState } from 'react';

const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
  // Mock Data
  const [teachers, setTeachers] = useState([
    { id: 1, name: "Sarah Connor", subject: "Cybernetics", status: "Active", email: "sarah.connor@school.edu" },
    { id: 2, name: "Dr. Emmet Brown", subject: "Physics", status: "Active", email: "emmet.brown@school.edu" },
    { id: 3, name: "Walter White", subject: "Chemistry", status: "On Leave", email: "walter.white@school.edu" },
    { id: 4, name: "Minerva McGonagall", subject: "Transfiguration", status: "Active", email: "minerva.mcgonagall@school.edu" },
    { id: 5, name: "Charles Xavier", subject: "Genetics", status: "Active", email: "charles.xavier@school.edu" },
  ]);

  const addTeacher = (teacherInput) => {
    const newTeacher = {
      id: Date.now(),
      name: (teacherInput?.name || '').trim(),
      email: (teacherInput?.email || '').trim(),
      subject: (teacherInput?.subject || '').trim() || '—',
      status: 'Active',
    };

    // basic guard: don't add empty names
    if (!newTeacher.name) return;

    setTeachers((prev) => [newTeacher, ...prev]);
  };

  // Make classrooms mutable (same logic pattern as teachers)
  const [classrooms, setClassrooms] = useState([
    { id: 101, year: "2025-26", std: "10", div: "A", classTeacher: "Sarah Connor" },
    { id: 102, year: "2025-26", std: "10", div: "B", classTeacher: "Dr. Emmet Brown" },
    { id: 103, year: "2025-26", std: "9", div: "A", classTeacher: "Walter White" },
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

  const studentsCount = 842;

  const schoolDetails = {
    name: "Springfield High Academy",
    index: "SCH-8829-X"
  };

  const adminProfile = {
    name: "Alex Mercer",
    email: "alex.mercer@admin.edu",
    avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=Alex"
  };

  // Single principal (null = not created yet)
  const [principal, setPrincipal] = useState(null);

  const createPrincipal = (principalInput) => {
    // Only one principal allowed
    if (principal) return;

    const newPrincipal = {
      id: Date.now(),
      name: (principalInput?.name || '').trim(),
      email: (principalInput?.email || '').trim(),
      phone: (principalInput?.phone || '').trim(),
      qualification: (principalInput?.qualification || '').trim(),
      status: 'Active',
    };

    if (!newPrincipal.name || !newPrincipal.email) return;

    setPrincipal(newPrincipal);
  };

  const updatePrincipal = (patch) => {
    setPrincipal((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        ...patch,
        name: (patch?.name ?? prev.name).trim?.() ?? prev.name,
        email: (patch?.email ?? prev.email).trim?.() ?? prev.email,
        phone: (patch?.phone ?? prev.phone).trim?.() ?? prev.phone,
        qualification: (patch?.qualification ?? prev.qualification).trim?.() ?? prev.qualification,
      };
    });
  };

  return (
    <AdminContext.Provider
      value={{
        teachers,
        addTeacher,
        classrooms,
        addClassroom,
        studentsCount,
        schoolDetails,
        adminProfile,
        principal,
        createPrincipal,
        updatePrincipal,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => useContext(AdminContext);
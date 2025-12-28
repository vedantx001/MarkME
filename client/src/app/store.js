// src/app/store.js
import { create } from 'zustand';

export const useAuthStore = create((set) => ({
    user: {
        id: 't-001',
        name: 'Prof. Anderson',
        role: 'teacher',
        schoolId: 'IDX-001'
    },
    isAuthenticated: true,
    login: (userData) => set({ user: userData, isAuthenticated: true }),
    logout: () => set({ user: null, isAuthenticated: false })
}));

export const useAttendanceStore = create((set) => ({
    stage: 'upload', // upload | processing | preview | submitted
    images: [],
    attendanceData: [],

    setStage: (stage) => set({ stage }),
    setImages: (images) => set({ images }),
    setAttendanceData: (data) => set({ attendanceData: data }),

    toggleStudentStatus: (studentId) => set((state) => ({
        attendanceData: state.attendanceData.map(s =>
            s.id === studentId ? { ...s, status: s.status === 'P' ? 'A' : 'P' } : s
        )
    })),

    resetFlow: () => set({ stage: 'upload', images: [], attendanceData: [] })
}));

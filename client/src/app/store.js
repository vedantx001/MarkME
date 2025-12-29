// src/app/store.js
import { create } from 'zustand';

export const useAttendanceStore = create((set) => ({
    stage: 'upload', // upload | processing | preview | submitted
    images: [],
    attendanceData: [],
    sessionId: null,

    setStage: (stage) => set({ stage }),
    setImages: (images) => set({ images }),
    setAttendanceData: (data) => set({ attendanceData: data }),
    setSessionId: (sessionId) => set({ sessionId }),

    toggleStudentStatus: (studentId) => set((state) => ({
        attendanceData: state.attendanceData.map(s =>
            s.id === studentId ? { ...s, status: s.status === 'P' ? 'A' : 'P' } : s
        )
    })),

    syncInitialStatuses: () => set((state) => ({
        attendanceData: state.attendanceData.map(s => ({ ...s, initialStatus: s.status }))
    })),

    resetFlow: () => set({ stage: 'upload', images: [], attendanceData: [], sessionId: null })
}));

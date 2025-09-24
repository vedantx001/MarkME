import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../utils/api';

// Create the context
const ClassroomContext = createContext();

// Create the provider component
export const ClassroomProvider = ({ children }) => {
    const [classrooms, setClassrooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const shapeName = (standard, division) => `Class ${standard} - Section ${division}`;

    const fetchClassrooms = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            if (!token) {
                setClassrooms([]);
                setError('Not authenticated');
                return;
            }
            const res = await api.get('/classrooms');
            const list = Array.isArray(res.data) ? res.data : [];
            const shaped = list.map(c => ({
                id: c._id,
                name: shapeName(c.standard, c.division),
                standard: c.standard,
                division: c.division,
                teacherId: typeof c.teacherId === 'object' ? c.teacherId?._id : c.teacherId,
                teacher: typeof c.teacherId === 'object' ? c.teacherId : undefined,
            }));
            setClassrooms(shaped);
            setError("");
        } catch (e) {
            setError(e?.response?.data?.error || e.message || 'Failed to load classrooms');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClassrooms();
    }, []);

    const createClassroom = async ({ standard, division }) => {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Not authenticated');
        const res = await api.post('/classrooms', { standard: Number(standard), division: String(division).toUpperCase() });
        const c = res.data;
        // Prefer refetch to reflect server-side invariants and avoid duplicates
        await fetchClassrooms();
        return { id: c._id, name: shapeName(c.standard, c.division), standard: c.standard, division: c.division, teacherId: (typeof c.teacherId === 'object' ? c.teacherId?._id : c.teacherId) };
    };

    const deleteClassroom = async (classroomId) => {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Not authenticated');
        await api.delete(`/classrooms/${classroomId}`);
        setClassrooms(prev => prev.filter(c => c.id !== classroomId));
    };

    return (
        <ClassroomContext.Provider value={{ classrooms, loading, error, fetchClassrooms, createClassroom, deleteClassroom }}>
            {children}
        </ClassroomContext.Provider>
    );
};

// Create a custom hook to use the context easily
export const useClassrooms = () => useContext(ClassroomContext);
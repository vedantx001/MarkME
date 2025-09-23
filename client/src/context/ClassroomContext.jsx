import React, { createContext, useState, useContext } from 'react';

// Create the context
const ClassroomContext = createContext();

// Create the provider component
export const ClassroomProvider = ({ children }) => {
    const [classrooms, setClassrooms] = useState([
        { id: 1, name: "Class 6 - Section A" },
        { id: 2, name: "Class 7 - Section B" },
    ]);

    const addClassroom = (newClass) => {
        setClassrooms((prevClassrooms) => [...prevClassrooms, newClass]);
    };

    const deleteClassroom = (classroomId) => {
        setClassrooms((prevClassrooms) =>
            prevClassrooms.filter((classroom) => classroom.id !== classroomId)
        );
    };

    return (
        <ClassroomContext.Provider value={{ classrooms, addClassroom, deleteClassroom }}>
            {children}
        </ClassroomContext.Provider>
    );
};

// Create a custom hook to use the context easily
export const useClassrooms = () => useContext(ClassroomContext);
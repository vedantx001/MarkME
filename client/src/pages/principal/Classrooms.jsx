// src/pages/principal/Classrooms.jsx

import { useNavigate } from "react-router-dom";

const classroomsMock = [
  {
    id: 1,
    name: "CE-A",
    year: "2024–2025",
    students: 60,
    routeId: "ce-a",
  },
  {
    id: 2,
    name: "CE-B",
    year: "2024–2025",
    students: 58,
    routeId: "ce-b",
  },
];

const Classrooms = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <h1 className="font-jakarta text-2xl font-semibold text-(--primary-text)">
        Classrooms
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {classroomsMock.map((cls) => (
          <div
            key={cls.id}
            className="bg-(--primary-bg) border border-black/5 rounded-xl p-6 hover:shadow-md transition-shadow"
            style={{ cursor: "pointer" }}
            onClick={() => navigate(`/principal/classrooms/${cls.routeId}`)}
          >
            <h2 className="font-semibold text-lg text-(--primary-text)">
              {cls.name}
            </h2>
            <p className="text-sm text-(--primary-text)/60">
              Academic Year: {cls.year}
            </p>
            <p className="text-sm mt-2 text-(--primary-text)">
              Students: {cls.students}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Classrooms;

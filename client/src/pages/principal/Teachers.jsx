// src/pages/principal/Teachers.jsx

const teachersMock = [
  { id: 1, name: "Prof. A Mehta", class: "CE-A" },
  { id: 2, name: "Prof. R Shah", class: "CE-B" },
  { id: 3, name: "Prof. S Patel", class: "IT-A" },
];

const Teachers = () => {
  return (
    <div className="space-y-6">
      <h1 className="font-jakarta text-2xl font-semibold text-(--primary-text)">
        Teachers
      </h1>

      <div className="bg-(--primary-bg) rounded-xl border border-black/5 overflow-hidden">
        <table className="w-full">
          <thead className="bg-(--secondary-bg)">
            <tr>
              <th className="px-6 py-3 text-left text-sm text-(--primary-text)/70">
                Name
              </th>
              <th className="px-6 py-3 text-left text-sm text-(--primary-text)/70">
                Assigned Class
              </th>
            </tr>
          </thead>
          <tbody>
            {teachersMock.map((t) => (
              <tr key={t.id} className="border-t">
                <td className="px-6 py-4 text-(--primary-text)">
                  {t.name}
                </td>
                <td className="px-6 py-4 text-(--primary-text)">
                  {t.class}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Teachers;

// src/pages/principal/Dashboard.jsx

import { motion } from "framer-motion";

const statsMock = [
  { label: "Total Classes", value: 12 },
  { label: "Total Teachers", value: 18 },
  { label: "Total Students", value: 540 },
  { label: "Avg Attendance", value: "91%" },
];

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <h1 className="font-jakarta text-2xl font-semibold text-(--primary-text)">
        Principal Dashboard
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsMock.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-(--primary-bg) border border-black/5 rounded-xl p-6"
          >
            <p className="text-sm text-(--primary-text)/60">
              {stat.label}
            </p>
            <p className="text-2xl font-semibold text-(--primary-text)">
              {stat.value}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;

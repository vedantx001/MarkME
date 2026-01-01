// src/pages/principal/Dashboard.jsx

import React, { useMemo } from 'react';
import {
  Users,
  School,
  GraduationCap,
  TrendingUp,
  MoreHorizontal,
  UserCheck,
} from 'lucide-react';
import { useAdmin } from '../../context/adminContext';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

/* =======================
   Reusable Components
======================= */

const StatCard = ({ title, value, icon: Icon, trend }) => (
  <motion.div
    variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
    className="bg-(--primary-bg) p-6 rounded-2xl shadow-sm border border-[rgb(var(--primary-accent-rgb)/0.05)] hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
  >
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 rounded-xl bg-(--secondary-bg) group-hover:bg-(--primary-accent) transition-colors duration-300">
        <Icon
          size={24}
          className="text-(--primary-accent) group-hover:text-(--secondary-accent) transition-colors duration-300"
        />
      </div>

      {trend && (
        <span className="flex items-center gap-1 text-xs font-semibold text-(--primary-accent) bg-(--secondary-accent)/20 px-2 py-1 rounded-full">
          <TrendingUp size={12} />
          {trend}
        </span>
      )}
    </div>

    <h3 className="text-(--primary-accent) opacity-60 text-sm font-medium mb-1">{title}</h3>
    <div className="text-3xl font-bold text-(--primary-text)">{value}</div>
  </motion.div>
);

const RecentListItem = ({ title, subtitle, status }) => {
  const isActive = status?.toLowerCase() === 'active';

  return (
    <div className="flex items-center justify-between p-4 hover:bg-(--secondary-bg) rounded-xl transition-colors cursor-pointer group border-b border-[rgb(var(--primary-accent-rgb)/0.05)] last:border-none">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-(--primary-accent) flex items-center justify-center text-(--secondary-accent) font-bold text-sm shadow-md group-hover:scale-110 transition-transform">
          {title?.charAt(0) || '?'}
        </div>

        <div>
          <h4 className="text-sm font-semibold text-(--primary-text)">{title || 'Unknown'}</h4>
          <p className="text-xs text-(--primary-accent) opacity-60">{subtitle || ''}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-medium border ${isActive
            ? 'bg-(--secondary-bg) text-(--primary-accent) border-[rgb(var(--secondary-accent-rgb)/0.3)]'
            : 'bg-(--primary-bg) text-(--primary-accent) opacity-50 border-[rgb(var(--primary-accent-rgb)/0.1)]'
            }`}
        >
          {status || 'Unknown'}
        </span>

        <button className="text-(--primary-accent) opacity-30 hover:opacity-100 transition-opacity">
          <MoreHorizontal size={18} />
        </button>
      </div>
    </div>
  );
};

/* =======================
   Main Dashboard
======================= */

const Dashboard = () => {
  const admin = useAdmin();
  const navigate = useNavigate();

  if (!admin) return null;

  const { teachers = [], classrooms = [], studentsCount = 0, loading, error } = admin;

  const activeTeachersCount = useMemo(
    () => teachers.filter((t) => (t?.status || '').toLowerCase() === 'active').length,
    [teachers]
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className="max-w-7xl mx-auto"
    >
      {error && (
        <div className="mb-6 text-sm font-semibold rounded-xl px-4 py-3 bg-red-50 text-red-700">
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard title="Total Teachers" value={teachers.length} icon={Users} />
        <StatCard title="Active Teachers" value={activeTeachersCount} icon={UserCheck} />
        <StatCard title="Total Students" value={studentsCount} icon={GraduationCap} />
        <StatCard title="Classrooms" value={classrooms.length} icon={School} />
      </motion.div>

      {loading && (
        <div className="mb-8 text-sm text-(--primary-accent) opacity-60">Refreshing data…</div>
      )}

      {/* Main Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Teachers Section */}
        <motion.div
          variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
          className="lg:col-span-2 bg-(--primary-bg) rounded-3xl shadow-sm border border-[rgb(var(--primary-accent-rgb)/0.05)] overflow-hidden"
        >
          <div className="p-6 border-b border-[rgb(var(--primary-accent-rgb)/0.05)] flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-(--primary-text)">Recent Teachers</h2>
              <p className="text-sm text-(--primary-accent) opacity-60">Overview of faculty members</p>
            </div>

            <button
              onClick={() => navigate('/principal/teachers')}
              className="text-(--secondary-accent) text-sm font-medium hover:text-(--primary-accent) transition-colors"
            >
              View All
            </button>
          </div>

          <div className="p-4">
            {teachers.slice(0, 8).map((teacher) => (
              <RecentListItem key={teacher.id} title={teacher.name} subtitle={teacher.email} status={teacher.status} />
            ))}

            {teachers.length === 0 && (
              <div className="text-sm text-(--primary-accent) opacity-60 p-4">No teachers yet.</div>
            )}
          </div>
        </motion.div>

        {/* Right Panel */}
        <div className="space-y-8">
          {/* Classrooms */}
          <motion.div
            variants={{ hidden: { opacity: 0, x: 20 }, show: { opacity: 1, x: 0 } }}
            className="bg-(--primary-bg) rounded-3xl shadow-sm border border-[rgb(var(--primary-accent-rgb)/0.05)] p-6"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-(--primary-text)">Classrooms</h2>
              <button
                onClick={() => navigate('/principal/classrooms')}
                className="text-(--secondary-accent) text-sm font-medium hover:text-(--primary-accent) transition-colors"
              >
                View All
              </button>
            </div>

            <div className="space-y-4">
              {classrooms.slice(0, 6).map((room) => {
                const occupancy = room.occupancy ?? Math.floor(Math.random() * 80 + 10);

                return (
                  <div
                    key={room.id}
                    onClick={() => navigate(`/principal/classrooms/${room.id}`)}
                    className="group p-4 rounded-2xl bg-(--secondary-bg) hover:border-(--secondary-accent) border border-transparent transition-all cursor-pointer"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-semibold text-(--primary-accent)">{room.name || `Std ${room.std}-${room.div}`}</h4>
                      <span className="text-xs font-bold text-(--primary-accent) opacity-50 bg-(--primary-bg) px-2 py-1 rounded-md shadow-sm">
                        {room.year}
                      </span>
                    </div>

                    <div className="w-full bg-(--primary-bg) rounded-full h-1.5 overflow-hidden">
                      <div className="bg-(--primary-accent) h-full rounded-full" style={{ width: `${occupancy}%` }} />
                    </div>
                  </div>
                );
              })}

              {classrooms.length === 0 && (
                <div className="text-sm text-(--primary-accent) opacity-60">No classrooms yet.</div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;

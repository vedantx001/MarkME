import React from 'react';
import {
  Users,
  School,
  GraduationCap,
  TrendingUp,
  MoreHorizontal,
  Plus,
  ArrowRight
} from 'lucide-react';
import { useAdmin } from '../../context/adminContext';

/* =======================
   Reusable Components
======================= */

const StatCard = ({ title, value, icon: Icon, trend }) => (
  <div className="bg-[#FBFDFF] p-6 rounded-2xl shadow-sm border border-[#2D3748]/5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 rounded-xl bg-[#F2F8FF] group-hover:bg-[#2D3748] transition-colors duration-300">
        <Icon
          size={24}
          className="text-[#2D3748] group-hover:text-[#85C7F2] transition-colors duration-300"
        />
      </div>

      {trend && (
        <span className="flex items-center gap-1 text-xs font-semibold text-[#2D3748] bg-[#85C7F2]/20 px-2 py-1 rounded-full">
          <TrendingUp size={12} />
          {trend}
        </span>
      )}
    </div>

    <h3 className="text-[#2D3748]/60 text-sm font-medium mb-1">{title}</h3>
    <div className="text-3xl font-bold text-[#0E0E11]">{value}</div>
  </div>
);

const RecentListItem = ({ title, subtitle, status }) => {
  const isActive = status?.toLowerCase() === 'active';

  return (
    <div className="flex items-center justify-between p-4 hover:bg-[#F2F8FF] rounded-xl transition-colors cursor-pointer group border-b border-[#F2F8FF] last:border-none">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-[#2D3748] flex items-center justify-center text-[#85C7F2] font-bold text-sm shadow-md group-hover:scale-110 transition-transform">
          {title?.charAt(0) || '?'}
        </div>

        <div>
          <h4 className="text-sm font-semibold text-[#0E0E11]">
            {title || 'Unknown'}
          </h4>
          <p className="text-xs text-[#2D3748]/60">
            {subtitle || '—'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
            isActive
              ? 'bg-[#F2F8FF] text-[#2D3748] border-[#85C7F2]/30'
              : 'bg-[#FBFDFF] text-[#2D3748]/50 border-[#2D3748]/10'
          }`}
        >
          {status || 'Unknown'}
        </span>

        <button className="text-[#2D3748]/30 hover:text-[#0E0E11]">
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

  if (!admin) return null;

  const { teachers = [], classrooms = [], studentsCount = 0, loading, error } = admin;

  return (
    <div className="max-w-7xl mx-auto">
      {error && (
        <div className="mb-6 text-sm font-semibold rounded-xl px-4 py-3 bg-red-50 text-red-700">
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard title="Total Teachers" value={teachers.length} icon={Users} />
        <StatCard title="Total Students" value={studentsCount} icon={GraduationCap} />
        <StatCard title="Classrooms" value={classrooms.length} icon={School} />
        <StatCard title="Attendance" value="—" icon={TrendingUp} />
      </div>

      {loading && (
        <div className="mb-8 text-sm text-[#2D3748]/60">Refreshing data…</div>
      )}

      {/* Main Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Teachers Section */}
        <div className="lg:col-span-2 bg-[#FBFDFF] rounded-3xl shadow-sm border border-[#2D3748]/5 overflow-hidden">
          <div className="p-6 border-b border-[#F2F8FF] flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-[#0E0E11]">Recent Teachers</h2>
              <p className="text-sm text-[#2D3748]/60">Overview of faculty members</p>
            </div>

            <button className="flex items-center gap-2 text-sm font-semibold text-[#FBFDFF] bg-[#2D3748] px-4 py-2 rounded-lg hover:bg-[#0E0E11] transition-colors shadow-lg shadow-[#2D3748]/20">
              <Plus size={16} />
              Add New
            </button>
          </div>

          <div className="p-4">
            {teachers.slice(0, 8).map((teacher) => (
              <RecentListItem
                key={teacher.id}
                title={teacher.name}
                subtitle={teacher.email}
                status={teacher.status}
              />
            ))}
          </div>
        </div>

        {/* Right Panel */}
        <div className="space-y-8">
          {/* Classrooms */}
          <div className="bg-[#FBFDFF] rounded-3xl shadow-sm border border-[#2D3748]/5 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-[#0E0E11]">Classrooms</h2>
              <button className="text-[#85C7F2] text-sm font-medium hover:text-[#2D3748] transition-colors">
                View All
              </button>
            </div>

            <div className="space-y-4">
              {classrooms.slice(0, 6).map((room) => {
                const occupancy = room.occupancy ?? Math.floor(Math.random() * 80 + 10);

                return (
                  <div
                    key={room.id}
                    className="group p-4 rounded-2xl bg-[#F2F8FF] hover:border-[#85C7F2] transition-all cursor-pointer"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-semibold text-[#2D3748]">
                        {room.name || `Std ${room.std}-${room.div}`}
                      </h4>
                      <span className="text-xs font-bold text-[#2D3748]/50 bg-[#FBFDFF] px-2 py-1 rounded-md shadow-sm">
                        {room.year}
                      </span>
                    </div>

                    <div className="w-full bg-[#FBFDFF] rounded-full h-1.5 overflow-hidden">
                      <div className="bg-[#2D3748] h-full rounded-full" style={{ width: `${occupancy}%` }} />
                    </div>
                  </div>
                );
              })}

              {classrooms.length === 0 && (
                <div className="text-sm text-[#2D3748]/60">No classrooms yet.</div>
              )}
            </div>
          </div>

          {/* Promo */}
          <div className="relative overflow-hidden rounded-3xl bg-[#2D3748] p-8 text-[#FBFDFF] shadow-xl shadow-[#2D3748]/20">
            <h3 className="text-xl font-bold mb-2">Premium Features</h3>
            <p className="text-[#85C7F2] text-sm mb-6">
              Unlock advanced analytics and reporting tools.
            </p>

            <button className="flex items-center gap-2 bg-[#85C7F2] text-[#0E0E11] px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-[#FBFDFF] transition-colors shadow-md">
              Upgrade Now
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

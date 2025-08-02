// components/admin/OverviewDashboard.tsx
"use client"

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'; // Re-introducing Recharts for data visualization

// Assuming AdminStats now includes data for charts
// For example:
// interface AdminStats {
//   totalStudents?: number;
//   totalEmployers?: number;
//   totalAdmins?: number;
//   activeLogins?: number;
//   newStudentsByDay?: { date: string; count: number }[]; // For Bar Chart
//   userDistribution?: { name: string; value: number; color: string }[]; // For Pie Chart
// }
import { AdminStats } from '@/types/admin-types';

interface OverviewDashboardProps {
  stats: AdminStats | null;
  loading: boolean;
  error: string | null;
}

export function OverviewDashboard({ stats, loading, error }: OverviewDashboardProps) {
  const currentStats = stats || {};

  // Example data for charts if `stats` doesn't provide them directly
  // In a real application, this data would come from `stats`
  const defaultNewStudentsData = [
    { date: 'Jul 26', count: 15 },
    { date: 'Jul 27', count: 22 },
    { date: 'Jul 28', count: 18 },
    { date: 'Jul 29', count: 25 },
    { date: 'Jul 30', count: 30 },
    { date: 'Jul 31', count: 28 },
    { date: 'Aug 01', count: 35 },
  ];

  const defaultUserDistributionData = [
    { name: 'Students', value: currentStats.totalStudents || 400, color: '#8884d8' },
    { name: 'Employers', value: currentStats.totalEmployers || 150, color: '#82ca9d' },
    { name: 'Admins', value: currentStats.totalAdmins || 10, color: '#ffc658' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-lg text-gray-400 animate-pulse">Loading dashboard data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-lg text-red-500">Error: {error}. Please try refreshing.</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-lg text-gray-400">No data available for the dashboard.</p>
      </div>
    );
  }

  // Use actual data from stats if available, otherwise use default
  const newStudentsByDay = currentStats.newStudentsByDay || defaultNewStudentsData;
  const userDistribution = currentStats.userDistribution || defaultUserDistributionData;


  // Colors for the Pie Chart, ensuring they match default if provided
  const PIE_COLORS = userDistribution.map(data => data.color);


  return (
    <div className="space-y-8 p-6 bg-gray-900 min-h-screen text-gray-100">
      <h2 className="text-4xl font-extrabold text-center mb-8 bg-gradient-to-r from-purple-400 to-blue-500 text-transparent bg-clip-text">
        Admin Dashboard
      </h2>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Number of Students Card */}
        <Card className="bg-gray-800 border border-gray-700 shadow-xl transition-all duration-300 hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-base font-semibold text-gray-300">Total Students</CardTitle>
            <span className="text-2xl text-purple-400">🎓</span>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-white tracking-tight">{currentStats.totalStudents?.toLocaleString() || '0'}</div>
          </CardContent>
        </Card>

        {/* Number of Employers Card */}
        <Card className="bg-gray-800 border border-gray-700 shadow-xl transition-all duration-300 hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-base font-semibold text-gray-300">Total Employers</CardTitle>
            <span className="text-2xl text-blue-400">🏢</span>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-white tracking-tight">{currentStats.totalEmployers?.toLocaleString() || '0'}</div>
          </CardContent>
        </Card>

        {/* Number of Admins Card */}
        <Card className="bg-gray-800 border border-gray-700 shadow-xl transition-all duration-300 hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-base font-semibold text-gray-300">Total Admins</CardTitle>
            <span className="text-2xl text-yellow-400">👑</span>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-white tracking-tight">{currentStats.totalAdmins?.toLocaleString() || '0'}</div>
          </CardContent>
        </Card>

        {/* Number of Active Logins Card */}
        <Card className="bg-gray-800 border border-gray-700 shadow-xl transition-all duration-300 hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-base font-semibold text-gray-300">Active Logins (Now)</CardTitle>
            <span className="text-2xl text-green-400">⚡</span>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-white tracking-tight">{currentStats.activeLogins?.toLocaleString() || '0'}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        {/* New Students Over Time Chart */}
        <Card className="bg-gray-800 border border-gray-700 shadow-xl p-4">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-200">New Students Last 7 Days</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={newStudentsByDay} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <XAxis dataKey="date" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.1)' }}
                  contentStyle={{ backgroundColor: '#374151', border: 'none', borderRadius: '4px', color: '#e5e7eb' }}
                  labelStyle={{ color: '#9ca3af' }}
                />
                <Bar dataKey="count" fill="#8884d8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* User Distribution Chart */}
        <Card className="bg-gray-800 border border-gray-700 shadow-xl p-4">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-200">User Type Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-80 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={userDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  animationDuration={800}
                >
                  {userDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#374151', border: 'none', borderRadius: '4px', color: '#e5e7eb' }}
                  labelStyle={{ color: '#9ca3af' }}
                />
                <Legend layout="vertical" align="right" verticalAlign="middle" wrapperStyle={{ color: '#9ca3af' }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
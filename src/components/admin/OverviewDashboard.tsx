"use client"

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, CartesianGrid
} from 'recharts';
import { AdminStats } from '@/types/admin-types';
import {
  TooltipProps,
  ValueType,
  NameType,
} from 'recharts/types/component/Tooltip';

interface OverviewDashboardProps {
  stats: AdminStats | null;
  loading: boolean;
  error: string | null;
}

// Custom Tooltip Component to show the original database date
const CustomTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const studentsValue = payload.find(p => p.dataKey === 'students')?.value || 0;
    const employersValue = payload.find(p => p.dataKey === 'employers')?.value || 0;
    
    return (
      <div className="bg-gray-800 p-3 rounded-lg border border-gray-700 shadow-lg text-gray-200">
        {/* Display the originalDate from the data payload */}
        <p className="font-bold mb-1">{`Date: ${data.originalDate}`}</p>
        <p className="text-purple-400">{`New Students: ${studentsValue}`}</p>
        <p className="text-green-400">{`New Employers: ${employersValue}`}</p>
      </div>
    );
  }

  return null;
};


export function OverviewDashboard({ stats, loading, error }: OverviewDashboardProps) {
  const currentStats = stats || {};

  // Generate an array of the last 7 days (Date objects for robust comparison)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  const lastSevenDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(sevenDaysAgo);
    d.setDate(d.getDate() + i);
    return d;
  });

  // Create full data set, filling in zeros for days with no registrations
  const dailyRegistrations = lastSevenDays.map(dateObject => {
    const isSameDay = (d1: Date, d2: Date) => 
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate();

    const dateString = dateObject.toISOString().split('T')[0];

    const studentData = (currentStats.newStudentsByDay || []).find(e => isSameDay(new Date(e.date), dateObject));
    const employerData = (currentStats.newEmployersByDay || []).find(e => isSameDay(new Date(e.date), dateObject));
    
    const formattedDate = dateObject.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });

    return {
      date: formattedDate,
      originalDate: dateString,
      students: studentData ? studentData.count : 0,
      employers: employerData ? employerData.count : 0,
    };
  });

  // Reverting to original color hex codes
  const userDistribution = [
    { name: 'Students', value: currentStats.totalStudents || 0, color: '#6366f1' },
    { name: 'Employers', value: currentStats.totalEmployers || 0, color: '#4ade80' },
    { name: 'Admins', value: currentStats.totalAdmins || 0, color: '#f59e0b' },
  ];
  const PIE_COLORS = userDistribution.map(data => data.color);

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

  return (
    <div className="space-y-8 p-1 bg-gray-900 min-h-screen text-gray-100">
      <h2 className="text-4xl font-extrabold text-center mb-8 bg-gradient-to-r from-purple-400 to-blue-500 text-transparent bg-clip-text">
        Admin Dashboard
      </h2>
      
      <style jsx global>{`
        .chart-container *:focus {
          outline: none;
        }
      `}</style>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gray-800 border border-gray-700 shadow-xl transition-all duration-300 hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-base font-semibold text-gray-300">Total Students</CardTitle>
            <span className="text-2xl text-purple-400">🎓</span>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-white tracking-tight">{currentStats.totalStudents?.toLocaleString() || '0'}</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border border-gray-700 shadow-xl transition-all duration-300 hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-base font-semibold text-gray-300">Total Employers</CardTitle>
            <span className="text-2xl text-blue-400">🏢</span>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-white tracking-tight">{currentStats.totalEmployers?.toLocaleString() || '0'}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border border-gray-700 shadow-xl transition-all duration-300 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-base font-semibold text-gray-300">Total Admins</CardTitle>
              <span className="text-2xl text-yellow-400">👑</span>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-white tracking-tight">{currentStats.totalAdmins?.toLocaleString() || '0'}</div>
            </CardContent>
          </Card>

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
          <Card className="bg-gray-800 border border-gray-700 shadow-xl p-4">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-200">
                Daily Registrations Last 7 Days
              </CardTitle>
            </CardHeader>
            <CardContent className="h-80 chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyRegistrations} margin={{ top: 5, right: 30, left: -30, bottom: 5 }} barCategoryGap="20%">
                    <XAxis dataKey="date" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip
                      cursor={false}
                      contentStyle={{ backgroundColor: '#374151', border: 'none', borderRadius: '8px', color: '#e5e7eb' }}
                      labelStyle={{ color: '#9ca3af' }}
                      content={<CustomTooltip />}
                    />
                    <Legend wrapperStyle={{ paddingTop: '10px' }} />
                    <Bar dataKey="students" fill="#6366f1" fillOpacity={0.8} name="New Students" stackId="a" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="employers" fill="#4ade80" fillOpacity={0.8} name="New Employers" stackId="a" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border border-gray-700 shadow-xl p-4">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-200">User Type Distribution</CardTitle>
            </CardHeader>
            <CardContent className="h-80 chart-container">
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
                    fillOpacity={0.8}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {userDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                      contentStyle={{ backgroundColor: '#374151', border: 'none', borderRadius: '8px',  padding: '2px 8px', color: '#e5e7eb' }}
                    labelStyle={{ color: '#9ca3af' }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
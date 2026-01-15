import React, { useState, useEffect } from 'react';
import { dashboardApi } from '../../../api';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const statsData = await dashboardApi.getStats();
        setStats(statsData);
      } catch (err) {
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-medium text-gray-600 mb-2">Total Projects</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.totalProjects}</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-medium text-gray-600 mb-2">Total Clients</h3>
            <p className="text-3xl font-bold text-green-600">{stats.totalClients}</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-medium text-gray-600 mb-2">Pending Projects</h3>
            <p className="text-3xl font-bold text-yellow-600">{stats.pendingProjects}</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-medium text-gray-600 mb-2">Completed Projects</h3>
            <p className="text-3xl font-bold text-purple-600">{stats.completedProjects}</p>
          </div>
        </div>
        
        {/* Charts/Graphs Section */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Project Analytics</h2>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-500">Analytics charts would be displayed here</p>
          </div>
        </div>
        
        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            <div className="border-b pb-4">
              <p className="text-gray-600">Project "Website Redesign" was created</p>
              <p className="text-sm text-gray-400">2 hours ago</p>
            </div>
            <div className="border-b pb-4">
              <p className="text-gray-600">New client "Acme Corp" registered</p>
              <p className="text-sm text-gray-400">5 hours ago</p>
            </div>
            <div>
              <p className="text-gray-600">Service "Mobile App Development" was updated</p>
              <p className="text-sm text-gray-400">1 day ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
import { useEffect, useState } from "react";
import axios from "axios";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalInterviews: 0,
    upcomingInterviews: 0,
    completedInterviews: 0,
    totalQuestions: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // In demo mode, we'll show mock data since authentication is disabled
        // In production, this would use proper authentication
        setStats({
          totalInterviews: 5,
          upcomingInterviews: 2,
          completedInterviews: 3,
          totalQuestions: 12
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
        // Show demo data on error
        setStats({
          totalInterviews: 5,
          upcomingInterviews: 2,
          completedInterviews: 3,
          totalQuestions: 12
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-lg">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Interviews</h3>
          <p className="text-3xl font-bold text-blue-600">{stats.totalInterviews}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Upcoming Interviews</h3>
          <p className="text-3xl font-bold text-yellow-600">{stats.upcomingInterviews}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Completed Interviews</h3>
          <p className="text-3xl font-bold text-green-600">{stats.completedInterviews}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Questions</h3>
          <p className="text-3xl font-bold text-purple-600">{stats.totalQuestions}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/interviews/create"
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-center hover:bg-blue-700"
          >
            Schedule Interview
          </a>
          <a
            href="/questions/create"
            className="bg-green-600 text-white px-4 py-2 rounded-md text-center hover:bg-green-700"
          >
            Create Question
          </a>
          <a
            href="/interviews"
            className="bg-purple-600 text-white px-4 py-2 rounded-md text-center hover:bg-purple-700"
          >
            View Interviews
          </a>
        </div>
      </div>

      <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">Demo Mode Notice</h3>
        <p className="text-yellow-700">
          This dashboard is showing demo data. Authentication is currently disabled.
          To enable full functionality, configure Clerk authentication with valid API keys.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
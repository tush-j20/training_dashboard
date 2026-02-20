import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';

interface DashboardStats {
  total_trainings: number;
  total_hours: number;
  active_trainers: number;
  by_status: {
    planned: number;
    ongoing: number;
    completed: number;
    cancelled: number;
  };
  by_type: {
    client: number;
    internal: number;
  };
}

interface Training {
  id: number;
  title: string;
  start_date: string;
  trainer_name: string;
  status: string;
  type: string;
}

export default function Dashboard() {
  const { token, user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [upcoming, setUpcoming] = useState<Training[]>([]);
  const [recent, setRecent] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<{ stats: DashboardStats; upcoming_trainings: Training[]; recent_completed: Training[] }>(
      '/dashboard/stats',
      { token }
    )
      .then(data => {
        setStats(data.stats);
        setUpcoming(data.upcoming_trainings);
        setRecent(data.recent_completed);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    planned: 'bg-blue-100 text-blue-800',
    ongoing: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.name}</p>
        </div>
        <Link to="/trainings/new" className="btn btn-primary">
          + New Training
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <p className="text-sm text-gray-500 uppercase tracking-wide">Total Trainings</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.total_trainings || 0}</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-gray-500 uppercase tracking-wide">Hours Delivered</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.total_hours || 0}</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-gray-500 uppercase tracking-wide">Completed</p>
          <p className="text-3xl font-bold text-green-600 mt-1">{stats?.by_status.completed || 0}</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-gray-500 uppercase tracking-wide">Planned</p>
          <p className="text-3xl font-bold text-blue-600 mt-1">{stats?.by_status.planned || 0}</p>
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Status Overview</h2>
          <div className="space-y-3">
            {['planned', 'ongoing', 'completed', 'cancelled'].map(status => (
              <div key={status} className="flex items-center justify-between">
                <span className="capitalize text-gray-700">{status}</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[status]}`}>
                  {stats?.by_status[status as keyof typeof stats.by_status] || 0}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">By Type</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Client Trainings</span>
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                {stats?.by_type.client || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Internal Trainings</span>
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                {stats?.by_type.internal || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming & Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Trainings</h2>
          {upcoming.length === 0 ? (
            <p className="text-gray-500 text-sm">No upcoming trainings</p>
          ) : (
            <div className="space-y-3">
              {upcoming.map(t => (
                <Link
                  key={t.id}
                  to={`/trainings/${t.id}`}
                  className="block p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <p className="font-medium text-gray-900">{t.title}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(t.start_date).toLocaleDateString()} • {t.trainer_name}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recently Completed</h2>
          {recent.length === 0 ? (
            <p className="text-gray-500 text-sm">No completed trainings yet</p>
          ) : (
            <div className="space-y-3">
              {recent.map(t => (
                <Link
                  key={t.id}
                  to={`/trainings/${t.id}`}
                  className="block p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <p className="font-medium text-gray-900">{t.title}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(t.start_date).toLocaleDateString()} • {t.trainer_name}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

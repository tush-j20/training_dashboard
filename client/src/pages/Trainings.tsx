import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';

interface Training {
  id: number;
  title: string;
  description: string;
  type: string;
  status: string;
  start_date: string;
  end_date: string;
  trainer_name: string;
  trainer_id: number;
  duration_minutes: number;
  location: string;
  product_names: string;
}

export default function Trainings() {
  const { token } = useAuth();
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    status: '',
    type: '',
  });

  useEffect(() => {
    loadTrainings();
  }, [token, filter]);

  const loadTrainings = () => {
    const params = new URLSearchParams();
    if (filter.status) params.append('status', filter.status);
    if (filter.type) params.append('type', filter.type);
    
    api<{ trainings: Training[] }>(`/trainings?${params}`, { token })
      .then(data => setTrainings(data.trainings))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const updateStatus = async (id: number, status: string) => {
    try {
      await api(`/trainings/${id}/status`, {
        method: 'PATCH',
        body: { status },
        token,
      });
      loadTrainings();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const statusColors: Record<string, string> = {
    planned: 'bg-blue-100 text-blue-800',
    ongoing: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  const typeColors: Record<string, string> = {
    client: 'bg-purple-100 text-purple-800',
    internal: 'bg-indigo-100 text-indigo-800',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading trainings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Trainings</h1>
        <Link to="/trainings/new" className="btn btn-primary">
          + New Training
        </Link>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            value={filter.status}
            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            className="input w-40"
          >
            <option value="">All</option>
            <option value="planned">Planned</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
          <select
            value={filter.type}
            onChange={(e) => setFilter({ ...filter, type: e.target.value })}
            className="input w-40"
          >
            <option value="">All</option>
            <option value="client">Client</option>
            <option value="internal">Internal</option>
          </select>
        </div>
      </div>

      {/* Trainings List */}
      {trainings.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-gray-500">No trainings found</p>
          <Link to="/trainings/new" className="btn btn-primary mt-4 inline-block">
            Create your first training
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {trainings.map(training => (
            <div key={training.id} className="card p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Link
                      to={`/trainings/${training.id}`}
                      className="text-lg font-semibold text-gray-900 hover:text-blue-600"
                    >
                      {training.title}
                    </Link>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[training.status]}`}>
                      {training.status}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${typeColors[training.type]}`}>
                      {training.type}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {training.description || 'No description'}
                  </p>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <span>📅 {new Date(training.start_date).toLocaleDateString()}</span>
                    <span>👤 {training.trainer_name}</span>
                    {training.duration_minutes && (
                      <span>⏱️ {Math.round(training.duration_minutes / 60 * 10) / 10}h</span>
                    )}
                    {training.location && <span>📍 {training.location}</span>}
                    {training.product_names && <span>📦 {training.product_names}</span>}
                  </div>
                </div>
                
                <div className="flex gap-2 ml-4">
                  {training.status === 'planned' && (
                    <button
                      onClick={() => updateStatus(training.id, 'ongoing')}
                      className="text-sm text-yellow-600 hover:text-yellow-800"
                    >
                      Start
                    </button>
                  )}
                  {training.status === 'ongoing' && (
                    <button
                      onClick={() => updateStatus(training.id, 'completed')}
                      className="text-sm text-green-600 hover:text-green-800"
                    >
                      Complete
                    </button>
                  )}
                  <Link
                    to={`/trainings/${training.id}/edit`}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

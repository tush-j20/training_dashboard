import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';

interface Product {
  id: number;
  name: string;
}

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
  meeting_link: string;
  attendee_count: number;
  actual_attendee_count: number;
  notes: string;
  products: Product[];
}

export default function TrainingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [training, setTraining] = useState<Training | null>(null);
  const [loading, setLoading] = useState(true);

  const canEdit = user?.role === 'admin' || user?.role === 'manager' || user?.id === training?.trainer_id;
  const canDelete = user?.role === 'admin' || user?.role === 'manager';

  useEffect(() => {
    api<{ training: Training }>(`/trainings/${id}`, { token })
      .then(data => setTraining(data.training))
      .catch(err => {
        console.error(err);
        navigate('/trainings');
      })
      .finally(() => setLoading(false));
  }, [id, token, navigate]);

  const updateStatus = async (status: string) => {
    try {
      await api(`/trainings/${id}/status`, { method: 'PATCH', body: { status }, token });
      setTraining(prev => prev ? { ...prev, status } : null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this training?')) return;
    
    try {
      await api(`/trainings/${id}`, { method: 'DELETE', token });
      navigate('/trainings');
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!training) return null;

  const statusColors: Record<string, string> = {
    planned: 'bg-blue-100 text-blue-800',
    ongoing: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link to="/trainings" className="hover:text-blue-600">Trainings</Link>
        <span>/</span>
        <span>{training.title}</span>
      </div>

      <div className="card p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{training.title}</h1>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[training.status]}`}>
                {training.status}
              </span>
            </div>
            <p className="text-gray-600">{training.description || 'No description'}</p>
          </div>
          
          <div className="flex gap-2">
            {canEdit && (
              <Link to={`/trainings/${id}/edit`} className="btn btn-secondary">
                Edit
              </Link>
            )}
            {canDelete && (
              <button onClick={handleDelete} className="btn btn-danger">
                Delete
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <p className="text-sm text-gray-500 mb-1">Type</p>
            <p className="font-medium capitalize">{training.type} Training</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Trainer</p>
            <p className="font-medium">{training.trainer_name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Start</p>
            <p className="font-medium">{new Date(training.start_date).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">End</p>
            <p className="font-medium">{new Date(training.end_date).toLocaleString()}</p>
          </div>
          {training.duration_minutes && (
            <div>
              <p className="text-sm text-gray-500 mb-1">Duration</p>
              <p className="font-medium">{Math.round(training.duration_minutes / 60 * 10) / 10} hours</p>
            </div>
          )}
          {training.attendee_count && (
            <div>
              <p className="text-sm text-gray-500 mb-1">Expected Attendees</p>
              <p className="font-medium">{training.attendee_count}</p>
            </div>
          )}
          {training.location && (
            <div>
              <p className="text-sm text-gray-500 mb-1">Location</p>
              <p className="font-medium">{training.location}</p>
            </div>
          )}
          {training.meeting_link && (
            <div>
              <p className="text-sm text-gray-500 mb-1">Meeting Link</p>
              <a href={training.meeting_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                Join Meeting
              </a>
            </div>
          )}
        </div>

        {training.products && training.products.length > 0 && (
          <div className="mb-6">
            <p className="text-sm text-gray-500 mb-2">Products/Topics</p>
            <div className="flex flex-wrap gap-2">
              {training.products.map(p => (
                <span key={p.id} className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                  {p.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {training.notes && (
          <div className="mb-6">
            <p className="text-sm text-gray-500 mb-1">Notes</p>
            <p className="text-gray-700 whitespace-pre-wrap">{training.notes}</p>
          </div>
        )}

        {/* Status Actions */}
        {canEdit && training.status !== 'completed' && training.status !== 'cancelled' && (
          <div className="border-t pt-6 flex gap-3">
            {training.status === 'planned' && (
              <>
                <button onClick={() => updateStatus('ongoing')} className="btn btn-primary">
                  Start Training
                </button>
                <button onClick={() => updateStatus('cancelled')} className="btn btn-secondary">
                  Cancel Training
                </button>
              </>
            )}
            {training.status === 'ongoing' && (
              <>
                <button onClick={() => updateStatus('completed')} className="btn btn-primary">
                  Mark as Completed
                </button>
                <button onClick={() => updateStatus('cancelled')} className="btn btn-secondary">
                  Cancel Training
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

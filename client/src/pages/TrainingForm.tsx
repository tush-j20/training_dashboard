import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';

interface Product {
  id: number;
  name: string;
  category: string;
}

interface Trainer {
  id: number;
  name: string;
  email: string;
}

interface TrainingData {
  title: string;
  description: string;
  type: string;
  trainer_id: number | string;
  start_date: string;
  end_date: string;
  duration_minutes: number | string;
  location: string;
  meeting_link: string;
  attendee_count: number | string;
  notes: string;
  product_ids: number[];
  status?: string;
}

export default function TrainingForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);

  const [form, setForm] = useState<TrainingData>({
    title: '',
    description: '',
    type: 'client',
    trainer_id: user?.id || '',
    start_date: '',
    end_date: '',
    duration_minutes: '',
    location: '',
    meeting_link: '',
    attendee_count: '',
    notes: '',
    product_ids: [],
  });

  useEffect(() => {
    Promise.all([
      api<{ products: Product[] }>('/products?active_only=true', { token }),
      api<{ trainers: Trainer[] }>('/users/trainers', { token }),
    ]).then(([productsData, trainersData]) => {
      setProducts(productsData.products);
      setTrainers(trainersData.trainers);
    });

    if (isEdit) {
      setLoading(true);
      api<{ training: TrainingData & { products: Product[] } }>(`/trainings/${id}`, { token })
        .then(data => {
          const t = data.training;
          setForm({
            title: t.title,
            description: t.description || '',
            type: t.type,
            trainer_id: t.trainer_id,
            start_date: t.start_date.slice(0, 16),
            end_date: t.end_date.slice(0, 16),
            duration_minutes: t.duration_minutes || '',
            location: t.location || '',
            meeting_link: t.meeting_link || '',
            attendee_count: t.attendee_count || '',
            notes: t.notes || '',
            product_ids: t.products?.map(p => p.id) || [],
            status: t.status,
          });
        })
        .catch(err => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [id, token, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const payload = {
        ...form,
        trainer_id: Number(form.trainer_id),
        duration_minutes: form.duration_minutes ? Number(form.duration_minutes) : null,
        attendee_count: form.attendee_count ? Number(form.attendee_count) : null,
      };

      if (isEdit) {
        await api(`/trainings/${id}`, { method: 'PUT', body: payload, token });
      } else {
        await api('/trainings', { method: 'POST', body: payload, token });
      }
      navigate('/trainings');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save training');
    } finally {
      setSaving(false);
    }
  };

  const handleProductToggle = (productId: number) => {
    setForm(prev => ({
      ...prev,
      product_ids: prev.product_ids.includes(productId)
        ? prev.product_ids.filter(id => id !== productId)
        : [...prev.product_ids, productId],
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {isEdit ? 'Edit Training' : 'New Training'}
      </h1>

      <form onSubmit={handleSubmit} className="card p-6 space-y-6">
        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title *
          </label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="input"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="input h-24"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type *
            </label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="input"
              required
            >
              <option value="client">Client Training</option>
              <option value="internal">Internal Training</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trainer *
            </label>
            <select
              value={form.trainer_id}
              onChange={(e) => setForm({ ...form, trainer_id: e.target.value })}
              className="input"
              required
              disabled={user?.role === 'trainer'}
            >
              <option value="">Select trainer</option>
              {trainers.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date & Time *
            </label>
            <input
              type="datetime-local"
              value={form.start_date}
              onChange={(e) => setForm({ ...form, start_date: e.target.value })}
              className="input"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date & Time *
            </label>
            <input
              type="datetime-local"
              value={form.end_date}
              onChange={(e) => setForm({ ...form, end_date: e.target.value })}
              className="input"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duration (minutes)
            </label>
            <input
              type="number"
              value={form.duration_minutes}
              onChange={(e) => setForm({ ...form, duration_minutes: e.target.value })}
              className="input"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expected Attendees
            </label>
            <input
              type="number"
              value={form.attendee_count}
              onChange={(e) => setForm({ ...form, attendee_count: e.target.value })}
              className="input"
              min="0"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Location
          </label>
          <input
            type="text"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            className="input"
            placeholder="Room name or address"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Meeting Link
          </label>
          <input
            type="url"
            value={form.meeting_link}
            onChange={(e) => setForm({ ...form, meeting_link: e.target.value })}
            className="input"
            placeholder="https://teams.microsoft.com/..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Products/Topics
          </label>
          <div className="flex flex-wrap gap-2">
            {products.map(product => (
              <button
                key={product.id}
                type="button"
                onClick={() => handleProductToggle(product.id)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  form.product_ids.includes(product.id)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {product.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="input h-24"
            rows={3}
            placeholder="Any additional notes..."
          />
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary flex-1 disabled:opacity-50"
          >
            {saving ? 'Saving...' : isEdit ? 'Update Training' : 'Create Training'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/trainings')}
            className="btn btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

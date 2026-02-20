import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

interface FormData {
  training_title: string;
  trainer_name: string;
  start_date: string;
  products: string[];
}

export default function FeedbackForm() {
  const { token } = useParams();
  const [formData, setFormData] = useState<FormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [response, setResponse] = useState({
    respondent_name: '',
    respondent_email: '',
    overall_rating: 0,
    content_quality: 0,
    trainer_effectiveness: 0,
    relevance: 0,
    pace: '',
    key_takeaways: '',
    suggestions: '',
    would_recommend: true,
    additional_comments: '',
  });

  const API_BASE = import.meta.env.PROD ? '/api' : 'http://localhost:3001/api';

  useEffect(() => {
    fetch(`${API_BASE}/feedback/form/${token}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
        } else {
          setFormData(data.form);
        }
      })
      .catch(() => setError('Failed to load feedback form'))
      .finally(() => setLoading(false));
  }, [token, API_BASE]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (response.overall_rating === 0) {
      setError('Please provide an overall rating');
      return;
    }
    
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE}/feedback/submit/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(response),
      });
      const data = await res.json();
      
      if (data.error) {
        setError(data.error);
      } else {
        setSubmitted(true);
      }
    } catch {
      setError('Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  const StarRating = ({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className={`text-3xl transition-colors ${star <= value ? 'text-yellow-400' : 'text-gray-300'}`}
          >
            ★
          </button>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (error && !formData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="card p-8 max-w-md text-center">
          <h1 className="text-xl font-bold text-red-600 mb-2">Error</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="card p-8 max-w-md text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold text-green-600 mb-2">Thank You!</h1>
          <p className="text-gray-600">Your feedback has been submitted successfully.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="card p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Training Feedback</h1>
          <div className="text-gray-600">
            <p className="font-medium">{formData?.training_title}</p>
            <p className="text-sm">Trainer: {formData?.trainer_name}</p>
            <p className="text-sm">Date: {formData?.start_date ? new Date(formData.start_date).toLocaleDateString() : ''}</p>
            {formData?.products && formData.products.length > 0 && (
              <p className="text-sm">Topics: {formData.products.join(', ')}</p>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="card p-6 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Name (optional)</label>
              <input
                type="text"
                value={response.respondent_name}
                onChange={(e) => setResponse({ ...response, respondent_name: e.target.value })}
                className="input"
                placeholder="Anonymous"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Email (optional)</label>
              <input
                type="email"
                value={response.respondent_email}
                onChange={(e) => setResponse({ ...response, respondent_email: e.target.value })}
                className="input"
              />
            </div>
          </div>

          <div className="border-t pt-6">
            <h2 className="text-lg font-semibold mb-4">Rate Your Experience</h2>
            
            <StarRating
              label="Overall Rating *"
              value={response.overall_rating}
              onChange={(v) => setResponse({ ...response, overall_rating: v })}
            />
            
            <StarRating
              label="Content Quality"
              value={response.content_quality}
              onChange={(v) => setResponse({ ...response, content_quality: v })}
            />
            
            <StarRating
              label="Trainer Effectiveness"
              value={response.trainer_effectiveness}
              onChange={(v) => setResponse({ ...response, trainer_effectiveness: v })}
            />
            
            <StarRating
              label="Relevance to Your Role"
              value={response.relevance}
              onChange={(v) => setResponse({ ...response, relevance: v })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Training Pace</label>
            <div className="flex gap-4">
              {[
                { value: 'too_slow', label: 'Too Slow' },
                { value: 'just_right', label: 'Just Right' },
                { value: 'too_fast', label: 'Too Fast' },
              ].map(opt => (
                <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="pace"
                    value={opt.value}
                    checked={response.pace === opt.value}
                    onChange={(e) => setResponse({ ...response, pace: e.target.value })}
                    className="w-4 h-4"
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Key Takeaways</label>
            <textarea
              value={response.key_takeaways}
              onChange={(e) => setResponse({ ...response, key_takeaways: e.target.value })}
              className="input h-24"
              placeholder="What were your main learnings from this training?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Suggestions for Improvement</label>
            <textarea
              value={response.suggestions}
              onChange={(e) => setResponse({ ...response, suggestions: e.target.value })}
              className="input h-24"
              placeholder="How can we improve future trainings?"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={response.would_recommend}
                onChange={(e) => setResponse({ ...response, would_recommend: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-sm font-medium text-gray-700">I would recommend this training to others</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Additional Comments</label>
            <textarea
              value={response.additional_comments}
              onChange={(e) => setResponse({ ...response, additional_comments: e.target.value })}
              className="input h-24"
              placeholder="Any other feedback..."
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full btn btn-primary py-3 disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </form>
      </div>
    </div>
  );
}

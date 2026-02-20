import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';

interface FeedbackResponse {
  id: number;
  respondent_name: string;
  respondent_email: string;
  overall_rating: number;
  content_quality: number;
  trainer_effectiveness: number;
  relevance: number;
  pace: string;
  key_takeaways: string;
  suggestions: string;
  would_recommend: number;
  additional_comments: string;
  submitted_at: string;
}

interface FeedbackSummary {
  total_responses: number;
  avg_overall: number;
  avg_content: number;
  avg_trainer: number;
  avg_relevance: number;
  recommendation_rate: number;
  pace_distribution: {
    too_slow: number;
    just_right: number;
    too_fast: number;
  };
}

interface FeedbackData {
  form: {
    id: number;
    training_id: number;
    form_token: string;
    training_title: string;
    trainer_name: string;
  } | null;
  responses: FeedbackResponse[];
  summary: FeedbackSummary | null;
}

export default function FeedbackView() {
  const { trainingId } = useParams();
  const { token } = useAuth();
  const [data, setData] = useState<FeedbackData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const baseUrl = window.location.origin;

  useEffect(() => {
    loadFeedback();
  }, [trainingId, token]);

  const loadFeedback = () => {
    api<FeedbackData>(`/feedback/training/${trainingId}`, { token })
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const generateForm = async () => {
    setGenerating(true);
    try {
      await api(`/feedback/generate/${trainingId}`, { method: 'POST', token });
      loadFeedback();
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  const copyLink = () => {
    if (data?.form) {
      navigator.clipboard.writeText(`${baseUrl}/feedback/${data.form.form_token}`);
      alert('Feedback link copied to clipboard!');
    }
  };

  const StarDisplay = ({ value }: { value: number | null }) => {
    if (value === null) return <span className="text-gray-400">N/A</span>;
    return (
      <span className="text-yellow-400">
        {'★'.repeat(Math.round(value))}
        {'☆'.repeat(5 - Math.round(value))}
        <span className="text-gray-600 ml-1">({value})</span>
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading feedback...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link to="/trainings" className="hover:text-blue-600">Trainings</Link>
        <span>/</span>
        <Link to={`/trainings/${trainingId}`} className="hover:text-blue-600">Training</Link>
        <span>/</span>
        <span>Feedback</span>
      </div>

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Training Feedback</h1>
        {data?.form ? (
          <button onClick={copyLink} className="btn btn-secondary">
            Copy Feedback Link
          </button>
        ) : (
          <button
            onClick={generateForm}
            disabled={generating}
            className="btn btn-primary disabled:opacity-50"
          >
            {generating ? 'Generating...' : 'Generate Feedback Form'}
          </button>
        )}
      </div>

      {!data?.form ? (
        <div className="card p-8 text-center">
          <p className="text-gray-500 mb-4">No feedback form has been generated for this training yet.</p>
          <button onClick={generateForm} disabled={generating} className="btn btn-primary">
            Generate Feedback Form
          </button>
        </div>
      ) : (
        <>
          {/* Feedback Link */}
          <div className="card p-4 bg-blue-50 border-blue-200">
            <p className="text-sm text-blue-800 mb-2">Share this link with attendees to collect feedback:</p>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={`${baseUrl}/feedback/${data.form.form_token}`}
                className="input flex-1 bg-white"
              />
              <button onClick={copyLink} className="btn btn-primary">Copy</button>
            </div>
          </div>

          {/* Summary Stats */}
          {data.summary && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="stat-card">
                <p className="text-sm text-gray-500">Total Responses</p>
                <p className="text-3xl font-bold text-gray-900">{data.summary.total_responses}</p>
              </div>
              <div className="stat-card">
                <p className="text-sm text-gray-500">Avg Overall Rating</p>
                <p className="text-3xl font-bold text-yellow-500">{data.summary.avg_overall || 'N/A'}</p>
              </div>
              <div className="stat-card">
                <p className="text-sm text-gray-500">Would Recommend</p>
                <p className="text-3xl font-bold text-green-600">{data.summary.recommendation_rate}%</p>
              </div>
              <div className="stat-card">
                <p className="text-sm text-gray-500">Avg Trainer Score</p>
                <p className="text-3xl font-bold text-blue-600">{data.summary.avg_trainer || 'N/A'}</p>
              </div>
            </div>
          )}

          {/* Rating Breakdown */}
          {data.summary && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold mb-4">Rating Breakdown</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex justify-between items-center">
                  <span>Content Quality:</span>
                  <StarDisplay value={data.summary.avg_content} />
                </div>
                <div className="flex justify-between items-center">
                  <span>Trainer Effectiveness:</span>
                  <StarDisplay value={data.summary.avg_trainer} />
                </div>
                <div className="flex justify-between items-center">
                  <span>Relevance:</span>
                  <StarDisplay value={data.summary.avg_relevance} />
                </div>
                <div className="flex justify-between items-center">
                  <span>Overall:</span>
                  <StarDisplay value={data.summary.avg_overall} />
                </div>
              </div>

              {/* Pace Distribution */}
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Pace Distribution</h3>
                <div className="flex gap-4">
                  <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                    Too Slow: {data.summary.pace_distribution.too_slow}
                  </span>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    Just Right: {data.summary.pace_distribution.just_right}
                  </span>
                  <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                    Too Fast: {data.summary.pace_distribution.too_fast}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Individual Responses */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4">Individual Responses ({data.responses.length})</h2>
            {data.responses.length === 0 ? (
              <p className="text-gray-500">No responses yet.</p>
            ) : (
              <div className="space-y-4">
                {data.responses.map(r => (
                  <div key={r.id} className="border-b pb-4 last:border-0">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium">{r.respondent_name || 'Anonymous'}</p>
                        <p className="text-sm text-gray-500">{new Date(r.submitted_at).toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-yellow-400 text-lg">{'★'.repeat(r.overall_rating)}</p>
                        {r.would_recommend ? (
                          <span className="text-xs text-green-600">Would recommend</span>
                        ) : (
                          <span className="text-xs text-red-600">Would not recommend</span>
                        )}
                      </div>
                    </div>
                    {r.key_takeaways && (
                      <p className="text-sm text-gray-700 mb-1">
                        <strong>Key Takeaways:</strong> {r.key_takeaways}
                      </p>
                    )}
                    {r.suggestions && (
                      <p className="text-sm text-gray-700 mb-1">
                        <strong>Suggestions:</strong> {r.suggestions}
                      </p>
                    )}
                    {r.additional_comments && (
                      <p className="text-sm text-gray-700">
                        <strong>Comments:</strong> {r.additional_comments}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

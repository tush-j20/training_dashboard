import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';

interface ReportSummary {
  by_status: Record<string, number>;
  by_type: Record<string, number>;
  total_hours: number;
  completed_trainings: number;
  monthly_trend: Array<{ month: string; count: number; completed: number }>;
  top_products: Array<{ name: string; training_count: number }>;
  feedback: {
    total_responses: number;
    avg_overall: number | null;
    avg_content: number | null;
    avg_trainer: number | null;
  };
}

interface TrainerStat {
  id: number;
  name: string;
  email: string;
  total_trainings: number;
  completed: number;
  cancelled: number;
  total_hours: number;
  total_attendees: number;
  feedback: { avg_rating: number; response_count: number } | null;
}

export default function Reports() {
  const { token, user } = useAuth();
  const [activeTab, setActiveTab] = useState<'summary' | 'trainers' | 'products'>('summary');
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [trainers, setTrainers] = useState<TrainerStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  const canViewTrainers = user?.role && ['admin', 'manager', 'head'].includes(user.role);

  useEffect(() => {
    loadReport();
  }, [activeTab, dateRange, token]);

  const loadReport = async () => {
    setLoading(true);
    try {
      const params = `?start_date=${dateRange.start}&end_date=${dateRange.end}`;
      
      if (activeTab === 'summary') {
        const data = await api<{ report: ReportSummary }>(`/reports/summary${params}`, { token });
        setSummary(data.report);
      } else if (activeTab === 'trainers' && canViewTrainers) {
        const data = await api<{ trainers: TrainerStat[] }>(`/reports/trainers${params}`, { token });
        setTrainers(data.trainers);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    const url = `${import.meta.env.PROD ? '' : 'http://localhost:3001'}/api/reports/export?format=csv&start_date=${dateRange.start}&end_date=${dateRange.end}`;
    window.open(url, '_blank');
  };

  const StatCard = ({ label, value, subtext }: { label: string; value: string | number; subtext?: string }) => (
    <div className="stat-card">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
        <button onClick={exportCSV} className="btn btn-secondary">
          Export CSV
        </button>
      </div>

      {/* Date Range Filter */}
      <div className="card p-4 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            className="input"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            className="input"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              const now = new Date();
              setDateRange({
                start: new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0],
                end: now.toISOString().split('T')[0]
              });
            }}
            className="btn btn-secondary text-sm"
          >
            This Month
          </button>
          <button
            onClick={() => {
              const now = new Date();
              setDateRange({
                start: new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0],
                end: now.toISOString().split('T')[0]
              });
            }}
            className="btn btn-secondary text-sm"
          >
            YTD
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {['summary', ...(canViewTrainers ? ['trainers'] : [])].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as 'summary' | 'trainers')}
              className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading report...</div>
        </div>
      ) : activeTab === 'summary' && summary ? (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Total Hours Delivered" value={summary.total_hours} />
            <StatCard label="Completed Trainings" value={summary.completed_trainings} />
            <StatCard
              label="Client Trainings"
              value={summary.by_type.client || 0}
            />
            <StatCard
              label="Internal Trainings"
              value={summary.by_type.internal || 0}
            />
          </div>

          {/* Status Breakdown */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4">Training Status Breakdown</h2>
            <div className="grid grid-cols-4 gap-4">
              {['planned', 'ongoing', 'completed', 'cancelled'].map(status => (
                <div key={status} className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold">{summary.by_status[status] || 0}</p>
                  <p className="text-sm text-gray-500 capitalize">{status}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Feedback Summary */}
          {summary.feedback.total_responses > 0 && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold mb-4">Feedback Summary</h2>
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold">{summary.feedback.total_responses}</p>
                  <p className="text-sm text-gray-500">Total Responses</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-500">{summary.feedback.avg_overall || 'N/A'}</p>
                  <p className="text-sm text-gray-500">Avg Overall</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-500">{summary.feedback.avg_content || 'N/A'}</p>
                  <p className="text-sm text-gray-500">Avg Content</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-500">{summary.feedback.avg_trainer || 'N/A'}</p>
                  <p className="text-sm text-gray-500">Avg Trainer</p>
                </div>
              </div>
            </div>
          )}

          {/* Monthly Trend */}
          {summary.monthly_trend.length > 0 && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold mb-4">Monthly Trend</h2>
              <div className="overflow-x-auto">
                <div className="flex gap-4 min-w-max">
                  {summary.monthly_trend.map(m => (
                    <div key={m.month} className="text-center w-24">
                      <div className="h-32 flex flex-col justify-end">
                        <div
                          className="bg-blue-500 rounded-t"
                          style={{ height: `${Math.max((m.count / Math.max(...summary.monthly_trend.map(x => x.count))) * 100, 10)}%` }}
                        />
                      </div>
                      <p className="text-sm font-medium mt-2">{m.count}</p>
                      <p className="text-xs text-gray-500">{m.month}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Top Products */}
          {summary.top_products.length > 0 && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold mb-4">Top Training Topics</h2>
              <div className="space-y-3">
                {summary.top_products.map((p, i) => (
                  <div key={p.name} className="flex items-center gap-4">
                    <span className="text-gray-400 w-6">{i + 1}.</span>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="font-medium">{p.name}</span>
                        <span className="text-gray-500">{p.training_count} trainings</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${(p.training_count / summary.top_products[0].training_count) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : activeTab === 'trainers' && canViewTrainers ? (
        <div className="card overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trainer</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Completed</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Hours</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Attendees</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Feedback</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {trainers.map(t => (
                <tr key={t.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{t.name}</div>
                    <div className="text-sm text-gray-500">{t.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">{t.total_trainings}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="text-green-600">{t.completed}</span>
                    {t.cancelled > 0 && <span className="text-red-500 ml-1">({t.cancelled} cancelled)</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">{t.total_hours}h</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">{t.total_attendees}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {t.feedback ? (
                      <span className="text-yellow-500">★ {t.feedback.avg_rating}</span>
                    ) : (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}

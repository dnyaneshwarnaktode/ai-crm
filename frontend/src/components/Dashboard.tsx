import { useEffect, useState } from 'react';
import { getAnalytics, getInteractions } from '../services/api';
import { Users, CalendarDays, Smile, Layers, ArrowUpRight, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AnalyticsData {
  total_hcps: number;
  total_interactions: number;
  sentiments: {
    positive: number;
    neutral: number;
    negative: number;
  };
  products: { name: string; count: number }[];
}

interface Interaction {
  id: number;
  hcp_name: string | null;
  interaction_type: string | null;
  interaction_date: string | null;
  sentiment: string | null;
}

export function Dashboard() {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<AnalyticsData | null>(null);
  const [recentLogs, setRecentLogs] = useState<Interaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [analyticData, logs] = await Promise.all([
          getAnalytics(),
          getInteractions(),
        ]);
        setMetrics(analyticData);
        setRecentLogs(logs.slice(0, 5));
      } catch (err) {
        console.error('Failed to load dashboard metrics', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading || !metrics) {
    return (
      <div className="flex-1 h-full flex items-center justify-center bg-[#0f1117]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
          <p className="text-xs text-slate-400 font-medium">Gathering analytics...</p>
        </div>
      </div>
    );
  }

  // Calculate Positive Ratio
  const totalSentiments =
    metrics.sentiments.positive +
    metrics.sentiments.neutral +
    metrics.sentiments.negative;
  const positiveRatio =
    totalSentiments > 0
      ? Math.round((metrics.sentiments.positive / totalSentiments) * 100)
      : 0;

  return (
    <div className="flex-1 h-full overflow-y-auto bg-[#0f1117] p-8">
      {/* Title */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Executive Dashboard</h1>
          <p className="text-xs text-slate-400 mt-1">Real-time statistics on HCP relationships and product discussions.</p>
        </div>
        <button
          onClick={() => navigate('/logger')}
          className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl text-xs font-semibold hover:shadow-lg hover:shadow-indigo-950/40 transition-all duration-200"
        >
          New Meeting Logger
          <ArrowUpRight size={14} />
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Total HCPs */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 hover:border-slate-700/50 transition-colors">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wide">Total HCP Directory</span>
            <div className="p-2 rounded-xl bg-violet-600/10 text-violet-400 border border-violet-500/10">
              <Users size={16} />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-slate-100 tracking-tight">{metrics.total_hcps}</h2>
          <p className="text-[10px] text-slate-500 mt-1 font-semibold">REGISTERED DOCTORS</p>
        </div>

        {/* Total Meetings */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 hover:border-slate-700/50 transition-colors">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wide">Logged Meetings</span>
            <div className="p-2 rounded-xl bg-indigo-600/10 text-indigo-400 border border-indigo-500/10">
              <CalendarDays size={16} />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-slate-100 tracking-tight">{metrics.total_interactions}</h2>
          <p className="text-[10px] text-slate-500 mt-1 font-semibold">TOTAL SESSIONS LOGGED</p>
        </div>

        {/* Positive Sentiment Ratio */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 hover:border-slate-700/50 transition-colors">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wide">Positive Response Ratio</span>
            <div className="p-2 rounded-xl bg-emerald-600/10 text-emerald-400 border border-emerald-500/10">
              <Smile size={16} />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-slate-100 tracking-tight">{positiveRatio}%</h2>
          <p className="text-[10px] text-slate-500 mt-1 font-semibold">{metrics.sentiments.positive} POSITIVE SESSIONS</p>
        </div>

        {/* Top Product */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 hover:border-slate-700/50 transition-colors">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wide">Most Discussed Product</span>
            <div className="p-2 rounded-xl bg-amber-600/10 text-amber-400 border border-amber-500/10">
              <Layers size={16} />
            </div>
          </div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight truncate mt-1">
            {metrics.products[0]?.name || 'N/A'}
          </h2>
          <p className="text-[10px] text-slate-500 mt-2 font-semibold">
            {metrics.products[0]?.count || 0} TOTAL DISCUSSIONS
          </p>
        </div>
      </div>

      {/* Grid: Sentiment & Products */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Sentiment Distribution */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-200 mb-5">Observed HCP Sentiment</h3>
            <div className="space-y-4">
              {/* Positive */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-emerald-400">Positive</span>
                  <span className="text-slate-300">{metrics.sentiments.positive}</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{
                      width: `${
                        totalSentiments > 0
                          ? (metrics.sentiments.positive / totalSentiments) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
              {/* Neutral */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-400">Neutral</span>
                  <span className="text-slate-300">{metrics.sentiments.neutral}</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-slate-500 rounded-full"
                    style={{
                      width: `${
                        totalSentiments > 0
                          ? (metrics.sentiments.neutral / totalSentiments) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
              {/* Negative */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-rose-400">Negative</span>
                  <span className="text-slate-300">{metrics.sentiments.negative}</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-rose-500 rounded-full"
                    style={{
                      width: `${
                        totalSentiments > 0
                          ? (metrics.sentiments.negative / totalSentiments) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
          <p className="text-[10px] text-slate-500 mt-4 font-semibold uppercase tracking-wider">
            BASED ON {totalSentiments} CLASSIFIED LOGS
          </p>
        </div>

        {/* Product Discussions ranking */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-200 mb-5">Product Discussion Share</h3>
            {metrics.products.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No products discussed yet.</p>
            ) : (
              <div className="space-y-3.5">
                {metrics.products.map((p, idx) => (
                  <div key={p.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-lg bg-slate-800 text-[10px] font-bold text-indigo-400 flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="font-semibold text-slate-300">{p.name}</span>
                    </div>
                    <span className="font-bold text-slate-400">{p.count} mentions</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <p className="text-[10px] text-slate-500 mt-4 font-semibold uppercase tracking-wider">
            PRODUCT LEADERBOARD
          </p>
        </div>

        {/* Quick Tips */}
        <div className="bg-gradient-to-br from-indigo-950/20 to-slate-900/60 border border-indigo-900/20 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
              <Award size={16} className="text-indigo-400" />
              Pro Representative Tip
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Pharmaceutical compliance is simplified using the **AI Chat Logger**. As you chat, the system extracts critical details case-insensitively and updates records without duplicates.
            </p>
            <div className="mt-4 p-3 bg-indigo-950/30 rounded-xl border border-indigo-500/10">
              <p className="text-[11px] text-indigo-400 font-semibold">Try typing this prompt:</p>
              <p className="text-[10px] text-slate-400 mt-1 italic">
                "Yesterday I logged a meeting with Dr Patel, we discussed Metformin."
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Interactions Panel */}
      <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6">
        <h3 className="text-sm font-bold text-slate-200 mb-4">Recent Meeting Activities</h3>
        {recentLogs.length === 0 ? (
          <p className="text-xs text-slate-500 italic">No meetings logged yet.</p>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {recentLogs.map((log) => (
              <div key={log.id} className="py-3 flex justify-between items-center">
                <div>
                  <h4 className="text-xs font-semibold text-slate-300">Meeting #{log.id}</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    HCP: <span className="font-semibold text-slate-400">{log.hcp_name || 'Unknown'}</span> · Type: {log.interaction_type || 'N/A'}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wider ${
                    log.sentiment === 'Positive'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10'
                      : log.sentiment === 'Negative'
                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/10'
                      : 'bg-slate-800 text-slate-400 border border-slate-700/30'
                  }`}>
                    {log.sentiment || 'Neutral'}
                  </span>
                  <span className="text-[10px] text-slate-500">{log.interaction_date || 'N/A'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

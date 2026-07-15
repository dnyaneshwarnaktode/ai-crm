import { useEffect, useState } from 'react';
import { getInteractions } from '../services/api';
import { Calendar, Search, ArrowRight } from 'lucide-react';

import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../store/hooks';
import { loadInteractionDetail } from '../store/interactionSlice';
import { loadChatHistory } from '../store/chatSlice';

interface InteractionSummary {
  id: number;
  hcp_id: number;
  hcp_name: string | null;
  interaction_type: string | null;
  interaction_date: string | null;
  sentiment: string | null;
  created_at: string | null;
}

export function LogsHistory() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [logs, setLogs] = useState<InteractionSummary[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const loadLogs = async () => {
    try {
      const data = await getInteractions();
      setLogs(data);
    } catch (err) {
      console.error('Failed to load logs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const handleResumeSession = (id: number) => {
    dispatch(loadInteractionDetail(id));
    dispatch(loadChatHistory(id));
    navigate('/logger');
  };

  const filteredLogs = logs.filter((log) =>
    (log.hcp_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (log.interaction_type || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 h-full overflow-y-auto bg-[#0f1117] p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Meeting Log History</h1>
          <p className="text-xs text-slate-400 mt-1">Review, access, and resume previous conversational sessions.</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 max-w-md relative">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search logs by doctor name or type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900/60 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-300 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
          />
        </div>
        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">
          {filteredLogs.length} logs found
        </p>
      </div>

      {/* Logs Table */}
      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center border border-dashed border-slate-800 rounded-2xl p-8 bg-slate-900/10">
          <Calendar size={36} className="text-slate-600 mb-2" />
          <p className="text-sm font-medium text-slate-400">No logs logged</p>
          <p className="text-xs text-slate-600 mt-1">Select the AI Logger in the sidebar to start logging.</p>
        </div>
      ) : (
        <div className="bg-[#181a20]/40 border border-slate-800 rounded-2xl overflow-hidden shadow-inner">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-850 text-[10px] text-slate-400 font-bold uppercase tracking-wider bg-slate-900/40">
                <th className="px-6 py-4">Session ID</th>
                <th className="px-6 py-4">Healthcare Professional</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Meeting Date</th>
                <th className="px-6 py-4">Sentiment</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-xs text-slate-300">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-900/20 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-500">#{log.id}</td>
                  <td className="px-6 py-4 font-semibold text-slate-200">{log.hcp_name || 'Unknown Doctor'}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 rounded-lg bg-slate-850 text-slate-400 font-medium">
                      {log.interaction_type || 'General'}
                    </span>
                  </td>
                  <td className="px-6 py-4">{log.interaction_date || 'N/A'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                      log.sentiment === 'Positive'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10'
                        : log.sentiment === 'Negative'
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/10'
                        : 'bg-slate-800 text-slate-400 border border-slate-700/30'
                    }`}>
                      {log.sentiment || 'Neutral'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleResumeSession(log.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 hover:text-indigo-300 rounded-xl font-semibold tracking-wide border border-indigo-500/10 transition-colors"
                    >
                      Resume Logger
                      <ArrowRight size={12} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react'
import './index.css'
import { InteractionForm } from './components/InteractionForm'
import { ChatPanel } from './components/ChatPanel'
import { useAppDispatch, useAppSelector } from './store/hooks'
import { loadChatHistory, clearChat } from './store/chatSlice'
import { loadInteractionDetail, clearInteraction } from './store/interactionSlice'
import { getInteractions } from './services/api'
import { PlusCircle } from 'lucide-react'

interface SimpleInteraction {
  id: number;
  hcp_name: string | null;
  interaction_type: string | null;
  interaction_date: string | null;
}

function App() {
  const dispatch = useAppDispatch();
  const activeId = useAppSelector((s) => s.interaction.interactionId);
  const [sessions, setSessions] = useState<SimpleInteraction[]>([]);

  // Fetch recent interactions/sessions
  const fetchSessions = async () => {
    try {
      const data = await getInteractions();
      setSessions(data);
    } catch (err) {
      console.error("Failed to fetch sessions", err);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [activeId]);

  const handleSelectSession = (id: number) => {
    if (!id) return;
    dispatch(loadInteractionDetail(id));
    dispatch(loadChatHistory(id));
  };

  const handleNewSession = () => {
    dispatch(clearChat());
    dispatch(clearInteraction());
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0f1117]">
      {/* Top accent bar */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-600 via-indigo-500 to-teal-500 z-50" />

      {/* Header */}
      <div className="absolute top-0.5 left-0 right-0 h-14 flex items-center justify-between px-6 bg-slate-900/90 backdrop-blur-md border-b border-slate-700/50 z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white">
              <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18" />
            </svg>
          </div>
          <div>
            <span className="text-sm font-bold text-slate-100 tracking-tight">AI CRM</span>
            <span className="text-xs text-slate-500 ml-2">HCP Interaction Logger</span>
          </div>
        </div>

        {/* Sessions Dropdown + Actions */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-400 font-medium whitespace-nowrap">Session:</label>
            <select
              value={activeId || ''}
              onChange={(e) => handleSelectSession(Number(e.target.value))}
              className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50"
            >
              <option value="">-- Active Conversation --</option>
              {sessions.map((s) => (
                <option key={s.id} value={s.id}>
                  #{s.id} - {s.hcp_name || 'Unknown HCP'} ({s.interaction_date || 'N/A'})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleNewSession}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30 border border-indigo-500/20 text-xs font-semibold transition-colors"
          >
            <PlusCircle size={14} />
            New Logger
          </button>

          <div className="flex items-center gap-2 border-l border-slate-700/50 pl-4">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-slate-400">Backend connected</span>
          </div>
        </div>
      </div>


      {/* Main split-screen layout */}
      <div className="flex w-full pt-[58px]">
        {/* Left Panel — Interaction Details Form */}
        <div className="w-1/2 border-r border-slate-700/50 flex flex-col overflow-hidden">
          <InteractionForm />
        </div>

        {/* Divider handle */}
        <div className="w-px bg-slate-700/50 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-12 rounded-full bg-slate-600/50" />
        </div>

        {/* Right Panel — AI Chat */}
        <div className="w-1/2 flex flex-col overflow-hidden">
          <ChatPanel />
        </div>
      </div>
    </div>
  )
}

export default App

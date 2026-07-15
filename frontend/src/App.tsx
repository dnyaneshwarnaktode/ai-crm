import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import { Sidebar } from './components/Sidebar'
import { Dashboard } from './components/Dashboard'
import { HcpDirectory } from './components/HcpDirectory'
import { LogsHistory } from './components/LogsHistory'
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

function InteractiveLogger() {
  const dispatch = useAppDispatch();
  const activeId = useAppSelector((s) => s.interaction.interactionId);
  const [sessions, setSessions] = useState<SimpleInteraction[]>([]);

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
    <div className="flex-1 flex flex-col h-full overflow-hidden relative">
      {/* Logger Local Header */}
      <div className="h-16 px-6 border-b border-slate-700/50 flex justify-between items-center bg-[#0f1117]/80 backdrop-blur-md">
        <div>
          <h2 className="text-sm font-bold text-slate-100">AI Meeting Chat Logger</h2>
          <p className="text-[10px] text-slate-500 font-medium">Capture physician engagements dynamically via conversational NLP.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-400 font-medium whitespace-nowrap">Active Session:</label>
            <select
              value={activeId || ''}
              onChange={(e) => handleSelectSession(Number(e.target.value))}
              className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
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
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30 border border-indigo-500/20 text-xs font-semibold transition-colors"
          >
            <PlusCircle size={14} />
            New Logger
          </button>
        </div>
      </div>

      {/* Split screen content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel — Interaction Details Form */}
        <div className="w-1/2 border-r border-slate-700/50 flex flex-col overflow-hidden">
          <InteractionForm />
        </div>

        {/* Divider handle */}
        <div className="w-px bg-slate-700/50 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-14 rounded-full bg-slate-600/50" />
        </div>

        {/* Right Panel — AI Chat */}
        <div className="w-1/2 flex flex-col overflow-hidden">
          <ChatPanel />
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <div className="flex h-screen w-screen overflow-hidden bg-[#0f1117]">
        {/* Top accent bar */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-600 via-indigo-500 to-teal-500 z-50" />

        {/* Left Sidebar Navigation */}
        <Sidebar />

        {/* Core Content Switching Port */}
        <div className="flex-1 flex flex-col overflow-hidden h-full">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/hcp" element={<HcpDirectory />} />
            <Route path="/logs" element={<LogsHistory />} />
            <Route path="/logger" element={<InteractiveLogger />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </Router>
  )
}

export default App;


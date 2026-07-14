import './index.css'
import { InteractionForm } from './components/InteractionForm'
import { ChatPanel } from './components/ChatPanel'

function App() {
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
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-slate-400">Backend connected</span>
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

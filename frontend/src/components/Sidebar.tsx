import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, History, MessageSquare, Bot } from 'lucide-react';

export function Sidebar() {
  const links = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/hcp', label: 'HCP Directory', icon: Users },
    { to: '/logs', label: 'Interaction Logs', icon: History },
    { to: '/logger', label: 'AI Chat Logger', icon: MessageSquare },
  ];

  return (
    <div className="w-64 h-full bg-[#181a20] border-r border-slate-700/50 flex flex-col justify-between flex-shrink-0 z-30">
      <div className="flex flex-col">
        {/* Logo Section */}
        <div className="h-16 px-6 flex items-center gap-3 border-b border-slate-700/30">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-md shadow-indigo-950/40">
            <Bot size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-100 tracking-wide">AI CRM</h1>
            <p className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase">CRM HCP Engine</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-1.5 flex-1">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-violet-600/20 to-indigo-600/10 text-indigo-400 border border-indigo-500/20 shadow-inner'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
                  }`
                }
              >
                <Icon size={16} />
                {link.label}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-700/30">
        <div className="bg-slate-800/30 rounded-xl p-3.5 border border-slate-700/30">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] text-slate-300 font-semibold uppercase tracking-wider">Groq Engine Connected</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1 font-medium">Powered by Qwen 27B</p>
        </div>
      </div>
    </div>
  );
}

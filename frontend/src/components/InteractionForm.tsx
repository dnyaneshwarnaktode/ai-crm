import React from 'react';
import {
  User, Stethoscope, Calendar, Clock, Users,
  MessageSquare, FileText, Package, Paperclip,
  FlaskConical, TrendingUp, Target, ArrowRight,
  ClipboardList,
} from 'lucide-react';
import { useAppSelector } from '../store/hooks';

// ── helpers ───────────────────────────────────────────────────────────────────

const sentimentColor = (sentiment: string | null) => {
  if (!sentiment) return 'text-slate-500';
  const s = sentiment.toLowerCase();
  if (s === 'positive') return 'text-emerald-400';
  if (s === 'negative') return 'text-red-400';
  return 'text-amber-400';
};

const sentimentBg = (sentiment: string | null) => {
  if (!sentiment) return 'bg-slate-700/30 border-slate-600/30';
  const s = sentiment.toLowerCase();
  if (s === 'positive') return 'bg-emerald-900/20 border-emerald-700/30';
  if (s === 'negative') return 'bg-red-900/20 border-red-700/30';
  return 'bg-amber-900/20 border-amber-700/30';
};

// ── Field components ──────────────────────────────────────────────────────────

interface FieldProps {
  icon: React.ReactNode;
  label: string;
  value: string | null | undefined;
  placeholder?: string;
  className?: string;
}

const Field: React.FC<FieldProps> = ({
  icon,
  label,
  value,
  placeholder = '—',
  className = '',
}) => (
  <div className={`flex flex-col gap-1 ${className}`}>
    <label className="flex items-center gap-1.5 text-xs font-medium text-slate-500 uppercase tracking-wide">
      <span className="text-slate-600">{icon}</span>
      {label}
    </label>
    <div className="px-3 py-2.5 rounded-lg bg-slate-800/60 border border-slate-700/40 text-sm text-slate-200 min-h-[38px]">
      {value || <span className="text-slate-600 italic">{placeholder}</span>}
    </div>
  </div>
);

interface TagListProps {
  icon: React.ReactNode;
  label: string;
  items: string[];
  colorClass?: string;
}

const TagList: React.FC<TagListProps> = ({
  icon,
  label,
  items,
  colorClass = 'bg-indigo-900/40 text-indigo-300 border-indigo-700/40',
}) => (
  <div className="flex flex-col gap-1">
    <label className="flex items-center gap-1.5 text-xs font-medium text-slate-500 uppercase tracking-wide">
      <span className="text-slate-600">{icon}</span>
      {label}
    </label>
    <div className="min-h-[38px] px-3 py-2.5 rounded-lg bg-slate-800/60 border border-slate-700/40">
      {items.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {items.map((item) => (
            <span
              key={item}
              className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClass}`}
            >
              {item}
            </span>
          ))}
        </div>
      ) : (
        <span className="text-slate-600 italic text-sm">—</span>
      )}
    </div>
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────

export const InteractionForm: React.FC = () => {
  const data = useAppSelector((s) => s.interaction.data);
  const interactionId = useAppSelector((s) => s.interaction.interactionId);

  const isEmpty = !data;

  return (
    <div className="flex flex-col h-full bg-slate-900/30">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-cyan-900/40">
              <ClipboardList size={18} className="text-white" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-100">Interaction Details</h2>
              <p className="text-xs text-slate-400">Auto-populated by AI · Read only</p>
            </div>
          </div>
          {interactionId && (
            <span className="text-xs px-2.5 py-1 rounded-full bg-teal-900/40 text-teal-400 border border-teal-700/40 font-medium">
              #{interactionId}
            </span>
          )}
        </div>
      </div>

      {/* Form body */}
      <div className="flex-1 overflow-y-auto px-5 py-5">
        {isEmpty ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-12">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-600/10 to-cyan-600/10 border border-teal-500/20 flex items-center justify-center">
              <ClipboardList size={28} className="text-teal-500/60" />
            </div>
            <div>
              <p className="text-slate-400 font-medium text-sm mb-1">No interaction logged yet</p>
              <p className="text-slate-600 text-xs max-w-[240px]">
                Tell the AI assistant about your HCP meeting and this form will populate automatically.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* HCP + Interaction Type */}
            <div className="grid grid-cols-2 gap-3">
              <Field
                icon={<User size={12} />}
                label="HCP Name"
                value={data.hcp_name}
              />
              <Field
                icon={<Stethoscope size={12} />}
                label="Interaction Type"
                value={data.interaction_type}
              />
            </div>

            {/* Date + Time */}
            <div className="grid grid-cols-2 gap-3">
              <Field
                icon={<Calendar size={12} />}
                label="Date"
                value={data.interaction_date}
              />
              <Field
                icon={<Clock size={12} />}
                label="Time"
                value={data.interaction_time}
              />
            </div>

            {/* Attendees */}
            <Field
              icon={<Users size={12} />}
              label="Attendees"
              value={data.attendees}
            />

            {/* Topics */}
            <Field
              icon={<MessageSquare size={12} />}
              label="Topics Discussed"
              value={data.topics_discussed}
            />

            {/* Summary */}
            <div className="flex flex-col gap-1">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-500 uppercase tracking-wide">
                <span className="text-slate-600"><FileText size={12} /></span>
                Summary
              </label>
              <div className="px-3 py-2.5 rounded-lg bg-slate-800/60 border border-slate-700/40 text-sm text-slate-200 min-h-[70px] whitespace-pre-wrap leading-relaxed">
                {data.summary || <span className="text-slate-600 italic">—</span>}
              </div>
            </div>

            {/* Sentiment */}
            <div className="flex flex-col gap-1">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-500 uppercase tracking-wide">
                <span className="text-slate-600"><TrendingUp size={12} /></span>
                Sentiment
              </label>
              <div
                className={`inline-flex px-3 py-2.5 rounded-lg border text-sm font-medium min-h-[38px] items-center ${sentimentBg(data.sentiment)}`}
              >
                <span className={sentimentColor(data.sentiment)}>
                  {data.sentiment || <span className="text-slate-600 italic font-normal">—</span>}
                </span>
              </div>
            </div>

            {/* Products */}
            <TagList
              icon={<Package size={12} />}
              label="Products Discussed"
              items={data.products || []}
              colorClass="bg-indigo-900/40 text-indigo-300 border-indigo-700/40"
            />

            {/* Materials */}
            <TagList
              icon={<Paperclip size={12} />}
              label="Materials Shared"
              items={data.materials_shared || []}
              colorClass="bg-violet-900/40 text-violet-300 border-violet-700/40"
            />

            {/* Samples */}
            <TagList
              icon={<FlaskConical size={12} />}
              label="Samples Distributed"
              items={data.samples_distributed || []}
              colorClass="bg-cyan-900/40 text-cyan-300 border-cyan-700/40"
            />

            {/* Outcomes */}
            <Field
              icon={<Target size={12} />}
              label="Outcomes"
              value={data.outcomes}
            />

            {/* Follow-up */}
            <div className="flex flex-col gap-1">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-500 uppercase tracking-wide">
                <span className="text-slate-600"><ArrowRight size={12} /></span>
                Follow-up Recommendation
              </label>
              <div className="px-3 py-2.5 rounded-lg bg-amber-900/10 border border-amber-700/20 text-sm text-amber-200/80 min-h-[38px] whitespace-pre-wrap leading-relaxed">
                {data.follow_up || <span className="text-slate-600 italic">—</span>}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer note */}
      <div className="px-5 py-3 border-t border-slate-700/30">
        <p className="text-xs text-slate-600 text-center">
          🔒 This form is read-only. Use the AI assistant to update fields.
        </p>
      </div>
    </div>
  );
};

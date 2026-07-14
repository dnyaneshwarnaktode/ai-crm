import React from 'react';
import type { ChatMessage } from '../types';
import { Bot, User } from 'lucide-react';

interface MessageBubbleProps {
  message: ChatMessage;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';

  const time = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      className={`flex gap-3 mb-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <div
        className={`
          flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
          ${isUser
            ? 'bg-indigo-600'
            : 'bg-gradient-to-br from-violet-600 to-indigo-600'
          }
        `}
      >
        {isUser ? (
          <User size={14} className="text-white" />
        ) : (
          <Bot size={14} className="text-white" />
        )}
      </div>

      {/* Bubble */}
      <div className={`flex flex-col max-w-[78%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`
            px-4 py-3 rounded-2xl text-sm leading-relaxed
            ${isUser
              ? 'bg-indigo-600 text-white rounded-tr-sm'
              : 'bg-slate-700/60 text-slate-100 rounded-tl-sm border border-slate-600/40'
            }
          `}
        >
          {message.content}
        </div>
        <span className="text-xs text-slate-500 mt-1 px-1">{time}</span>
      </div>
    </div>
  );
};

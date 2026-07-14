import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Bot, AlertCircle, Trash2 } from 'lucide-react';
import { MessageBubble } from './MessageBubble';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { sendChatMessage, addUserMessage, clearChat, clearError } from '../store/chatSlice';
import { clearInteraction } from '../store/interactionSlice';

export const ChatPanel: React.FC = () => {
  const dispatch = useAppDispatch();
  const { messages, loading, error } = useAppSelector((s) => s.chat);
  const interactionId = useAppSelector((s) => s.interaction.interactionId);

  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput('');
    dispatch(addUserMessage(text));
    dispatch(sendChatMessage({ message: text, interactionId }));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClear = () => {
    dispatch(clearChat());
    dispatch(clearInteraction());
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/50">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-900/40">
            <Bot size={18} className="text-white" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-100">AI Assistant</h2>
            <p className="text-xs text-slate-400">Powered by Groq · qwen-27b</p>




          </div>
        </div>
        {messages.length > 0 && (
          <button
            id="clear-chat-btn"
            onClick={handleClear}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-700/50 transition-colors"
            title="Clear conversation"
          >
            <Trash2 size={15} />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-4 py-12">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600/20 to-indigo-600/20 border border-violet-500/20 flex items-center justify-center">
              <Bot size={28} className="text-violet-400" />
            </div>
            <div>
              <p className="text-slate-300 font-medium text-sm mb-1">Start a conversation</p>
              <p className="text-slate-500 text-xs max-w-[260px]">
                Describe your HCP interaction and I'll extract, log, and organize all the details automatically.
              </p>
            </div>
            <div className="flex flex-col gap-2 w-full max-w-[300px]">
              {[
                'Today I met Dr Smith and discussed Ozempic. Doctor liked it.',
                'Update the sentiment to positive for the last interaction.',
                'What products did we discuss in the last meeting?',
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setInput(suggestion)}
                  className="text-left text-xs px-3 py-2 rounded-lg bg-slate-700/40 hover:bg-slate-700/70 text-slate-400 hover:text-slate-200 transition-colors border border-slate-600/30"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {/* Typing indicator */}
        {loading && (
          <div className="flex gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center flex-shrink-0">
              <Bot size={14} className="text-white" />
            </div>
            <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-slate-700/60 border border-slate-600/40">
              <div className="flex gap-1 items-center h-4">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-900/30 border border-red-700/40 text-red-400 text-xs mb-3">
            <AlertCircle size={13} />
            <span>{error}</span>
            <button
              onClick={() => dispatch(clearError())}
              className="ml-auto text-red-500 hover:text-red-300"
            >
              ✕
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="px-4 py-4 border-t border-slate-700/50 bg-slate-900/60 backdrop-blur-sm">
        {interactionId && (
          <p className="text-xs text-slate-500 mb-2 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
            Session #{interactionId} active — AI will update this interaction
          </p>
        )}
        <div className="flex gap-2 items-end">
          <textarea
            ref={inputRef}
            id="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe the HCP interaction… (Enter to send)"
            rows={1}
            disabled={loading}
            className="
              flex-1 resize-none rounded-xl px-4 py-3 text-sm
              bg-slate-700/50 border border-slate-600/50
              text-slate-100 placeholder-slate-500
              focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50
              disabled:opacity-50 disabled:cursor-not-allowed
              max-h-32 overflow-y-auto
              transition-all
            "
            style={{
              height: 'auto',
              minHeight: '48px',
            }}
            onInput={(e) => {
              const t = e.currentTarget;
              t.style.height = 'auto';
              t.style.height = Math.min(t.scrollHeight, 128) + 'px';
            }}
          />
          <button
            id="send-message-btn"
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="
              w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0
              bg-indigo-600 hover:bg-indigo-500
              disabled:bg-slate-700 disabled:cursor-not-allowed
              transition-all duration-200
              shadow-lg shadow-indigo-900/30
            "
          >
            {loading ? (
              <Loader2 size={16} className="text-slate-400 animate-spin" />
            ) : (
              <Send size={16} className="text-white" />
            )}
          </button>
        </div>
        <p className="text-xs text-slate-600 mt-2 text-center">
          Shift+Enter for new line · Enter to send
        </p>
      </div>
    </div>
  );
};

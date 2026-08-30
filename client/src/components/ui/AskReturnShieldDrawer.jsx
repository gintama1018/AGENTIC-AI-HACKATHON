import React, { useState } from 'react';
import { Sparkles, X, Send, Wrench, ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';
import { api } from '../../services/api';
import { Badge } from './Badge';

const SAMPLE_QUESTIONS = [
  'Why did ReturnShield prioritize Xpress Logistics?',
  'What is the root cause for Kurta Set Sage Green?',
  'How does COD RTO compare against Prepaid orders?',
  'What changed since the previous analysis run?'
];

export const AskReturnShieldDrawer = ({ isOpen, onClose, runId }) => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: `Hello! I am the ReturnShield Investigation Agent. I have access to 6 analytical tools grounded in Run ${runId || 'current'}. Ask me any question about return drivers, courier RTOs, or prescribed actions.`,
      tools_used: [],
      confidence: 0.95
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (questionText) => {
    const q = questionText || input;
    if (!q || !q.trim() || loading) return;

    const userMsg = { role: 'user', text: q.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.askReturnShield(q.trim(), runId);
      const assistantMsg = {
        role: 'assistant',
        text: res.answer,
        confidence: res.confidence,
        caveats: res.caveats || [],
        tools_used: Array.isArray(res.tools_used) ? res.tools_used : []
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: `Could not retrieve answer: ${err.message}. Ensure the n8n Ask Agent workflow is running.`,
          tools_used: [],
          confidence: 0.5,
          isError: true
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[440px] bg-[#0D121F] border-l border-slate-800 shadow-2xl flex flex-col font-sans text-slate-100 animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-[#080C14]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center text-indigo-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              Ask ReturnShield
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </h3>
            <p className="text-[10px] text-slate-400 font-num">Grounded in Run: {runId || 'rs_current'}</p>
          </div>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {messages.map((m, idx) => (
          <div key={idx} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`p-3.5 rounded-xl max-w-[92%] space-y-2 ${m.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : m.isError ? 'bg-rose-950/40 border border-rose-800/60 text-rose-200' : 'bg-[#111827] border border-slate-800 text-slate-200 rounded-bl-none'}`}>
              <p className="leading-relaxed whitespace-pre-wrap">{m.text}</p>

              {/* Tools Used Badge indicator */}
              {m.tools_used && m.tools_used.length > 0 && (
                <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] text-slate-400 flex items-center gap-1 font-semibold">
                    <Wrench className="w-3 h-3 text-indigo-400" /> Tools Called:
                  </span>
                  {m.tools_used.map(t => (
                    <code key={t} className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-[10px] text-indigo-300 font-mono">
                      {t}()
                    </code>
                  ))}
                </div>
              )}

              {/* Caveats */}
              {m.caveats && m.caveats.length > 0 && (
                <div className="pt-1 text-[11px] text-amber-300/90 italic flex items-start gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0 mt-0.5 text-amber-400" />
                  <span>{m.caveats.join(' ')}</span>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 p-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 max-w-[80%]">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
            <span>Agent calling analytical tools…</span>
          </div>
        )}
      </div>

      {/* Suggested Questions */}
      <div className="px-4 py-2 border-t border-slate-800/80 bg-[#080C14] space-y-1.5">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Suggested Deep Dives</p>
        <div className="flex flex-wrap gap-1.5">
          {SAMPLE_QUESTIONS.map(sq => (
            <button
              key={sq}
              onClick={() => handleSend(sq)}
              disabled={loading}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 text-left transition-colors"
            >
              {sq}
            </button>
          ))}
        </div>
      </div>

      {/* Input bar */}
      <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="p-3 border-t border-slate-800 bg-[#0D121F] flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about SKU, courier, pincode RTO..."
          className="rs-field text-xs flex-1"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="rs-btn-primary px-3 text-xs disabled:opacity-40"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};

import { useState, useRef, useEffect } from "react";
import { chatWithAI } from "../lib/gemini";
import type { ZonePayload, LocationPayload, EventPayload } from "../lib/gemini";

interface Message {
  id: number;
  role: "user" | "ai";
  text: string;
  timestamp: Date;
}

interface Props {
  zones: ZonePayload[];
  location: LocationPayload;
  events: EventPayload[];
  overall: string;
  power: string;
}

const QUICK_QUESTIONS = [
  "What happened today?",
  "How should we respond to this fire?",
  "Give fire prevention tips.",
  "Summarize today's safety events.",
];

export default function AIChatbot({ zones, location, events, overall, power }: Props) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      role: "ai",
      text: "Hi! I'm FireGuard AI, your emergency response assistant. Ask me about current alerts, evacuation procedures, or fire safety tips.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const msgIdRef = useRef(1);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, messages]);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = { id: msgIdRef.current++, role: "user", text: text.trim(), timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const reply = await chatWithAI(text.trim(), { zones, location, events, overall, power });
      setMessages(prev => [...prev, { id: msgIdRef.current++, role: "ai", text: reply, timestamp: new Date() }]);
    } catch {
      setMessages(prev => [...prev, { id: msgIdRef.current++, role: "ai", text: "Sorry, I couldn't connect to the AI service. Please try again.", timestamp: new Date() }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-label="Open FireGuard AI Assistant"
        className={`fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 ${
          open ? "bg-slate-700 rotate-45 scale-95" : "bg-violet-600 hover:bg-violet-500 scale-100"
        }`}
      >
        {open ? (
          <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
            <path d="M18 6 6 18M6 6l12 12"/>
          </svg>
        ) : (
          <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 2C6.48 2 2 6.03 2 11c0 2.7 1.23 5.14 3.2 6.8L4 22l4.86-1.62A10.6 10.6 0 0 0 12 20c5.52 0 10-4.03 10-9S17.52 2 12 2z"/>
            <circle cx="8" cy="11" r="1" fill="currentColor"/>
            <circle cx="12" cy="11" r="1" fill="currentColor"/>
            <circle cx="16" cy="11" r="1" fill="currentColor"/>
          </svg>
        )}
      </button>

      {/* Pulsing badge for active alert */}
      {!open && overall === "FIRE ALERT" && (
        <span className="fixed bottom-[76px] right-6 z-40 w-3.5 h-3.5 rounded-full bg-red-500 border-2 border-slate-950 animate-pulse" />
      )}

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-40 w-[360px] max-w-[calc(100vw-1.5rem)] rounded-2xl border border-white/10 bg-slate-900 shadow-2xl flex flex-col overflow-hidden"
          style={{ maxHeight: "560px" }}>
          {/* Header */}
          <div className="bg-gradient-to-r from-violet-700 to-violet-600 px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 2C6.48 2 2 6.03 2 11c0 2.7 1.23 5.14 3.2 6.8L4 22l4.86-1.62A10.6 10.6 0 0 0 12 20c5.52 0 10-4.03 10-9S17.52 2 12 2z"/>
                </svg>
              </div>
              <div>
                <div className="text-sm font-semibold text-white">FireGuard AI</div>
                <div className="text-[10px] text-white/60">Powered by Gemini</div>
              </div>
            </div>
            <div className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${
              overall === "FIRE ALERT" ? "bg-red-500/30 text-red-200" :
              overall === "WARNING" ? "bg-amber-500/30 text-amber-200" :
              "bg-emerald-500/30 text-emerald-200"
            }`}>{overall}</div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "ai" && (
                  <div className="w-6 h-6 rounded-full bg-violet-600/30 flex items-center justify-center shrink-0 mr-2 mt-0.5">
                    <svg className="w-3 h-3 text-violet-400" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M12 2C6.48 2 2 6.03 2 11c0 2.7 1.23 5.14 3.2 6.8L4 22l4.86-1.62A10.6 10.6 0 0 0 12 20c5.52 0 10-4.03 10-9S17.52 2 12 2z"/>
                    </svg>
                  </div>
                )}
                <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-violet-600 text-white rounded-br-sm"
                    : "bg-slate-800 text-slate-200 rounded-bl-sm"
                }`}>
                  {msg.text}
                  <div className={`text-[10px] mt-1 ${msg.role === "user" ? "text-violet-200" : "text-slate-500"}`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="w-6 h-6 rounded-full bg-violet-600/30 flex items-center justify-center shrink-0 mr-2 mt-0.5">
                  <svg className="w-3 h-3 text-violet-400" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 2C6.48 2 2 6.03 2 11c0 2.7 1.23 5.14 3.2 6.8L4 22l4.86-1.62A10.6 10.6 0 0 0 12 20c5.52 0 10-4.03 10-9S17.52 2 12 2z"/>
                  </svg>
                </div>
                <div className="bg-slate-800 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick questions */}
          <div className="px-3 pb-2 shrink-0">
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {QUICK_QUESTIONS.map(q => (
                <button
                  key={q}
                  type="button"
                  onClick={() => send(q)}
                  disabled={loading}
                  className="shrink-0 text-[10px] px-2.5 py-1 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 hover:bg-violet-500/20 transition-colors disabled:opacity-50 whitespace-nowrap"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="px-3 pb-3 shrink-0">
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-800 px-3 py-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask FireGuard AI…"
                disabled={loading}
                className="flex-1 bg-transparent text-sm text-slate-100 placeholder:text-slate-500 outline-none disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => send(input)}
                disabled={loading || !input.trim()}
                className="w-7 h-7 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-40 flex items-center justify-center transition-colors"
              >
                <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, Bot, User, Plus, MessageSquare, Trash2, Menu, Copy, Check, Sparkles, X
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useFarm } from '../context/FarmContext';

/* ───────────────────────────────────────
   Inline text renderer: **bold**, `code`
─────────────────────────────────────── */
function InlineText({ text }) {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**'))
          return <strong key={i} className="font-bold">{part.slice(2, -2)}</strong>;
        if (part.startsWith('`') && part.endsWith('`'))
          return <code key={i} className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-[11px] font-mono">{part.slice(1, -1)}</code>;
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

/* ───────────────────────────────────────
   Full Markdown → JSX renderer
─────────────────────────────────────── */
function MarkdownMessage({ text }) {
  if (!text) return null;
  const lines = text.split('\n');
  const nodes = [];
  let i = 0;

  while (i < lines.length) {
    const raw = lines[i];
    const trimmed = raw.trim();

    // Skip blank lines
    if (!trimmed) { i++; continue; }

    // Headings
    if (trimmed.startsWith('#### ')) {
      nodes.push(<h4 key={i} className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-4 mb-1"><InlineText text={trimmed.slice(5)} /></h4>);
      i++; continue;
    }
    if (trimmed.startsWith('### ')) {
      nodes.push(<h3 key={i} className="text-base font-extrabold text-slate-900 dark:text-slate-100 mt-4 mb-1.5 border-b border-slate-200 dark:border-slate-700 pb-1"><InlineText text={trimmed.slice(4)} /></h3>);
      i++; continue;
    }
    if (trimmed.startsWith('## ')) {
      nodes.push(<h2 key={i} className="text-lg font-extrabold text-emerald-700 dark:text-emerald-400 mt-4 mb-2"><InlineText text={trimmed.slice(3)} /></h2>);
      i++; continue;
    }
    if (trimmed.startsWith('# ')) {
      nodes.push(<h1 key={i} className="text-xl font-black text-emerald-600 dark:text-emerald-300 mt-3 mb-2"><InlineText text={trimmed.slice(2)} /></h1>);
      i++; continue;
    }

    // Horizontal rule
    if (/^[-=]{3,}$/.test(trimmed)) {
      nodes.push(<hr key={i} className="my-3 border-slate-200 dark:border-slate-700" />);
      i++; continue;
    }

    // Code block
    if (trimmed.startsWith('```')) {
      const lang = trimmed.slice(3);
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // consume closing ```
      nodes.push(
        <div key={i} className="my-3 rounded-xl overflow-hidden border border-slate-700">
          {lang && <div className="px-3 py-1 bg-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">{lang}</div>}
          <pre className="bg-slate-900 text-slate-100 p-4 text-xs font-mono overflow-x-auto leading-relaxed">
            {codeLines.join('\n')}
          </pre>
        </div>
      );
      continue;
    }

    // Markdown table
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      const tableRows = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        tableRows.push(lines[i].trim());
        i++;
      }
      // Filter out separator rows like |---|---|
      const headerRow = tableRows[0];
      const bodyRows = tableRows.slice(1).filter(r => !/^\|[\s|:-]+\|$/.test(r));
      const parseCells = row => row.split('|').slice(1, -1).map(c => c.trim());
      const headers = parseCells(headerRow);
      nodes.push(
        <div key={i} className="my-3 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <table className="w-full text-xs text-left">
            <thead className="bg-emerald-50 dark:bg-emerald-950/40">
              <tr>
                {headers.map((h, hi) => (
                  <th key={hi} className="px-3 py-2 font-bold text-emerald-800 dark:text-emerald-300 border-b border-slate-200 dark:border-slate-700 whitespace-nowrap">
                    <InlineText text={h} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bodyRows.map((row, ri) => (
                <tr key={ri} className={ri % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50 dark:bg-slate-800/50'}>
                  {parseCells(row).map((cell, ci) => (
                    <td key={ci} className="px-3 py-2 text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-800">
                      <InlineText text={cell} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    // Unordered list block
    if (/^[-*]\s/.test(trimmed)) {
      const items = [];
      while (i < lines.length && /^[-*]\s/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^[-*]\s+/, ''));
        i++;
      }
      nodes.push(
        <ul key={i} className="my-2 space-y-1.5 pl-2">
          {items.map((item, ii) => (
            <li key={ii} className="flex items-start gap-2 text-sm leading-relaxed">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
              <span><InlineText text={item} /></span>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Ordered list block
    if (/^\d+\.\s/.test(trimmed)) {
      const items = [];
      let num = 1;
      while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
        items.push({ num, text: lines[i].trim().replace(/^\d+\.\s+/, '') });
        num++;
        i++;
      }
      nodes.push(
        <ol key={i} className="my-2 space-y-1.5 pl-2">
          {items.map((item, ii) => (
            <li key={ii} className="flex items-start gap-2.5 text-sm leading-relaxed">
              <span className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400 w-5 shrink-0 mt-0.5">{item.num}.</span>
              <span><InlineText text={item.text} /></span>
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // Blockquote
    if (trimmed.startsWith('> ')) {
      nodes.push(
        <blockquote key={i} className="my-2 pl-3 border-l-4 border-emerald-400 text-slate-600 dark:text-slate-400 text-sm italic">
          <InlineText text={trimmed.slice(2)} />
        </blockquote>
      );
      i++; continue;
    }

    // Regular paragraph
    nodes.push(
      <p key={i} className="text-sm leading-relaxed text-slate-800 dark:text-slate-200 mb-2">
        <InlineText text={trimmed} />
      </p>
    );
    i++;
  }

  return <div className="space-y-0.5">{nodes}</div>;
}

/* ───────────────────────────────────────
   Main AI Assistant Page
─────────────────────────────────────── */
const AIAssistantPage = () => {
  const { user } = useAuth();
  const { activeFarm } = useFarm();
  const { i18n } = useTranslation();
  
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024); // default open on desktop, closed on mobile
  const userRole = user?.role?.toLowerCase() || 'farmer';

  const roleConfigs = {
    admin: {
      title: "AgriShield Admin Command AI",
      badge: "Enterprise Admin & System Operations",
      badgeColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300",
      avatarBg: "bg-emerald-600 text-white",
      welcomeMsg: `Hello **${user?.name || 'Administrator'}**! I am your **AgriShield Enterprise Admin AI Assistant**.\n\nI monitor system security compliance, MongoDB user accounts, ESP32 IoT node telemetry, database queries, and platform micro-services. Ask me about system status, audit logs, or hardware nodes!`,
      prompts: [
        "Run system security compliance & OWASP audit check",
        "Inspect active ESP32 IoT hardware node telemetry & pinouts",
        "Summarize registered user account roles & statistics",
        "Check server error logs, database connections & rate limits"
      ]
    },
    tester: {
      title: "AgriShield QA & Test AI",
      badge: "Simulation & Model Validation Mode",
      badgeColor: "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-300",
      avatarBg: "bg-purple-600 text-white",
      welcomeMsg: `Hello **${user?.name || 'QA Tester'}**! I am your **AgriShield QA & Simulation AI Assistant**.\n\nI help you run automated test suites, simulate ESP32 sensor telemetry injection, benchmark PyTorch model confidence thresholds, and debug API endpoints!`,
      prompts: [
        "Run Phase 5 production polish test suite",
        "Simulate ESP32 sensor telemetry injection (Soil, Temp, Rain)",
        "Benchmark PyTorch EfficientNetV2 confidence thresholds",
        "Check API response latency & HTTP status codes"
      ]
    },
    farmer: {
      title: "AgriShield Smart Agronomist AI",
      badge: "Agronomy & Crop Care Mode",
      badgeColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300",
      avatarBg: "bg-emerald-500 text-white",
      welcomeMsg: `Hello **${user?.name || 'Farmer'}**! I am your **AgriShield Agronomist AI Assistant**.\n\nAsk me anything about crop disease diagnosis, drip irrigation schedules, NPK fertilizer dosages, or daily farming advisories!`,
      prompts: [
        "How do I prevent Tomato Early Blight — organic treatment?",
        "Calculate NPK fertilizer dosage for my crop growth stage.",
        "What drip irrigation schedule is best for current weather?",
        "Why are my crop leaves turning yellow at growth stage?"
      ]
    }
  };

  const activeRoleConfig = roleConfigs[userRole] || roleConfigs.farmer;

  const createNewSession = (title = `${activeRoleConfig.title} Consultation`) => ({
    id: 'chat_' + Date.now(),
    title,
    createdAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' , timeZone: 'Asia/Kolkata'}),
    messages: [
      { id: Date.now(), role: 'assistant', content: activeRoleConfig.welcomeMsg }
    ]
  });

  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [isSessionsLoaded, setIsSessionsLoaded] = useState(false);
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const chatBottomRef = useRef(null);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await API.get('/api/ai/chat/sessions');
        if (res.data && res.data.length > 0) {
          setSessions(res.data);
          setActiveSessionId(res.data[0].id);
        } else {
          const s = createNewSession();
          setSessions([s]);
          setActiveSessionId(s.id);
          await API.post('/api/ai/chat/sessions', s);
        }
      } catch (err) {
        console.error("Failed to fetch chat sessions:", err);
      } finally {
        setIsSessionsLoaded(true);
      }
    };
    fetchSessions();
  }, [userRole]);

  const currentSession = sessions.find(s => s.id === activeSessionId) || sessions[0];

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentSession?.messages, isTyping]);

  const handleSendMessage = async (queryText = inputQuery) => {
    if (!queryText || !queryText.trim() || isTyping) return;

    // Capture the existing messages BEFORE appending the new user message
    // so we can send them as history to the backend
    const currentMessages = sessions.find(s => s.id === activeSessionId)?.messages || [];

    const userMessage = { id: Date.now(), role: 'user', content: queryText };
    const currentSession = sessions.find(s => s.id === activeSessionId) || sessions[0];
    const newTitle = currentSession.messages.length === 1 ? queryText.slice(0, 32) + '...' : currentSession.title;
    const updatedMsgsWithUser = [...currentSession.messages, userMessage];
    
    setSessions(prev => prev.map(s => {
      if (s.id === activeSessionId) {
        return { ...s, title: newTitle, messages: updatedMsgsWithUser };
      }
      return s;
    }));
    setInputQuery('');
    setIsTyping(true);

    try {
      // Sync user message to backend
      await API.put(`/api/ai/chat/sessions/${activeSessionId}`, { title: newTitle, messages: updatedMsgsWithUser }).catch(console.warn);
      
      // Build history array from all previous messages in this session
      // Skip the very first welcome message (role: assistant, index 0) to avoid bloat
      const historyPayload = currentMessages
        .filter(m => m.role === 'user' || m.role === 'assistant')
        .slice(-20) // send last 20 messages max (10 turns)
        .map(m => ({ role: m.role, content: m.content }));

      const res = await API.post('/api/ai/chat', {
        message: queryText,
        history: historyPayload,   // ✅ Full conversation history included
        user_id: user?.id || 'demo_user',
        role: userRole,
        language: i18n.language || 'en',
        context: {
          current_time_ampm: (() => {
            const d = new Date();
            let h = d.getHours();
            const m = d.getMinutes().toString().padStart(2, '0');
            const s = d.getSeconds().toString().padStart(2, '0');
            const ampm = h >= 12 ? 'PM' : 'AM';
            h = h % 12;
            h = h ? h : 12;
            return `${h}:${m}:${s} ${ampm}`;
          })(),
          current_date: new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' , timeZone: 'Asia/Kolkata'})
        }
      });
      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: res.data.response || res.data.reply || res.data.answer || "I have processed your system request."
      };
      const finalMsgs = [...updatedMsgsWithUser, assistantMessage];
      setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, messages: finalMsgs } : s));
      
      // Sync assistant message to backend
      await API.put(`/api/ai/chat/sessions/${activeSessionId}`, { messages: finalMsgs }).catch(console.warn);
    } catch {
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: "Sorry, I encountered a temporary connection issue. Please check your network connection and try again."
      };
      setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, messages: [...s.messages, errorMessage] } : s));
    } finally {
      setIsTyping(false);
    }
  };

  const createNewChat = async () => {
    const s = createNewSession();
    setSessions(prev => [s, ...prev]);
    setActiveSessionId(s.id);
    try {
      await API.post('/api/ai/chat/sessions', s);
    } catch (err) {
      console.warn("Failed to save new session:", err);
    }
  };

  const deleteSession = async (e, id) => {
    e.stopPropagation();
    if (sessions.length === 1) return;
    
    // Optimistic UI update
    const filtered = sessions.filter(s => s.id !== id);
    setSessions(filtered);
    if (activeSessionId === id) setActiveSessionId(filtered[0].id);
    
    try {
      await API.delete(`/api/ai/chat/sessions/${id}`);
    } catch (err) {
      console.warn("Failed to delete session:", err);
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950 overflow-hidden relative">

      {/* ── MOBILE BACKDROP ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-950/40 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── SIDEBAR ── */}
      <div className={`
        fixed top-16 bottom-0 left-0 z-40 w-64 flex flex-col h-[calc(100vh-4rem)]
        bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800
        transition-all duration-300 ease-in-out
        lg:relative lg:top-0 lg:z-auto lg:h-full lg:shrink-0
        ${sidebarOpen ? 'translate-x-0 shadow-2xl lg:shadow-none lg:w-64 lg:opacity-100' : '-translate-x-full lg:translate-x-0 lg:w-0 lg:opacity-0 lg:overflow-hidden lg:border-none'}
      `}>
        <div className="p-3 border-b border-slate-100 dark:border-slate-800">
          <button
            onClick={createNewChat}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors"
          >
            <Plus className="w-4 h-4" /> New Chat Thread
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
          <p className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">Conversations</p>
          {sessions.map(s => (
            <div
              key={s.id}
              onClick={() => setActiveSessionId(s.id)}
              className={`group flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                s.id === activeSessionId
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <MessageSquare className="w-3.5 h-3.5 shrink-0 opacity-60" />
                <span className="truncate">{s.title}</span>
              </div>
              {sessions.length > 1 && (
                <button onClick={e => deleteSession(e, s.id)} className="opacity-0 group-hover:opacity-100 p-1 text-rose-400 hover:text-rose-600 shrink-0">
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>
        <div className="p-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            <span>Powered by AgriShield LLM</span>
          </div>
        </div>
      </div>

      {/* ── MAIN CHAT ── */}
      <div className="flex-1 flex flex-col min-w-0 h-full">

        {/* Header */}
        <div className="flex items-center justify-between px-3 sm:px-4 py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <button onClick={() => setSidebarOpen(o => !o)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 shrink-0 transition-colors">
              <Menu className="w-4 h-4" />
            </button>
            <div className={`w-8 h-8 rounded-xl ${activeRoleConfig.avatarBg} flex items-center justify-center shrink-0 shadow-sm`}>
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{activeRoleConfig.title}</h2>
              <p className="text-[10px] text-slate-400 truncate max-w-[160px] sm:max-w-xs">{currentSession?.title}</p>
            </div>
          </div>
          <span className={`hidden sm:inline px-3 py-1 rounded-full text-[10px] font-bold border shrink-0 ${activeRoleConfig.badgeColor}`}>
            {activeRoleConfig.badge}
          </span>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {currentSession?.messages.map(msg => {
            const isUser = msg.role === 'user';
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className={`w-9 h-9 rounded-xl ${activeRoleConfig.avatarBg} flex items-center justify-center shrink-0 shadow-sm mt-1`}>
                    <Sparkles className="w-4 h-4" />
                  </div>
                )}

                <div className={`relative group ${isUser ? 'max-w-[70%]' : 'max-w-[82%] w-full'}`}>
                  <div className={`rounded-2xl px-5 py-4 shadow-sm border ${
                    isUser
                      ? 'bg-emerald-600 text-white border-emerald-600 rounded-tr-none'
                      : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-800 rounded-tl-none'
                  }`}>
                    {isUser ? (
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                    ) : (
                      <MarkdownMessage text={msg.content} />
                    )}
                  </div>

                  {!isUser && (
                    <button
                      onClick={() => copyToClipboard(msg.content, msg.id)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-all"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>

                {isUser && (
                  <div className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0 mt-1">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </motion.div>
            );
          })}

          {isTyping && (
            <div className="flex gap-3 justify-start">
              <div className={`w-9 h-9 rounded-xl ${activeRoleConfig.avatarBg} flex items-center justify-center shrink-0`}>
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-5 py-4 rounded-2xl rounded-tl-none flex items-center gap-1.5 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.15s]" />
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.3s]" />
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Input area */}
        <div className="px-6 pb-5 pt-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0">

          {/* Suggested prompts — only on fresh session */}
          {currentSession?.messages.length <= 1 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {activeRoleConfig.prompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(prompt)}
                  className="text-[11px] font-medium px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-end gap-3">
            <textarea
              rows={1}
              value={inputQuery}
              onChange={e => {
                setInputQuery(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
              }}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder={`Ask ${activeRoleConfig.title}...`}
              className="flex-1 resize-none rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed min-h-[48px] max-h-[120px] overflow-y-auto"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputQuery.trim() || isTyping}
              className="shrink-0 p-3 rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-center text-[10px] text-slate-400 mt-2">AgriShield AI may make mistakes. Verify important farming advice with local experts.</p>
        </div>
      </div>
    </div>
  );
};

export default AIAssistantPage;

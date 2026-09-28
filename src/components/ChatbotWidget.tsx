import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  RotateCcw,
  Minimize2,
  Maximize2,
  ExternalLink,
  ChevronDown,
  Compass,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

const N8N_DIRECT_WEBHOOK = 'https://harshitha916.app.n8n.cloud/webhook/e320861e-f3c1-44cb-aa92-3a7467fa0139/chat';
const PROXY_API = '/api/n8n-chat';

const QUICK_SUGGESTIONS = [
  '🏛️ What are the top attractions and entry fees in Visakhapatnam?',
  '🍜 Recommend famous street food stalls in Vizag',
  '💰 How do I budget a 3-day trip to Jaipur or Goa?',
  '⛩️ What are the free admission temples in Kyoto?',
];

// Helper to render markdown-formatted text simply and safely
function renderFormattedText(text: string) {
  // Split into paragraphs / lines
  const lines = text.split('\n');
  return (
    <div className="space-y-1.5 text-xs leading-relaxed break-words">
      {lines.map((line, lineIdx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={lineIdx} className="h-1" />;
        }

        // Check for bullet lists
        if (trimmed.startsWith('* ') || trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
          const bulletText = trimmed.replace(/^[\*\-•]\s*/, '');
          return (
            <div key={lineIdx} className="flex items-start gap-1.5 pl-1">
              <span className="text-amber-500 font-bold shrink-0 mt-0.5">•</span>
              <span>{renderInlineFormatting(bulletText)}</span>
            </div>
          );
        }

        // Check for numbered lists
        const numberedMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
        if (numberedMatch) {
          return (
            <div key={lineIdx} className="flex items-start gap-1.5 pl-1">
              <span className="text-amber-600 font-bold font-mono text-[11px] shrink-0 mt-0.5">
                {numberedMatch[1]}.
              </span>
              <span>{renderInlineFormatting(numberedMatch[2])}</span>
            </div>
          );
        }

        // Check for headings
        if (trimmed.startsWith('### ')) {
          return (
            <div key={lineIdx} className="font-bold text-stone-900 text-xs mt-2 mb-1">
              {renderInlineFormatting(trimmed.replace(/^###\s*/, ''))}
            </div>
          );
        }
        if (trimmed.startsWith('## ') || trimmed.startsWith('# ')) {
          return (
            <div key={lineIdx} className="font-extrabold text-stone-900 text-sm mt-2 mb-1">
              {renderInlineFormatting(trimmed.replace(/^#+\s*/, ''))}
            </div>
          );
        }

        return <p key={lineIdx}>{renderInlineFormatting(line)}</p>;
      })}
    </div>
  );
}

// Helper to parse **bold**, *italic*, and `code` inline
function renderInlineFormatting(str: string) {
  // Regex to split bold, italic, code
  const parts = str.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);

  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      return (
        <strong key={i} className="font-bold text-stone-900">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
      return (
        <em key={i} className="italic text-stone-800">
          {part.slice(1, -1)}
        </em>
      );
    }
    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      return (
        <code key={i} className="px-1 py-0.5 bg-stone-200/80 rounded font-mono text-[11px] text-amber-900">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

export const ChatbotWidget: React.FC<{ activeCityName?: string }> = ({ activeCityName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [hasPromptNotification, setHasPromptNotification] = useState(true);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    return [
      {
        id: 'welcome',
        sender: 'bot',
        text: `Hello! 👋 I am your **RoamWise Travel & Budget Assistant**.\n\nI can help you explore top tourist attractions, verified monument entry fees, famous street food stalls, and tailored trip budgets for **Visakhapatnam**, **Goa**, **Kyoto**, **Rome**, and beyond!\n\nWhat destination would you like to plan today?`,
        timestamp: new Date(),
      },
    ];
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize persistent session ID
  useEffect(() => {
    let sid = localStorage.getItem('roamwise_n8n_chat_session');
    if (!sid) {
      sid = `rw-session-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      localStorage.setItem('roamwise_n8n_chat_session', sid);
    }
    setSessionId(sid);
  }, []);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized, isLoading]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 200);
    }
  }, [isOpen, isMinimized]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || isLoading) return;

    setInputMessage('');
    setHasPromptNotification(false);

    const userMsgId = `user-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: query,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      let botResponseText = '';

      // Try 1: Call server proxy route (bypasses browser CORS across environments)
      try {
        const proxyRes = await fetch(PROXY_API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chatInput: query,
            message: query,
            sessionId: sessionId || 'default-session',
          }),
        });

        if (proxyRes.ok) {
          const proxyData = await proxyRes.json();
          botResponseText =
            proxyData.output ||
            proxyData.text ||
            proxyData.message ||
            proxyData.response ||
            (typeof proxyData === 'string' ? proxyData : '');
        }
      } catch (proxyErr) {
        console.warn('Proxy route attempt failed, trying direct n8n webhook:', proxyErr);
      }

      // Try 2: If proxy didn't succeed, call direct n8n webhook
      if (!botResponseText) {
        const directRes = await fetch(N8N_DIRECT_WEBHOOK, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chatInput: query,
            message: query,
            sessionId: sessionId || 'default-session',
          }),
        });

        if (directRes.ok) {
          const directData = await directRes.json();
          botResponseText =
            directData.output ||
            directData.text ||
            directData.message ||
            directData.response ||
            (typeof directData === 'string' ? directData : '');
        } else {
          throw new Error(`Webhook returned status ${directRes.status}`);
        }
      }

      if (!botResponseText) {
        botResponseText = "I've received your request, but the assistant didn't return a text reply. Please try asking again!";
      }

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: botResponseText,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'bot',
        text: `⚠️ **Unable to reach the assistant at this moment.**\n\n*Error details:* Could not connect to the n8n webhook server. Please verify your connection or try again in a few moments.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    const newSession = `rw-session-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    localStorage.setItem('roamwise_n8n_chat_session', newSession);
    setSessionId(newSession);

    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'bot',
        text: `Conversation cleared! ✨ What destination or budget travel questions can I help you with?`,
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end">
      {/* Floating Teaser Notification Balloon (shown before first open) */}
      {!isOpen && hasPromptNotification && (
        <div
          onClick={() => {
            setIsOpen(true);
            setHasPromptNotification(false);
          }}
          className="mb-2.5 max-w-xs bg-stone-900 text-white text-xs px-3.5 py-2.5 rounded-xl shadow-xl border border-stone-700/80 cursor-pointer animate-in fade-in slide-in-from-bottom-3 duration-300 hover:bg-stone-800 transition-colors flex items-center gap-2.5 group"
        >
          <div className="w-6 h-6 rounded-full bg-amber-400 text-stone-950 flex items-center justify-center shrink-0 font-bold">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div className="flex-1">
            <div className="font-semibold text-amber-300 flex items-center gap-1">
              <span>RoamWise Assistant</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-[11px] text-stone-300 line-clamp-1">
              {activeCityName ? `Ask anything about ${activeCityName}!` : 'Plan your budget trip or food crawl!'}
            </p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setHasPromptNotification(false);
            }}
            className="text-stone-400 hover:text-white p-1 rounded-sm cursor-pointer"
            aria-label="Dismiss teaser"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Chat Window Panel */}
      {isOpen && (
        <div
          className={`w-[92vw] sm:w-[380px] bg-white rounded-2xl shadow-2xl border border-stone-300 overflow-hidden flex flex-col transition-all duration-200 mb-3 ${
            isMinimized ? 'h-14' : 'h-[520px] max-h-[82vh]'
          }`}
          style={{ boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.3)' }}
        >
          {/* Header Bar */}
          <div className="bg-stone-900 text-white px-4 py-3 flex items-center justify-between shrink-0 select-none border-b border-stone-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-400 text-stone-950 flex items-center justify-center font-bold relative shadow-xs">
                <Compass className="w-4 h-4 text-stone-950" />
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-stone-900" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xs tracking-tight text-white font-display">
                    RoamWise Assistant
                  </span>
                  <span className="text-[9px] font-semibold bg-stone-800 text-amber-300 px-1.5 py-0.5 rounded border border-stone-700">
                    n8n AI
                  </span>
                </div>
                <div className="text-[10px] text-stone-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Ready to assist 24/7</span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={handleClearChat}
                className="w-7 h-7 rounded-md flex items-center justify-center text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
                title="Reset conversation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="w-7 h-7 rounded-md flex items-center justify-center text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
                title={isMinimized ? 'Expand' : 'Minimize'}
              >
                {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-md flex items-center justify-center text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
                title="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Expanded Chat Body */}
          {!isMinimized && (
            <>
              {/* Message scroll area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#fafaf8]">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2 ${
                      msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
                    }`}
                  >
                    {/* Avatar */}
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold mt-0.5 ${
                        msg.sender === 'user'
                          ? 'bg-amber-500 text-stone-950'
                          : 'bg-stone-900 text-amber-400 border border-stone-800'
                      }`}
                    >
                      {msg.sender === 'user' ? <User className="w-3 h-3" /> : <Bot className="w-3.5 h-3.5" />}
                    </div>

                    {/* Bubble */}
                    <div
                      className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl ${
                        msg.sender === 'user'
                          ? 'bg-stone-900 text-white rounded-tr-xs shadow-xs'
                          : 'bg-white text-stone-800 border border-stone-200 rounded-tl-xs shadow-xs'
                      }`}
                    >
                      {renderFormattedText(msg.text)}
                      <div
                        className={`text-[9px] mt-1 text-right ${
                          msg.sender === 'user' ? 'text-stone-400' : 'text-stone-400'
                        }`}
                      >
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Animated Typing Indicator */}
                {isLoading && (
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded-full bg-stone-900 text-amber-400 border border-stone-800 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                    <div className="bg-white border border-stone-200 px-3.5 py-2.5 rounded-2xl rounded-tl-xs shadow-xs flex items-center gap-1.5 text-stone-500 text-xs">
                      <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce" />
                      <span className="text-[11px] text-stone-500 ml-1">Consulting travel guide...</span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Prompt Suggestions */}
              {messages.length <= 2 && (
                <div className="px-3 py-2 bg-stone-100 border-t border-stone-200">
                  <div className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1.5">
                    Suggested Questions:
                  </div>
                  <div className="flex flex-col gap-1">
                    {QUICK_SUGGESTIONS.map((sug, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(sug)}
                        disabled={isLoading}
                        className="text-left text-[11px] font-medium text-stone-700 hover:text-stone-950 bg-white hover:bg-amber-50 border border-stone-200 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer truncate"
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input Footer */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="p-3 bg-white border-t border-stone-200 flex items-center gap-2"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask about entry fees, food, itinerary..."
                  disabled={isLoading}
                  className="flex-1 bg-stone-50 text-stone-900 placeholder-stone-400 text-xs px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-all"
                />

                <button
                  type="submit"
                  disabled={!inputMessage.trim() || isLoading}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                    inputMessage.trim() && !isLoading
                      ? 'bg-amber-400 hover:bg-amber-500 text-stone-950 shadow-sm cursor-pointer'
                      : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                  }`}
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          )}
        </div>
      )}

      {/* Floating Toggle Launcher Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          setIsMinimized(false);
          setHasPromptNotification(false);
        }}
        className="group relative flex items-center gap-2 px-4 py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-full shadow-2xl border border-stone-700/80 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
        aria-label="Open RoamWise Chatbot"
      >
        <div className="relative">
          <div className="w-7 h-7 rounded-full bg-amber-400 text-stone-950 flex items-center justify-center font-bold shadow-xs">
            <Bot className="w-4 h-4 text-stone-950" />
          </div>
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-stone-900 animate-pulse" />
        </div>

        <span className="text-xs font-bold tracking-tight pr-1">
          {isOpen ? 'Close Assistant' : 'Chat with Travel AI'}
        </span>

        {/* Small n8n indicator badge */}
        <span className="text-[9px] font-bold bg-amber-400/20 text-amber-300 px-1.5 py-0.5 rounded-full border border-amber-400/30">
          n8n
        </span>
      </button>
    </div>
  );
};

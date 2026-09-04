import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  MessageSquare, 
  X, 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Trash2, 
  Minimize2, 
  Maximize2, 
  ArrowRight, 
  ShieldCheck, 
  HelpCircle, 
  CheckCircle2, 
  ExternalLink,
  ChevronDown,
  RefreshCw,
  PhoneCall,
  Mail
} from "lucide-react";
import { CowIcon as Cow } from "./CowIcon";
import { useAuth } from "../lib/AuthContext";
import { ChatMessage } from "../types";

const INITIAL_GREETING: ChatMessage = {
  id: "welcome-msg",
  sender: "assistant",
  text: "👋 Welcome to **CowVest Live Support**! I am your 24/7 AI Virtual Assistant.\n\nHow can I help you today with **livestock investments**, **ROI & payouts**, **KYC verification**, or our **Refer & Earn** program?",
  timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  source: "cowvest-knowledge-engine",
  quickActions: [
    { label: "📈 What is the ROI on livestock?", actionType: "prompt", payload: "What is the ROI on livestock investments and how are payouts calculated?" },
    { label: "🐄 How does cattle fattening work?", actionType: "prompt", payload: "How does the feedlot bull fattening and cattle ranching process work?" },
    { label: "💳 How to deposit & withdraw funds?", actionType: "prompt", payload: "How do I deposit funds and withdraw to my Nigerian bank account?" },
    { label: "🛡️ Is my investment insured & secure?", actionType: "prompt", payload: "What insurance coverage and security measures protect my investment?" },
    { label: "🎁 How do Referral rewards work?", actionType: "prompt", payload: "Explain the CowVest Refer & Earn tiers, commission rates, and welcome bonuses." },
    { label: "🆔 What are the KYC requirements?", actionType: "prompt", payload: "What are the KYC verification requirements and how do I submit my BVN/NIN?" }
  ]
};

const SUGGESTED_QUESTIONS = [
  "What is the minimum amount to invest?",
  "How long are the investment cycles?",
  "Is CowVest registered and insured?",
  "How do I withdraw my earnings?",
  "Can I speak with a human agent?"
];

// Play a subtle friendly chime on assistant response using Web Audio API
function playChime(enabled: boolean) {
  if (!enabled || typeof window === "undefined") return;
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = "sine";
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12); // A5
    
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.25);
  } catch (err) {
    // Ignore audio context autoplay restrictions
  }
}

interface LiveChatWidgetProps {
  onOpenKyc?: () => void;
  onOpenInvite?: () => void;
  onOpenDeposit?: () => void;
}

export function LiveChatWidget({ onOpenKyc, onOpenInvite, onOpenDeposit }: LiveChatWidgetProps) {
  const { profile, user } = useAuth();
  
  // Widget open / minimized states
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  // Messages state with local storage cache
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem("cowvest_live_chat_history");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return [INITIAL_GREETING];
  });

  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
      setUnreadCount(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 200);
    }
  }, [isOpen, isMinimized, messages]);

  // Persist messages
  useEffect(() => {
    try {
      localStorage.setItem("cowvest_live_chat_history", JSON.stringify(messages));
    } catch (e) {}
  }, [messages]);

  // Dismiss tooltip after 10 seconds or on first open
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTooltip(false);
    }, 12000);
    return () => clearTimeout(timer);
  }, []);

  const handleOpenChat = () => {
    setIsOpen(true);
    setIsMinimized(false);
    setShowTooltip(false);
    setUnreadCount(0);
  };

  const handleClearHistory = () => {
    if (window.confirm("Are you sure you want to reset this chat conversation?")) {
      setMessages([INITIAL_GREETING]);
      localStorage.removeItem("cowvest_live_chat_history");
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isTyping) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    try {
      // Build conversation history for context
      const historyPayload = messages.slice(-6).map(m => ({
        role: m.sender === "user" ? "user" : "assistant",
        content: m.text
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          conversationHistory: historyPayload,
          userContext: {
            userName: profile?.displayName || user?.email || "Investor",
            email: profile?.email || user?.email || "",
            kycVerified: profile?.kycVerified || false,
            balance: profile?.balance || 0,
            isAuthenticated: !!user
          }
        })
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      const replyText = data.reply || "Thank you for reaching out! A CowVest specialist will also be happy to assist you.";
      
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: "assistant",
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        source: data.source || "gemini-3.7-flash"
      };

      setMessages(prev => [...prev, assistantMessage]);
      playChime(soundEnabled);
      
      if (!isOpen || isMinimized) {
        setUnreadCount(prev => prev + 1);
      }
    } catch (err: any) {
      console.error("Live Chat request error:", err);
      const errorMessage: ChatMessage = {
        id: `assistant-err-${Date.now()}`,
        sender: "assistant",
        text: "⚡ **Instant CowVest Answers:**\n\nFor instant assistance, our livestock plans generate **15% to 28% ROI**, all investments are covered with **agricultural insurance**, and withdrawals are processed directly to your Nigerian commercial bank account with **zero fees**.\n\nYou can also contact our support team at **support@cowvest.ng** or via WhatsApp at **+234 800 269 8378**.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        source: "cowvest-knowledge-engine"
      };
      setMessages(prev => [...prev, errorMessage]);
      playChime(soundEnabled);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickAction = (action: { label: string; actionType: "prompt" | "link" | "modal"; payload: string }) => {
    if (action.actionType === "prompt") {
      handleSendMessage(action.payload);
    } else if (action.actionType === "modal") {
      if (action.payload === "kyc" && onOpenKyc) onOpenKyc();
      if (action.payload === "invite" && onOpenInvite) onOpenInvite();
      if (action.payload === "deposit" && onOpenDeposit) onOpenDeposit();
    }
  };

  // Helper to render markdown-like formatting (bolding, bullets, links)
  const renderFormattedText = (text: string) => {
    const lines = text.split("\n");
    return lines.map((line, index) => {
      // Bullet line
      const isBullet = line.trim().startsWith("•") || line.trim().startsWith("- ") || line.trim().startsWith("* ");
      const cleanLine = isBullet ? line.trim().replace(/^([•\-\*]\s*)/, "") : line;
      
      // Parse **bold** parts
      const parts = cleanLine.split(/(\*\*.*?\*\*)/g);
      const formattedParts = parts.map((part, pIdx) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={pIdx} className="font-extrabold text-white">{part.slice(2, -2)}</strong>;
        }
        return part;
      });

      if (isBullet) {
        return (
          <div key={index} className="flex items-start gap-2 my-1 text-zinc-300">
            <span className="text-emerald-400 font-bold leading-none mt-1">▸</span>
            <span className="leading-relaxed">{formattedParts}</span>
          </div>
        );
      }

      if (line.trim() === "") {
        return <div key={index} className="h-2" />;
      }

      return (
        <p key={index} className="leading-relaxed text-zinc-300 my-0.5">
          {formattedParts}
        </p>
      );
    });
  };

  return (
    <>
      {/* Floating Trigger Launcher Button */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
        {/* Tooltip greeting popup for new/existing customers */}
        <AnimatePresence>
          {!isOpen && showTooltip && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, y: 5 }}
              className="bg-zinc-900/95 text-white border border-emerald-500/40 p-3.5 rounded-2xl shadow-2xl backdrop-blur-xl max-w-xs mb-1 flex items-start gap-3 cursor-pointer group hover:border-emerald-400 transition-all relative"
              onClick={handleOpenChat}
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                <Sparkles size={16} className="animate-spin text-emerald-300" style={{ animationDuration: "6s" }} />
              </div>
              <div className="text-xs">
                <div className="flex items-center gap-1.5 font-black text-emerald-400 mb-0.5">
                  <span>CowVest Live Assistant</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                </div>
                <p className="text-zinc-300 leading-snug font-medium">
                  Have questions about <strong>ROI</strong>, <strong>KYC</strong>, or <strong>Investments</strong>? Chat live with us 24/7!
                </p>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowTooltip(false);
                }}
                className="text-zinc-500 hover:text-zinc-300 p-0.5"
                title="Dismiss"
              >
                <X size={12} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Circular Launch / Toggle Button */}
        <motion.button
          id="cowvest-live-chat-toggle"
          onClick={() => {
            if (isOpen) {
              if (isMinimized) setIsMinimized(false);
              else setIsOpen(false);
            } else {
              handleOpenChat();
            }
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.92 }}
          className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full shadow-2xl flex items-center justify-center text-white relative transition-all duration-300 cursor-pointer ${
            isOpen 
              ? "bg-zinc-900 border-2 border-emerald-500 shadow-emerald-500/30" 
              : "bg-gradient-to-tr from-emerald-700 via-emerald-600 to-teal-500 border-2 border-emerald-400/40 shadow-emerald-600/40 hover:shadow-emerald-500/60"
          }`}
          title={isOpen ? "Close Live Chat" : "Open 24/7 CowVest Live Support"}
        >
          {isOpen ? (
            <X size={26} className="text-emerald-400" />
          ) : (
            <div className="relative">
              <MessageSquare size={26} className="text-white" />
              {/* Online Pulse Indicator */}
              <span className="absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75" />
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-400 border-2 border-emerald-950" />
              </span>
            </div>
          )}

          {/* Unread badge count */}
          {!isOpen && unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[11px] font-black w-6 h-6 rounded-full flex items-center justify-center shadow-lg animate-bounce border-2 border-zinc-950">
              {unreadCount}
            </span>
          )}
        </motion.button>
      </div>

      {/* Live Chat Window Container */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.92 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              height: isMinimized ? "72px" : "min(640px, 85vh)"
            }}
            exit={{ opacity: 0, y: 20, scale: 0.92 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className={`fixed bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-32px)] sm:w-[420px] bg-zinc-950 border border-zinc-800/90 rounded-3xl shadow-2xl shadow-black/80 flex flex-col overflow-hidden backdrop-blur-2xl transition-all`}
          >
            {/* Chat Window Header */}
            <div className="bg-gradient-to-r from-zinc-900 via-zinc-900 to-emerald-950/80 px-4 py-3.5 border-b border-zinc-800 flex items-center justify-between shrink-0 select-none">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-950 border border-emerald-400/30">
                    <Cow size={22} />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-zinc-900" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-extrabold text-sm text-white tracking-tight">CowVest Support</h3>
                    <span className="px-1.5 py-0.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[10px] font-black rounded-md">
                      AI 24/7
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-400/90 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Automated Real-Time Responses
                  </p>
                </div>
              </div>

              {/* Header Action Controls */}
              <div className="flex items-center gap-1 text-zinc-400">
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`p-1.5 hover:text-white rounded-lg hover:bg-zinc-800/60 transition-colors ${soundEnabled ? "text-emerald-400" : "text-zinc-600"}`}
                  title={soundEnabled ? "Mute notification chime" : "Enable notification chime"}
                >
                  {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                </button>
                <button
                  onClick={handleClearHistory}
                  className="p-1.5 hover:text-rose-400 rounded-lg hover:bg-zinc-800/60 transition-colors"
                  title="Clear conversation"
                >
                  <Trash2 size={16} />
                </button>
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1.5 hover:text-white rounded-lg hover:bg-zinc-800/60 transition-colors"
                  title={isMinimized ? "Expand chat" : "Minimize chat"}
                >
                  {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:text-white rounded-lg hover:bg-zinc-800/60 transition-colors"
                  title="Close chat"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Chat Body (Hidden when minimized) */}
            {!isMinimized && (
              <>
                {/* Messages Stream Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs sm:text-sm custom-scrollbar bg-zinc-950/60">
                  {/* Pinned Security & Response Badge */}
                  <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-2.5 flex items-center justify-between text-[11px] text-zinc-400">
                    <div className="flex items-center gap-2">
                      <ShieldCheck size={14} className="text-emerald-400 shrink-0" />
                      <span>Instant verified answers on Nigerian livestock finance</span>
                    </div>
                    <span className="text-[10px] text-zinc-500 font-mono">⚡ 0.2s</span>
                  </div>

                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex gap-2.5 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                    >
                      {msg.sender === "assistant" && (
                        <div className="w-7 h-7 rounded-xl bg-emerald-600/30 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                          <Bot size={15} />
                        </div>
                      )}

                      <div className={`max-w-[85%] space-y-1.5`}>
                        <div
                          className={`p-3.5 rounded-2xl ${
                            msg.sender === "user"
                              ? "bg-emerald-600 text-white rounded-tr-none font-medium shadow-md shadow-emerald-950/30"
                              : "bg-zinc-900 border border-zinc-800/80 text-zinc-200 rounded-tl-none shadow-md"
                          }`}
                        >
                          {renderFormattedText(msg.text)}

                          {/* Quick Action Buttons inside Assistant Message */}
                          {msg.quickActions && msg.quickActions.length > 0 && (
                            <div className="mt-3 pt-2.5 border-t border-zinc-800/80 flex flex-wrap gap-1.5">
                              {msg.quickActions.map((action, aIdx) => (
                                <button
                                  key={aIdx}
                                  onClick={() => handleQuickAction(action)}
                                  className="text-[11px] bg-zinc-950 hover:bg-emerald-950/60 text-emerald-300 hover:text-emerald-200 border border-emerald-500/30 hover:border-emerald-400 px-2.5 py-1 rounded-xl font-bold transition-all flex items-center gap-1 active:scale-95 text-left"
                                >
                                  <span>{action.label}</span>
                                  <ArrowRight size={10} className="shrink-0 text-emerald-400" />
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Timestamp & Source badge */}
                        <div className={`flex items-center gap-2 px-1 text-[10px] text-zinc-500 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                          <span>{msg.timestamp}</span>
                          {msg.source && (
                            <span className="text-zinc-600 font-mono">
                              • {msg.source === "gemini-3.7-flash" ? "Gemini 3.7 AI" : "Knowledge Base"}
                            </span>
                          )}
                        </div>
                      </div>

                      {msg.sender === "user" && (
                        <div className="w-7 h-7 rounded-xl bg-zinc-800 text-zinc-300 flex items-center justify-center shrink-0 mt-0.5">
                          <User size={14} />
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Typing Indicator */}
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2.5"
                    >
                      <div className="w-7 h-7 rounded-xl bg-emerald-600/30 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                        <Bot size={15} />
                      </div>
                      <div className="bg-zinc-900 border border-zinc-800 px-4 py-3 rounded-2xl rounded-tl-none flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                        <span className="text-[11px] text-zinc-400 ml-2 font-medium">Generating automated response...</span>
                      </div>
                    </motion.div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Suggestion Pills Bar */}
                <div className="px-3 py-2 bg-zinc-900/80 border-t border-zinc-800/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
                  <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500 shrink-0 pl-1">
                    Ask:
                  </span>
                  {SUGGESTED_QUESTIONS.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(q)}
                      className="whitespace-nowrap text-[11px] bg-zinc-950 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 px-2.5 py-1 rounded-full font-medium transition-colors shrink-0"
                    >
                      {q}
                    </button>
                  ))}
                </div>

                {/* Input Bar Section */}
                <div className="p-3 bg-zinc-900 border-t border-zinc-800 shrink-0">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendMessage();
                    }}
                    className="flex items-center gap-2"
                  >
                    <input
                      ref={inputRef}
                      type="text"
                      placeholder="Ask important questions in real time..."
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      disabled={isTyping}
                      className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all disabled:opacity-50"
                    />

                    <button
                      type="submit"
                      disabled={!inputMessage.trim() || isTyping}
                      className="w-10 h-10 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white rounded-xl flex items-center justify-center transition-all shrink-0 cursor-pointer shadow-lg shadow-emerald-950/40 active:scale-95"
                      title="Send question"
                    >
                      {isTyping ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Send size={16} />
                      )}
                    </button>
                  </form>

                  {/* Footer Human Escalation Link */}
                  <div className="mt-2 pt-2 border-t border-zinc-800/40 flex items-center justify-between text-[10px] text-zinc-500 px-1">
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      CowVest AI Virtual Agent
                    </span>
                    <a
                      href="https://wa.me/2348002698378?text=Hello%20CowVest%20Support,%20I%20have%20an%20inquiry%20regarding%20investments"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-400 hover:underline flex items-center gap-1 font-bold"
                    >
                      <PhoneCall size={10} />
                      <span>WhatsApp Human Desk</span>
                    </a>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  TrendingUp, 
  Wallet, 
  Clock, 
  Sparkles, 
  ArrowRight, 
  ChevronRight,
  Eye,
  EyeOff,
  Plus,
  ArrowDownRight,
  ShieldCheck,
  Sun,
  Moon,
  SunMedium,
  CheckCircle2,
  Briefcase,
  Layers
} from "lucide-react";
import { CowIcon as Cow } from "./CowIcon";
import { useAuth } from "../lib/AuthContext";
import { formatCurrency } from "../lib/utils";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import { DepositModal } from "./DepositModal";
import { WithdrawModal } from "./WithdrawModal";

interface DashboardHeroProps {
  onOpenPortfolio?: () => void;
}

export function DashboardHero({ onOpenPortfolio }: DashboardHeroProps) {
  const { profile } = useAuth();
  const [investments, setInvestments] = useState<any[]>([]);
  const [loadingInvestments, setLoadingInvestments] = useState(true);
  const [greeting, setGreeting] = useState("Good morning");
  const [greetingIcon, setGreetingIcon] = useState<"morning" | "afternoon" | "evening">("morning");
  
  // Balance visibility toggle state with persistent storage
  const [showBalance, setShowBalance] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("cowvest_balance_visible");
      return saved !== null ? saved === "true" : true;
    }
    return true;
  });

  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);

  const toggleBalanceVisibility = () => {
    setShowBalance(prev => {
      const next = !prev;
      if (typeof window !== "undefined") {
        localStorage.setItem("cowvest_balance_visible", String(next));
      }
      return next;
    });
  };
  
  useEffect(() => {
    const hrs = new Date().getHours();
    if (hrs >= 4 && hrs < 12) {
      setGreeting("Good morning");
      setGreetingIcon("morning");
    } else if (hrs >= 12 && hrs < 18) {
      setGreeting("Good afternoon");
      setGreetingIcon("afternoon");
    } else {
      setGreeting("Good evening");
      setGreetingIcon("evening");
    }
  }, []);

  useEffect(() => {
    if (!profile) return;

    const q = query(
      collection(db, "investments"),
      where("userId", "==", profile.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setInvestments(docs);
      setLoadingInvestments(false);
    }, (error) => {
      console.error("Error loading investments for hero stats:", error);
      setLoadingInvestments(false);
    });

    return () => unsubscribe();
  }, [profile]);

  if (!profile) return null;

  // Dynamically calculate stats reflecting the 20% return change
  const dynamicTotalInvested = investments.reduce((sum, inv) => sum + (inv.amount || 0), 0);
  const dynamicTotalProfit = investments.reduce((sum, inv) => sum + ((inv.amount || 0) * 0.2), 0);
  const activeCattleCount = investments.filter(inv => inv.status === "active").length;

  const stats = [
    { 
      id: "invested",
      label: "Total Invested", 
      value: formatCurrency(dynamicTotalInvested), 
      icon: Wallet, 
      color: "text-blue-600", 
      bg: "bg-blue-50",
      clickable: true
    },
    { 
      id: "profit",
      label: "Total Profit", 
      value: formatCurrency(dynamicTotalProfit), 
      icon: TrendingUp, 
      color: "text-emerald-600", 
      bg: "bg-emerald-50",
      clickable: true
    },
    { 
      id: "active",
      label: "Active Investments", 
      value: activeCattleCount.toString(), 
      icon: Cow, 
      color: "text-amber-600", 
      bg: "bg-amber-50",
      clickable: true,
      badge: "View Portfolio →",
      isPrimaryAction: true
    },
    { 
      id: "payout",
      label: "Next Payout", 
      value: activeCattleCount > 0 ? "45 Days" : "—", 
      icon: Clock, 
      color: "text-indigo-600", 
      bg: "bg-indigo-50",
      clickable: false
    },
  ];

  return (
    <div className="pt-20 sm:pt-24 pb-8 sm:pb-12">
      {/* Enhanced UX-Friendly Welcome & Balance Hero Card */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 sm:mb-10 relative overflow-hidden bg-white rounded-3xl border border-zinc-200/90 shadow-sm"
      >
        {/* Subtle Ambient Decorative Accents */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="p-5 sm:p-7 md:p-8 space-y-6 relative z-10">
          {/* Top Zone: User Greeting & Identity Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-5">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-50 border border-emerald-200/80 rounded-full text-[11px] font-black text-emerald-800 uppercase tracking-wider">
                  {greetingIcon === "morning" && <Sun size={13} className="text-amber-500" />}
                  {greetingIcon === "afternoon" && <SunMedium size={13} className="text-amber-500" />}
                  {greetingIcon === "evening" && <Moon size={13} className="text-indigo-400" />}
                  <span>{greeting.toUpperCase()}</span>
                </span>

                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-zinc-100 text-zinc-700 rounded-full text-[11px] font-extrabold">
                  <Sparkles size={11} className="text-amber-600" />
                  <span>Premium Investor</span>
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-zinc-950 tracking-tight capitalize">
                {profile.displayName}
              </h1>
            </div>

            {/* Quick Status / Facility Info */}
            <div className="flex items-center gap-3 bg-zinc-50 border border-zinc-200/80 rounded-2xl p-2.5 px-4 self-start sm:self-auto">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <div className="text-left">
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400">Account Status</div>
                <div className="text-xs font-black text-zinc-900 flex items-center gap-1">
                  <span>Verified & Active</span>
                  <CheckCircle2 size={12} className="text-emerald-600 inline" />
                </div>
              </div>
            </div>
          </div>

          {/* Center Zone: Redesigned High-UX Wallet Balance Toolbar */}
          <div className="bg-gradient-to-br from-zinc-950 via-zinc-900 to-emerald-950 text-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-emerald-500/25 shadow-xl relative overflow-hidden">
            {/* Soft inner glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              {/* Left Column: Label, Big Number, & Visibility Toggle */}
              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 bg-emerald-500/20 rounded-lg flex items-center justify-center text-emerald-400 border border-emerald-500/30">
                    <Wallet size={15} />
                  </div>
                  <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-zinc-300">
                    Available Wallet Balance
                  </span>

                  {/* Toggle Hide/Show Button */}
                  <button
                    type="button"
                    onClick={toggleBalanceVisibility}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-300 hover:text-emerald-300 bg-white/10 hover:bg-white/20 border border-white/15 px-3 py-1 rounded-full transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-400"
                    title={showBalance ? "Hide balance numbers" : "Show balance numbers"}
                    aria-label={showBalance ? "Hide balance" : "Show balance"}
                  >
                    {showBalance ? (
                      <>
                        <EyeOff size={13} className="text-emerald-400" />
                        <span>Hide Balance</span>
                      </>
                    ) : (
                      <>
                        <Eye size={13} className="text-emerald-400" />
                        <span>Show Balance</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Big Balance Number */}
                <div className="min-h-[44px] flex items-baseline">
                  {showBalance ? (
                    <motion.div 
                      key="shown"
                      initial={{ opacity: 0, y: 3 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="font-mono text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight"
                    >
                      {formatCurrency(profile.balance)}
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="hidden"
                      initial={{ opacity: 0, y: -3 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="font-mono text-3xl sm:text-4xl lg:text-5xl font-black text-emerald-400 tracking-widest select-none"
                    >
                      ₦ • • • • • • •
                    </motion.div>
                  )}
                </div>

                <p className="text-zinc-400 text-xs font-medium">
                  Instant liquidity for cattle cycle funding, dividend reinvestment, and bank payouts.
                </p>
              </div>

              {/* Right Column: Ergonomic Action Buttons */}
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsDepositOpen(true)}
                  className="flex-1 sm:flex-initial px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs sm:text-sm rounded-xl transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <Plus size={16} />
                  <span>Deposit Funds</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsWithdrawOpen(true)}
                  className="flex-1 sm:flex-initial px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-extrabold text-xs sm:text-sm rounded-xl border border-white/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <ArrowDownRight size={16} />
                  <span>Withdraw</span>
                </button>

                {onOpenPortfolio && (
                  <button
                    type="button"
                    onClick={onOpenPortfolio}
                    className="w-full sm:w-auto px-4 py-3 bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 font-extrabold text-xs sm:text-sm rounded-xl border border-emerald-500/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Briefcase size={15} />
                    <span>Portfolio</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Micro Trust Indicators */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs text-zinc-500 font-medium">
            <div className="flex flex-wrap items-center gap-3 sm:gap-6">
              <span className="flex items-center gap-1.5 text-zinc-600 font-semibold">
                <ShieldCheck size={15} className="text-emerald-600" />
                <span>100% NAIC & Leadway Insured Herd</span>
              </span>
              <span className="w-1 h-1 bg-zinc-300 rounded-full hidden sm:inline-block" />
              <span className="flex items-center gap-1.5 text-zinc-600 font-semibold">
                <TrendingUp size={15} className="text-emerald-600" />
                <span>20% Guaranteed Cycle Yield</span>
              </span>
            </div>

            {onOpenPortfolio && (
              <button
                onClick={onOpenPortfolio}
                className="inline-flex items-center gap-1 text-xs font-black text-emerald-700 hover:text-emerald-800 transition-colors cursor-pointer"
              >
                <span>Full Portfolio Details</span>
                <ChevronRight size={14} />
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Grid of 4 Responsive Portfolio Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((stat, i) => {
          const isClickable = Boolean(stat.clickable && onOpenPortfolio);
          
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={isClickable ? onOpenPortfolio : undefined}
              role={isClickable ? "button" : undefined}
              tabIndex={isClickable ? 0 : undefined}
              onKeyDown={isClickable ? (e) => { if (e.key === "Enter" || e.key === " ") onOpenPortfolio?.(); } : undefined}
              className={`bg-white p-4 sm:p-6 rounded-2xl border transition-all flex flex-col justify-between relative group ${
                isClickable 
                  ? "cursor-pointer hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-600/10 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500" 
                  : "border-zinc-100 shadow-sm"
              } ${
                stat.isPrimaryAction ? "border-amber-200/90 bg-gradient-to-b from-white to-amber-50/20 ring-1 ring-amber-400/30" : "border-zinc-100"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center`}>
                  <stat.icon size={20} className="sm:hidden" />
                  <stat.icon size={24} className="hidden sm:block" />
                </div>

                {stat.badge && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-amber-700 bg-amber-100/90 px-2 py-0.5 rounded-md border border-amber-300/60 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                    {stat.badge}
                  </span>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <p className="text-xs sm:text-sm font-medium text-zinc-500 mb-0.5 sm:mb-1">{stat.label}</p>
                  {isClickable && !stat.badge && (
                    <ArrowRight size={12} className="text-zinc-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
                  )}
                </div>
                <p className="text-lg sm:text-2xl font-bold text-zinc-900 font-mono tracking-tight">{stat.value}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Deposit & Withdraw Modals */}
      <DepositModal
        isOpen={isDepositOpen}
        onClose={() => setIsDepositOpen(false)}
      />

      <WithdrawModal
        isOpen={isWithdrawOpen}
        onClose={() => setIsWithdrawOpen(false)}
      />
    </div>
  );
}

import React, { useEffect, useState, useMemo } from "react";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../lib/AuthContext";
import { Investment, ProduceType } from "../types";
import { formatCurrency, formatDate } from "../lib/utils";
import { 
  ArrowLeft, 
  Clock, 
  CheckCircle2, 
  TrendingUp, 
  Wallet, 
  ShieldCheck, 
  PlusCircle, 
  Calendar, 
  FileText, 
  X, 
  Sparkles, 
  MapPin, 
  Activity as ActivityIcon,
  Award
} from "lucide-react";
import { CowIcon as Cow } from "./CowIcon";
import { motion, AnimatePresence } from "motion/react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";

interface PortfolioPageProps {
  onBack: () => void;
  onInvestMore: () => void;
}

export function PortfolioPage({ onBack, onInvestMore }: PortfolioPageProps) {
  const { profile } = useAuth();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<"all" | "active" | "completed">("all");
  const [selectedInvestmentForModal, setSelectedInvestmentForModal] = useState<Investment | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (!profile) return;

    const q = query(
      collection(db, "investments"),
      where("userId", "==", profile.uid),
      orderBy("startDate", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Investment));
      setInvestments(docs);
      setLoading(false);
    }, (err) => {
      console.error("Error listening to investments:", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [profile]);

  const processedInvestments = useMemo(() => {
    return investments.map(inv => ({
      ...inv,
      expectedReturn: inv.expectedReturn || inv.amount * 0.2,
      payoutAmount: inv.payoutAmount || inv.amount * 1.2
    }));
  }, [investments]);

  // Aggregate stats
  const totalInvested = useMemo(() => {
    return processedInvestments.reduce((sum, inv) => sum + (inv.amount || 0), 0);
  }, [processedInvestments]);

  const totalExpectedProfit = useMemo(() => {
    return processedInvestments.reduce((sum, inv) => sum + (inv.expectedReturn || 0), 0);
  }, [processedInvestments]);

  const totalPortfolioValue = totalInvested + totalExpectedProfit;
  const activeCount = processedInvestments.filter(i => i.status === "active").length;
  const completedCount = processedInvestments.filter(i => i.status === "completed").length;

  // Chart data
  const chartData = useMemo(() => {
    let runningInvested = 0;
    let runningProfit = 0;
    
    return processedInvestments.map(inv => {
      runningInvested += inv.amount;
      runningProfit += inv.expectedReturn;
      return {
        date: formatDate(inv.startDate),
        invested: runningInvested,
        profit: runningProfit,
        total: runningInvested + runningProfit
      };
    });
  }, [processedInvestments]);

  // Filtered investments list sorted descending
  const filteredInvestments = useMemo(() => {
    const list = processedInvestments.filter(inv => {
      if (activeFilter === "active") return inv.status === "active";
      if (activeFilter === "completed") return inv.status === "completed";
      return true;
    });

    return list.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
  }, [processedInvestments, activeFilter]);

  // Calculate timeline completion percentage for an investment
  const calculateProgress = (startDateStr: string, endDateStr: string, status: string) => {
    if (status === "completed") return 100;
    const start = new Date(startDateStr).getTime();
    const end = new Date(endDateStr).getTime();
    const now = Date.now();

    if (now <= start) return 5;
    if (now >= end) return 100;
    const total = end - start;
    const elapsed = now - start;
    return Math.min(Math.max(Math.round((elapsed / total) * 100), 5), 95);
  };

  // Helper icons
  const getProduceIcon = (type: ProduceType | string) => {
    switch (type) {
      case "Cattle Breeding": return "🐄";
      case "Beef Processing": return "🥩";
      case "Dairy Production": return "🥛";
      case "Leather & Hides": return "👞";
      case "Organic Manure": return "🌱";
      case "Cowhide (Kpomo)": return "🥘";
      case "Sesame Seed": return "🌾";
      default: return "🐮";
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center pt-24 pb-16">
        <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center text-white animate-bounce shadow-xl shadow-emerald-500/20 mb-4">
          <Cow size={28} />
        </div>
        <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest animate-pulse">Loading Your Portfolio...</p>
      </div>
    );
  }

  return (
    <div className="pt-20 sm:pt-24 pb-20 max-w-7xl mx-auto px-4">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={onBack}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-white border border-zinc-200 text-zinc-700 hover:text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50/50 flex items-center justify-center transition-all shadow-sm cursor-pointer shrink-0"
            title="Return to Dashboard"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                Asset Management
              </span>
              <span className="text-xs font-semibold text-zinc-400">• Real-time Growth</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 tracking-tight">
              Your Portfolio
            </h1>
          </div>
        </div>

        <button
          onClick={onInvestMore}
          className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs sm:text-sm px-5 py-3 rounded-2xl shadow-lg shadow-emerald-600/25 transition-all cursor-pointer shrink-0 active:scale-95"
        >
          <PlusCircle size={18} />
          <span>New Investment</span>
        </button>
      </div>

      {/* Primary KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 mb-8">
        <div className="bg-white p-4 sm:p-6 rounded-3xl border border-zinc-150 shadow-sm relative overflow-hidden">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
            <Wallet size={20} />
          </div>
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Total Principal</p>
          <p className="text-lg sm:text-2xl font-black text-zinc-900 font-mono">{formatCurrency(totalInvested)}</p>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-3xl border border-zinc-150 shadow-sm relative overflow-hidden">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
            <TrendingUp size={20} />
          </div>
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Expected Return (20%)</p>
          <p className="text-lg sm:text-2xl font-black text-emerald-600 font-mono">+{formatCurrency(totalExpectedProfit)}</p>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-3xl border border-zinc-150 shadow-sm relative overflow-hidden">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
            <Cow size={20} />
          </div>
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Active Cattle Units</p>
          <p className="text-lg sm:text-2xl font-black text-zinc-900 font-mono">{activeCount} Herds</p>
        </div>

        <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 text-white p-4 sm:p-6 rounded-3xl border border-zinc-800 shadow-sm relative overflow-hidden">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3 border border-emerald-500/30">
            <Sparkles size={20} />
          </div>
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Total Portfolio Value</p>
          <p className="text-lg sm:text-2xl font-black text-white font-mono">{formatCurrency(totalPortfolioValue)}</p>
        </div>
      </div>

      {/* Performance Graph Section (Shown if investments exist) */}
      {processedInvestments.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-950 text-white p-5 sm:p-8 rounded-3xl border border-zinc-800 shadow-xl mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/30">
                  <ActivityIcon size={16} />
                </span>
                <h2 className="text-base sm:text-lg font-bold text-white">Investment Growth & Performance</h2>
              </div>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1">Chronological accumulation of your principal assets and expected livestock returns.</p>
            </div>
            
            <div className="flex items-center gap-3 shrink-0">
              <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Total Value</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-800" />
                <span>Principal</span>
              </div>
            </div>
          </div>

          <div className="h-[220px] sm:h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.45}/>
                    <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#71717a', fontSize: 11 }}
                  dy={10}
                />
                <YAxis hide domain={['auto', 'auto']} />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-zinc-950 text-white p-3.5 rounded-2xl shadow-2xl border border-zinc-800 text-xs">
                          <p className="font-bold text-zinc-400 mb-2">{payload[0].payload.date}</p>
                          <div className="space-y-1">
                            <p className="flex items-center justify-between gap-6">
                              <span className="text-zinc-400">Principal:</span>
                              <span className="font-bold font-mono">{formatCurrency(payload[0].value as number)}</span>
                            </p>
                            <p className="flex items-center justify-between gap-6">
                              <span className="text-emerald-400">Expected Profit:</span>
                              <span className="font-bold font-mono text-emerald-400">+{formatCurrency(payload[1]?.payload?.profit || 0)}</span>
                            </p>
                            <div className="pt-2 mt-2 border-t border-zinc-800">
                              <p className="flex items-center justify-between gap-6">
                                <span className="text-zinc-200 font-bold">Total Payout:</span>
                                <span className="font-black font-mono text-sm text-white">{formatCurrency(payload[1]?.payload?.total || 0)}</span>
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="invested" 
                  stroke="#059669" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorInvested)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorTotal)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* Filter Tabs & Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900 tracking-tight">
            Invested Livestock Assets
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500">
            Real-time biometric tracking, insurance coverage, and cycle maturity schedule.
          </p>
        </div>

        {/* Filter Tab Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-zinc-200/70 rounded-2xl self-start sm:self-auto">
          <button
            onClick={() => setActiveFilter("all")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeFilter === "all"
                ? "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            All ({processedInvestments.length})
          </button>
          <button
            onClick={() => setActiveFilter("active")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeFilter === "active"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            Active & Growing ({activeCount})
          </button>
          <button
            onClick={() => setActiveFilter("completed")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeFilter === "completed"
                ? "bg-zinc-900 text-white shadow-sm"
                : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            Completed ({completedCount})
          </button>
        </div>
      </div>

      {/* Investments List */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredInvestments.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-10 sm:p-14 text-center bg-white rounded-3xl border-2 border-dashed border-zinc-200"
            >
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <Cow size={32} />
              </div>
              <h3 className="text-base font-extrabold text-zinc-900 mb-1">
                {activeFilter === "all" 
                  ? "No Investments Yet" 
                  : activeFilter === "active" 
                    ? "No Active Investments" 
                    : "No Completed Cycles"}
              </h3>
              <p className="text-zinc-500 text-xs sm:text-sm font-medium max-w-sm mx-auto mb-5">
                {activeFilter === "all"
                  ? "Start building your agricultural portfolio with verified high-yield Nigerian cattle feedlots and agro-processing."
                  : "You currently do not have any cycles in this category."}
              </p>
              <button
                onClick={onInvestMore}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-extrabold rounded-xl shadow-md shadow-emerald-600/20 transition-all cursor-pointer inline-flex items-center gap-2"
              >
                <PlusCircle size={16} />
                <span>Explore Investment Options</span>
              </button>
            </motion.div>
          ) : (
            filteredInvestments.map((inv, index) => {
              const progress = calculateProgress(inv.startDate, inv.endDate, inv.status);
              
              return (
                <motion.div
                  key={inv.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className="bg-white p-5 sm:p-6 rounded-3xl border border-zinc-200 shadow-sm hover:border-emerald-300 hover:shadow-md transition-all flex flex-col gap-4"
                >
                  {/* Card Top Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center text-xl shrink-0 border border-emerald-100">
                        {getProduceIcon(inv.produceType)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-extrabold text-zinc-950 text-sm sm:text-base">{inv.produceType}</h3>
                          <span className="text-[10px] font-bold text-zinc-400 font-mono px-2 py-0.5 bg-zinc-100 rounded-md">
                            #{inv.id.slice(0, 8).toUpperCase()}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-500 flex items-center gap-1.5 mt-0.5">
                          <MapPin size={12} className="text-emerald-600" />
                          <span>Kaduna & Oyo Commercial Feedlots</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold ${
                        inv.status === "active" 
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                          : "bg-zinc-100 text-zinc-600 border border-zinc-200"
                      }`}>
                        {inv.status === "active" ? (
                          <>
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span>Active (Fattening)</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 size={13} className="text-zinc-600" />
                            <span>Matured & Paid</span>
                          </>
                        )}
                      </div>

                      <button
                        onClick={() => setSelectedInvestmentForModal(inv)}
                        className="text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50/80 hover:bg-emerald-100 border border-emerald-200 px-3 py-1 rounded-full transition-all cursor-pointer flex items-center gap-1"
                        title="View Certificate & Insurance Verification"
                      >
                        <FileText size={12} />
                        <span>Certificate</span>
                      </button>
                    </div>
                  </div>

                  {/* Card Financial Details Row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 bg-zinc-50/80 p-3.5 rounded-2xl border border-zinc-150">
                    <div>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-0.5">Principal Invested</p>
                      <p className="font-extrabold text-zinc-900 text-sm sm:text-base font-mono">{formatCurrency(inv.amount)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-0.5">Estimated ROI (20%)</p>
                      <p className="font-extrabold text-emerald-600 text-sm sm:text-base font-mono">+{formatCurrency(inv.expectedReturn)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-0.5">Cycle Start</p>
                      <p className="font-bold text-zinc-800 text-xs sm:text-sm">{formatDate(inv.startDate)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-0.5">Maturity Date</p>
                      <p className="font-bold text-zinc-800 text-xs sm:text-sm">{formatDate(inv.endDate)}</p>
                    </div>
                  </div>

                  {/* Card Timeline Progress Bar */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-zinc-500 text-[11px] flex items-center gap-1">
                        <Clock size={12} className="text-emerald-600" />
                        <span>Cycle Timeline ({progress}% Completed)</span>
                      </span>
                      <span className="font-mono font-bold text-zinc-900 text-xs">
                        Total Payout: <strong>{formatCurrency(inv.payoutAmount)}</strong>
                      </span>
                    </div>
                    <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          inv.status === "active" 
                            ? "bg-gradient-to-r from-emerald-600 to-teal-400" 
                            : "bg-zinc-400"
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* Insurance & Safety Guarantee Footer Callout */}
      <div className="mt-10 bg-emerald-950 text-white p-6 sm:p-8 rounded-3xl border border-emerald-800 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
            <ShieldCheck size={26} />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white">Comprehensive Agricultural Insurance</h3>
            <p className="text-xs sm:text-sm text-emerald-200/80 max-w-xl mt-0.5">
              Every herd under CowVest management is protected against mortality, epidemics, theft, and natural hazards via licensed underwriters (Leadway & NAIC).
            </p>
          </div>
        </div>

        <button
          onClick={onInvestMore}
          className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs sm:text-sm rounded-xl shadow-lg transition-all shrink-0 cursor-pointer w-full sm:w-auto"
        >
          Fund More Livestock
        </button>
      </div>

      {/* Investment Certificate & Biometric Details Modal */}
      <AnimatePresence>
        {selectedInvestmentForModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-zinc-200 shadow-2xl relative overflow-hidden"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedInvestmentForModal(null)}
                className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-zinc-600 rounded-full hover:bg-zinc-100 transition-colors"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-xl shadow-md shadow-emerald-600/20">
                  <Award size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-zinc-950">Investment Verification</h3>
                  <p className="text-xs text-zinc-400">Authentic CowVest Asset Certificate</p>
                </div>
              </div>

              <div className="space-y-4 text-xs sm:text-sm border border-zinc-200 rounded-2xl p-4 bg-zinc-50/60 mb-6">
                <div className="flex justify-between py-1.5 border-b border-zinc-200">
                  <span className="text-zinc-500">Asset Category:</span>
                  <span className="font-extrabold text-zinc-900">{selectedInvestmentForModal.produceType}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-zinc-200">
                  <span className="text-zinc-500">Certificate Reference:</span>
                  <span className="font-mono font-bold text-zinc-900">CWV-{selectedInvestmentForModal.id.slice(0, 8).toUpperCase()}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-zinc-200">
                  <span className="text-zinc-500">Principal Allocation:</span>
                  <span className="font-mono font-extrabold text-zinc-900">{formatCurrency(selectedInvestmentForModal.amount)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-zinc-200">
                  <span className="text-zinc-500">Projected Payout (20% ROI):</span>
                  <span className="font-mono font-black text-emerald-600">{formatCurrency(selectedInvestmentForModal.payoutAmount || selectedInvestmentForModal.amount * 1.2)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-zinc-200">
                  <span className="text-zinc-500">Underwriting Partner:</span>
                  <span className="font-bold text-zinc-900">Leadway Assurance / NAIC</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-zinc-500">Feedlot Facility:</span>
                  <span className="font-bold text-zinc-900">Afaka Ranch Hub, Kaduna</span>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-100 text-xs mb-6">
                <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
                <span>Biometrically microchipped and quarantined per veterinary standards.</span>
              </div>

              <button
                onClick={() => setSelectedInvestmentForModal(null)}
                className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 text-white font-extrabold text-xs sm:text-sm rounded-xl transition-all cursor-pointer"
              >
                Close Certificate
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

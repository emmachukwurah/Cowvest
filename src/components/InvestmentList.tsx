import React, { useEffect, useState, useMemo } from "react";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../lib/AuthContext";
import { Investment } from "../types";
import { formatCurrency, formatDate } from "../lib/utils";
import { Clock, CheckCircle2, History, TrendingUp as TrendingIcon } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";

export function InvestmentList() {
  const { profile } = useAuth();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;

    const q = query(
      collection(db, "investments"),
      where("userId", "==", profile.uid),
      orderBy("startDate", "asc") // Changed to asc for chronological chart data
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Investment));
      setInvestments(docs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [profile]);

  const processedInvestments = useMemo(() => {
    return investments.map(inv => ({
      ...inv,
      expectedReturn: inv.amount * 0.2,
      payoutAmount: inv.amount * 1.2
    }));
  }, [investments]);

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

  // Sort back to desc for the list view
  const displayInvestments = useMemo(() => {
    return [...processedInvestments].sort((a, b) => 
      new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    );
  }, [processedInvestments]);

  if (loading) return null;

  return (
    <div className="bg-zinc-900 rounded-[2rem] p-5 sm:p-8 text-white mb-8 sm:mb-12 overflow-hidden relative border border-zinc-800">
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-zinc-800 rounded-lg text-emerald-400">
            <History size={20} />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">Your Portfolio</h2>
        </div>
        {investments.length > 0 && (
          <div className="flex items-center gap-1.5 sm:gap-2 text-emerald-400 font-bold text-xs sm:text-sm bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-900/50">
            <TrendingIcon size={14} className="sm:hidden" />
            <TrendingIcon size={16} className="hidden sm:block" />
            <span>Growth Tracked</span>
          </div>
        )}
      </div>

      {investments.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-950/50 p-4 sm:p-8 rounded-[2rem] border border-zinc-800 mb-6 sm:mb-8"
        >
          <div className="mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-bold text-white">Investment Performance</h3>
            <p className="text-xs sm:text-sm text-zinc-400">Cumulative growth of your principal and expected returns.</p>
          </div>
          
          <div className="h-[220px] sm:h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.4}/>
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
                <YAxis 
                  hide
                  domain={['auto', 'auto']}
                />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-zinc-950 text-white p-3 sm:p-4 rounded-xl shadow-2xl border border-zinc-800">
                          <p className="text-xs font-bold text-zinc-400 mb-2">{payload[0].payload.date}</p>
                          <div className="space-y-1">
                            <p className="flex items-center justify-between gap-6 text-xs">
                              <span className="text-zinc-400">Invested:</span>
                              <span className="font-bold">{formatCurrency(payload[0].value as number)}</span>
                            </p>
                            <p className="flex items-center justify-between gap-6 text-xs">
                              <span className="text-emerald-400">Expected Profit:</span>
                              <span className="font-bold text-emerald-400">+{formatCurrency(payload[1].payload.profit)}</span>
                            </p>
                            <div className="pt-2 mt-2 border-t border-zinc-800">
                              <p className="flex items-center justify-between gap-6 text-xs">
                                <span className="text-zinc-200">Total Value:</span>
                                <span className="font-bold text-sm sm:text-lg">{formatCurrency(payload[1].payload.total)}</span>
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
                  stroke="#10b981" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorInvested)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#059669" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorTotal)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-zinc-800">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-zinc-600" />
              <span className="text-[10px] sm:text-xs font-bold text-zinc-400 uppercase tracking-widest">Principal</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-[10px] sm:text-xs font-bold text-zinc-400 uppercase tracking-widest">Total with Profit</span>
            </div>
          </div>
        </motion.div>
      )}

      <div className="space-y-4">
        <AnimatePresence>
          {displayInvestments.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-8 sm:p-12 text-center bg-zinc-950/30 rounded-[2rem] border-2 border-dashed border-zinc-800"
            >
              <History size={40} className="mx-auto text-zinc-600 mb-3" />
              <p className="text-zinc-400 text-xs sm:text-sm font-medium">No investments found. Start your journey below!</p>
            </motion.div>
          ) : (
            displayInvestments.map((inv, i) => (
              <motion.div
                key={inv.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="bg-zinc-950/40 p-4 sm:p-6 rounded-2xl sm:rounded-[2rem] border border-zinc-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 hover:bg-zinc-800/20 transition-all group"
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-lg sm:text-xl shrink-0 shadow-sm ${
                    inv.status === "active" ? "bg-emerald-950/40 text-emerald-400 border border-emerald-900/50" : "bg-zinc-800 text-zinc-400"
                  }`}>
                    {inv.produceType === "Cattle Breeding" ? "🐄" : 
                     inv.produceType === "Beef Processing" ? "🥩" : 
                     inv.produceType === "Dairy Production" ? "🥛" : 
                     inv.produceType === "Leather & Hides" ? "👞" : 
                     inv.produceType === "Organic Manure" ? "🌱" : 
                     inv.produceType === "Cowhide (Kpomo)" ? "🥘" : 
                     inv.produceType === "Sesame Seed" ? "🌾" : "🐮"}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm sm:text-base">{inv.produceType}</h3>
                    <p className="text-[10px] sm:text-xs text-zinc-500 font-mono">ID: {inv.id.slice(0, 8)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 flex-1 md:px-6 bg-zinc-900/40 p-3 sm:p-0 rounded-xl sm:rounded-none">
                  <div>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-0.5">Principal</p>
                    <p className="font-bold text-white text-xs sm:text-sm font-mono">{formatCurrency(inv.amount)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-0.5">Return</p>
                    <p className="font-bold text-emerald-400 text-xs sm:text-sm font-mono">+{formatCurrency(inv.expectedReturn)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-0.5">Maturity</p>
                    <p className="font-bold text-white text-xs sm:text-sm">{formatDate(inv.endDate)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-0.5">Status</p>
                    <div className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold ${
                      inv.status === "active" ? "bg-emerald-950/80 text-emerald-400 border border-emerald-900/40" : "bg-zinc-800 text-zinc-400"
                    }`}>
                      {inv.status === "active" ? <Clock size={10} /> : <CheckCircle2 size={10} />}
                      {inv.status === "active" ? "Growing" : "Completed"}
                    </div>
                  </div>
                </div>

                <div className="flex md:flex-col justify-between items-center md:items-end border-t md:border-t-0 border-zinc-800/80 pt-3 md:pt-0">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Total Payout</p>
                  <p className="text-lg sm:text-xl font-black text-white font-mono">{formatCurrency(inv.payoutAmount)}</p>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}


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

  const chartData = useMemo(() => {
    let runningInvested = 0;
    let runningProfit = 0;
    
    return investments.map(inv => {
      runningInvested += inv.amount;
      runningProfit += inv.expectedReturn;
      return {
        date: formatDate(inv.startDate),
        invested: runningInvested,
        profit: runningProfit,
        total: runningInvested + runningProfit
      };
    });
  }, [investments]);

  // Sort back to desc for the list view
  const displayInvestments = [...investments].sort((a, b) => 
    new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  );

  if (loading) return null;

  return (
    <div className="py-12">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-zinc-100 rounded-lg">
            <History size={20} className="text-zinc-600" />
          </div>
          <h2 className="text-2xl font-bold text-zinc-900">Your Portfolio</h2>
        </div>
        {investments.length > 0 && (
          <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
            <TrendingIcon size={16} /> Growth Tracked
          </div>
        )}
      </div>

      {investments.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-[2rem] border border-zinc-100 mb-8 shadow-sm"
        >
          <div className="mb-6">
            <h3 className="text-lg font-bold text-zinc-900">Investment Performance</h3>
            <p className="text-sm text-zinc-500">Cumulative growth of your principal and expected returns.</p>
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#a1a1aa', fontSize: 12 }}
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
                        <div className="bg-zinc-900 text-white p-4 rounded-xl shadow-2xl border border-zinc-800">
                          <p className="text-xs font-bold text-zinc-400 mb-2">{payload[0].payload.date}</p>
                          <div className="space-y-1">
                            <p className="flex items-center justify-between gap-8">
                              <span className="text-zinc-400 text-xs">Invested:</span>
                              <span className="font-bold">{formatCurrency(payload[0].value as number)}</span>
                            </p>
                            <p className="flex items-center justify-between gap-8">
                              <span className="text-emerald-400 text-xs">Expected Profit:</span>
                              <span className="font-bold text-emerald-400">+{formatCurrency(payload[1].payload.profit)}</span>
                            </p>
                            <div className="pt-2 mt-2 border-t border-zinc-800">
                              <p className="flex items-center justify-between gap-8">
                                <span className="text-zinc-200 text-xs">Total Value:</span>
                                <span className="font-bold text-lg">{formatCurrency(payload[1].payload.total)}</span>
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

          <div className="flex items-center gap-6 mt-6 pt-6 border-t border-zinc-50">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-zinc-300" />
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Principal</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-600" />
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Total with Profit</span>
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
              className="p-12 text-center bg-zinc-50 rounded-[2rem] border-2 border-dashed border-zinc-200"
            >
              <History size={48} className="mx-auto text-zinc-300 mb-4" />
              <p className="text-zinc-500 font-medium">No investments found. Start your journey below!</p>
            </motion.div>
          ) : (
            displayInvestments.map((inv, i) => (
              <motion.div
                key={inv.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white p-4 md:p-6 rounded-[2rem] border border-zinc-100 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-lg transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl shadow-sm ${
                    inv.status === "active" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-zinc-50 text-zinc-400"
                  }`}>
                    {inv.produceType === "Cattle Breeding" ? "🐄" : 
                     inv.produceType === "Beef Processing" ? "🥩" : 
                     inv.produceType === "Dairy Production" ? "🥛" : 
                     inv.produceType === "Leather & Hides" ? "👞" : 
                     inv.produceType === "Organic Manure" ? "🌱" : 
                     inv.produceType === "Cowhide (Kpomo)" ? "🥘" : "🐮"}
                  </div>
                  <div>
                    <h3 className="font-bold text-zinc-900">{inv.produceType} Investment</h3>
                    <p className="text-xs text-zinc-400 font-medium">ID: {inv.id.slice(0, 8)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 flex-1 md:px-8">
                  <div>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Principal</p>
                    <p className="font-bold text-zinc-900">{formatCurrency(inv.amount)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Return</p>
                    <p className="font-bold text-emerald-600">+{formatCurrency(inv.expectedReturn)}</p>
                  </div>
                  <div className="hidden md:block">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Maturity</p>
                    <p className="font-bold text-zinc-900">{formatDate(inv.endDate)}</p>
                  </div>
                  <div className="hidden md:block">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Status</p>
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                      inv.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-zinc-100 text-zinc-500"
                    }`}>
                      {inv.status === "active" ? <Clock size={12} /> : <CheckCircle2 size={12} />}
                      {inv.status === "active" ? "Growing" : "Completed"}
                    </div>
                  </div>
                </div>

                <div className="md:text-right">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Total Payout</p>
                  <p className="text-xl font-black text-zinc-900">{formatCurrency(inv.payoutAmount)}</p>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}


import React, { useState } from "react";
import { motion } from "motion/react";
import { PRODUCE_OPTIONS } from "../constants";
import { formatCurrency } from "../lib/utils";
import { Leaf, ArrowRight, ShieldCheck, Info } from "lucide-react";
import { useAuth } from "../lib/AuthContext";
import { addDoc, collection, doc, updateDoc, increment } from "firebase/firestore";
import { db } from "../lib/firebase";

export function InvestSection() {
  const { profile } = useAuth();
  const [selectedProduce, setSelectedProduce] = useState<typeof PRODUCE_OPTIONS[0] | null>(null);
  const [amount, setAmount] = useState<number>(100000);
  const [investing, setInvesting] = useState(false);

  const handleInvest = async () => {
    if (!profile || !selectedProduce) return;
    
    // In a real app, we'd check if balance is sufficient.
    // For this demo, we'll allow it and record it.
    setInvesting(true);
    try {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 6);

      const investment = {
        userId: profile.uid,
        amount,
        produceType: selectedProduce.type,
        status: "active",
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        expectedReturn: amount * 0.5,
        payoutAmount: amount * 1.5,
      };

      await addDoc(collection(db, "investments"), investment);
      
      // Update user stats (atomic increment)
      const userRef = doc(db, "users", profile.uid);
      await updateDoc(userRef, {
        totalInvested: increment(amount),
      });

      // Log activity
      await addDoc(collection(db, "activities"), {
        userId: profile.uid,
        type: "investment",
        amount,
        timestamp: new Date().toISOString(),
        description: `Invested ${formatCurrency(amount)} in ${selectedProduce.type} produce.`,
      });

      setSelectedProduce(null);
      alert("Investment successful! You can track it in your dashboard.");
    } catch (error) {
      console.error(error);
      alert("Error processing investment.");
    } finally {
      setInvesting(false);
    }
  };

  return (
    <section className="py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900">Available Produce</h2>
          <p className="text-zinc-500">Select a project to start your investment journey.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-xs font-semibold uppercase tracking-wider">
          <ShieldCheck size={16} />
          Insured Investments
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {PRODUCE_OPTIONS.map((option, i) => (
          <motion.div
            key={option.type}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="group bg-white rounded-3xl border border-zinc-100 overflow-hidden shadow-sm hover:shadow-xl hover:border-emerald-100 transition-all cursor-pointer"
            onClick={() => setSelectedProduce(option)}
          >
            <div className="relative h-48 overflow-hidden">
              <img 
                src={option.image} 
                alt={option.type}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full flex items-center gap-2 text-sm font-bold text-emerald-701">
                <Leaf size={14} className="text-emerald-600" />
                {option.type}
              </div>
            </div>
            <div className="p-6">
              <p className="text-zinc-500 text-sm mb-4 line-clamp-2">{option.description}</p>
              <div className="flex items-center justify-between pb-6 border-b border-zinc-50">
                <div>
                  <p className="text-xs text-zinc-400 font-medium tracking-wide uppercase">Returns</p>
                  <p className="text-lg font-bold text-emerald-600">{option.returns}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-zinc-400 font-medium tracking-wide uppercase">Entry</p>
                  <p className="text-base font-bold text-zinc-900">{formatCurrency(option.minAmount)}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-center text-emerald-600 font-bold group-hover:gap-4 transition-all">
                Invest Now <ArrowRight size={18} className="ml-2" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Investment Modal */}
      {selectedProduce && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white rounded-[2rem] w-full max-w-lg overflow-hidden shadow-2xl"
          >
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-zinc-900">Invest in {selectedProduce.type}</h3>
                  <p className="text-zinc-500">Secure your spot in this agricultural project.</p>
                </div>
                <button 
                  onClick={() => setSelectedProduce(null)}
                  className="w-10 h-10 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-400 hover:bg-zinc-200"
                >
                  &times;
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-zinc-700 mb-2">Investment Amount (NGN)</label>
                  <div className="relative">
                    <input 
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      min={selectedProduce.minAmount}
                      max={selectedProduce.maxAmount}
                      className="w-full px-5 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-xl font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">
                      MIN: {formatCurrency(selectedProduce.minAmount)}
                    </div>
                  </div>
                </div>

                <div className="bg-emerald-50 p-6 rounded-2xl flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-emerald-600 shadow-sm">
                    <TrendingUp size={24} />
                  </div>
                  <div>
                    <p className="text-xs text-emerald-700 font-bold uppercase tracking-wider">Estimated Profit (6 Months)</p>
                    <p className="text-2xl font-black text-emerald-900">{formatCurrency(amount * 0.5)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl">
                  <Info size={18} className="text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-800 leading-relaxed">
                    By proceeding, you agree to locking your funds for a period of 6 months. Your initial capital and 50% profit will be paid out automatically on completion.
                  </p>
                </div>

                <button 
                  disabled={investing || amount < selectedProduce.minAmount || amount > selectedProduce.maxAmount}
                  onClick={handleInvest}
                  className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold text-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-emerald-200 transition-all"
                >
                  {investing ? "Processing..." : "Confirm Investment"}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </section>
  );
}

// Local implementation of icons to avoid multiple imports
function TrendingUp({ size, className }: { size: number, className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}

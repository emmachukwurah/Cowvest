import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, TrendingUp, TrendingDown, Minus, Loader2 } from "lucide-react";
import { MarketAnalysis, ProduceType } from "../types";

export function MarketInsights() {
  const [analysis, setAnalysis] = useState<MarketAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedProduce, setSelectedProduce] = useState<ProduceType>("Cattle Breeding");

  const fetchAnalysis = async (type: ProduceType) => {
    setLoading(true);
    try {
      const response = await fetch("/api/market-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ produceType: type }),
      });
      const data = await response.json();
      setAnalysis(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysis(selectedProduce);
  }, [selectedProduce]);

  const produceTypes: ProduceType[] = ["Cattle Breeding", "Beef Processing", "Dairy Production", "Leather & Hides", "Organic Manure", "Cowhide (Kpomo)", "Sesame Seed"];

  return (
    <div className="bg-zinc-900 rounded-[2rem] p-5 sm:p-8 text-white mb-8 sm:mb-12 overflow-hidden relative border border-zinc-800">
      <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
        <Sparkles size={120} />
      </div>

      <div className="relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs sm:text-sm uppercase tracking-widest mb-2">
              <Sparkles size={16} />
              AI Market Intelligence
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold">Predictive Insights</h2>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 no-scrollbar -mx-2 px-2">
            {produceTypes.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedProduce(type)}
                className={`px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                  selectedProduce === type 
                    ? "bg-white text-zinc-900 shadow-lg" 
                    : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="min-h-[200px] flex items-center justify-center">
          {loading ? (
            <div className="flex flex-col items-center gap-4 text-zinc-500">
              <Loader2 className="animate-spin" size={40} />
              <p className="font-medium animate-pulse">Analyzing real-time market data...</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {analysis && (
                <motion.div
                  key={selectedProduce}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full"
                >
                  <div className="md:col-span-2">
                    <p className="text-xl text-zinc-300 leading-relaxed font-medium">
                      {analysis.summary}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-zinc-800/50 p-6 rounded-2xl border border-zinc-700">
                      <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-3">Risk Level</p>
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          analysis.riskLevel === "Low" ? "bg-emerald-500" : 
                          analysis.riskLevel === "Medium" ? "bg-amber-500" : "bg-red-500"
                        }`} />
                        <span className="text-xl font-bold">{analysis.riskLevel}</span>
                      </div>
                    </div>

                    <div className="bg-zinc-800/50 p-6 rounded-2xl border border-zinc-700">
                      <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-3">6-Month Trend</p>
                      <div className="flex items-center gap-3">
                        {analysis.trend === "Up" ? (
                          <TrendingUp className="text-emerald-500" />
                        ) : analysis.trend === "Down" ? (
                          <TrendingDown className="text-red-500" />
                        ) : (
                          <Minus className="text-zinc-500" />
                        )}
                        <span className="text-xl font-bold">{analysis.trend === "Up" ? "Bullish" : analysis.trend === "Down" ? "Bearish" : "Stable"}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}

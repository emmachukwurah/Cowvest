import React from "react";
import { AuthProvider, useAuth } from "./lib/AuthContext";
import { Navbar } from "./components/Navbar";
import { DashboardHero } from "./components/DashboardHero";
import { MarketInsights } from "./components/MarketInsights";
import { InvestSection } from "./components/InvestSection";
import { InvestmentList } from "./components/InvestmentList";
import { Sprout, ShieldCheck, ArrowRight, TrendingUp } from "lucide-react";
import { motion } from "motion/react";

function AppContent() {
  const { user, profile, loading, signIn } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center text-white animate-bounce shadow-2xl shadow-emerald-200">
            <Sprout size={32} />
          </div>
          <p className="font-bold text-zinc-400 animate-pulse uppercase tracking-[0.2em] text-xs">Securing Connection...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 pt-32 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
                <ShieldCheck size={16} /> Secure Agricultural Yields
              </div>
              <h1 className="text-6xl md:text-8xl font-black text-zinc-900 leading-[0.9] tracking-tighter mb-8">
                Empowering <br />
                <span className="text-emerald-600">Growth</span> through <br />
                Innovation.
              </h1>
              <p className="text-xl text-zinc-500 max-w-lg mb-10 leading-relaxed">
                Invest in Nigeria's agricultural future. Secure 50% profit in just 6 months through our managed agricultural produce pool.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={signIn}
                  className="px-10 py-5 bg-emerald-600 text-white rounded-[2rem] font-bold text-xl hover:bg-emerald-700 shadow-2xl shadow-emerald-200 flex items-center justify-center gap-3 active:scale-95 transition-all"
                >
                  Start Investing <ArrowRight size={24} />
                </button>
                <div className="flex items-center gap-4 px-8 py-5 text-zinc-400 font-bold">
                  <div className="flex -space-x-4">
                    {[1,2,3].map(i => (
                      <div key={i} className="w-10 h-10 border-4 border-white bg-zinc-100 rounded-full" />
                    ))}
                  </div>
                  Join 100k+ Investors
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative hidden lg:block"
            >
              <div className="absolute inset-0 bg-emerald-100 rounded-[3rem] blur-3xl opacity-30 -z-10 animate-pulse" />
              <img 
                src="https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&q=80&w=1200" 
                alt="Agricultural fields"
                className="rounded-[3rem] shadow-2xl shadow-zinc-200 border-8 border-white aspect-[4/5] object-cover"
              />
              <div className="absolute -bottom-10 -left-10 bg-white p-8 rounded-[2rem] shadow-2xl border border-zinc-100 max-w-xs animate-bounce" style={{ animationDuration: "5s" }}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                    <TrendingUp size={24} />
                  </div>
                  <div>
                    <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest">Fixed Returns</p>
                    <p className="text-2xl font-black text-emerald-900">+50.0% / 6m</p>
                  </div>
                </div>
                <p className="text-zinc-500 text-sm leading-relaxed">
                  Join a community of investors funding sustainable maize and cocoa plantations across the country.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 pb-32">
        <DashboardHero />
        <MarketInsights />
        <InvestmentList />
        <InvestSection />
      </main>
      
      <footer className="py-20 bg-white border-t border-zinc-100">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2 grayscale brightness-0 opacity-40">
            <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center text-white">
              <Sprout size={16} />
            </div>
            <span className="text-lg font-bold">Cowvest</span>
          </div>
          <p className="text-zinc-400 text-sm font-medium">
            © 2026 Cowvest Agricultural Finance. All rights reserved. Securely powered by Gemini AI.
          </p>
          <div className="flex gap-8 text-sm font-bold text-zinc-400 uppercase tracking-widest">
            <a href="#" className="hover:text-emerald-600 transition-colors">Privacy</a>
            <a href="#" className="hover:text-emerald-600 transition-colors">Terms</a>
            <a href="#" className="hover:text-emerald-600 transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

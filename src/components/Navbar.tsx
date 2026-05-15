import React, { useState } from "react";
import { useAuth } from "../lib/AuthContext";
import { Sprout, LogOut, User, Plus } from "lucide-react";
import { formatCurrency } from "../lib/utils";
import { DepositModal } from "./DepositModal";

export function Navbar() {
  const { profile, logout, signIn } = useAuth();
  const [isDepositOpen, setIsDepositOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-100">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white">
              <Sprout size={24} />
            </div>
            <span className="text-xl font-bold tracking-tight text-emerald-900">Cowvest</span>
          </div>

          <div className="flex items-center gap-6">
            {profile ? (
              <>
                <div className="hidden md:flex flex-col items-end">
                  <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Balance</span>
                  <span className="text-sm font-bold text-emerald-700">{formatCurrency(profile.balance)}</span>
                </div>
                
                <button 
                  onClick={() => setIsDepositOpen(true)}
                  className="hidden sm:flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-full text-sm font-bold hover:bg-emerald-100 transition-colors border border-emerald-100"
                >
                  <Plus size={18} /> Deposit
                </button>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 border border-emerald-100">
                    <User size={20} />
                  </div>
                  <button 
                    onClick={logout}
                    className="p-2 text-zinc-400 hover:text-red-500 transition-colors"
                  >
                    <LogOut size={20} />
                  </button>
                </div>
              </>
            ) : (
              <button 
                onClick={signIn}
                className="bg-emerald-600 text-white px-6 py-2 rounded-full font-medium hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </nav>

      <DepositModal isOpen={isDepositOpen} onClose={() => setIsDepositOpen(false)} />
    </>
  );
}

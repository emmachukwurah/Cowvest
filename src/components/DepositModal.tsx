import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Wallet, X, ArrowRight, ShieldCheck, CheckCircle2, PartyPopper } from "lucide-react";
import { useAuth } from "../lib/AuthContext";
import { db } from "../lib/firebase";
import { doc, updateDoc, increment, addDoc, collection } from "firebase/firestore";
import { formatCurrency } from "../lib/utils";

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DepositModal({ isOpen, onClose }: DepositModalProps) {
  const { profile } = useAuth();
  const [amount, setAmount] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen || !profile) return null;

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    
    if (isNaN(numAmount) || numAmount <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    setLoading(true);
    try {
      const userRef = doc(db, "users", profile.uid);
      
      // Update balance
      await updateDoc(userRef, {
        balance: increment(numAmount)
      });

      // Log activity
      await addDoc(collection(db, "activities"), {
        userId: profile.uid,
        type: "deposit",
        amount: numAmount,
        timestamp: new Date().toISOString(),
        description: `Deposited ${formatCurrency(numAmount)} into wallet.`
      });

      setIsSuccess(true);
      setAmount("");
    } catch (error) {
      console.error("Deposit error:", error);
      alert("Failed to process deposit. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsSuccess(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-[2rem] w-full max-w-md overflow-hidden shadow-2xl"
      >
        <AnimatePresence mode="wait">
          {!isSuccess ? (
            <motion.div 
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="p-8"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-zinc-900">Add Funds</h3>
                  <p className="text-zinc-500">Top up your Cowvest wallet instantly.</p>
                </div>
                <button 
                  onClick={handleClose}
                  className="w-10 h-10 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-400 hover:bg-zinc-200 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleDeposit} className="space-y-6">
                <div className="bg-emerald-50 p-6 rounded-2xl flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-emerald-600 shadow-sm">
                    <Wallet size={24} />
                  </div>
                  <div>
                    <p className="text-xs text-emerald-700 font-bold uppercase tracking-wider">Current Balance</p>
                    <p className="text-xl font-black text-emerald-900">{formatCurrency(profile.balance)}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-zinc-700 mb-2">Deposit Amount (NGN)</label>
                  <input 
                    type="number"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="e.g. 500,000"
                    className="w-full px-5 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-xl font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>

                <div className="flex items-start gap-3 p-4 bg-zinc-50 rounded-xl">
                  <ShieldCheck size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    Your transaction is secured with bank-grade encryption. Deposited funds are available for immediate investment.
                  </p>
                </div>

                <button 
                  type="submit"
                  disabled={loading || !amount}
                  className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold text-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-emerald-200 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? "Processing..." : <>Confirm Deposit <ArrowRight size={20} /></>}
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-8 text-center"
            >
              <div className="flex flex-col items-center py-8">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 12, stiffness: 200 }}
                  className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6 relative"
                >
                  <CheckCircle2 size={48} />
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1], rotate: [0, 15, -15, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute -top-2 -right-2 text-amber-500"
                  >
                    <PartyPopper size={24} />
                  </motion.div>
                </motion.div>
                
                <h3 className="text-2xl font-black text-zinc-900 mb-2">Deposit Successful!</h3>
                <p className="text-zinc-500 mb-8 max-w-[240px] mx-auto text-sm leading-relaxed">
                  Your funds have been securely added to your wallet. You can now proceed to invest.
                </p>

                <button 
                  onClick={handleClose}
                  className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold text-lg hover:bg-emerald-700 shadow-xl shadow-emerald-200 transition-all"
                >
                  Back to Dashboard
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

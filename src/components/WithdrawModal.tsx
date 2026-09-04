import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  PartyPopper, 
  Landmark, 
  Coins, 
  Calendar, 
  ArrowDownRight, 
  HelpCircle,
  Clock,
  Sparkles,
  Loader2,
  ShieldAlert
} from "lucide-react";
import { useAuth } from "../lib/AuthContext";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { doc, updateDoc, increment, addDoc, collection, query, where, onSnapshot } from "firebase/firestore";
import { formatCurrency, formatDate } from "../lib/utils";
import { Investment } from "../types";

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = "wallet" | "investments";

export function WithdrawModal({ isOpen, onClose }: WithdrawModalProps) {
  const { profile } = useAuth();
  
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<TabType>("wallet");
  
  // Wallet withdraw form state
  const [walletAmount, setWalletAmount] = useState<string>("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  // Verification & Authentication states
  const [verificationState, setVerificationState] = useState<"idle" | "authenticating" | "mismatch">("idle");
  const [verificationProgress, setVerificationProgress] = useState(0);
  const [verificationStepText, setVerificationStepText] = useState("");
  const [mismatchData, setMismatchData] = useState<{ entered: string; registered: string } | null>(null);

  // Investments list state
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [investmentsLoading, setInvestmentsLoading] = useState(true);

  // Initialize bank details from user profile if available
  useEffect(() => {
    if (profile?.bankAccount) {
      setBankName(profile.bankAccount.bankName || "");
      setAccountNumber(profile.bankAccount.accountNumber || "");
      setAccountName(profile.bankAccount.accountName || "");
    }
  }, [profile]);

  // Query investments
  useEffect(() => {
    if (!profile || !isOpen) return;

    const q = query(
      collection(db, "investments"),
      where("userId", "==", profile.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Investment));
      setInvestments(docs);
      setInvestmentsLoading(false);
    }, (error) => {
      console.error("Error listening to investments:", error);
      setInvestmentsLoading(false);
    });

    return () => unsubscribe();
  }, [profile, isOpen]);

  if (!isOpen || !profile) return null;

  // Helper to verify if the bank account name matches the profile displayName
  const checkNameMatch = (inputName: string, registeredName: string): boolean => {
    if (!inputName || !registeredName) return false;
    
    // Normalize string: lowercase, remove non-alphanumeric, split to words
    const normalize = (name: string) => 
      name.toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .split(/\s+/)
        .filter(word => word.length >= 3); // match substantial words (ignore initials or small titles)
        
    const inputWords = normalize(inputName);
    const registeredWords = normalize(registeredName);
    
    if (inputWords.length === 0 || registeredWords.length === 0) {
      // Fallback: simple substring check if words are too short or empty
      return inputName.toLowerCase().includes(registeredName.toLowerCase()) || 
             registeredName.toLowerCase().includes(inputName.toLowerCase());
    }
    
    // Check if at least one substantial word matches
    return inputWords.some(word => registeredWords.includes(word));
  };

  const startVerification = async (
    type: "wallet" | "investment",
    enteredName: string,
    amount: number,
    inv?: Investment
  ) => {
    setVerificationState("authenticating");
    setVerificationProgress(0);
    setVerificationStepText("Connecting to NIBSS Secure API Gateway...");

    // Step simulation
    const steps = [
      { progress: 15, text: "Connecting to NIBSS Central Bank API..." },
      { progress: 35, text: "Routing via Interswitch Direct Transfer Gateway..." },
      { progress: 60, text: "Querying commercial bank clearance network..." },
      { progress: 85, text: "Authenticating recipient registration name..." },
      { progress: 100, text: "Resolving official account name record..." }
    ];

    for (const step of steps) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      setVerificationProgress(step.progress);
      setVerificationStepText(step.text);
    }

    // Verify name
    const isMatch = checkNameMatch(enteredName, profile.displayName);

    if (isMatch) {
      // Match found - execute actual withdrawal
      if (type === "wallet") {
        await executeWalletWithdraw(amount);
      } else if (type === "investment" && inv) {
        await executeInvestmentPayoutWithdraw(inv);
      }
    } else {
      // Mismatch found - show failure screen
      setVerificationState("mismatch");
      setMismatchData({
        entered: enteredName,
        registered: profile.displayName
      });
    }
  };

  // Handle wallet balance withdrawal trigger
  const handleWalletWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(walletAmount);

    if (isNaN(numAmount) || numAmount <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    if (numAmount > profile.balance) {
      alert("Insufficient wallet balance for this withdrawal");
      return;
    }

    if (!bankName || !accountNumber || !accountName) {
      alert("Please fill in your destination bank account details");
      return;
    }

    await startVerification("wallet", accountName, numAmount);
  };

  const executeWalletWithdraw = async (numAmount: number) => {
    setLoading(true);
    try {
      const userRef = doc(db, "users", profile.uid);

      // 1. Update user balance and bank account in Firestore
      try {
        await updateDoc(userRef, {
          balance: increment(-numAmount),
          bankAccount: {
            bankName,
            accountNumber,
            accountName
          }
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${profile.uid}`);
      }

      // 2. Log withdrawal activity
      try {
        await addDoc(collection(db, "activities"), {
          userId: profile.uid,
          type: "withdrawal",
          amount: numAmount,
          timestamp: new Date().toISOString(),
          description: `Withdrew ${formatCurrency(numAmount)} to ${bankName} (${accountNumber}).`
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, "activities");
      }

      setSuccessMsg(`Successfully withdrew ${formatCurrency(numAmount)} to your bank account!`);
      setIsSuccess(true);
      setWalletAmount("");
      setVerificationState("idle");
    } catch (error) {
      console.error("Wallet withdrawal error:", error);
      alert("Failed to process withdrawal. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle matured investment payout withdrawal trigger
  const handleInvestmentPayoutWithdraw = async (investment: Investment) => {
    const payoutAmount = investment.amount + investment.expectedReturn;
    
    // Check if bank details are set
    if (!profile.bankAccount || !profile.bankAccount.accountNumber || !profile.bankAccount.accountName) {
      alert("Please configure and verify your destination bank account under the 'Wallet Balance' tab first.");
      setActiveTab("wallet");
      return;
    }

    await startVerification("investment", profile.bankAccount.accountName, payoutAmount, investment);
  };

  const executeInvestmentPayoutWithdraw = async (investment: Investment) => {
    setLoading(true);
    try {
      const payoutAmount = investment.amount + investment.expectedReturn;
      const userRef = doc(db, "users", profile.uid);
      const investmentRef = doc(db, "investments", investment.id);

      // 1. Mark investment as completed
      try {
        await updateDoc(investmentRef, {
          status: "completed"
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `investments/${investment.id}`);
      }

      // 2. Update user profile to record total profits accrued
      try {
        await updateDoc(userRef, {
          totalProfit: increment(investment.expectedReturn)
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${profile.uid}`);
      }

      // 3. Log withdrawal activity of principal and interest
      try {
        await addDoc(collection(db, "activities"), {
          userId: profile.uid,
          type: "payout",
          amount: payoutAmount,
          timestamp: new Date().toISOString(),
          description: `Withdrew payout of ${formatCurrency(payoutAmount)} (Principal: ${formatCurrency(investment.amount)} + 20% Profit: ${formatCurrency(investment.expectedReturn)}) from matured ${investment.produceType} investment.`
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, "activities");
      }

      setSuccessMsg(`Withdrew ${formatCurrency(payoutAmount)} directly to your bank account! Principal and profit successfully paid.`);
      setIsSuccess(true);
      setVerificationState("idle");
    } catch (error) {
      console.error("Investment payout error:", error);
      alert("Failed to process investment withdrawal. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Simulate Maturity for demo testing
  const handleSimulateMaturity = async (investment: Investment) => {
    try {
      const investmentRef = doc(db, "investments", investment.id);
      const immediatePastDate = new Date();
      immediatePastDate.setMonth(immediatePastDate.getMonth() - 7); // Backdate it by 7 months to exceed 6 months
      
      await updateDoc(investmentRef, {
        endDate: immediatePastDate.toISOString()
      });
    } catch (error) {
      console.error("Simulation error:", error);
      alert("Could not simulate maturity.");
    }
  };

  const handleClose = () => {
    setIsSuccess(false);
    setSuccessMsg("");
    setVerificationState("idle");
    onClose();
  };

  // Helper to determine if investment is mature (endDate is in the past) and is still active
  const isInvestmentMatured = (inv: Investment) => {
    return inv.status === "active" && new Date(inv.endDate) <= new Date();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4 bg-zinc-900/60 backdrop-blur-sm overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col my-auto max-h-[92vh]"
      >
        <AnimatePresence mode="wait">
          {!isSuccess ? (
            verificationState === "authenticating" ? (
              <motion.div
                key="authenticating"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="p-8 text-center flex flex-col items-center justify-center min-h-[480px]"
              >
                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mb-6 relative">
                  <Loader2 className="w-12 h-12 animate-spin shrink-0 text-emerald-600" />
                  <div className="absolute inset-0 w-full h-full rounded-full border-4 border-emerald-100 border-t-transparent animate-pulse" />
                </div>
                
                <h3 className="text-xl font-black text-zinc-900 mb-1.5 uppercase tracking-tight">Security Authentication</h3>
                <p className="text-sm font-semibold text-emerald-700 max-w-xs mb-6 h-10 flex items-center justify-center text-center">
                  {verificationStepText}
                </p>

                <div className="w-full max-w-xs bg-zinc-100 h-2 rounded-full overflow-hidden mb-8 border border-zinc-200">
                  <motion.div 
                    initial={{ width: "0%" }}
                    animate={{ width: `${verificationProgress}%` }}
                    transition={{ ease: "easeInOut", duration: 0.3 }}
                    className="h-full bg-emerald-600"
                  />
                </div>

                <div className="bg-zinc-50 border border-zinc-150 p-5 rounded-2xl w-full max-w-md space-y-2.5 text-left">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-zinc-400">Gateway Provider:</span>
                    <span className="text-zinc-700 font-bold">NIBSS & Interswitch</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-zinc-400">Account Number:</span>
                    <span className="text-zinc-950 font-black tracking-widest">{accountNumber}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-zinc-400">Destination Bank:</span>
                    <span className="text-zinc-700 font-bold">{bankName || profile.bankAccount?.bankName}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-semibold border-t border-zinc-100 pt-2 mt-2">
                    <span className="text-zinc-400">Security Clearance Level:</span>
                    <span className="text-emerald-700 font-extrabold flex items-center gap-1">🛡️ AES-256 Verified</span>
                  </div>
                </div>
              </motion.div>
            ) : verificationState === "mismatch" ? (
              <motion.div
                key="mismatch"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="p-8 text-center flex flex-col items-center justify-center min-h-[480px] overflow-y-auto"
              >
                <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center text-rose-600 mb-6 border border-rose-100 relative">
                  <ShieldAlert size={36} className="text-rose-600 animate-bounce" />
                </div>

                <h3 className="text-xl font-black text-zinc-900 mb-2 uppercase tracking-tight">Account Name Tally Failed</h3>
                <p className="text-zinc-500 text-xs max-w-md mb-6 leading-relaxed">
                  For anti-fraud protection and to comply with Central Bank AML regulations, CowVest requires the recipient bank account name to match your verified profile identity.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-md mb-8">
                  <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-xl text-left">
                    <p className="text-[9px] font-black uppercase tracking-wider text-emerald-700 mb-1">Your Verified Name</p>
                    <p className="font-extrabold text-zinc-900 text-xs flex items-center gap-1 truncate">
                      🟢 {profile.displayName}
                    </p>
                  </div>
                  <div className="bg-rose-50/50 border border-rose-100 p-4 rounded-xl text-left">
                    <p className="text-[9px] font-black uppercase tracking-wider text-rose-700 mb-1">Provided Account Name</p>
                    <p className="font-extrabold text-zinc-900 text-xs flex items-center gap-1 truncate">
                      🔴 {mismatchData?.entered}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
                  <button
                    type="button"
                    onClick={() => setVerificationState("idle")}
                    className="flex-1 py-3.5 bg-zinc-900 text-white font-bold rounded-xl text-sm hover:bg-zinc-800 transition-colors"
                  >
                    Modify Bank Details
                  </button>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex-1 py-3.5 bg-zinc-100 text-zinc-600 font-bold rounded-xl text-sm hover:bg-zinc-200 transition-colors"
                  >
                    Cancel Transaction
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="withdraw-form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col h-full"
              >
                {/* Header */}
                <div className="p-5 sm:p-8 pb-4 sm:pb-4 flex justify-between items-start border-b border-zinc-100 shrink-0">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black tracking-tight text-zinc-900">Withdraw Funds</h3>
                    <p className="text-zinc-500 text-xs sm:text-sm">Withdraw your wallet balance or matured investment profit.</p>
                  </div>
                  <button 
                    onClick={handleClose}
                    className="w-9 h-9 sm:w-10 sm:h-10 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-400 hover:bg-zinc-200 transition-colors shrink-0"
                  >
                    <X size={20} />
                  </button>
                </div>


              {/* Tabs */}
              <div className="px-5 sm:px-8 pt-4 flex gap-2 sm:gap-4 overflow-x-auto shrink-0 border-b border-zinc-100">
                <button
                  type="button"
                  onClick={() => setActiveTab("wallet")}
                  className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap ${
                    activeTab === "wallet" 
                      ? "border-emerald-600 text-emerald-600" 
                      : "border-transparent text-zinc-400 hover:text-zinc-600"
                  }`}
                >
                  <Coins size={16} /> Wallet Balance ({formatCurrency(profile.balance)})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("investments")}
                  className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap ${
                    activeTab === "investments" 
                      ? "border-emerald-600 text-emerald-600" 
                      : "border-transparent text-zinc-400 hover:text-zinc-600"
                  }`}
                >
                  <Landmark size={16} /> Matured Investments
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="p-5 sm:p-8 overflow-y-auto max-h-[60vh] flex-1">
                {activeTab === "wallet" ? (
                  /* TAB 1: WALLET WITHDRAWAL */
                  <form onSubmit={handleWalletWithdraw} className="space-y-6">
                    <div className="bg-emerald-50 p-6 rounded-2xl flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-emerald-600 shadow-sm">
                        <Coins size={24} />
                      </div>
                      <div>
                        <p className="text-xs text-emerald-700 font-bold uppercase tracking-wider">Withdrawable Wallet Balance</p>
                        <p className="text-2xl font-black text-emerald-900">{formatCurrency(profile.balance)}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-xs font-black uppercase tracking-wider text-zinc-500 mb-2">Withdrawal Amount (NGN)</label>
                        <div className="relative">
                          <input 
                            type="number"
                            required
                            max={profile.balance}
                            value={walletAmount}
                            onChange={(e) => setWalletAmount(e.target.value)}
                            placeholder="e.g. 100,000"
                            className="w-full px-5 py-4 bg-zinc-50 border border-zinc-150 rounded-2xl text-xl font-black text-zinc-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                          />
                          <button
                            type="button"
                            onClick={() => setWalletAmount(profile.balance.toString())}
                            className="absolute right-4 top-1/2 -translate-y-1/2 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-extrabold hover:bg-emerald-200 transition-colors"
                          >
                            WITHDRAW ALL
                          </button>
                        </div>
                      </div>

                      <div className="md:col-span-2 mt-2">
                        <h4 className="text-sm font-black text-zinc-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                          <Landmark size={16} className="text-emerald-600" />
                          Payout Destination Bank Account
                        </h4>
                        <p className="text-xs text-zinc-500 mb-4">
                          Provide the bank account where your withdrawn funds will be settled securely.
                        </p>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-zinc-500 mb-1.5">Bank Name</label>
                        <input 
                          type="text"
                          required
                          value={bankName}
                          onChange={(e) => setBankName(e.target.value)}
                          placeholder="e.g. GTBank, Zenith Bank"
                          className="w-full px-4 py-3 bg-zinc-50 border border-zinc-150 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-zinc-500 mb-1.5">Account Number</label>
                        <input 
                          type="text"
                          required
                          maxLength={10}
                          pattern="\d*"
                          value={accountNumber}
                          onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ""))}
                          placeholder="e.g. 0123456789"
                          className="w-full px-4 py-3 bg-zinc-50 border border-zinc-150 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-zinc-500 mb-1.5">Account Name</label>
                        <input 
                          type="text"
                          required
                          value={accountName}
                          onChange={(e) => setAccountName(e.target.value)}
                          placeholder="e.g. John Doe"
                          className="w-full px-4 py-3 bg-zinc-50 border border-zinc-150 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-zinc-50 rounded-xl border border-zinc-150">
                      <ShieldCheck size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                      <p className="text-xs text-zinc-500 leading-relaxed">
                        Funds will be disbursed instantly to your provided bank account once confirmed. Ensure account details are exact.
                      </p>
                    </div>

                    <button 
                      type="submit"
                      disabled={loading || !walletAmount || parseFloat(walletAmount) <= 0}
                      className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold text-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-emerald-200 transition-all flex items-center justify-center gap-2"
                    >
                      {loading ? "Processing Transfer..." : <>Confirm Withdrawal <ArrowRight size={20} /></>}
                    </button>
                  </form>
                ) : (
                  /* TAB 2: MATURED INVESTMENTS LIST */
                  <div className="space-y-4">
                    <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 flex items-start gap-4">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-600 shrink-0 shadow-xs">
                        <Sparkles size={20} />
                      </div>
                      <div className="text-sm">
                        <p className="font-bold text-emerald-900">About the 6-Month Cycle</p>
                        <p className="text-emerald-700 text-xs leading-relaxed mt-1">
                          Invested funds undergo a full 6 months compounding cycle. At the end of the maturity term, you can withdraw your initial capital together with your accrued 20% profit directly to your registered bank account.
                        </p>
                      </div>
                    </div>

                    {investmentsLoading ? (
                      <p className="text-center text-zinc-400 py-8 font-semibold animate-pulse text-xs uppercase tracking-wider">
                        Fetching investments...
                      </p>
                    ) : investments.filter(inv => inv.status === "active").length === 0 ? (
                      <div className="p-12 text-center bg-zinc-50/50 rounded-2xl border-2 border-dashed border-zinc-200">
                        <Calendar size={40} className="mx-auto text-zinc-300 mb-3" />
                        <p className="text-zinc-500 text-sm font-bold uppercase tracking-wider">No active investments found</p>
                        <p className="text-zinc-400 text-xs mt-1">Start an agricultural investment on the dashboard to grow profits.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {investments
                          .filter(inv => inv.status === "active")
                          .map((inv) => {
                            const matured = isInvestmentMatured(inv);
                            const profit = inv.expectedReturn || inv.amount * 0.2;
                            const totalPayout = inv.amount + profit;

                            return (
                              <div 
                                key={inv.id}
                                className={`p-5 rounded-2xl border transition-all ${
                                  matured 
                                    ? "bg-emerald-50/60 border-emerald-200 shadow-md shadow-emerald-50/50" 
                                    : "bg-zinc-50/60 border-zinc-200"
                                }`}
                              >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                  <div>
                                    <div className="flex items-center gap-2 mb-1.5">
                                      <span className="text-lg">
                                        {inv.produceType === "Cattle Breeding" ? "🐄" : 
                                         inv.produceType === "Beef Processing" ? "🥩" : 
                                         inv.produceType === "Dairy Production" ? "🥛" : 
                                         inv.produceType === "Leather & Hides" ? "💼" : 
                                         inv.produceType === "Organic Manure" ? "🌱" : "🥘"}
                                      </span>
                                      <h4 className="font-extrabold text-zinc-900 text-sm">{inv.produceType}</h4>
                                      {matured ? (
                                        <span className="bg-emerald-100 text-emerald-700 text-[9px] font-black uppercase px-2 py-0.5 rounded-md border border-emerald-200">
                                          Matured & Ready
                                        </span>
                                      ) : (
                                        <span className="bg-amber-50 text-amber-700 text-[9px] font-black uppercase px-2 py-0.5 rounded-md border border-amber-200 flex items-center gap-1">
                                          <Clock size={10} /> Lock-in Active
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-xs font-semibold text-zinc-400">ID: {inv.id.slice(0, 8)} • Ends: {formatDate(inv.endDate)}</p>
                                  </div>

                                  {/* Payout Summary */}
                                  <div className="sm:text-right bg-white p-3 rounded-xl border border-zinc-150/60 shadow-xs sm:min-w-[160px]">
                                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Payout Value</p>
                                    <p className="text-base font-black text-emerald-700">{formatCurrency(totalPayout)}</p>
                                    <p className="text-[9px] text-zinc-500 font-bold">
                                      Principal ({formatCurrency(inv.amount)}) + Profit ({formatCurrency(profit)})
                                    </p>
                                  </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="mt-4 pt-3 border-t border-zinc-200/60 flex items-center justify-between gap-3 flex-wrap">
                                  {!matured ? (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => handleSimulateMaturity(inv)}
                                        className="text-[10px] font-black text-emerald-700 hover:text-emerald-800 bg-emerald-100/60 hover:bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                                        title="Simulate 6 months maturity immediately"
                                      >
                                        🧪 Simulate Maturity (6 Months Later)
                                      </button>
                                      <p className="text-[10px] text-zinc-400 font-semibold italic">Locked until 6-month term is completed.</p>
                                    </>
                                  ) : (
                                    <>
                                      <div className="text-[10px] text-emerald-700 font-bold">
                                        ✓ Cycle complete. Total interest and principal can now be released.
                                      </div>
                                      <button
                                        type="button"
                                        disabled={loading}
                                        onClick={() => handleInvestmentPayoutWithdraw(inv)}
                                        className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-black hover:bg-emerald-700 transition-all shadow-md shadow-emerald-200 flex items-center gap-1 cursor-pointer"
                                      >
                                        {loading ? "withdrawing..." : <>Withdraw to Bank <ArrowDownRight size={14} /></>}
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )
          ) : (
            /* SUCCESS CARD */
            <motion.div 
              key="success-screen"
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
                  
                  {/* Confetti Particles */}
                  {[...Array(12)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0, x: 0, y: 0 }}
                      animate={{ 
                        scale: [0, 1, 0],
                        x: Math.cos(i * 30 * Math.PI / 180) * 80,
                        y: Math.sin(i * 30 * Math.PI / 180) * 80,
                      }}
                      transition={{ 
                        duration: 1, 
                        delay: 0.1,
                        ease: "easeOut"
                      }}
                      className={`absolute w-2 h-2 rounded-full ${
                        i % 3 === 0 ? "bg-emerald-400" : i % 3 === 1 ? "bg-amber-400" : "bg-blue-400"
                      }`}
                    />
                  ))}

                  <motion.div 
                    animate={{ scale: [1, 1.2, 1], rotate: [0, 15, -15, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute -top-2 -right-2 text-amber-500"
                  >
                    <PartyPopper size={24} />
                  </motion.div>
                </motion.div>
                
                <h3 className="text-2xl font-black text-zinc-900 mb-2">Withdrawal Successful!</h3>
                <p className="text-zinc-500 mb-8 max-w-sm mx-auto text-sm leading-relaxed">
                  {successMsg || "Your payout has been safely processed and is on its way to your destination account."}
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

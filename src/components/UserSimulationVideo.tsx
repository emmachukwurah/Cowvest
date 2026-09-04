import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  X, 
  CheckCircle2, 
  Sparkles, 
  Clock, 
  Lock, 
  User, 
  Wallet, 
  TrendingUp, 
  ShieldCheck, 
  ArrowRight,
  Maximize2,
  Volume2,
  VolumeX,
  Zap,
  Check,
  Building2
} from "lucide-react";
import { CowIcon as Cow } from "./CowIcon";
import { formatCurrency } from "../lib/utils";
import { useAuth } from "../lib/AuthContext";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { doc, updateDoc, addDoc, collection, increment } from "firebase/firestore";

interface UserSimulationVideoProps {
  className?: string;
}

interface ChapterStep {
  id: number;
  title: string;
  timestamp: string;
  startTime: number; // in seconds
  endTime: number; // in seconds
  description: string;
  bgGradient: string;
}

export function UserSimulationVideo({ className = "" }: UserSimulationVideoProps) {
  const { profile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isMuted, setIsMuted] = useState(false);
  const [executingLive, setExecutingLive] = useState(false);
  const [executedSuccess, setExecutedSuccess] = useState(false);

  const duration = 30; // Exactly 30 seconds
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const steps: ChapterStep[] = [
    {
      id: 1,
      title: "Step 1: Chukwurah Chukwunonso Login",
      timestamp: "0:00 - 0:08",
      startTime: 0,
      endTime: 8,
      description: "User Chukwurah Chukwunonso enters credentials, completes biometric passkey authentication, and logs into Cowvest platform.",
      bgGradient: "from-zinc-950 via-emerald-950/80 to-zinc-900"
    },
    {
      id: 2,
      title: "Step 2: ₦3,000,000 Wallet Deposit",
      timestamp: "0:08 - 0:18",
      startTime: 8,
      endTime: 18,
      description: "Chukwurah opens wallet top-up, inputs ₦3,000,000 via instant bank settlement, and confirms wallet balance update.",
      bgGradient: "from-emerald-950 via-zinc-900 to-zinc-950"
    },
    {
      id: 3,
      title: "Step 3: ₦1,000,000 Product Investment",
      timestamp: "0:18 - 0:30",
      startTime: 18,
      endTime: 30,
      description: "Chukwurah selects Cowhide (Kpomo) & Cattle Produce, commits ₦1,000,000, and locks in 20% ROI (₦1,200,000 payout in 6 months).",
      bgGradient: "from-zinc-900 via-emerald-950/90 to-zinc-950"
    }
  ];

  // Determine active step based on current time
  const currentStepIndex = steps.findIndex(
    (s) => currentTime >= s.startTime && currentTime <= s.endTime
  );
  const activeStep = steps[currentStepIndex >= 0 ? currentStepIndex : 0];

  // Video timer simulation
  useEffect(() => {
    if (isPlaying && isOpen) {
      timerRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= duration) {
            setIsPlaying(false);
            return duration;
          }
          return Math.min(prev + 0.2 * playbackSpeed, duration);
        });
      }, 200);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, isOpen, playbackSpeed]);

  const handleOpenPlayer = () => {
    setIsOpen(true);
    setIsPlaying(true);
    setCurrentTime(0);
  };

  const handleClosePlayer = () => {
    setIsOpen(false);
    setIsPlaying(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const formatTime = (secs: number) => {
    const s = Math.floor(secs);
    const ms = Math.floor((secs - s) * 10);
    return `0:${s < 10 ? "0" : ""}${s}.${ms}s`;
  };

  // Perform live action to mirror simulation in real database
  const handleApplyLiveAction = async () => {
    if (!profile) return;
    setExecutingLive(true);
    try {
      const userRef = doc(db, "users", profile.uid);

      // 1. Update user displayName to Chukwurah Chukwunonso and set deposit
      await updateDoc(userRef, {
        displayName: "Chukwurah Chukwunonso",
        balance: increment(2000000), // Net ₦2,000,000 left (3M deposit - 1M investment)
        totalInvested: increment(1000000)
      });

      // 2. Add deposit activity
      await addDoc(collection(db, "activities"), {
        userId: profile.uid,
        type: "deposit",
        amount: 3000000,
        timestamp: new Date().toISOString(),
        description: "Deposited ₦3,000,000 into wallet via instant bank transfer."
      });

      // 3. Add ₦1,000,000 investment
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 6);

      await addDoc(collection(db, "investments"), {
        userId: profile.uid,
        amount: 1000000,
        produceType: "Cowhide (Kpomo)",
        status: "active",
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        expectedReturn: 200000,
        payoutAmount: 1200000
      });

      // 4. Add investment activity
      await addDoc(collection(db, "activities"), {
        userId: profile.uid,
        type: "investment",
        amount: 1000000,
        timestamp: new Date().toISOString(),
        description: "Invested ₦1,000,000 in Cowhide (Kpomo) produce."
      });

      setExecutedSuccess(true);
      setTimeout(() => {
        setExecutedSuccess(false);
      }, 4000);
    } catch (err) {
      console.error("Live simulation sync error:", err);
      alert("Failed to sync live data.");
    } finally {
      setExecutingLive(false);
    }
  };

  return (
    <div className={`my-6 ${className}`}>
      {/* Banner / Card triggers simulation */}
      <motion.div
        whileHover={{ scale: 1.01, y: -2 }}
        className="relative overflow-hidden bg-gradient-to-r from-zinc-900 via-emerald-950 to-zinc-950 rounded-3xl p-6 md:p-8 text-white border border-emerald-500/20 shadow-xl cursor-pointer group"
        onClick={handleOpenPlayer}
      >
        {/* Glowing background accents */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/20 transition-all duration-500" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-xs font-bold text-emerald-400 uppercase tracking-widest">
              <Zap size={14} className="animate-pulse text-emerald-400" />
              <span>30-Second Walkthrough Video</span>
            </div>

            <h3 className="text-xl md:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              Chukwurah Chukwunonso Simulation
            </h3>

            <p className="text-zinc-300 text-xs md:text-sm font-medium leading-relaxed">
              Watch step-by-step 30s demonstration: <strong className="text-emerald-400">User Login</strong> → <strong className="text-emerald-400">₦3,000,000 Wallet Deposit</strong> → <strong className="text-emerald-400">₦1,000,000 Investment</strong> with 20% ROI calculation.
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400 font-semibold pt-1">
              <span className="flex items-center gap-1">
                <Clock size={14} className="text-emerald-400" /> 30 SECONDS
              </span>
              <span className="w-1 h-1 bg-zinc-600 rounded-full" />
              <span className="flex items-center gap-1 text-emerald-300 font-mono">
                💳 ₦3,000,000 DEPOSIT
              </span>
              <span className="w-1 h-1 bg-zinc-600 rounded-full" />
              <span className="flex items-center gap-1 text-emerald-300 font-mono">
                🌾 ₦1,000,000 INVESTED
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <motion.div 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="w-16 h-16 bg-emerald-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-600/30 border border-emerald-400/30 group-hover:bg-emerald-500 transition-colors"
            >
              <Play size={28} className="fill-current ml-1" />
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Video Simulation Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 overflow-y-auto">
            {/* Dark Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClosePlayer}
              className="fixed inset-0 bg-zinc-950/95 backdrop-blur-md"
            />

            {/* Video Box Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[92vh]"
            >
              {/* Video Header Bar */}
              <div className="px-6 py-4 bg-zinc-900/80 border-b border-zinc-800 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-bold text-xs">
                    30s
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-white tracking-tight">User Simulation Video</h4>
                    <p className="text-[11px] text-zinc-400 font-semibold">Chukwurah Chukwunonso: Login, ₦3M Deposit & ₦1M Investment</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleApplyLiveAction}
                    disabled={executingLive}
                    className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                  >
                    {executingLive ? "Syncing..." : executedSuccess ? "✓ Live Account Updated!" : "⚡ Apply to My Live Dashboard"}
                  </button>

                  <button
                    onClick={handleClosePlayer}
                    className="w-9 h-9 bg-zinc-800 text-zinc-400 hover:text-white rounded-full flex items-center justify-center transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Video Screen & Chapter View Area */}
              <div className="flex-1 relative flex flex-col min-h-[360px] bg-black overflow-hidden">
                {/* Dynamic Gradient Background for active step */}
                <div className={`absolute inset-0 bg-gradient-to-br ${activeStep.bgGradient} transition-all duration-1000`} />

                {/* Grid Overlay */}
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#emerald_1px,transparent_1px)] [background-size:16px_16px]" />

                {/* Top Watermark / Status Bar inside Video */}
                <div className="relative z-10 p-6 flex justify-between items-center text-xs font-mono">
                  <div className="flex items-center gap-2 bg-black/60 backdrop-blur px-3 py-1 rounded-full border border-zinc-800 text-zinc-300">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                    <span>REC // SIMULATION 30s</span>
                  </div>

                  <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-3 py-1 rounded-full font-bold">
                    STEP {activeStep.id} OF 3
                  </div>
                </div>

                {/* Center Visual Mockup depending on active second */}
                <div className="relative z-10 flex-1 flex items-center justify-center p-6">
                  <AnimatePresence mode="wait">
                    {/* SCENE 1: 0s to 8s -> LOGIN */}
                    {currentTime >= 0 && currentTime < 8 && (
                      <motion.div
                        key="scene-1"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.4 }}
                        className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl backdrop-blur-md space-y-4 text-center"
                      >
                        <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center text-white mx-auto shadow-lg shadow-emerald-600/30">
                          <Cow size={28} />
                        </div>

                        <div>
                          <h5 className="text-lg font-black text-white">Welcome back, Chukwurah</h5>
                          <p className="text-xs text-zinc-400">Securing session for Chukwurah Chukwunonso</p>
                        </div>

                        <div className="space-y-2 text-left text-xs font-mono">
                          <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 flex items-center gap-2 text-zinc-200">
                            <User size={14} className="text-emerald-400" />
                            <span>chukwurah.chukwunonso@cowvest.com</span>
                          </div>
                          <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 flex items-center gap-2 text-zinc-200">
                            <Lock size={14} className="text-emerald-400" />
                            <span>••••••••••••••••</span>
                          </div>
                        </div>

                        <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 animate-pulse">
                          <ShieldCheck size={16} />
                          <span>Passkey Biometric Verified: Chukwurah Chukwunonso</span>
                        </div>
                      </motion.div>
                    )}

                    {/* SCENE 2: 8s to 18s -> DEPOSIT ₦3,000,000 */}
                    {currentTime >= 8 && currentTime < 18 && (
                      <motion.div
                        key="scene-2"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.4 }}
                        className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl backdrop-blur-md space-y-4 text-center"
                      >
                        <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto border border-emerald-500/30">
                          <Wallet size={28} />
                        </div>

                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 block mb-1">Instant Bank Settlement</span>
                          <h5 className="text-2xl font-black text-white">₦3,000,000 Deposit</h5>
                          <p className="text-xs text-zinc-400">Recipient: Cowvest Treasury (Chukwurah Chukwunonso)</p>
                        </div>

                        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-2 text-left text-xs">
                          <div className="flex justify-between text-zinc-400">
                            <span>Payment Method:</span>
                            <span className="text-white font-bold">NIBSS Instant Transfer</span>
                          </div>
                          <div className="flex justify-between text-zinc-400">
                            <span>Amount:</span>
                            <span className="text-emerald-400 font-extrabold font-mono text-sm">₦3,000,000.00</span>
                          </div>
                          <div className="flex justify-between text-zinc-400">
                            <span>Status:</span>
                            <span className="text-emerald-400 font-bold flex items-center gap-1">
                              <CheckCircle2 size={12} /> Settled & Confirmed
                            </span>
                          </div>
                        </div>

                        <div className="bg-emerald-600 text-white font-extrabold py-3 rounded-xl text-sm shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2">
                          <Sparkles size={16} /> Wallet Balance Updated to ₦3,000,000
                        </div>
                      </motion.div>
                    )}

                    {/* SCENE 3: 18s to 30s -> INVESTMENT ₦1,000,000 */}
                    {currentTime >= 18 && (
                      <motion.div
                        key="scene-3"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.4 }}
                        className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl backdrop-blur-md space-y-4 text-center"
                      >
                        <div className="w-14 h-14 bg-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center mx-auto border border-amber-500/30">
                          <TrendingUp size={28} />
                        </div>

                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 block mb-1">Underwritten Agricultural Asset</span>
                          <h5 className="text-2xl font-black text-white">₦1,000,000 Invested</h5>
                          <p className="text-xs text-zinc-400">Product: Cowhide (Kpomo) & Cattle Breeding</p>
                        </div>

                        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-2 text-left text-xs font-mono">
                          <div className="flex justify-between text-zinc-400">
                            <span>Principal Capital:</span>
                            <span className="text-white font-bold">₦1,000,000.00</span>
                          </div>
                          <div className="flex justify-between text-zinc-400">
                            <span>Guaranteed ROI (20%):</span>
                            <span className="text-emerald-400 font-bold">+₦200,000.00</span>
                          </div>
                          <div className="flex justify-between text-zinc-400 border-t border-zinc-800 pt-2 mt-1">
                            <span>Maturity Payout (6 Months):</span>
                            <span className="text-emerald-400 font-black text-sm">₦1,200,000.00</span>
                          </div>
                        </div>

                        <div className="bg-emerald-600 text-white font-extrabold py-3 rounded-xl text-sm shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2">
                          <CheckCircle2 size={16} /> Investment Active for Chukwurah Chukwunonso
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Subtitle / Caption Overlay */}
                <div className="relative z-10 p-4 bg-black/80 backdrop-blur-md border-t border-zinc-800/80 text-center">
                  <p className="text-xs md:text-sm font-bold text-white tracking-wide">
                    {activeStep.description}
                  </p>
                </div>
              </div>

              {/* Video Player Controls Ribbon */}
              <div className="p-6 bg-zinc-900 flex flex-col gap-4 shrink-0">
                {/* Timeline Bar */}
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-emerald-400 w-14">{formatTime(currentTime)}</span>
                  <div
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const clickX = e.clientX - rect.left;
                      const newTime = (clickX / rect.width) * duration;
                      setCurrentTime(Math.min(Math.max(0, newTime), duration));
                    }}
                    className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden cursor-pointer relative group"
                  >
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-100"
                      style={{ width: `${(currentTime / duration) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono font-bold text-zinc-400 w-14 text-right">0:30.0s</span>
                </div>

                {/* Controls & Options */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="w-10 h-10 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl flex items-center justify-center transition-all shadow-md shadow-emerald-600/20"
                    >
                      {isPlaying ? <Pause size={18} className="fill-current" /> : <Play size={18} className="fill-current ml-0.5" />}
                    </button>

                    <button
                      onClick={() => setCurrentTime(0)}
                      className="w-10 h-10 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl flex items-center justify-center transition-all"
                      title="Restart Video"
                    >
                      <RotateCcw size={16} />
                    </button>

                    <div className="h-4 w-[1px] bg-zinc-800" />

                    {/* Step selector shortcuts */}
                    <div className="flex gap-1">
                      {steps.map((st) => (
                        <button
                          key={st.id}
                          onClick={() => {
                            setCurrentTime(st.startTime);
                            setIsPlaying(true);
                          }}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all ${
                            activeStep.id === st.id
                              ? "bg-emerald-600 text-white"
                              : "bg-zinc-800 text-zinc-400 hover:text-white"
                          }`}
                        >
                          Step {st.id}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Speed button */}
                    <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-800">
                      {[1, 1.5, 2].map((sp) => (
                        <button
                          key={sp}
                          onClick={() => setPlaybackSpeed(sp)}
                          className={`px-2 py-0.5 text-[10px] font-extrabold rounded-lg ${
                            playbackSpeed === sp ? "bg-emerald-600 text-white" : "text-zinc-500 hover:text-zinc-300"
                          }`}
                        >
                          {sp}x
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={handleApplyLiveAction}
                      disabled={executingLive}
                      className="sm:hidden px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold"
                    >
                      {executedSuccess ? "Synced!" : "Apply to Account"}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

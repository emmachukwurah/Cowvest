import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, 
  Sparkles, 
  Award, 
  Users, 
  UserCheck, 
  Wallet, 
  Clock, 
  TrendingUp, 
  Share2, 
  Copy, 
  Check, 
  MessageSquare, 
  Globe, 
  Send, 
  ShieldCheck, 
  Zap, 
  Gift, 
  ArrowRight, 
  Info, 
  HelpCircle,
  Calendar,
  CheckCircle2
} from "lucide-react";
import { useAuth } from "../lib/AuthContext";
import { formatCurrency } from "../lib/utils";
import { 
  calculateTier, 
  getTierRate, 
  listenReferralSettings 
} from "../lib/referralService";
import { ReferralSettings } from "../types";

interface ReferralPackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenMyReferrals: () => void;
  onOpenTerms: () => void;
}

export function ReferralPackageModal({
  isOpen,
  onClose,
  onOpenMyReferrals,
  onOpenTerms
}: ReferralPackageModalProps) {
  const { profile } = useAuth();
  const [copied, setCopied] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [calcAmount, setCalcAmount] = useState<number>(500000);

  const [settings, setSettings] = useState<ReferralSettings>({
    bronzeRate: 0.5,
    silverRate: 0.75,
    goldRate: 1.0,
    newInvestorBonusRate: 0.25,
    maxReferrerRewardCap: 5000,
    maxNewInvestorBonusCap: 2500,
    monthlyLimitPerUser: 50000,
    minQualifyingInvestment: 10000,
    updatedAt: new Date().toISOString()
  });

  useEffect(() => {
    const unsub = listenReferralSettings((updated) => {
      setSettings(updated);
    });
    return () => unsub();
  }, []);

  if (!isOpen || !profile) return null;

  const stats = profile.referralStats || {
    totalReferrals: 0,
    successfulReferrals: 0,
    pendingRewards: 0,
    availableReferralEarnings: 0,
    totalReferralEarnings: 0,
    monthlyEarnings: 0,
    currentTier: "Bronze"
  };

  const currentTier = calculateTier(stats.successfulReferrals);
  const currentRate = getTierRate(currentTier, settings);

  // Next tier math
  let nextTierName = "Silver";
  let targetReferrals = 5;
  let remainingForNext = Math.max(0, 5 - stats.successfulReferrals);
  let progressPercentage = Math.min(100, (stats.successfulReferrals / 5) * 100);

  if (currentTier === "Silver") {
    nextTierName = "Gold";
    targetReferrals = 10;
    remainingForNext = Math.max(0, 10 - stats.successfulReferrals);
    progressPercentage = Math.min(100, ((stats.successfulReferrals - 5) / 5) * 100);
  } else if (currentTier === "Gold") {
    nextTierName = "Gold Max Tier";
    targetReferrals = 10;
    remainingForNext = 0;
    progressPercentage = 100;
  }

  const referralCode = profile.referralCode || "COWVEST";
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://cowvest.app";
  const referralLink = `${baseUrl}/?ref=${referralCode}`;
  const messageText = `Join me on CowVest and explore high-yield livestock investment opportunities! Use my referral link to register and receive a welcome bonus: ${referralLink}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  // Social shares
  const shareWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(messageText)}`;
    window.open(url, "_blank");
  };

  const shareFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}&quote=${encodeURIComponent(messageText)}`;
    window.open(url, "_blank");
  };

  const shareX = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(messageText)}`;
    window.open(url, "_blank");
  };

  const shareNative = () => {
    if (navigator.share) {
      navigator.share({
        title: "CowVest Refer & Earn",
        text: messageText,
        url: referralLink,
      }).catch((err) => console.log("Share canceled", err));
    } else {
      handleCopyLink();
    }
  };

  // Calculator calculations
  const simulatedReferrerReward = Math.min(
    settings.maxReferrerRewardCap,
    (calcAmount * currentRate) / 100
  );
  const simulatedFriendBonus = Math.min(
    settings.maxNewInvestorBonusCap,
    (calcAmount * settings.newInvestorBonusRate) / 100
  );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[90] flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-zinc-950/85 backdrop-blur-md"
        />

        {/* Modal Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden z-10 border border-zinc-150 flex flex-col my-6 max-h-[92vh]"
        >
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-zinc-950 via-emerald-950 to-zinc-900 p-6 sm:p-8 text-white relative overflow-hidden shrink-0">
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-600/10 rounded-full blur-2xl pointer-events-none" />

            <button
              onClick={onClose}
              className="absolute top-5 right-5 w-9 h-9 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors cursor-pointer"
              title="Close Package"
            >
              <X size={18} />
            </button>

            <div className="flex flex-wrap items-center gap-2 mb-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 border border-emerald-500/40 rounded-full text-xs font-black text-emerald-300 uppercase tracking-widest">
                <Sparkles size={14} className="text-emerald-400" />
                <span>Cowvest Refer and earn</span>
              </div>
              <span className="px-2.5 py-0.5 bg-amber-400/20 border border-amber-400/40 text-amber-300 rounded-full text-[11px] font-extrabold uppercase">
                Up to 1.0% Commission
              </span>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-1.5">
                  Invite. Invest. Earn.
                </h2>
                <p className="text-zinc-300 text-xs sm:text-sm font-medium max-w-2xl leading-relaxed">
                  Earn when your friends invest with CowVest. Receive up to 1.0% in referral rewards plus welcome bonuses for new investors.
                </p>
              </div>

              {/* Current Tier Badge */}
              <div className="flex items-center gap-3 shrink-0 bg-white/10 border border-white/15 p-3 sm:p-3.5 rounded-2xl backdrop-blur-sm">
                <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center font-black text-xl shadow-lg ${
                  currentTier === "Gold" 
                    ? "bg-gradient-to-tr from-amber-500 to-yellow-300 text-zinc-950 shadow-amber-500/30" 
                    : currentTier === "Silver"
                    ? "bg-gradient-to-tr from-slate-300 to-zinc-100 text-zinc-900 shadow-slate-300/30"
                    : "bg-gradient-to-tr from-amber-700 to-amber-600 text-white shadow-amber-700/30"
                }`}>
                  <Award size={22} />
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-300">Your Active Tier</div>
                  <div className="text-base sm:text-lg font-black text-white flex items-center gap-1.5">
                    <span>{currentTier}</span>
                    <span className="text-xs px-2 py-0.5 bg-emerald-500/30 text-emerald-300 rounded-md border border-emerald-500/40 font-extrabold">
                      {currentRate}% Reward
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Scrollable Package Body */}
          <div className="p-5 sm:p-8 space-y-6 overflow-y-auto flex-1">
            
            {/* Live Stats Overview Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-zinc-50 border border-zinc-200/80 rounded-2xl p-3.5 sm:p-4">
                <div className="flex items-center justify-between text-zinc-500 mb-1.5">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider">Total Referrals</span>
                  <Users size={16} className="text-emerald-600" />
                </div>
                <div className="text-xl sm:text-2xl font-black text-zinc-900">{stats.totalReferrals}</div>
                <div className="text-[10px] text-zinc-400 font-medium mt-0.5">Friends signed up</div>
              </div>

              <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-3.5 sm:p-4">
                <div className="flex items-center justify-between text-emerald-800 mb-1.5">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider">Funded Investors</span>
                  <UserCheck size={16} className="text-emerald-600" />
                </div>
                <div className="text-xl sm:text-2xl font-black text-emerald-950">{stats.successfulReferrals}</div>
                <div className="text-[10px] text-emerald-700 font-bold mt-0.5">KYC + 1st Investment</div>
              </div>

              <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3.5 sm:p-4">
                <div className="flex items-center justify-between text-amber-800 mb-1.5">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider">Pending Rewards</span>
                  <Clock size={16} className="text-amber-600" />
                </div>
                <div className="text-xl sm:text-2xl font-black text-amber-950">{formatCurrency(stats.pendingRewards || 0)}</div>
                <div className="text-[10px] text-amber-700 font-medium mt-0.5">In verification</div>
              </div>

              <div className="bg-zinc-950 text-white rounded-2xl p-3.5 sm:p-4 border border-zinc-800">
                <div className="flex items-center justify-between text-zinc-400 mb-1.5">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider">Total Earned</span>
                  <Wallet size={16} className="text-emerald-400" />
                </div>
                <div className="text-xl sm:text-2xl font-black text-emerald-400">{formatCurrency(stats.totalReferralEarnings || 0)}</div>
                <div className="text-[10px] text-zinc-400 font-medium mt-0.5">Credited to wallet</div>
              </div>
            </div>

            {/* Instant Sharing & Referral Link Toolbox */}
            <div className="bg-emerald-950/10 border border-emerald-500/20 rounded-3xl p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-emerald-600 text-white rounded-xl">
                    <Share2 size={16} />
                  </span>
                  <h3 className="font-extrabold text-sm sm:text-base text-zinc-900">
                    Your Personalized Referral Link & Code
                  </h3>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100/70 px-2.5 py-0.5 rounded-full">
                  Instant Payouts
                </span>
              </div>

              {/* Link Input Row */}
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <div className="flex-1 w-full flex items-center bg-white border border-zinc-200 rounded-2xl p-2 pl-3.5 shadow-xs">
                  <input
                    type="text"
                    readOnly
                    value={referralLink}
                    className="w-full bg-transparent text-xs sm:text-sm font-semibold text-zinc-900 outline-none select-all"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl transition-all shadow-sm flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copied ? "Copied!" : "Copy Link"}</span>
                  </button>
                </div>

                <div className="w-full sm:w-auto flex items-center gap-2 bg-white border border-zinc-200 rounded-2xl p-2 px-3 shadow-xs shrink-0">
                  <div className="text-[10px] font-bold text-zinc-400 uppercase">Code:</div>
                  <span className="font-mono font-black text-sm text-emerald-950">{referralCode}</span>
                  <button
                    onClick={handleCopyCode}
                    className="p-1.5 text-zinc-500 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors cursor-pointer ml-1"
                    title="Copy Code"
                  >
                    {copiedCode ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>

              {/* Social Channels Share Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                <button
                  onClick={shareWhatsApp}
                  className="py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200/80 rounded-xl flex items-center justify-center gap-2 text-emerald-900 font-bold text-xs transition-colors cursor-pointer"
                >
                  <MessageSquare size={16} className="text-emerald-600" />
                  <span>WhatsApp</span>
                </button>

                <button
                  onClick={shareFacebook}
                  className="py-2.5 px-3 bg-blue-50 hover:bg-blue-100/80 border border-blue-200/80 rounded-xl flex items-center justify-center gap-2 text-blue-900 font-bold text-xs transition-colors cursor-pointer"
                >
                  <Globe size={16} className="text-blue-600" />
                  <span>Facebook</span>
                </button>

                <button
                  onClick={shareX}
                  className="py-2.5 px-3 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 rounded-xl flex items-center justify-center gap-2 text-zinc-900 font-bold text-xs transition-colors cursor-pointer"
                >
                  <Send size={16} className="text-zinc-800" />
                  <span>X (Twitter)</span>
                </button>

                <button
                  onClick={shareNative}
                  className="py-2.5 px-3 bg-teal-50 hover:bg-teal-100/80 border border-teal-200/80 rounded-xl flex items-center justify-center gap-2 text-teal-900 font-bold text-xs transition-colors cursor-pointer"
                >
                  <Share2 size={16} className="text-teal-600" />
                  <span>More Options</span>
                </button>
              </div>
            </div>

            {/* Interactive Reward Calculator */}
            <div className="bg-white border border-zinc-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-zinc-950 flex items-center gap-2">
                    <Zap size={18} className="text-amber-500" />
                    <span>Interactive Earnings Calculator</span>
                  </h3>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    See exactly how much you and your friend earn based on your tier rate ({currentRate}%).
                  </p>
                </div>
              </div>

              {/* Amount Quick Presets */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-zinc-600">Friend's First Investment Amount:</span>
                  <span className="font-mono font-black text-zinc-950 text-sm">{formatCurrency(calcAmount)}</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[100000, 500000, 1000000, 2500000].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setCalcAmount(preset)}
                      className={`py-2 px-3 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
                        calcAmount === preset
                          ? "bg-zinc-900 text-white border-zinc-900 shadow-sm"
                          : "bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100"
                      }`}
                    >
                      {formatCurrency(preset)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Calculated Outputs Split View */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-emerald-800 block">Your Cash Reward ({currentRate}%)</span>
                    <span className="text-xl sm:text-2xl font-black text-emerald-950 font-mono">
                      +{formatCurrency(simulatedReferrerReward)}
                    </span>
                    <span className="text-[10px] text-emerald-700 block mt-0.5">Credited straight to your CowVest wallet</span>
                  </div>
                  <div className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center shadow-sm">
                    <Award size={20} />
                  </div>
                </div>

                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-amber-800 block">Friend's Welcome Bonus (0.25%)</span>
                    <span className="text-xl sm:text-2xl font-black text-amber-950 font-mono">
                      +{formatCurrency(simulatedFriendBonus)}
                    </span>
                    <span className="text-[10px] text-amber-700 block mt-0.5">Added directly to their starting portfolio</span>
                  </div>
                  <div className="w-10 h-10 bg-amber-500 text-white rounded-xl flex items-center justify-center shadow-sm">
                    <Gift size={20} />
                  </div>
                </div>
              </div>
            </div>

            {/* 3-Tier Growth Structure */}
            <div className="bg-zinc-950 text-white rounded-3xl p-5 sm:p-6 border border-zinc-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-white flex items-center gap-2">
                    <TrendingUp size={18} className="text-emerald-400" />
                    <span>Tier Progression & Scaling Commissions</span>
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Your reward percentage increases automatically as your network expands.
                  </p>
                </div>
                <div className="text-xs font-bold text-emerald-300">
                  {currentTier === "Gold" ? (
                    <span className="text-amber-300 font-extrabold flex items-center gap-1">
                      <Award size={14} /> Maximum Tier (1.0% Rate)
                    </span>
                  ) : (
                    <span>{remainingForNext} more to reach {nextTierName} ({getTierRate(nextTierName as any, settings)}%)</span>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-zinc-800 h-2.5 rounded-full overflow-hidden border border-white/10">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-300 rounded-full"
                />
              </div>

              {/* Tiers Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className={`p-4 rounded-2xl border transition-all ${
                  currentTier === "Bronze"
                    ? "bg-amber-950/40 border-amber-500/60 ring-1 ring-amber-500/30"
                    : "bg-white/5 border-white/10"
                }`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-black text-xs text-amber-400 uppercase tracking-wider">Bronze Tier</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/10">1–4 Referrals</span>
                  </div>
                  <div className="text-xl font-black text-white mt-1">0.5% Reward</div>
                  <p className="text-[11px] text-zinc-400 mt-1">Up to ₦5,000 per referral + ₦2,500 friend bonus</p>
                </div>

                <div className={`p-4 rounded-2xl border transition-all ${
                  currentTier === "Silver"
                    ? "bg-slate-800/80 border-slate-300/60 ring-1 ring-slate-300/30"
                    : "bg-white/5 border-white/10"
                }`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-black text-xs text-slate-200 uppercase tracking-wider">Silver Tier</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/10">5–9 Referrals</span>
                  </div>
                  <div className="text-xl font-black text-white mt-1">0.75% Reward</div>
                  <p className="text-[11px] text-zinc-400 mt-1">Accelerated commission with priority payout status</p>
                </div>

                <div className={`p-4 rounded-2xl border transition-all ${
                  currentTier === "Gold"
                    ? "bg-amber-500/20 border-amber-400/60 ring-1 ring-amber-400/30"
                    : "bg-white/5 border-white/10"
                }`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-black text-xs text-amber-300 uppercase tracking-wider">Gold Tier</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/10">10+ Referrals</span>
                  </div>
                  <div className="text-xl font-black text-amber-300 mt-1">1.0% Reward</div>
                  <p className="text-[11px] text-zinc-400 mt-1">Highest tier with maximum 1.0% earnings on all invites</p>
                </div>
              </div>
            </div>

            {/* Step by Step Flow */}
            <div className="space-y-3 pt-2">
              <h4 className="font-extrabold text-xs sm:text-sm text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-emerald-600" />
                <span>How CowVest Refer & Earn Operates</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-xs">
                <div className="p-3.5 bg-zinc-50 border border-zinc-200/80 rounded-2xl">
                  <div className="w-6 h-6 bg-emerald-600 text-white rounded-full flex items-center justify-center font-black text-[11px] mb-2">
                    1
                  </div>
                  <div className="font-extrabold text-zinc-950 mb-0.5">Share Your Link</div>
                  <div className="text-zinc-500 text-[11px]">Send via WhatsApp, X, Facebook, or direct link.</div>
                </div>

                <div className="p-3.5 bg-zinc-50 border border-zinc-200/80 rounded-2xl">
                  <div className="w-6 h-6 bg-emerald-600 text-white rounded-full flex items-center justify-center font-black text-[11px] mb-2">
                    2
                  </div>
                  <div className="font-extrabold text-zinc-950 mb-0.5">Friend Registers</div>
                  <div className="text-zinc-500 text-[11px]">Creates their CowVest account with your referral tag.</div>
                </div>

                <div className="p-3.5 bg-zinc-50 border border-zinc-200/80 rounded-2xl">
                  <div className="w-6 h-6 bg-emerald-600 text-white rounded-full flex items-center justify-center font-black text-[11px] mb-2">
                    3
                  </div>
                  <div className="font-extrabold text-zinc-950 mb-0.5">Passes KYC</div>
                  <div className="text-zinc-500 text-[11px]">Completes BVN/NIN identity verification safely.</div>
                </div>

                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl">
                  <div className="w-6 h-6 bg-emerald-700 text-white rounded-full flex items-center justify-center font-black text-[11px] mb-2">
                    4
                  </div>
                  <div className="font-extrabold text-emerald-950 mb-0.5">1st Investment</div>
                  <div className="text-emerald-800 text-[11px] font-bold">Both receive instant cash rewards in wallet!</div>
                </div>
              </div>
            </div>

            {/* Disclaimer & Policy Notice */}
            <div className="p-4 bg-zinc-100 rounded-2xl border border-zinc-200/80 text-[11px] text-zinc-600 flex items-start gap-2.5">
              <ShieldCheck size={16} className="text-emerald-700 shrink-0 mt-0.5" />
              <p>
                <strong>Promotional Incentive Notice:</strong> Referral rewards are community expansion incentives and strictly separated from agricultural ROI distributions. Monthly ceiling is {formatCurrency(settings.monthlyLimitPerUser)} per user. Subject to anti-fraud verification.
              </p>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 sm:p-6 bg-zinc-50 border-t border-zinc-150 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={() => {
                  onClose();
                  onOpenMyReferrals();
                }}
                className="px-4 py-2.5 bg-white hover:bg-zinc-100 text-zinc-800 border border-zinc-200 font-extrabold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Users size={14} className="text-emerald-600" />
                <span>My Referrals ({stats.totalReferrals})</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onOpenTerms();
                }}
                className="px-3 py-2 text-zinc-500 hover:text-emerald-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
              >
                <HelpCircle size={14} />
                <span>Programme Terms</span>
              </button>
            </div>

            <button
              onClick={handleCopyLink}
              className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Share2 size={16} />
              <span>{copied ? "Link Copied!" : "Copy & Share Link"}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

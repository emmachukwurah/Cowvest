import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  Users, 
  UserCheck, 
  Clock, 
  Wallet, 
  Award, 
  Share2, 
  ChevronRight, 
  Sparkles, 
  TrendingUp, 
  ShieldCheck, 
  Gift, 
  HelpCircle, 
  Calendar,
  Zap,
  CheckCircle2,
  Lock,
  DollarSign
} from "lucide-react";
import { useAuth } from "../lib/AuthContext";
import { formatCurrency } from "../lib/utils";
import { 
  getReferralSettings, 
  calculateTier, 
  getTierRate, 
  listenReferralSettings 
} from "../lib/referralService";
import { ReferralSettings } from "../types";

interface ReferAndEarnCardProps {
  onOpenInvite: () => void;
  onOpenMyReferrals: () => void;
  onOpenTerms: () => void;
}

export function ReferAndEarnCard({ onOpenInvite, onOpenMyReferrals, onOpenTerms }: ReferAndEarnCardProps) {
  const { profile } = useAuth();
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

  if (!profile) return null;

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

  // Progress to next tier calculations
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

  const remainingMonthlyLimit = Math.max(0, settings.monthlyLimitPerUser - (stats.monthlyEarnings || 0));

  return (
    <div id="refer-and-earn-card" className="my-8 bg-gradient-to-br from-zinc-950 via-emerald-950 to-zinc-900 rounded-3xl p-6 sm:p-8 text-white border border-emerald-500/30 shadow-2xl relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Badge & Title */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-emerald-500/20">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-emerald-500/20 border border-emerald-500/40 rounded-full text-xs font-black text-emerald-300 uppercase tracking-widest">
            <Sparkles size={14} className="text-emerald-400" />
            <span>CowVest Refer & Earn</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
            Invite. Invest. Earn.
          </h2>
          <p className="text-zinc-300 text-sm font-medium">
            Earn when your friends invest with CowVest. Receive up to 1.0% in referral rewards plus welcome bonuses for new investors!
          </p>
        </div>

        {/* Tier Badge */}
        <div className="flex items-center gap-3 shrink-0 bg-white/5 border border-white/10 p-3 rounded-2xl backdrop-blur-sm">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl shadow-lg ${
            currentTier === "Gold" 
              ? "bg-gradient-to-tr from-amber-500 to-yellow-300 text-zinc-950 shadow-amber-500/30" 
              : currentTier === "Silver"
              ? "bg-gradient-to-tr from-slate-300 to-zinc-100 text-zinc-900 shadow-slate-300/30"
              : "bg-gradient-to-tr from-amber-700 to-amber-600 text-white shadow-amber-700/30"
          }`}>
            <Award size={24} />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400">Current Tier</div>
            <div className="text-lg font-black text-white flex items-center gap-1.5">
              <span>{currentTier} Tier</span>
              <span className="text-xs px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-md border border-emerald-500/30 font-extrabold">
                {currentRate}% Reward
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3.5 my-6">
        {/* Total Referrals */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-extrabold uppercase tracking-wider">Total Referrals</span>
            <Users size={16} className="text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">{stats.totalReferrals}</div>
          <div className="text-[11px] text-zinc-400 font-medium mt-1">Friends registered</div>
        </div>

        {/* Successful Referrals */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-extrabold uppercase tracking-wider">Funded Investors</span>
            <UserCheck size={16} className="text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-300">{stats.successfulReferrals}</div>
          <div className="text-[11px] text-emerald-400 font-bold mt-1">KYC + Funded 1st Investment</div>
        </div>

        {/* Pending Rewards */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-extrabold uppercase tracking-wider">Pending Rewards</span>
            <Clock size={16} className="text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-300">{formatCurrency(stats.pendingRewards || 0)}</div>
          <div className="text-[11px] text-amber-400/90 font-medium mt-1">Awaiting approval</div>
        </div>

        {/* Total Referral Earnings */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-extrabold uppercase tracking-wider">Total Earned</span>
            <Wallet size={16} className="text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">{formatCurrency(stats.totalReferralEarnings || 0)}</div>
          <div className="text-[11px] text-zinc-400 font-medium mt-1">Credited to wallet</div>
        </div>
      </div>

      {/* Referral Progress Tracker Section */}
      <div className="relative z-10 bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5 my-6 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-emerald-400" />
            <span className="text-sm font-black uppercase tracking-wider text-zinc-200">Referral Tier Progress</span>
          </div>
          <div className="text-xs font-bold text-emerald-300">
            {currentTier === "Gold" ? (
              <span className="flex items-center gap-1 text-amber-300">
                <Award size={14} /> Maximum Tier Achieved (1.0% Rate)
              </span>
            ) : (
              <span>{stats.successfulReferrals} successful referrals — {remainingForNext} more to reach {nextTierName} ({getTierRate(nextTierName as any, settings)}%)</span>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-zinc-800/80 h-3 rounded-full overflow-hidden border border-white/10 relative my-2">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-300 rounded-full"
          />
        </div>

        {/* Tier Badges Row */}
        <div className="grid grid-cols-3 gap-2 mt-3 pt-2 border-t border-white/5 text-center text-xs">
          <div className={`p-2 rounded-xl border transition-all ${
            currentTier === "Bronze" 
              ? "bg-amber-950/60 border-amber-500/50 text-amber-300 font-black shadow-md" 
              : "bg-white/5 border-white/5 text-zinc-400 font-semibold"
          }`}>
            <div className="text-[10px] uppercase tracking-wider font-extrabold">Bronze Tier</div>
            <div className="text-sm font-extrabold mt-0.5">1–4 Referrals</div>
            <div className="text-[11px] text-emerald-400 font-black mt-0.5">0.5% Reward</div>
          </div>

          <div className={`p-2 rounded-xl border transition-all ${
            currentTier === "Silver" 
              ? "bg-slate-800/80 border-slate-300/50 text-slate-200 font-black shadow-md" 
              : "bg-white/5 border-white/5 text-zinc-400 font-semibold"
          }`}>
            <div className="text-[10px] uppercase tracking-wider font-extrabold">Silver Tier</div>
            <div className="text-sm font-extrabold mt-0.5">5–9 Referrals</div>
            <div className="text-[11px] text-emerald-400 font-black mt-0.5">0.75% Reward</div>
          </div>

          <div className={`p-2 rounded-xl border transition-all ${
            currentTier === "Gold" 
              ? "bg-amber-500/20 border-amber-400/50 text-amber-300 font-black shadow-md" 
              : "bg-white/5 border-white/5 text-zinc-400 font-semibold"
          }`}>
            <div className="text-[10px] uppercase tracking-wider font-extrabold">Gold Tier</div>
            <div className="text-sm font-extrabold mt-0.5">10+ Referrals</div>
            <div className="text-[11px] text-amber-300 font-black mt-0.5">1.0% Reward</div>
          </div>
        </div>
      </div>

      {/* Monthly Limit Bar & Examples */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
        {/* Monthly Limit Info Card */}
        <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
              <Calendar size={14} className="text-emerald-400" /> Monthly Earning Cap
            </span>
            <span className="text-xs font-extrabold text-zinc-300">
              {formatCurrency(stats.monthlyEarnings || 0)} / {formatCurrency(settings.monthlyLimitPerUser)}
            </span>
          </div>

          <p className="text-xs text-zinc-300 font-medium mb-3">
            Monthly referral limit initially set at {formatCurrency(settings.monthlyLimitPerUser)}. Remaining available limit this month: <strong className="text-emerald-300">{formatCurrency(remainingMonthlyLimit)}</strong>.
          </p>

          <div className="w-full bg-zinc-900/80 h-2 rounded-full overflow-hidden border border-emerald-500/20">
            <div 
              className="h-full bg-emerald-400 rounded-full" 
              style={{ width: `${Math.min(100, ((stats.monthlyEarnings || 0) / settings.monthlyLimitPerUser) * 100)}%` }}
            />
          </div>
        </div>

        {/* Reward Examples Box as requested */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <div className="text-xs font-black uppercase tracking-wider text-zinc-300 mb-2 flex items-center gap-1.5">
            <Zap size={14} className="text-amber-400" /> Reward Calculation Examples
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between items-center py-1 border-b border-white/5 text-zinc-200">
              <span>₦100,000 investment</span>
              <span className="font-mono text-emerald-300">Referrer: ₦500 | Friend: ₦250</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-white/5 text-zinc-200">
              <span>₦500,000 investment</span>
              <span className="font-mono text-emerald-300">Referrer: ₦2,500 | Friend: ₦1,250</span>
            </div>
            <div className="flex justify-between items-center py-1 text-zinc-200">
              <span>₦1,000,000 investment</span>
              <span className="font-mono text-emerald-300">Referrer: ₦5,000 (Max) | Friend: ₦2,500</span>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="relative z-10 pt-2 flex flex-col sm:flex-row items-center gap-3">
        <button
          onClick={onOpenInvite}
          className="w-full sm:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black rounded-2xl text-sm transition-all shadow-xl shadow-emerald-500/30 flex items-center justify-center gap-2 cursor-pointer group"
        >
          <Share2 size={18} />
          <span>Invite Friends</span>
          <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </button>

        <button
          onClick={onOpenMyReferrals}
          className="w-full sm:w-auto px-6 py-4 bg-white/10 hover:bg-white/20 text-white border border-white/15 font-bold rounded-2xl text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Users size={18} className="text-emerald-400" />
          <span>My Referrals ({stats.totalReferrals})</span>
        </button>

        <button
          onClick={onOpenTerms}
          className="ml-auto text-xs font-extrabold text-zinc-400 hover:text-emerald-300 transition-colors flex items-center gap-1 cursor-pointer py-2 px-1"
        >
          <HelpCircle size={14} />
          <span>Referral Programme Terms</span>
        </button>
      </div>
    </div>
  );
}

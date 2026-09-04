import React from "react";
import { motion } from "motion/react";
import { Sparkles, Gift, ArrowRight, Award, Users, ChevronRight } from "lucide-react";
import { useAuth } from "../lib/AuthContext";
import { calculateTier, getTierRate } from "../lib/referralService";

interface ReferAndEarnBannerProps {
  onClick: () => void;
}

export function ReferAndEarnBanner({ onClick }: ReferAndEarnBannerProps) {
  const { profile } = useAuth();

  const stats = profile?.referralStats || {
    totalReferrals: 0,
    successfulReferrals: 0,
    currentTier: "Bronze"
  };

  const currentTier = calculateTier(stats.successfulReferrals);

  return (
    <motion.div
      id="refer-and-earn-banner"
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className="my-8 relative overflow-hidden bg-gradient-to-r from-zinc-950 via-emerald-950 to-zinc-900 rounded-3xl p-6 sm:p-8 text-white border border-emerald-500/30 shadow-xl hover:shadow-2xl hover:border-emerald-400/60 hover:scale-[1.008] active:scale-[0.995] transition-all cursor-pointer group select-none"
    >
      {/* Ambient decorative glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/25 transition-all duration-500" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left Side: Headline & Copy */}
        <div className="space-y-2.5 max-w-3xl">
          {/* Top Tag Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 border border-emerald-500/40 rounded-full text-xs font-black text-emerald-300 uppercase tracking-widest">
              <Sparkles size={14} className="text-emerald-400" />
              <span>Cowvest Refer and earn</span>
            </div>

            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-400/15 border border-amber-400/30 text-amber-300 rounded-full text-[11px] font-extrabold uppercase">
              <Award size={12} />
              <span>Up to 1.0% Commission</span>
            </span>

            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-400/15 border border-emerald-400/30 text-emerald-300 rounded-full text-[11px] font-extrabold uppercase">
              <Gift size={12} />
              <span>₦2,500 Welcome Bonus</span>
            </span>
          </div>

          {/* Subheading / Hook */}
          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white flex items-center gap-2">
            Invite. Invest. Earn
          </h3>

          {/* User Request Description Copy */}
          <p className="text-zinc-300 text-xs sm:text-sm md:text-base font-medium leading-relaxed">
            Earn when your friends invest with CowVest. Receive up to 1.0% in referral rewards plus welcome bonuses for new investors.
          </p>

          {/* Quick interactive badges */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400 font-semibold pt-1">
            <span className="flex items-center gap-1 text-emerald-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Instant Wallet Payouts</span>
            </span>
            <span className="w-1 h-1 bg-zinc-700 rounded-full hidden sm:inline-block" />
            <span className="flex items-center gap-1 text-zinc-300">
              <Users size={13} className="text-emerald-400" />
              <span>{stats.totalReferrals} Invited • Tier: {currentTier}</span>
            </span>
          </div>
        </div>

        {/* Right Side: Clickable Action Package CTA */}
        <div className="shrink-0 flex items-center gap-3">
          <div className="w-full sm:w-auto px-6 py-3.5 bg-emerald-500 group-hover:bg-emerald-400 text-zinc-950 font-black rounded-2xl text-xs sm:text-sm transition-all shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2">
            <span>Explore Refer & Earn Package</span>
            <ArrowRight size={18} className="group-hover:translate-x-1.5 transition-transform" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

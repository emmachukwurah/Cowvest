import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  HelpCircle, 
  Info,
  Award,
  Zap,
  Lock,
  Calendar
} from "lucide-react";

interface ReferralTermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ReferralTermsModal({ isOpen, onClose }: ReferralTermsModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-zinc-950/80 backdrop-blur-md"
        />

        {/* Modal Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden z-10 border border-zinc-150 flex flex-col my-8 max-h-[85vh]"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-zinc-950 via-emerald-950 to-zinc-900 p-6 sm:p-8 text-white relative shrink-0">
            <button
              onClick={onClose}
              className="absolute top-5 right-5 w-9 h-9 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/20 border border-emerald-500/40 rounded-full text-xs font-bold text-emerald-300 uppercase tracking-widest w-fit mb-3">
              <ShieldCheck size={14} className="text-emerald-400" />
              <span>Programme Governance</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-1">
              CowVest Refer & Earn Rules
            </h2>
            <p className="text-zinc-300 text-xs sm:text-sm font-medium">
              Official Terms & Conditions governing referral rewards and investor bonuses.
            </p>
          </div>

          {/* Content Body */}
          <div className="p-6 sm:p-8 space-y-6 overflow-y-auto text-xs text-zinc-600 leading-relaxed">
            {/* MANDATORY DISCLAIMER BOX */}
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3 text-emerald-900">
              <Info size={18} className="text-emerald-600 shrink-0 mt-0.5" />
              <p className="font-bold">
                Referral rewards are promotional marketing incentives for expanding the CowVest community and are strictly separate from agricultural investment returns or ROI distributions.
              </p>
            </div>

            {/* Section 1 */}
            <div className="space-y-2">
              <h3 className="text-sm font-black text-zinc-900 uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600" /> 1. Eligibility & Qualifying Referrals
              </h3>
              <p>
                To earn a referral reward, you must be an active registered CowVest user with completed identity verification (KYC). A referral only becomes eligible for a reward when:
              </p>
              <ul className="list-disc pl-5 space-y-1 font-medium">
                <li>The referred user registers using your exact referral link or code.</li>
                <li>The referred user successfully passes identity clearance (KYC).</li>
                <li>The referred user executes their first qualifying agricultural investment (Minimum ₦10,000).</li>
              </ul>
              <p className="text-zinc-500 italic">No monetary reward is granted merely for link sharing or basic user registration.</p>
            </div>

            {/* Section 2 */}
            <div className="space-y-2">
              <h3 className="text-sm font-black text-zinc-900 uppercase tracking-wider flex items-center gap-2">
                <Award size={16} className="text-emerald-600" /> 2. Referral Tier & Reward Structure
              </h3>
              <p>
                Referrer reward rates scale automatically based on your cumulative count of successful funded referrals:
              </p>
              <div className="grid grid-cols-3 gap-2 py-2">
                <div className="p-2.5 bg-zinc-50 rounded-xl border border-zinc-200 text-center">
                  <span className="font-black text-zinc-900 block">Bronze Tier</span>
                  <span className="text-[11px] text-emerald-700 font-extrabold">0.5% Reward (1–4 users)</span>
                </div>
                <div className="p-2.5 bg-zinc-50 rounded-xl border border-zinc-200 text-center">
                  <span className="font-black text-zinc-900 block">Silver Tier</span>
                  <span className="text-[11px] text-emerald-700 font-extrabold">0.75% Reward (5–9 users)</span>
                </div>
                <div className="p-2.5 bg-zinc-50 rounded-xl border border-zinc-200 text-center">
                  <span className="font-black text-zinc-900 block">Gold Tier</span>
                  <span className="text-[11px] text-amber-700 font-extrabold">1.0% Reward (10+ users)</span>
                </div>
              </div>
            </div>

            {/* Section 3 */}
            <div className="space-y-2">
              <h3 className="text-sm font-black text-zinc-900 uppercase tracking-wider flex items-center gap-2">
                <Zap size={16} className="text-amber-600" /> 3. Reward Caps & Monthly Limits
              </h3>
              <ul className="list-disc pl-5 space-y-1 font-medium">
                <li><strong>Maximum Referrer Cap:</strong> ₦5,000 per individual qualifying referral.</li>
                <li><strong>New Investor Welcome Bonus:</strong> 0.25% of first investment (Capped at ₦2,500 maximum).</li>
                <li><strong>Monthly Earning Limit:</strong> Standard accounts can earn up to ₦50,000 in referral rewards per calendar month. Excess rewards roll over or require admin review.</li>
              </ul>
            </div>

            {/* Section 4 */}
            <div className="space-y-2">
              <h3 className="text-sm font-black text-zinc-900 uppercase tracking-wider flex items-center gap-2">
                <AlertCircle size={16} className="text-rose-600" /> 4. Anti-Fraud & Compliance Safeguards
              </h3>
              <p>
                CowVest enforces strict automated monitoring against referral farming, self-referrals, duplicate accounts, and disposable emails.
              </p>
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-[11px] font-medium">
                Self-referrals (referring yourself using alternate emails) and duplicate account creation will lead to instant disqualification, revocation of pending rewards, and potential account suspension.
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-150 flex justify-end">
              <button
                onClick={onClose}
                className="px-6 py-3 bg-zinc-900 hover:bg-zinc-800 text-white font-black rounded-xl text-xs transition-colors cursor-pointer"
              >
                I Understand & Agree
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

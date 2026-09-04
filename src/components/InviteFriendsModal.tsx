import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, 
  Copy, 
  Check, 
  Share2, 
  MessageSquare, 
  Sparkles, 
  Users, 
  ShieldCheck, 
  TrendingUp, 
  ArrowRight,
  Send,
  Globe
} from "lucide-react";
import { useAuth } from "../lib/AuthContext";

interface InviteFriendsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InviteFriendsModal({ isOpen, onClose }: InviteFriendsModalProps) {
  const { profile } = useAuth();
  const [copied, setCopied] = useState(false);

  if (!isOpen || !profile) return null;

  const referralCode = profile.referralCode || "COWVEST";
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://cowvest.app";
  const referralLink = `${baseUrl}/?ref=${referralCode}`;

  const messageText = `Join me on CowVest and explore investment opportunities across the agricultural value chain. Use my referral link to sign up: ${referralLink}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Social Share handlers
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

  const shareSms = () => {
    const url = `sms:?body=${encodeURIComponent(messageText)}`;
    window.open(url, "_self");
  };

  const shareNative = () => {
    if (navigator.share) {
      navigator.share({
        title: "CowVest Refer & Earn",
        text: messageText,
        url: referralLink,
      }).catch((err) => console.log("Share canceled", err));
    } else {
      handleCopy();
    }
  };

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
          className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden z-10 border border-zinc-150 flex flex-col my-8"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-zinc-950 via-emerald-950 to-zinc-900 p-6 md:p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <button
              onClick={onClose}
              className="absolute top-5 right-5 w-9 h-9 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/20 border border-emerald-500/40 rounded-full text-xs font-bold text-emerald-300 uppercase tracking-widest w-fit mb-3">
              <Sparkles size={14} className="text-emerald-400" />
              <span>Invite Friends & Earn</span>
            </div>

            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white mb-2">
              Share CowVest with Your Network
            </h2>

            <p className="text-zinc-300 text-xs md:text-sm font-medium leading-relaxed">
              Earn 0.5% to 1.0% in referral rewards when your friends register, complete KYC, and make their first qualifying investment.
            </p>
          </div>

          {/* Modal Content */}
          <div className="p-6 md:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
            {/* Referral Link Box */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-zinc-700 flex items-center justify-between">
                <span>Your Unique Referral Link</span>
                <span className="text-emerald-600 font-bold text-[11px]">Instant 1-Click Copy</span>
              </label>

              <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-200 rounded-2xl p-2 pl-4 focus-within:border-emerald-500 transition-all">
                <input
                  type="text"
                  readOnly
                  value={referralLink}
                  className="w-full bg-transparent text-sm font-semibold text-zinc-900 outline-none select-all"
                />
                <button
                  onClick={handleCopy}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  <span>{copied ? "Copied!" : "Copy Link"}</span>
                </button>
              </div>
            </div>

            {/* Referral Code Box */}
            <div className="p-4 bg-emerald-50/70 border border-emerald-150 rounded-2xl flex items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800 block">Your Referral Code</span>
                <span className="text-2xl font-black text-emerald-950 font-mono tracking-wider">{referralCode}</span>
              </div>
              <button
                onClick={handleCopyCode}
                className="px-4 py-2 bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-extrabold rounded-xl transition-colors cursor-pointer"
              >
                Copy Code
              </button>
            </div>

            {/* Social Share Buttons */}
            <div>
              <label className="text-xs font-black uppercase tracking-wider text-zinc-700 block mb-3">
                Share Directly via
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {/* WhatsApp */}
                <button
                  onClick={shareWhatsApp}
                  className="p-3 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-2xl flex flex-col items-center justify-center gap-1.5 text-emerald-800 font-bold text-xs transition-colors cursor-pointer"
                >
                  <MessageSquare size={20} className="text-emerald-600" />
                  <span>WhatsApp</span>
                </button>

                {/* Facebook */}
                <button
                  onClick={shareFacebook}
                  className="p-3 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-2xl flex flex-col items-center justify-center gap-1.5 text-blue-800 font-bold text-xs transition-colors cursor-pointer"
                >
                  <Globe size={20} className="text-blue-600" />
                  <span>Facebook</span>
                </button>

                {/* X / Twitter */}
                <button
                  onClick={shareX}
                  className="p-3 bg-zinc-900/10 hover:bg-zinc-900/20 border border-zinc-900/20 rounded-2xl flex flex-col items-center justify-center gap-1.5 text-zinc-900 font-bold text-xs transition-colors cursor-pointer"
                >
                  <Send size={20} className="text-zinc-800" />
                  <span>X / Twitter</span>
                </button>

                {/* SMS / More */}
                <button
                  onClick={shareNative}
                  className="p-3 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 rounded-2xl flex flex-col items-center justify-center gap-1.5 text-teal-800 font-bold text-xs transition-colors cursor-pointer"
                >
                  <Share2 size={20} className="text-teal-600" />
                  <span>SMS / More</span>
                </button>
              </div>
            </div>

            {/* Simple Referral Message Box */}
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-wider text-zinc-700 block">
                Pre-Populated Invite Message
              </label>
              <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-2xl text-xs text-zinc-700 font-medium leading-relaxed italic">
                "{messageText}"
              </div>
            </div>

            {/* How It Works 4-Step Diagram */}
            <div className="pt-2 border-t border-zinc-150">
              <h4 className="text-xs font-black uppercase tracking-wider text-zinc-900 mb-3 flex items-center gap-1.5">
                <TrendingUp size={14} className="text-emerald-600" /> How CowVest Refer & Earn Works
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2.5 bg-zinc-50 rounded-xl border border-zinc-100">
                  <span className="w-5 h-5 bg-emerald-600 text-white rounded-full inline-flex items-center justify-center font-black text-[10px] mb-1">1</span>
                  <div className="font-extrabold text-zinc-900">Share Link</div>
                  <div className="text-[11px] text-zinc-500">No reward yet</div>
                </div>

                <div className="p-2.5 bg-zinc-50 rounded-xl border border-zinc-100">
                  <span className="w-5 h-5 bg-emerald-600 text-white rounded-full inline-flex items-center justify-center font-black text-[10px] mb-1">2</span>
                  <div className="font-extrabold text-zinc-900">User Registers</div>
                  <div className="text-[11px] text-zinc-500">Status: Registered</div>
                </div>

                <div className="p-2.5 bg-zinc-50 rounded-xl border border-zinc-100">
                  <span className="w-5 h-5 bg-emerald-600 text-white rounded-full inline-flex items-center justify-center font-black text-[10px] mb-1">3</span>
                  <div className="font-extrabold text-zinc-900">KYC Clearance</div>
                  <div className="text-[11px] text-zinc-500">Identity verified</div>
                </div>

                <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200">
                  <span className="w-5 h-5 bg-emerald-700 text-white rounded-full inline-flex items-center justify-center font-black text-[10px] mb-1">4</span>
                  <div className="font-extrabold text-emerald-950">1st Investment</div>
                  <div className="text-[11px] text-emerald-700 font-bold">Earn up to ₦5,000!</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, 
  Users, 
  UserCheck, 
  Search, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Lock,
  Wallet,
  Sparkles,
  ChevronRight
} from "lucide-react";
import { useAuth } from "../lib/AuthContext";
import { formatCurrency } from "../lib/utils";
import { listenUserReferrals } from "../lib/referralService";
import { Referral } from "../types";

interface MyReferralsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenInvite: () => void;
}

export function MyReferralsModal({ isOpen, onClose, onOpenInvite }: MyReferralsModalProps) {
  const { profile } = useAuth();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    if (!profile) return;
    const unsub = listenUserReferrals(profile.uid, (data) => {
      setReferrals(data);
    });
    return () => unsub();
  }, [profile, isOpen]);

  if (!isOpen || !profile) return null;

  const filteredReferrals = referrals.filter((ref) => {
    const matchesSearch = 
      ref.referredName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ref.referredEmail.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === "all") return matchesSearch;
    if (filterStatus === "invested") return matchesSearch && ref.investmentStatus === "Invested";
    if (filterStatus === "pending") return matchesSearch && ref.rewardStatus === "Pending";
    if (filterStatus === "paid") return matchesSearch && ref.rewardStatus === "Paid";
    return matchesSearch;
  });

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
          className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden z-10 border border-zinc-150 flex flex-col my-8 max-h-[90vh]"
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
              <Users size={14} className="text-emerald-400" />
              <span>My Referrals Directory</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-1">
                  Track Your Referred Investors
                </h2>
                <p className="text-zinc-300 text-xs sm:text-sm font-medium">
                  Monitor registration, KYC clearance, investment status, and referral reward payouts.
                </p>
              </div>

              <button
                onClick={() => { onClose(); onOpenInvite(); }}
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black rounded-xl text-xs transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <Sparkles size={14} /> Invite More Friends
              </button>
            </div>
          </div>

          {/* Privacy Protection Banner */}
          <div className="px-6 py-2.5 bg-zinc-100 border-b border-zinc-200 text-xs text-zinc-600 flex items-center gap-2 shrink-0">
            <Lock size={14} className="text-emerald-700 shrink-0" />
            <span><strong>Privacy Protected:</strong> In compliance with CowVest data protection rules, referred users' personal names and emails are partially masked.</span>
          </div>

          {/* Controls Bar: Search & Filter */}
          <div className="p-4 sm:p-6 bg-zinc-50 border-b border-zinc-150 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            <div className="relative w-full sm:w-72">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Search referred user..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-900 outline-none focus:border-emerald-500 transition-all"
              />
            </div>

            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto no-scrollbar">
              <button
                onClick={() => setFilterStatus("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                  filterStatus === "all" ? "bg-zinc-900 text-white" : "bg-white text-zinc-600 hover:bg-zinc-200"
                }`}
              >
                All ({referrals.length})
              </button>

              <button
                onClick={() => setFilterStatus("invested")}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                  filterStatus === "invested" ? "bg-emerald-600 text-white" : "bg-white text-zinc-600 hover:bg-zinc-200"
                }`}
              >
                Funded
              </button>

              <button
                onClick={() => setFilterStatus("pending")}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                  filterStatus === "pending" ? "bg-amber-600 text-white" : "bg-white text-zinc-600 hover:bg-zinc-200"
                }`}
              >
                Pending
              </button>

              <button
                onClick={() => setFilterStatus("paid")}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                  filterStatus === "paid" ? "bg-teal-600 text-white" : "bg-white text-zinc-600 hover:bg-zinc-200"
                }`}
              >
                Paid
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1">
            {filteredReferrals.length === 0 ? (
              <div className="py-16 text-center flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-zinc-100 rounded-3xl flex items-center justify-center text-zinc-400 mb-4">
                  <Users size={32} />
                </div>
                <h3 className="text-lg font-black text-zinc-900 mb-1">No Referral Records Found</h3>
                <p className="text-xs text-zinc-500 max-w-sm mb-6">
                  {searchTerm ? "No users match your search query." : "You haven't referred any users yet. Share your link to start earning rewards!"}
                </p>
                <button
                  onClick={() => { onClose(); onOpenInvite(); }}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
                >
                  Share Referral Link Now
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[650px]">
                  <thead>
                    <tr className="border-b border-zinc-200 text-[10px] font-black uppercase tracking-wider text-zinc-400">
                      <th className="pb-3 pl-2">Referred User</th>
                      <th className="pb-3">Date Joined</th>
                      <th className="pb-3">KYC Status</th>
                      <th className="pb-3">Investment Status</th>
                      <th className="pb-3">Reward</th>
                      <th className="pb-3 pr-2 text-right">Reward Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 text-xs">
                    {filteredReferrals.map((ref) => (
                      <tr key={ref.id} className="hover:bg-zinc-50/80 transition-colors">
                        {/* User */}
                        <td className="py-3.5 pl-2 font-bold text-zinc-900">
                          <div>{ref.referredName}</div>
                          <div className="text-[10px] font-mono font-normal text-zinc-400">{ref.referredEmail}</div>
                        </td>

                        {/* Date Joined */}
                        <td className="py-3.5 text-zinc-500 font-medium">
                          {new Date(ref.registeredAt).toLocaleDateString("en-NG", {
                            day: "numeric",
                            month: "short",
                            year: "numeric"
                          })}
                        </td>

                        {/* KYC Status */}
                        <td className="py-3.5">
                          {ref.kycStatus === "KYC Completed" ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-extrabold text-[10px]">
                              <CheckCircle2 size={12} /> KYC Completed
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-zinc-100 text-zinc-600 border border-zinc-200 rounded-full font-semibold text-[10px]">
                              <Clock size={12} /> KYC Pending
                            </span>
                          )}
                        </td>

                        {/* Investment Status */}
                        <td className="py-3.5">
                          {ref.investmentStatus === "Invested" ? (
                            <div>
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full font-black text-[10px]">
                                Invested ({formatCurrency(ref.firstInvestmentAmount || 0)})
                              </span>
                            </div>
                          ) : (
                            <span className="text-zinc-400 font-medium text-[11px]">No Investment</span>
                          )}
                        </td>

                        {/* Reward */}
                        <td className="py-3.5 font-black text-zinc-900 font-mono">
                          {ref.rewardAmount > 0 ? formatCurrency(ref.rewardAmount) : "—"}
                        </td>

                        {/* Reward Status */}
                        <td className="py-3.5 pr-2 text-right">
                          {ref.rewardStatus === "Paid" ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-teal-50 text-teal-700 border border-teal-200 rounded-full font-black text-[10px]">
                              <CheckCircle2 size={12} /> Paid
                            </span>
                          ) : ref.rewardStatus === "Approved" ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-black text-[10px]">
                              Approved
                            </span>
                          ) : ref.rewardStatus === "Rejected" ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-full font-black text-[10px]">
                              Rejected
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full font-black text-[10px]">
                              <Clock size={12} /> Pending
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

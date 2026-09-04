import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, 
  Bell, 
  CheckCircle2, 
  Gift, 
  Users, 
  UserCheck, 
  Sparkles, 
  Clock, 
  Check, 
  Inbox
} from "lucide-react";
import { useAuth } from "../lib/AuthContext";
import { 
  listenUserNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead 
} from "../lib/referralService";
import { ReferralNotification } from "../types";

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationsModal({ isOpen, onClose }: NotificationsModalProps) {
  const { profile } = useAuth();
  const [notifications, setNotifications] = useState<ReferralNotification[]>([]);

  useEffect(() => {
    if (!profile) return;
    const unsub = listenUserNotifications(profile.uid, (items) => {
      setNotifications(items);
    });
    return () => unsub();
  }, [profile, isOpen]);

  if (!isOpen || !profile) return null;

  const handleMarkAllRead = async () => {
    await markAllNotificationsAsRead(profile.uid);
  };

  const handleMarkRead = async (notifId: string) => {
    await markNotificationAsRead(notifId);
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

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden z-10 border border-zinc-150 flex flex-col my-8 max-h-[85vh]"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-zinc-950 via-emerald-950 to-zinc-900 p-6 text-white relative shrink-0">
            <button
              onClick={onClose}
              className="absolute top-5 right-5 w-9 h-9 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/20 border border-emerald-500/40 rounded-full text-xs font-bold text-emerald-300 uppercase tracking-widest w-fit mb-2">
              <Bell size={14} className="text-emerald-400" />
              <span>In-App Notifications</span>
            </div>

            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black tracking-tight text-white">
                Activity & Rewards
              </h2>

              {notifications.some(n => !n.read) && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs font-bold text-emerald-300 hover:text-emerald-200 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Check size={14} /> Mark all read
                </button>
              )}
            </div>
          </div>

          {/* List Content */}
          <div className="p-4 sm:p-6 overflow-y-auto space-y-3 flex-1">
            {notifications.length === 0 ? (
              <div className="py-12 text-center flex flex-col items-center justify-center text-zinc-400">
                <Inbox size={40} className="mb-2 text-zinc-300" />
                <p className="text-sm font-bold text-zinc-600">No Notifications Yet</p>
                <p className="text-xs text-zinc-400 max-w-xs mt-1">
                  You will receive real-time alerts when friends sign up with your link, complete KYC, or earn you referral rewards.
                </p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => !n.read && handleMarkRead(n.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${
                    n.read ? "bg-zinc-50 border-zinc-150 text-zinc-700" : "bg-emerald-50/70 border-emerald-200 text-emerald-950 font-semibold shadow-sm"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      n.type === "reward_paid" ? "bg-teal-600 text-white" : n.type === "first_investment" ? "bg-emerald-600 text-white" : "bg-zinc-200 text-zinc-700"
                    }`}>
                      {n.type === "reward_paid" ? <Gift size={18} /> : n.type === "first_investment" ? <Sparkles size={18} /> : <Users size={18} />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <h4 className="text-xs font-black text-zinc-900 truncate">{n.title}</h4>
                        <span className="text-[10px] text-zinc-400 font-medium shrink-0">
                          {new Date(n.createdAt).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>

                      <p className="text-xs leading-relaxed text-zinc-600">{n.message}</p>
                    </div>

                    {!n.read && (
                      <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full shrink-0 mt-1.5" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

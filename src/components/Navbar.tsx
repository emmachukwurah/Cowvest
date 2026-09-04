import React, { useState, useEffect } from "react";
import { useAuth } from "../lib/AuthContext";
import { LogOut, User, Plus, ArrowDownRight, Settings, Bell, Share2, Shield } from "lucide-react";
import { CowIcon as Cow } from "./CowIcon";
import { formatCurrency } from "../lib/utils";
import { DepositModal } from "./DepositModal";
import { WithdrawModal } from "./WithdrawModal";
import { ProfileSettingsSidebar } from "./ProfileSettingsSidebar";
import { NotificationsModal } from "./NotificationsModal";
import { listenUserNotifications } from "../lib/referralService";

interface NavbarProps {
  currentPage?: "dashboard" | "portfolio";
  onNavigate?: (page: "dashboard" | "portfolio") => void;
  onOpenKyc?: () => void;
  onOpenInvite?: () => void;
  onOpenAdminReferral?: () => void;
}

export function Navbar({ currentPage = "dashboard", onNavigate, onOpenKyc, onOpenInvite, onOpenAdminReferral }: NavbarProps) {
  const { profile, logout, signIn } = useAuth();
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!profile) return;
    const unsub = listenUserNotifications(profile.uid, (items) => {
      const unread = items.filter(i => !i.read).length;
      setUnreadCount(unread);
    });
    return () => unsub();
  }, [profile]);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/85 backdrop-blur-md border-b border-zinc-100">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-6">
            {/* Clickable Brand Logo */}
            <button
              onClick={() => onNavigate?.("dashboard")}
              className="flex items-center gap-2 text-left group cursor-pointer focus-visible:outline-none"
              title="Go to CowVest Dashboard"
            >
              <div className="w-10 h-10 bg-emerald-600 group-hover:bg-emerald-700 rounded-xl flex items-center justify-center text-white transition-colors shadow-sm shadow-emerald-600/20">
                <Cow size={24} />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-emerald-950 group-hover:text-emerald-700 transition-colors">
                Cowvest
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 md:gap-6">
            {profile ? (
              <>
                {!profile.kycVerified && onOpenKyc && (
                  <button
                    onClick={onOpenKyc}
                    className="hidden sm:flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-emerald-600 text-white px-3 py-1 rounded-full text-xs font-black shadow-md hover:brightness-110 transition-all cursor-pointer animate-pulse"
                    title="Submit KYC to start investing"
                  >
                    <span>KYC Pending</span>
                  </button>
                )}
                
                {/* Deposit CTA */}
                <button 
                  onClick={() => setIsDepositOpen(true)}
                  className="flex items-center gap-1 sm:gap-1.5 bg-emerald-600 text-white px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-extrabold hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-600/20 cursor-pointer"
                  title="Deposit Funds"
                >
                  <Plus size={16} /> <span className="hidden xs:inline">Deposit</span>
                </button>

                {/* Withdraw CTA */}
                <button 
                  onClick={() => setIsWithdrawOpen(true)}
                  className="hidden xs:flex items-center gap-1 sm:gap-1.5 bg-zinc-100 text-zinc-700 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-extrabold hover:bg-zinc-200 transition-colors border border-zinc-200 cursor-pointer"
                  title="Withdraw Funds"
                >
                  <ArrowDownRight size={16} /> <span className="hidden sm:inline">Withdraw</span>
                </button>

                {/* Refer & Earn Quick Button */}
                {onOpenInvite && (
                  <button
                    onClick={onOpenInvite}
                    className="hidden lg:flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-full text-xs font-black hover:bg-emerald-100 transition-all cursor-pointer"
                    title="Invite Friends & Earn Rewards"
                  >
                    <Share2 size={14} className="text-emerald-600" />
                    <span>Refer & Earn</span>
                  </button>
                )}

                {/* Admin Panel Quick Access Button */}
                {onOpenAdminReferral && (
                  <button
                    onClick={onOpenAdminReferral}
                    className="hidden md:flex items-center gap-1 bg-zinc-900 text-white px-2.5 py-1 rounded-full text-xs font-extrabold hover:bg-zinc-800 transition-all cursor-pointer"
                    title="Admin Referral Console"
                  >
                    <Shield size={12} className="text-emerald-400" />
                    <span>Admin</span>
                  </button>
                )}

                {/* Notification Bell Button */}
                <button
                  onClick={() => setIsNotificationsOpen(true)}
                  className="w-9 h-9 sm:w-10 sm:h-10 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-full flex items-center justify-center transition-colors relative cursor-pointer"
                  title="In-App Notifications"
                >
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white rounded-full text-[10px] font-black flex items-center justify-center shadow-md animate-bounce">
                      {unreadCount}
                    </span>
                  )}
                </button>

                <div className="flex items-center gap-1.5 sm:gap-3">
                  <button 
                    onClick={() => setIsSettingsOpen(true)}
                    className="w-9 h-9 sm:w-10 sm:h-10 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 border border-emerald-100 hover:ring-2 hover:ring-emerald-500/20 hover:border-emerald-500 transition-all overflow-hidden relative group cursor-pointer"
                    title="Security & Profile Settings"
                  >
                    {profile.avatarUrl ? (
                      <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User size={18} />
                    )}
                    <div className="absolute inset-0 bg-emerald-900/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Settings size={12} className="text-emerald-700 animate-spin-slow" />
                    </div>
                  </button>
                  <button 
                    onClick={logout}
                    className="p-1.5 text-zinc-400 hover:text-red-500 transition-colors cursor-pointer"
                    title="Sign Out"
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              </>
            ) : (
              <button 
                onClick={signIn}
                className="bg-emerald-600 text-white px-6 py-2 rounded-full font-medium hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </nav>

      <DepositModal isOpen={isDepositOpen} onClose={() => setIsDepositOpen(false)} />
      <WithdrawModal isOpen={isWithdrawOpen} onClose={() => setIsWithdrawOpen(false)} />
      <ProfileSettingsSidebar isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <NotificationsModal isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />
    </>
  );
}

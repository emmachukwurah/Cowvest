import React from "react";
import { motion } from "motion/react";
import { TrendingUp, Wallet, Sprout, Clock } from "lucide-react";
import { useAuth } from "../lib/AuthContext";
import { formatCurrency } from "../lib/utils";

export function DashboardHero() {
  const { profile } = useAuth();
  
  if (!profile) return null;

  const stats = [
    { label: "Total Invested", value: formatCurrency(profile.totalInvested), icon: Wallet, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Total Profit", value: formatCurrency(profile.totalProfit), icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Active Crops", value: "3", icon: Sprout, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Next Payout", value: "45 Days", icon: Clock, color: "text-indigo-600", bg: "bg-indigo-50" },
  ];

  return (
    <div className="pt-24 pb-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-zinc-900">Welcome back, {profile.displayName}</h1>
        <p className="text-zinc-500">Track and manage your agricultural investments.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm"
          >
            <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
              <stat.icon size={24} />
            </div>
            <p className="text-sm font-medium text-zinc-500 mb-1">{stat.label}</p>
            <p className="text-2xl font-bold text-zinc-900">{stat.value}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

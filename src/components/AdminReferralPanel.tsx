import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  Users, 
  UserCheck, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Settings, 
  DollarSign, 
  TrendingUp, 
  ShieldAlert, 
  Save, 
  Sparkles,
  Search,
  Filter,
  BarChart3,
  Award,
  AlertCircle
} from "lucide-react";
import { formatCurrency } from "../lib/utils";
import { 
  getAllReferrals, 
  getReferralSettings, 
  updateReferralSettings, 
  approveAndPayReferral, 
  listenReferralSettings 
} from "../lib/referralService";
import { Referral, ReferralSettings } from "../types";

export function AdminReferralPanel() {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
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

  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const refs = await getAllReferrals();
      setReferrals(refs);
      const s = await getReferralSettings();
      setSettings(s);
    } catch (err) {
      console.error("Error fetching admin referral data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
    const unsub = listenReferralSettings((updated) => {
      setSettings(updated);
    });
    return () => unsub();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsSuccess(false);
    try {
      await updateReferralSettings(settings);
      setSettingsSuccess(true);
      setTimeout(() => setSettingsSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to update referral settings:", err);
      alert("Error saving settings.");
    } finally {
      setSavingSettings(false);
    }
  };

  const handleApproveAndPay = async (refId: string) => {
    setActionLoadingId(refId);
    try {
      const success = await approveAndPayReferral(refId);
      if (success) {
        alert("Referral reward approved and credited to referrer wallet!");
        fetchAllData();
      } else {
        alert("Failed to approve referral or reward already processed.");
      }
    } catch (err) {
      console.error("Error approving referral:", err);
      alert("An error occurred while approving referral.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Program Analytics Calculations
  const totalReferrals = referrals.length;
  const totalFunded = referrals.filter(r => r.investmentStatus === "Invested").length;
  const conversionRate = totalReferrals > 0 ? ((totalFunded / totalReferrals) * 100).toFixed(1) : "0.0";

  const totalRewardsPending = referrals
    .filter(r => r.rewardStatus === "Pending")
    .reduce((sum, r) => sum + r.rewardAmount, 0);

  const totalRewardsPaid = referrals
    .filter(r => r.rewardStatus === "Paid")
    .reduce((sum, r) => sum + r.rewardAmount, 0);

  // Cost Per Funded Customer (CPFC) metric requested by business requirements
  const cpfc = totalFunded > 0 ? (totalRewardsPaid / totalFunded) : 0;

  const filteredReferrals = referrals.filter(r => {
    const matchesSearch = 
      r.referrerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.referredName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.referredEmail.toLowerCase().includes(searchTerm.toLowerCase());

    if (statusFilter === "all") return matchesSearch;
    return matchesSearch && r.rewardStatus.toLowerCase() === statusFilter.toLowerCase();
  });

  return (
    <div className="space-y-8 py-6">
      {/* Title Header */}
      <div className="bg-gradient-to-r from-zinc-950 via-emerald-950 to-zinc-900 rounded-3xl p-6 sm:p-8 text-white border border-emerald-500/30 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-emerald-500/20 border border-emerald-500/40 rounded-full text-xs font-bold text-emerald-300 uppercase tracking-widest">
            <Settings size={14} className="text-emerald-400" />
            <span>Admin Management</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            CowVest Refer & Earn Administration
          </h2>
          <p className="text-zinc-300 text-sm max-w-2xl">
            Manage referral records, approve pending rewards, monitor anti-fraud triggers, and customize reward tiers and caps.
          </p>
        </div>
      </div>

      {/* Analytics Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Total Referrals */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-xs font-black uppercase tracking-wider">Total Signups</span>
            <Users size={16} className="text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-zinc-900">{totalReferrals}</div>
          <p className="text-[11px] text-zinc-500 font-medium mt-1">Referred users</p>
        </div>

        {/* Funded Investors */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-xs font-black uppercase tracking-wider">Funded Investors</span>
            <UserCheck size={16} className="text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600">{totalFunded}</div>
          <p className="text-[11px] text-emerald-700 font-bold mt-1">{conversionRate}% Conv. Rate</p>
        </div>

        {/* Pending Rewards */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-xs font-black uppercase tracking-wider">Pending Rewards</span>
            <Clock size={16} className="text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600">{formatCurrency(totalRewardsPending)}</div>
          <p className="text-[11px] text-amber-700 font-medium mt-1">Awaiting approval</p>
        </div>

        {/* Total Rewards Paid */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-xs font-black uppercase tracking-wider">Total Paid</span>
            <CheckCircle2 size={16} className="text-teal-600" />
          </div>
          <div className="text-2xl font-black text-teal-700">{formatCurrency(totalRewardsPaid)}</div>
          <p className="text-[11px] text-teal-800 font-medium mt-1">Credited to wallets</p>
        </div>

        {/* Cost Per Funded Customer (CPFC) Card */}
        <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-200 shadow-sm col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-emerald-800 mb-2">
            <span className="text-xs font-black uppercase tracking-wider">CPFC Metric</span>
            <BarChart3 size={16} className="text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-950">{formatCurrency(cpfc)}</div>
          <p className="text-[11px] text-emerald-700 font-bold mt-1">Cost Per Funded Customer</p>
        </div>
      </div>

      {/* Main Tabs / Sections Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Referral Table (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-zinc-200 p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-150">
            <div>
              <h3 className="text-lg font-black text-zinc-900">Referral Records</h3>
              <p className="text-xs text-zinc-500">Review, verify, and approve referral payouts.</p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search referrer/referred..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-semibold outline-none focus:border-emerald-500"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-700 outline-none"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="paid">Paid</option>
              </select>
            </div>
          </div>

          {filteredReferrals.length === 0 ? (
            <div className="py-12 text-center text-zinc-400 text-xs">
              No referral records found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-200 text-[10px] font-black uppercase tracking-wider text-zinc-400">
                    <th className="pb-3">Referrer</th>
                    <th className="pb-3">Referred User</th>
                    <th className="pb-3">KYC</th>
                    <th className="pb-3">Investment</th>
                    <th className="pb-3">Reward (₦)</th>
                    <th className="pb-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {filteredReferrals.map((r) => (
                    <tr key={r.id} className="hover:bg-zinc-50">
                      <td className="py-3 font-mono text-[11px] text-zinc-600 truncate max-w-[100px]">
                        {r.referrerId.substring(0, 8)}...
                      </td>
                      <td className="py-3 font-bold text-zinc-900">
                        {r.referredName}
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          r.kycStatus === "KYC Completed" ? "bg-emerald-100 text-emerald-800" : "bg-zinc-100 text-zinc-600"
                        }`}>
                          {r.kycStatus}
                        </span>
                      </td>
                      <td className="py-3">
                        {r.investmentStatus === "Invested" ? (
                          <span className="font-bold text-emerald-700">
                            ₦{(r.firstInvestmentAmount || 0).toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-zinc-400">None</span>
                        )}
                      </td>
                      <td className="py-3 font-black text-zinc-900 font-mono">
                        ₦{r.rewardAmount.toLocaleString()}
                      </td>
                      <td className="py-3 text-right">
                        {r.rewardStatus === "Pending" && r.investmentStatus === "Invested" ? (
                          <button
                            disabled={actionLoadingId === r.id}
                            onClick={() => handleApproveAndPay(r.id)}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] rounded-lg transition-colors shadow-sm cursor-pointer disabled:opacity-50"
                          >
                            {actionLoadingId === r.id ? "Processing..." : "Approve & Credit"}
                          </button>
                        ) : (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            r.rewardStatus === "Paid" ? "bg-teal-100 text-teal-800" : "bg-zinc-100 text-zinc-500"
                          }`}>
                            {r.rewardStatus}
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

        {/* Admin Settings Form (1 col) */}
        <div className="bg-white rounded-3xl border border-zinc-200 p-6 shadow-sm space-y-4">
          <div className="pb-3 border-b border-zinc-150">
            <h3 className="text-lg font-black text-zinc-900 flex items-center gap-2">
              <Settings size={18} className="text-emerald-600" /> Referral Settings
            </h3>
            <p className="text-xs text-zinc-500">Configure tier rates, caps, and limits.</p>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
            {settingsSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl font-bold flex items-center gap-2">
                <CheckCircle2 size={16} />
                <span>Settings updated successfully!</span>
              </div>
            )}

            {/* Bronze Rate */}
            <div className="space-y-1">
              <label className="font-bold text-zinc-700">Bronze Tier Rate (%)</label>
              <input
                type="number"
                step="0.05"
                value={settings.bronzeRate}
                onChange={(e) => setSettings({ ...settings, bronzeRate: Number(e.target.value) })}
                className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl font-semibold outline-none focus:border-emerald-500"
              />
            </div>

            {/* Silver Rate */}
            <div className="space-y-1">
              <label className="font-bold text-zinc-700">Silver Tier Rate (%)</label>
              <input
                type="number"
                step="0.05"
                value={settings.silverRate}
                onChange={(e) => setSettings({ ...settings, silverRate: Number(e.target.value) })}
                className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl font-semibold outline-none focus:border-emerald-500"
              />
            </div>

            {/* Gold Rate */}
            <div className="space-y-1">
              <label className="font-bold text-zinc-700">Gold Tier Rate (%)</label>
              <input
                type="number"
                step="0.05"
                value={settings.goldRate}
                onChange={(e) => setSettings({ ...settings, goldRate: Number(e.target.value) })}
                className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl font-semibold outline-none focus:border-emerald-500"
              />
            </div>

            {/* Max Referrer Reward Cap */}
            <div className="space-y-1">
              <label className="font-bold text-zinc-700">Max Referrer Reward Cap (₦)</label>
              <input
                type="number"
                value={settings.maxReferrerRewardCap}
                onChange={(e) => setSettings({ ...settings, maxReferrerRewardCap: Number(e.target.value) })}
                className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl font-semibold outline-none focus:border-emerald-500"
              />
            </div>

            {/* New Investor Bonus Rate */}
            <div className="space-y-1">
              <label className="font-bold text-zinc-700">New Investor Bonus Rate (%)</label>
              <input
                type="number"
                step="0.05"
                value={settings.newInvestorBonusRate}
                onChange={(e) => setSettings({ ...settings, newInvestorBonusRate: Number(e.target.value) })}
                className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl font-semibold outline-none focus:border-emerald-500"
              />
            </div>

            {/* Max New Investor Bonus Cap */}
            <div className="space-y-1">
              <label className="font-bold text-zinc-700">Max New Investor Bonus Cap (₦)</label>
              <input
                type="number"
                value={settings.maxNewInvestorBonusCap}
                onChange={(e) => setSettings({ ...settings, maxNewInvestorBonusCap: Number(e.target.value) })}
                className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl font-semibold outline-none focus:border-emerald-500"
              />
            </div>

            {/* Monthly Limit Per User */}
            <div className="space-y-1">
              <label className="font-bold text-zinc-700">Monthly Referral Limit Per User (₦)</label>
              <input
                type="number"
                value={settings.monthlyLimitPerUser}
                onChange={(e) => setSettings({ ...settings, monthlyLimitPerUser: Number(e.target.value) })}
                className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl font-semibold outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={savingSettings}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Save size={16} />
              <span>{savingSettings ? "Saving..." : "Save Settings"}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, User, Shield, Key, Fingerprint, CreditCard, CheckCircle2, 
  Camera, Landmark, ChevronRight, Lock, Eye, AlertCircle, Sparkles,
  HelpCircle, RefreshCw, Smartphone, Upload
} from "lucide-react";
import { useAuth } from "../lib/AuthContext";
import { doc, updateDoc } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";

interface ProfileSettingsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = "picture" | "bvn" | "2fa" | "kyc" | "fingerprint" | "bank";

const PRESET_AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=250",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=250",
];

const NIGERIAN_BANKS = [
  "Access Bank",
  "Guaranty Trust Bank (GTB)",
  "Zenith Bank",
  "United Bank for Africa (UBA)",
  "First Bank of Nigeria",
  "Kuda Bank",
  "Opay",
  "Wema Bank / ALAT",
  "Stanbic IBTC",
  "Fidelity Bank"
];

export function ProfileSettingsSidebar({ isOpen, onClose }: ProfileSettingsSidebarProps) {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("picture");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form states
  const [customAvatarUrl, setCustomAvatarUrl] = useState("");
  const [bvnInput, setBvnInput] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [kycFullName, setKycFullName] = useState("");
  const [kycIdType, setKycIdType] = useState("National ID");
  const [kycIdNumber, setKycIdNumber] = useState("");
  const [kycAddress, setKycAddress] = useState("");
  const [scanningFingerprint, setScanningFingerprint] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [bankName, setBankName] = useState(NIGERIAN_BANKS[0]);
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [bankAccountName, setBankAccountName] = useState("");
  const [resolvingBank, setResolvingBank] = useState(false);

  // Sync inputs with profile data when opened
  useEffect(() => {
    if (profile) {
      setCustomAvatarUrl(profile.avatarUrl || "");
      setBvnInput(profile.bvn || "");
      setKycFullName(profile.kycDetails?.fullName || profile.displayName || "");
      setKycIdType(profile.kycDetails?.idType || "National ID");
      setKycIdNumber(profile.kycDetails?.idNumber || "");
      setKycAddress(profile.kycDetails?.address || "");
      setBankName(profile.bankAccount?.bankName || NIGERIAN_BANKS[0]);
      setBankAccountNumber(profile.bankAccount?.accountNumber || "");
      setBankAccountName(profile.bankAccount?.accountName || "");
    }
  }, [profile, isOpen]);

  // Handle messages auto-clearing
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  if (!profile) return null;

  const updateProfileField = async (fields: Partial<typeof profile>) => {
    setSaving(true);
    setMessage(null);
    try {
      const userRef = doc(db, "users", profile.uid);
      await updateDoc(userRef, fields);
      setMessage({ type: "success", text: "Settings updated successfully and saved to cloud." });
    } catch (err: any) {
      setMessage({ type: "error", text: "Failed to save to cloud database: " + err.message });
      handleFirestoreError(err, OperationType.UPDATE, `users/${profile.uid}`);
    } finally {
      setSaving(false);
    }
  };

  // 1. Add profile picture
  const handleSelectPresetAvatar = (url: string) => {
    updateProfileField({ avatarUrl: url });
  };

  const handleCustomAvatarSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customAvatarUrl.trim()) return;
    updateProfileField({ avatarUrl: customAvatarUrl.trim() });
  };

  const handleDeviceImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage({ type: "error", text: "Please select a valid image file." });
      return;
    }

    setSaving(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Resize to max 300x300 for optimal performance and Firestore limit compliance
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 300;
        const MAX_HEIGHT = 300;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const resizedDataUrl = canvas.toDataURL("image/jpeg", 0.85);
          updateProfileField({ avatarUrl: resizedDataUrl });
        } else {
          updateProfileField({ avatarUrl: event.target?.result as string });
        }
      };
      img.onerror = () => {
        setMessage({ type: "error", text: "Failed to read image file." });
        setSaving(false);
      };
      img.src = event.target?.result as string;
    };
    reader.onerror = () => {
      setMessage({ type: "error", text: "Failed to read file from device." });
      setSaving(false);
    };
    reader.readAsDataURL(file);
  };

  // 2. Add BVN
  const handleBvnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (bvnInput.length !== 11 || !/^\d+$/.test(bvnInput)) {
      setMessage({ type: "error", text: "Please enter a valid 11-digit numerical BVN." });
      return;
    }
    updateProfileField({ bvn: bvnInput });
  };

  // 3. Two-Factor Authentication
  const handleToggle2FA = () => {
    if (profile.twoFactorEnabled) {
      updateProfileField({ twoFactorEnabled: false });
    } else {
      // Need OTP confirmation to enable
      if (otpInput === "123456" || otpInput.length === 6) {
        updateProfileField({ twoFactorEnabled: true });
        setOtpInput("");
      } else {
        setMessage({ type: "error", text: "Please enter a valid 6-digit verification code. (Try 123456)" });
      }
    }
  };

  // 4. KYC Form Submission
  const handleKycSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!kycFullName.trim() || !kycIdNumber.trim() || !kycAddress.trim()) {
      setMessage({ type: "error", text: "All KYC fields are required for compliance verification." });
      return;
    }
    updateProfileField({
      kycVerified: true,
      kycDetails: {
        fullName: kycFullName.trim(),
        idType: kycIdType,
        idNumber: kycIdNumber.trim(),
        address: kycAddress.trim()
      }
    });
  };

  // 5. Fingerprint scanning simulation
  const startFingerprintScanning = () => {
    if (profile.fingerprintEnabled) {
      updateProfileField({ fingerprintEnabled: false });
      return;
    }
    setScanningFingerprint(true);
    setScanProgress(0);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (scanningFingerprint) {
      interval = setInterval(() => {
        setScanProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setScanningFingerprint(false);
            updateProfileField({ fingerprintEnabled: true });
            return 100;
          }
          return prev + 10;
        });
      }, 200);
    }
    return () => clearInterval(interval);
  }, [scanningFingerprint]);

  // 6. Link Bank Account
  const handleResolveBank = () => {
    if (bankAccountNumber.length < 10) {
      setMessage({ type: "error", text: "Account number must be at least 10 digits." });
      return;
    }
    setResolvingBank(true);
    setTimeout(() => {
      setBankAccountName("EMMANUEL CHUKWURAH");
      setResolvingBank(false);
    }, 1200);
  };

  const handleLinkBankSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankAccountNumber || !bankAccountName) {
      setMessage({ type: "error", text: "Please input account details and verify bank account first." });
      return;
    }
    updateProfileField({
      bankAccount: {
        bankName,
        accountNumber: bankAccountNumber,
        accountName: bankAccountName
      }
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-zinc-950/40 backdrop-blur-xs"
          />

          {/* Sidebar Drawer */}
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="w-screen max-w-full sm:max-w-2xl bg-white shadow-2xl flex flex-col"
            >
              {/* Header */}
              <div className="px-6 py-5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-700">
                    <Shield size={18} />
                  </div>
                  <div>
                    <h2 className="text-lg font-extrabold text-zinc-900 tracking-tight">Security & Verification</h2>
                    <p className="text-xs text-zinc-500 font-medium">Configure profile credentials and regulatory assets</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 text-zinc-400 hover:text-zinc-950 hover:bg-zinc-100 rounded-full transition-all outline-none"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Toast Message inside Sidebar */}
              {message && (
                <div className={`px-6 py-3 border-b text-xs font-bold flex items-center gap-2 ${
                  message.type === "success" 
                    ? "bg-emerald-50 text-emerald-800 border-emerald-100" 
                    : "bg-red-50 text-red-800 border-red-100"
                }`}>
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{message.text}</span>
                </div>
              )}

              {/* Sidebar Content Layout: Menu Sidebar + Active Panel */}
              <div className="flex-1 flex flex-col sm:flex-row min-h-0 divide-y sm:divide-y-0 sm:divide-x divide-zinc-100">
                {/* Left Navigation Track / Top Horizontal Track on Mobile */}
                <div className="w-full sm:w-56 bg-zinc-50/30 overflow-x-auto sm:overflow-y-auto p-3 flex sm:flex-col gap-1 shrink-0 no-scrollbar">
                  <div className="hidden sm:block px-2 py-1 text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                    Pillars of Profile
                  </div>

                  {/* Profile Picture Tab */}
                  <button
                    onClick={() => setActiveTab("picture")}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left text-xs font-bold transition-all border ${
                      activeTab === "picture"
                        ? "bg-white border-zinc-200 text-emerald-700 shadow-xs"
                        : "bg-transparent border-transparent text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg shrink-0 ${activeTab === "picture" ? "bg-emerald-50 text-emerald-600" : "bg-zinc-100 text-zinc-500"}`}>
                      {profile.avatarUrl ? (
                        <img src={profile.avatarUrl} alt="Avatar" className="w-4 h-4 rounded-full object-cover" />
                      ) : (
                        <User size={14} />
                      )}
                    </div>
                    <span className="truncate">Profile Picture</span>
                  </button>

                  {/* KYC Form Tab */}
                  <button
                    onClick={() => setActiveTab("kyc")}
                    className={`w-full flex items-center justify-between p-3 rounded-xl text-left text-xs font-bold transition-all border ${
                      activeTab === "kyc"
                        ? "bg-white border-zinc-200 text-emerald-700 shadow-xs"
                        : "bg-transparent border-transparent text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                    }`}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <div className={`p-1.5 rounded-lg shrink-0 ${activeTab === "kyc" ? "bg-emerald-50 text-emerald-600" : "bg-zinc-100 text-zinc-500"}`}>
                        <User size={14} />
                      </div>
                      <span className="truncate">KYC Form</span>
                    </div>
                    {profile.kycVerified && <CheckCircle2 size={12} className="text-emerald-600 shrink-0" />}
                  </button>

                  {/* BVN Tab */}
                  <button
                    onClick={() => setActiveTab("bvn")}
                    className={`w-full flex items-center justify-between p-3 rounded-xl text-left text-xs font-bold transition-all border ${
                      activeTab === "bvn"
                        ? "bg-white border-zinc-200 text-emerald-700 shadow-xs"
                        : "bg-transparent border-transparent text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                    }`}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <div className={`p-1.5 rounded-lg shrink-0 ${activeTab === "bvn" ? "bg-emerald-50 text-emerald-600" : "bg-zinc-100 text-zinc-500"}`}>
                        <Shield size={14} />
                      </div>
                      <span className="truncate">Add BVN</span>
                    </div>
                    {profile.bvn && <CheckCircle2 size={12} className="text-emerald-600 shrink-0" />}
                  </button>

                  {/* 2FA Tab */}
                  <button
                    onClick={() => setActiveTab("2fa")}
                    className={`w-full flex items-center justify-between p-3 rounded-xl text-left text-xs font-bold transition-all border ${
                      activeTab === "2fa"
                        ? "bg-white border-zinc-200 text-emerald-700 shadow-xs"
                        : "bg-transparent border-transparent text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                    }`}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <div className={`p-1.5 rounded-lg shrink-0 ${activeTab === "2fa" ? "bg-emerald-50 text-emerald-600" : "bg-zinc-100 text-zinc-500"}`}>
                        <Key size={14} />
                      </div>
                      <span className="truncate">Two-Factor (2FA)</span>
                    </div>
                    {profile.twoFactorEnabled && <CheckCircle2 size={12} className="text-emerald-600 shrink-0" />}
                  </button>

                  {/* Fingerprint Tab */}
                  <button
                    onClick={() => setActiveTab("fingerprint")}
                    className={`w-full flex items-center justify-between p-3 rounded-xl text-left text-xs font-bold transition-all border ${
                      activeTab === "fingerprint"
                        ? "bg-white border-zinc-200 text-emerald-700 shadow-xs"
                        : "bg-transparent border-transparent text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                    }`}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <div className={`p-1.5 rounded-lg shrink-0 ${activeTab === "fingerprint" ? "bg-emerald-50 text-emerald-600" : "bg-zinc-100 text-zinc-500"}`}>
                        <Fingerprint size={14} />
                      </div>
                      <span className="truncate">Biometric Fingerprint</span>
                    </div>
                    {profile.fingerprintEnabled && <CheckCircle2 size={12} className="text-emerald-600 shrink-0" />}
                  </button>

                  {/* Link Bank Account Tab */}
                  <button
                    onClick={() => setActiveTab("bank")}
                    className={`w-full flex items-center justify-between p-3 rounded-xl text-left text-xs font-bold transition-all border ${
                      activeTab === "bank"
                        ? "bg-white border-zinc-200 text-emerald-700 shadow-xs"
                        : "bg-transparent border-transparent text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                    }`}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <div className={`p-1.5 rounded-lg shrink-0 ${activeTab === "bank" ? "bg-emerald-50 text-emerald-600" : "bg-zinc-100 text-zinc-500"}`}>
                        <CreditCard size={14} />
                      </div>
                      <span className="truncate">Link Bank Account</span>
                    </div>
                    {profile.bankAccount && <CheckCircle2 size={12} className="text-emerald-600 shrink-0" />}
                  </button>
                </div>

                {/* Right Interactive Detail Pane */}
                <div className="flex-1 overflow-y-auto p-6 bg-white">
                  <AnimatePresence mode="wait">
                    
                    {/* PROFILE PICTURE FORM PANEL */}
                    {activeTab === "picture" && (
                      <motion.div
                        key="picture"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                      >
                        <div className="border-b border-zinc-100 pb-4">
                          <h3 className="text-base font-black text-zinc-900">Add a Profile Picture</h3>
                          <p className="text-xs text-zinc-500">Upload an image from your device, choose a curated avatar, or provide an external image link.</p>
                        </div>

                        {/* Current Picture Preview */}
                        <div className="flex items-center gap-4 bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                          <div className="relative">
                            <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center overflow-hidden">
                              {profile.avatarUrl ? (
                                <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                              ) : (
                                <User size={28} className="text-emerald-600" />
                              )}
                            </div>
                            <div className="absolute -bottom-1 -right-1 bg-emerald-600 text-white p-1 rounded-full border-2 border-white shadow-sm">
                              <Camera size={10} />
                            </div>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-zinc-800">{profile.displayName}</p>
                            <p className="text-[10px] font-mono text-zinc-400">{profile.email}</p>
                            <span className="mt-1.5 inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[9px] font-black uppercase px-2 py-0.5 rounded-md border border-emerald-100">
                              Verified Account
                            </span>
                          </div>
                        </div>

                        {/* Device Upload Section */}
                        <div className="space-y-2">
                          <label className="text-xs font-black text-zinc-700 uppercase tracking-wide">Upload from your Device</label>
                          <div className="relative border-2 border-dashed border-zinc-200 hover:border-emerald-500 rounded-2xl p-6 bg-zinc-50/50 hover:bg-emerald-50/5 transition-all flex flex-col items-center justify-center text-center group cursor-pointer">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleDeviceImageUpload}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                              title="Upload photo from PC, Android, or iOS"
                            />
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-zinc-400 group-hover:text-emerald-600 group-hover:scale-110 transition-all shadow-xs border border-zinc-150 mb-3">
                              <Upload size={18} />
                            </div>
                            <p className="text-xs font-bold text-zinc-700">
                              {saving ? "Uploading and saving to cloud..." : "Choose a photo"}
                            </p>
                            <p className="text-[10px] text-zinc-400 font-semibold mt-1">Supports PNG, JPG, or HEIC from PC, Android, or iOS</p>
                          </div>
                        </div>

                        {/* Preset selection */}
                        <div className="space-y-2">
                          <label className="text-xs font-black text-zinc-700 uppercase tracking-wide">Select from Curated Avatars</label>
                          <div className="grid grid-cols-6 gap-2">
                            {PRESET_AVATARS.map((url, i) => (
                              <button
                                key={i}
                                onClick={() => handleSelectPresetAvatar(url)}
                                className={`aspect-square rounded-xl overflow-hidden border-2 transition-all relative outline-none hover:scale-105 active:scale-95 ${
                                  profile.avatarUrl === url ? "border-emerald-500 scale-105 shadow-md" : "border-zinc-200"
                                }`}
                              >
                                <img src={url} alt={`Preset ${i}`} className="w-full h-full object-cover" />
                                {profile.avatarUrl === url && (
                                  <div className="absolute inset-0 bg-emerald-900/10 flex items-center justify-center">
                                    <CheckCircle2 size={16} className="text-emerald-600 fill-white" />
                                  </div>
                                )}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Custom Image URL Submit */}
                        <form onSubmit={handleCustomAvatarSubmit} className="space-y-3.5 pt-4 border-t border-zinc-100">
                          <div className="space-y-1.5">
                            <label className="text-xs font-black text-zinc-700 uppercase tracking-wide">Or Input Image Web URL</label>
                            <div className="flex gap-2">
                              <input
                                type="url"
                                placeholder="https://example.com/your-picture.jpg"
                                value={customAvatarUrl}
                                onChange={(e) => setCustomAvatarUrl(e.target.value)}
                                className="flex-1 bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs font-medium focus:bg-white focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                              />
                              <button
                                type="submit"
                                disabled={saving || !customAvatarUrl.trim()}
                                className="bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all disabled:opacity-50"
                              >
                                {saving ? "Saving..." : "Apply URL"}
                              </button>
                            </div>
                          </div>
                        </form>
                      </motion.div>
                    )}

                    {/* KYC DETAILS COMPLIANCE FORM */}
                    {activeTab === "kyc" && (
                      <motion.div
                        key="kyc"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                      >
                        <div className="border-b border-zinc-100 pb-4 flex justify-between items-start">
                          <div>
                            <h3 className="text-base font-black text-zinc-900">KYC Compliance Form</h3>
                            <p className="text-xs text-zinc-500">Ensure regulatory standards are met to enable full withdrawal access.</p>
                          </div>
                          {profile.kycVerified && (
                            <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-black uppercase px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xs">
                              <CheckCircle2 size={12} /> Verified
                            </span>
                          )}
                        </div>

                        <form onSubmit={handleKycSubmit} className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5 col-span-2">
                              <label className="text-xs font-black text-zinc-700 uppercase tracking-wide">Full Legal Name</label>
                              <input
                                type="text"
                                placeholder="As written on your official ID"
                                value={kycFullName}
                                onChange={(e) => setKycFullName(e.target.value)}
                                required
                                disabled={profile.kycVerified && !saving}
                                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs font-medium focus:bg-white focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none disabled:opacity-75"
                              />
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-xs font-black text-zinc-700 uppercase tracking-wide">ID Document Type</label>
                              <select
                                value={kycIdType}
                                onChange={(e) => setKycIdType(e.target.value)}
                                disabled={profile.kycVerified && !saving}
                                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs font-bold focus:bg-white focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none disabled:opacity-75"
                              >
                                <option value="National ID">National ID Card (NIN)</option>
                                <option value="International Passport">International Passport</option>
                                <option value="Drivers License">Driver's License</option>
                                <option value="Voters Card">Voter's Card</option>
                              </select>
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-xs font-black text-zinc-700 uppercase tracking-wide">ID Document Number</label>
                              <input
                                type="text"
                                placeholder="E.g. 59381749203"
                                value={kycIdNumber}
                                onChange={(e) => setKycIdNumber(e.target.value)}
                                required
                                disabled={profile.kycVerified && !saving}
                                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs font-medium focus:bg-white focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none disabled:opacity-75"
                              />
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-black text-zinc-700 uppercase tracking-wide">Residential Address</label>
                            <textarea
                              rows={3}
                              placeholder="House address, City, State"
                              value={kycAddress}
                              onChange={(e) => setKycAddress(e.target.value)}
                              required
                              disabled={profile.kycVerified && !saving}
                              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-4 text-xs font-medium focus:bg-white focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none disabled:opacity-75"
                            />
                          </div>

                          <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100 flex gap-3 text-zinc-500 text-[10px] leading-relaxed font-semibold">
                            <Lock size={16} className="text-zinc-400 shrink-0" />
                            <span>Documents are processed in accordance with Nigerian Data Protection Regulations (NDPR) and encrypted.</span>
                          </div>

                          {!profile.kycVerified && (
                            <button
                              type="submit"
                              disabled={saving}
                              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-3 rounded-xl transition-all shadow-md shadow-emerald-600/10 flex items-center justify-center gap-2"
                            >
                              {saving ? (
                                <RefreshCw size={14} className="animate-spin" />
                              ) : "Submit KYC Verification"}
                            </button>
                          )}
                        </form>
                      </motion.div>
                    )}

                    {/* BVN INPUT AND INTEGRITY VALIDATION */}
                    {activeTab === "bvn" && (
                      <motion.div
                        key="bvn"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                      >
                        <div className="border-b border-zinc-100 pb-4 flex justify-between items-start">
                          <div>
                            <h3 className="text-base font-black text-zinc-900">Bank Verification Number (BVN)</h3>
                            <p className="text-xs text-zinc-500">Securely verify your identity using the Central Bank database network.</p>
                          </div>
                          {profile.bvn && (
                            <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-black uppercase px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xs">
                              <CheckCircle2 size={12} /> Linked
                            </span>
                          )}
                        </div>

                        <form onSubmit={handleBvnSubmit} className="space-y-4">
                          <div className="space-y-1.5">
                            <label className="text-xs font-black text-zinc-700 uppercase tracking-wide">Your 11-Digit BVN</label>
                            <input
                              type="password"
                              maxLength={11}
                              placeholder="•••••••••••"
                              value={bvnInput}
                              onChange={(e) => setBvnInput(e.target.value.replace(/\D/g, ""))}
                              required
                              disabled={profile.bvn && !saving}
                              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm font-mono tracking-widest focus:bg-white focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none disabled:opacity-75"
                            />
                            <p className="text-[10px] text-zinc-400 font-semibold">We only check identity info; we do not have access to your bank balances.</p>
                          </div>

                          <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100 flex gap-3 text-emerald-800 text-[10px] leading-relaxed font-bold">
                            <Shield size={16} className="text-emerald-600 shrink-0" />
                            <span>Connecting your BVN establishes high-security investment compliance across Cowvest products.</span>
                          </div>

                          {!profile.bvn && (
                            <button
                              type="submit"
                              disabled={saving || bvnInput.length !== 11}
                              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-3 rounded-xl transition-all shadow-md shadow-emerald-600/10 flex items-center justify-center gap-2"
                            >
                              {saving ? <RefreshCw size={14} className="animate-spin" /> : "Verify & Link BVN"}
                            </button>
                          )}
                        </form>
                      </motion.div>
                    )}

                    {/* TWO-FACTOR AUTHENTICATION OTP & CODE SETUP */}
                    {activeTab === "2fa" && (
                      <motion.div
                        key="2fa"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                      >
                        <div className="border-b border-zinc-100 pb-4 flex justify-between items-start">
                          <div>
                            <h3 className="text-base font-black text-zinc-900">Two-Factor Authentication (2FA)</h3>
                            <p className="text-xs text-zinc-500">Require a secure secondary security key to approve payments & trades.</p>
                          </div>
                          {profile.twoFactorEnabled && (
                            <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-black uppercase px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xs">
                              <CheckCircle2 size={12} /> Active
                            </span>
                          )}
                        </div>

                        {profile.twoFactorEnabled ? (
                          <div className="space-y-4">
                            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex gap-3.5 text-emerald-800 text-xs">
                              <Shield size={20} className="shrink-0 text-emerald-600" />
                              <div className="space-y-1">
                                <h4 className="font-extrabold">2FA Protection is Active</h4>
                                <p className="text-[10.5px] text-emerald-700 leading-relaxed font-semibold">
                                  Your transactions are fully secured. If you wish to disable this secondary protection, click the deactivate button below.
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={handleToggle2FA}
                              disabled={saving}
                              className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs py-2.5 rounded-xl transition-all"
                            >
                              Deactivate 2FA Security
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-5">
                            {/* Setup guides & QR Mockup */}
                            <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100 flex items-center gap-5">
                              {/* QR code simulated */}
                              <div className="w-24 h-24 bg-white border-2 border-zinc-100 rounded-xl p-2.5 flex flex-col justify-between shrink-0 shadow-sm relative group overflow-hidden">
                                <div className="grid grid-cols-5 grid-rows-5 gap-1.5 w-full h-full opacity-90">
                                  {Array.from({ length: 25 }).map((_, i) => (
                                    <div 
                                      key={i} 
                                      className={`rounded-xs ${
                                        (i * 7 + 13) % 5 === 0 || (i > 3 && i < 8) || (i > 15 && i < 20) 
                                          ? "bg-zinc-900" 
                                          : (i === 0 || i === 4 || i === 20 || i === 24)
                                          ? "bg-emerald-600 animate-pulse"
                                          : "bg-transparent"
                                      }`} 
                                    />
                                  ))}
                                </div>
                                <div className="absolute inset-0 bg-emerald-950/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Smartphone size={16} className="text-emerald-700" />
                                </div>
                              </div>
                              <div className="space-y-1">
                                <h4 className="text-xs font-black text-zinc-800 uppercase tracking-wide">Step 1: Scan QR Code</h4>
                                <p className="text-[10.5px] text-zinc-500 leading-relaxed font-medium">
                                  Open Google Authenticator, Authy, or your secure system keychain app and point your camera here.
                                </p>
                                <p className="text-[9.5px] font-mono text-zinc-400 font-bold mt-1 bg-white border border-zinc-100 px-2 py-0.5 rounded inline-block">
                                  SETUP KEY: COWVEST-SECURE-91
                                </p>
                              </div>
                            </div>

                            {/* Verify and Activate */}
                            <div className="space-y-2">
                              <label className="text-xs font-black text-zinc-700 uppercase tracking-wide">Step 2: Enter Verification OTP</label>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  maxLength={6}
                                  placeholder="E.g. 123456"
                                  value={otpInput}
                                  onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ""))}
                                  className="flex-1 bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs font-mono font-bold tracking-widest text-center focus:bg-white focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                                />
                                <button
                                  onClick={handleToggle2FA}
                                  disabled={saving || otpInput.length !== 6}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-6 py-2.5 rounded-xl transition-all shadow-md shadow-emerald-600/10"
                                >
                                  Activate 2FA
                                </button>
                              </div>
                              <p className="text-[10px] text-zinc-400 text-center font-semibold">Enter any 6 digits to verify setup during preview testing.</p>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}

                    {/* BIOMETRIC FINGERPRINT LOG IN ENABLER */}
                    {activeTab === "fingerprint" && (
                      <motion.div
                        key="fingerprint"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                      >
                        <div className="border-b border-zinc-100 pb-4 flex justify-between items-start">
                          <div>
                            <h3 className="text-base font-black text-zinc-900">Biometric Fingerprint Login</h3>
                            <p className="text-xs text-zinc-500">Sign transactions and log in safely using your physical device fingerprint scanner.</p>
                          </div>
                          {profile.fingerprintEnabled && (
                            <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-black uppercase px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xs">
                              <CheckCircle2 size={12} /> Enabled
                            </span>
                          )}
                        </div>

                        <div className="flex flex-col items-center justify-center p-8 bg-zinc-50 rounded-2xl border border-zinc-100 space-y-6">
                          
                          {/* Biometric Scan Target Ring */}
                          <button
                            type="button"
                            onClick={startFingerprintScanning}
                            disabled={saving || scanningFingerprint}
                            className={`w-28 h-28 rounded-full border-2 flex items-center justify-center transition-all relative ${
                              scanningFingerprint 
                                ? "border-emerald-500 animate-pulse bg-emerald-50/20" 
                                : profile.fingerprintEnabled
                                ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                                : "border-zinc-300 hover:border-zinc-400 bg-white hover:scale-105 active:scale-95 cursor-pointer"
                            }`}
                          >
                            <Fingerprint size={48} className={scanningFingerprint ? "text-emerald-600" : ""} />
                            
                            {/* Radial scanning sweep progress */}
                            {scanningFingerprint && (
                              <svg className="absolute inset-0 w-full h-full -rotate-90">
                                <circle 
                                  cx="56" 
                                  cy="56" 
                                  r="53" 
                                  stroke="#10b981" 
                                  strokeWidth="3" 
                                  fill="transparent" 
                                  strokeDasharray={`${2 * Math.PI * 53}`}
                                  strokeDashoffset={`${2 * Math.PI * 53 * (1 - scanProgress / 100)}`}
                                  className="transition-all duration-200"
                                />
                              </svg>
                            )}
                          </button>

                          <div className="text-center max-w-xs space-y-1">
                            <h4 className="text-xs font-black text-zinc-800 uppercase tracking-wider">
                              {scanningFingerprint 
                                ? `Scanned: ${scanProgress}%` 
                                : profile.fingerprintEnabled 
                                ? "Fingerprint Registered" 
                                : "Tap Fingerprint to Register"}
                            </h4>
                            <p className="text-[10.5px] text-zinc-500 leading-relaxed font-semibold">
                              {scanningFingerprint 
                                ? "Keep pressing on the reader..." 
                                : profile.fingerprintEnabled 
                                ? "You can now use your biometric hardware credentials to instantly sign investment cycles."
                                : "Touch the sensor graphic above to simulate registering a secure hardware key."}
                            </p>
                          </div>
                        </div>

                        {profile.fingerprintEnabled && (
                          <button
                            onClick={() => updateProfileField({ fingerprintEnabled: false })}
                            disabled={saving}
                            className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs py-2.5 rounded-xl transition-all"
                          >
                            Deregister Fingerprint Key
                          </button>
                        )}
                      </motion.div>
                    )}

                    {/* LINK BANK ACCOUNT SECTION */}
                    {activeTab === "bank" && (
                      <motion.div
                        key="bank"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                      >
                        <div className="border-b border-zinc-100 pb-4 flex justify-between items-start">
                          <div>
                            <h3 className="text-base font-black text-zinc-900">Link Bank Account</h3>
                            <p className="text-xs text-zinc-500">Provide bank details to securely receive matured payouts and cycle yields.</p>
                          </div>
                          {profile.bankAccount && (
                            <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-black uppercase px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xs">
                              <CheckCircle2 size={12} /> Linked
                            </span>
                          )}
                        </div>

                        <form onSubmit={handleLinkBankSubmit} className="space-y-4">
                          <div className="space-y-1.5">
                            <label className="text-xs font-black text-zinc-700 uppercase tracking-wide">Select Financial Institution</label>
                            <select
                              value={bankName}
                              onChange={(e) => setBankName(e.target.value)}
                              disabled={profile.bankAccount && !saving}
                              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs font-bold focus:bg-white focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none disabled:opacity-75"
                            >
                              {NIGERIAN_BANKS.map((b) => (
                                <option key={b} value={b}>{b}</option>
                              ))}
                            </select>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-black text-zinc-700 uppercase tracking-wide">Account Number</label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                maxLength={10}
                                placeholder="E.g. 0123456789"
                                value={bankAccountNumber}
                                onChange={(e) => setBankAccountNumber(e.target.value.replace(/\D/g, ""))}
                                required
                                disabled={profile.bankAccount && !saving}
                                className="flex-1 bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs font-medium focus:bg-white focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none disabled:opacity-75"
                              />
                              {!profile.bankAccount && (
                                <button
                                  type="button"
                                  onClick={handleResolveBank}
                                  disabled={resolvingBank || bankAccountNumber.length < 10}
                                  className="bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all disabled:opacity-50 flex items-center gap-1"
                                >
                                  {resolvingBank ? <RefreshCw size={12} className="animate-spin" /> : "Verify Account"}
                                </button>
                              )}
                            </div>
                          </div>

                          {bankAccountName && (
                            <div className="space-y-1.5 bg-zinc-50 p-3.5 rounded-xl border border-zinc-100">
                              <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Resolved Account Holder</span>
                              <p className="text-xs font-black text-zinc-900 flex items-center gap-1">
                                <Landmark size={14} className="text-emerald-600" />
                                {bankAccountName}
                              </p>
                            </div>
                          )}

                          {!profile.bankAccount && (
                            <button
                              type="submit"
                              disabled={saving || !bankAccountName}
                              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-3 rounded-xl transition-all shadow-md shadow-emerald-600/10 flex items-center justify-center gap-2"
                            >
                              {saving ? <RefreshCw size={14} className="animate-spin" /> : "Link Secure Bank Account"}
                            </button>
                          )}

                          {profile.bankAccount && (
                            <button
                              onClick={() => updateProfileField({ bankAccount: undefined })}
                              disabled={saving}
                              type="button"
                              className="w-full bg-zinc-950 hover:bg-zinc-900 text-white font-bold text-xs py-2.5 rounded-xl transition-all"
                            >
                              Unlink Bank Account
                            </button>
                          )}
                        </form>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}

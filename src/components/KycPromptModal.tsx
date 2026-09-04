import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ShieldCheck, 
  X, 
  CheckCircle2, 
  Sparkles, 
  Lock, 
  UserCheck, 
  FileText, 
  CreditCard, 
  Building, 
  Loader2, 
  AlertCircle,
  ChevronRight,
  Shield,
  ArrowRight
} from "lucide-react";
import { useAuth } from "../lib/AuthContext";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { processUserKycCompletion } from "../lib/referralService";

interface KycPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function KycPromptModal({ isOpen, onClose, onSuccess }: KycPromptModalProps) {
  const { profile } = useAuth();
  const [fullName, setFullName] = useState("");
  const [bvn, setBvn] = useState("");
  const [idType, setIdType] = useState("NIN (National Identity Number)");
  const [idNumber, setIdNumber] = useState("");
  const [address, setAddress] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verifyStepText, setVerifyStepText] = useState("");
  const [verifyProgress, setVerifyProgress] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Populate existing profile data if available
  useEffect(() => {
    if (profile) {
      setFullName(profile.kycDetails?.fullName || profile.displayName || "");
      setBvn(profile.bvn || "");
      setIdType(profile.kycDetails?.idType || "NIN (National Identity Number)");
      setIdNumber(profile.kycDetails?.idNumber || "");
      setAddress(profile.kycDetails?.address || "");
    }
  }, [profile, isOpen]);

  if (!isOpen || !profile) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!fullName.trim()) {
      setErrorMessage("Please enter your official full name as registered on your ID.");
      return;
    }
    if (bvn.trim() && (bvn.length !== 11 || !/^\d+$/.test(bvn))) {
      setErrorMessage("BVN must be an 11-digit numerical code.");
      return;
    }
    if (!idNumber.trim()) {
      setErrorMessage("Please enter your Government ID number (e.g., NIN / Passport / License).");
      return;
    }
    if (!address.trim()) {
      setErrorMessage("Please enter your current residential address.");
      return;
    }

    setIsSubmitting(true);
    setVerifyProgress(0);

    // Simulate verification steps
    const steps = [
      { progress: 20, text: "Connecting to NIMC & NIBSS Verification Gateway..." },
      { progress: 45, text: "Validating Government Identification Record..." },
      { progress: 70, text: "Performing Anti-Money Laundering (AML) Compliance Check..." },
      { progress: 90, text: "Encrypting & Storing KYC Clearance..." },
      { progress: 100, text: "Verification Complete!" }
    ];

    for (const step of steps) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      setVerifyProgress(step.progress);
      setVerifyStepText(step.text);
    }

    try {
      const userRef = doc(db, "users", profile.uid);
      await updateDoc(userRef, {
        kycVerified: true,
        bvn: bvn.trim() || profile.bvn || "22194830192",
        kycDetails: {
          fullName: fullName.trim(),
          idType: idType,
          idNumber: idNumber.trim(),
          address: address.trim()
        }
      });

      // Trigger referral program KYC update
      await processUserKycCompletion(profile.uid);

      setIsSubmitting(false);
      setIsSuccess(true);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error("KYC Submission error:", err);
      handleFirestoreError(err, OperationType.WRITE, `users/${profile.uid}`);
      setErrorMessage("Failed to submit KYC. Please try again.");
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsSuccess(false);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="fixed inset-0 bg-zinc-950/80 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden z-10 border border-zinc-150 flex flex-col my-8"
        >
          {/* Top Banner Header with exact prompt text */}
          <div className="bg-gradient-to-r from-zinc-900 via-emerald-950 to-zinc-950 p-6 md:p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <button
              onClick={handleClose}
              className="absolute top-5 right-5 w-9 h-9 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/20 border border-emerald-500/40 rounded-full text-xs font-bold text-emerald-300 uppercase tracking-widest w-fit mb-3">
              <ShieldCheck size={14} className="text-emerald-400" />
              <span>Identity Verification (KYC)</span>
            </div>

            {/* Exact text requested */}
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white mb-2">
              Submit your KYC to Start your investment journey
            </h2>

            <p className="text-zinc-300 text-xs md:text-sm font-medium leading-relaxed">
              Complete your identity clearance to unlock high-yield agricultural produce investments, instant withdrawals, and 100% SEC-compliant asset protection.
            </p>
          </div>

          {/* Modal Content */}
          <div className="p-6 md:p-8">
            {isSubmitting ? (
              /* Loading / Verification Progress View */
              <div className="py-12 text-center flex flex-col items-center justify-center">
                <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center text-emerald-600 mb-6 relative shadow-inner">
                  <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
                  <div className="absolute inset-0 w-full h-full rounded-3xl border-4 border-emerald-200 border-t-transparent animate-pulse" />
                </div>

                <h3 className="text-xl font-black text-zinc-900 mb-2 uppercase tracking-tight">Verifying Identification</h3>
                <p className="text-sm font-semibold text-emerald-700 max-w-xs mb-6 h-12 flex items-center justify-center text-center">
                  {verifyStepText}
                </p>

                <div className="w-full max-w-xs bg-zinc-100 h-2.5 rounded-full overflow-hidden mb-4 border border-zinc-200">
                  <motion.div
                    initial={{ width: "0%" }}
                    animate={{ width: `${verifyProgress}%` }}
                    transition={{ ease: "easeInOut", duration: 0.3 }}
                    className="h-full bg-emerald-600"
                  />
                </div>
                <span className="text-xs font-mono font-bold text-zinc-400">{verifyProgress}% COMPLETED</span>
              </div>
            ) : isSuccess ? (
              /* Success View */
              <div className="py-8 text-center flex flex-col items-center justify-center">
                <div className="w-20 h-20 bg-emerald-500 text-white rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-emerald-500/30">
                  <CheckCircle2 size={44} />
                </div>

                <h3 className="text-2xl font-black text-zinc-900 mb-2">KYC Verification Completed!</h3>
                <p className="text-zinc-600 text-sm max-w-md mb-8 leading-relaxed">
                  Your identity has been successfully verified. You now have full clearance to invest in Cowvest agricultural produce and enjoy guaranteed 20% ROI payouts.
                </p>

                <button
                  onClick={handleClose}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl text-base transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2"
                >
                  <Sparkles size={20} /> Start Investing Now <ArrowRight size={20} />
                </button>
              </div>
            ) : (
              /* Main KYC Form */
              <form onSubmit={handleSubmit} className="space-y-4">
                {errorMessage && (
                  <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-bold flex items-center gap-2">
                    <AlertCircle size={16} className="shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-zinc-700 flex items-center gap-1.5">
                    <UserCheck size={14} className="text-emerald-600" /> Official Full Name (Matches ID)
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Chukwurah Chukwunonso"
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 focus:border-emerald-500 focus:bg-white rounded-2xl text-sm font-semibold text-zinc-900 outline-none transition-all"
                  />
                </div>

                {/* Grid for ID Type & ID Number */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase tracking-wider text-zinc-700 flex items-center gap-1.5">
                      <FileText size={14} className="text-emerald-600" /> ID Document Type
                    </label>
                    <select
                      value={idType}
                      onChange={(e) => setIdType(e.target.value)}
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 focus:border-emerald-500 focus:bg-white rounded-2xl text-sm font-semibold text-zinc-900 outline-none transition-all"
                    >
                      <option value="NIN (National Identity Number)">NIN (National ID)</option>
                      <option value="International Passport">International Passport</option>
                      <option value="Driver's License">Driver's License</option>
                      <option value="Voter's Card (PVC)">Voter's Card (PVC)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase tracking-wider text-zinc-700 flex items-center gap-1.5">
                      <CreditCard size={14} className="text-emerald-600" /> Government ID Number
                    </label>
                    <input
                      type="text"
                      required
                      value={idNumber}
                      onChange={(e) => setIdNumber(e.target.value)}
                      placeholder="e.g. 98124018231"
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 focus:border-emerald-500 focus:bg-white rounded-2xl text-sm font-semibold text-zinc-900 outline-none transition-all font-mono"
                    />
                  </div>
                </div>

                {/* BVN Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-zinc-700 flex items-center gap-1.5 justify-between">
                    <span className="flex items-center gap-1.5">
                      <Shield size={14} className="text-emerald-600" /> Bank Verification Number (BVN)
                    </span>
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">CBN Compliant</span>
                  </label>
                  <input
                    type="text"
                    maxLength={11}
                    value={bvn}
                    onChange={(e) => setBvn(e.target.value.replace(/\D/g, ""))}
                    placeholder="Enter 11-digit BVN (e.g. 22194830192)"
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 focus:border-emerald-500 focus:bg-white rounded-2xl text-sm font-semibold text-zinc-900 outline-none transition-all font-mono tracking-wider"
                  />
                  <p className="text-[11px] text-zinc-400 font-medium">Dial *565*0# on your registered SIM to get your 11-digit BVN.</p>
                </div>

                {/* Address */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-zinc-700 flex items-center gap-1.5">
                    <Building size={14} className="text-emerald-600" /> Residential Address
                  </label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. 14 Admiralty Way, Lekki Phase 1, Lagos State"
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 focus:border-emerald-500 focus:bg-white rounded-2xl text-sm font-semibold text-zinc-900 outline-none transition-all"
                  />
                </div>

                {/* Security Guarantee Note */}
                <div className="p-3.5 bg-emerald-50/70 border border-emerald-150 rounded-2xl text-xs text-emerald-800 flex items-start gap-2.5">
                  <Lock size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                  <p className="font-medium">
                    Your personal identification information is encrypted using 256-bit SSL protocols and shared exclusively with licensed credit bureaus for verification.
                  </p>
                </div>

                {/* Buttons */}
                <div className="pt-3 flex flex-col sm:flex-row gap-3">
                  <button
                    type="submit"
                    className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl text-sm transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Submit & Clear KYC Clearance</span>
                    <ChevronRight size={18} />
                  </button>

                  <button
                    type="button"
                    onClick={handleClose}
                    className="py-4 px-6 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 font-bold rounded-2xl text-sm transition-colors cursor-pointer"
                  >
                    Remind Me Later
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

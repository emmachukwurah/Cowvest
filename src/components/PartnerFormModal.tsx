import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Building2, 
  Phone, 
  MapPin, 
  Calendar, 
  Ship, 
  FileText, 
  X, 
  CheckCircle2, 
  Loader2, 
  Handshake, 
  Mail, 
  User, 
  Package, 
  ArrowRight,
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import { useAuth } from "../lib/AuthContext";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { addDoc, collection } from "firebase/firestore";

interface PartnerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PartnerFormModal({ isOpen, onClose }: PartnerFormModalProps) {
  const { profile } = useAuth();

  const [orgName, setOrgName] = useState("");
  const [contactPerson, setContactPerson] = useState(profile?.displayName || "");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState(profile?.email || "");
  const [address, setAddress] = useState("");
  const [yearsImporting, setYearsImporting] = useState("3-5 years");
  const [importVolume, setImportVolume] = useState("10 - 50 Tonnes / Month");
  const [portOfEntry, setPortOfEntry] = useState("Apapa Port, Lagos");
  const [additionalInfo, setAdditionalInfo] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!orgName.trim()) {
      setErrorMessage("Please enter your Organisation / Business Name.");
      return;
    }
    if (!phoneNumber.trim()) {
      setErrorMessage("Please enter a valid phone number.");
      return;
    }
    if (!address.trim()) {
      setErrorMessage("Please enter your business or facility address.");
      return;
    }

    setIsSubmitting(true);

    try {
      const applicationData = {
        userId: profile?.uid || "guest",
        orgName: orgName.trim(),
        contactPerson: contactPerson.trim(),
        phoneNumber: phoneNumber.trim(),
        email: email.trim(),
        address: address.trim(),
        yearsImporting,
        importVolume,
        portOfEntry,
        additionalInfo: additionalInfo.trim(),
        createdAt: new Date().toISOString(),
        status: "pending_review"
      };

      await addDoc(collection(db, "partner_applications"), applicationData);

      setIsSubmitting(false);
      setIsSuccess(true);
    } catch (err: any) {
      console.error("Partner application submit error:", err);
      handleFirestoreError(err, OperationType.CREATE, "partner_applications");
      setErrorMessage("Failed to submit application. Please check your network and try again.");
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setIsSuccess(false);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleResetAndClose}
          className="fixed inset-0 bg-zinc-950/80 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden z-10 border border-zinc-150 my-8 flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-zinc-950 via-emerald-950 to-zinc-900 p-6 md:p-8 text-white relative overflow-hidden shrink-0">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <button
              onClick={handleResetAndClose}
              className="absolute top-5 right-5 w-9 h-9 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 border border-emerald-500/40 rounded-full text-xs font-bold text-emerald-300 uppercase tracking-widest mb-3">
              <Handshake size={14} className="text-emerald-400" />
              <span>Importers & Trade Partnership</span>
            </div>

            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white mb-2">
              Become A Cowhide (Kpomo) Partner
            </h2>

            <p className="text-zinc-300 text-xs md:text-sm font-medium leading-relaxed">
              Register as an active cowhide importer in Nigeria to access Cowvest off-take agreements, liquidity financing, and nationwide distribution network.
            </p>
          </div>

          {/* Form Content */}
          <div className="p-6 md:p-8 overflow-y-auto flex-1">
            {isSuccess ? (
              <div className="py-12 text-center flex flex-col items-center justify-center space-y-4">
                <div className="w-20 h-20 bg-emerald-500 text-white rounded-3xl flex items-center justify-center shadow-xl shadow-emerald-500/30">
                  <CheckCircle2 size={44} />
                </div>

                <h3 className="text-2xl font-black text-zinc-900">Partnership Application Received!</h3>
                <p className="text-zinc-600 text-sm max-w-md leading-relaxed">
                  Thank you for applying. Our Cowhide Importation & Trade Procurement team in Nigeria will review <strong className="text-emerald-700">{orgName}</strong> and contact you via phone or email within 24–48 hours.
                </p>

                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-xs text-emerald-800 font-medium max-w-md">
                  <ShieldCheck size={16} className="inline mr-1 text-emerald-600" />
                  Your partnership request is recorded securely under Cowvest Nigeria Commercial Trade Desk.
                </div>

                <button
                  onClick={handleResetAndClose}
                  className="mt-4 px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl text-sm transition-all shadow-lg shadow-emerald-600/30 cursor-pointer"
                >
                  Return to Available Products
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {errorMessage && (
                  <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-bold flex items-center gap-2">
                    <AlertCircle size={16} className="shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Section Title */}
                <div className="border-b border-zinc-100 pb-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-emerald-700">1. Organisation & Contact Details</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Name of Organisation */}
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-black uppercase tracking-wider text-zinc-700 flex items-center gap-1.5">
                      <Building2 size={14} className="text-emerald-600" /> Name of Organisation / Business Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      placeholder="e.g. Lagos Hide & Leather Global Ltd"
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 focus:border-emerald-500 focus:bg-white rounded-2xl text-sm font-semibold text-zinc-900 outline-none transition-all"
                    />
                  </div>

                  {/* Contact Person */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase tracking-wider text-zinc-700 flex items-center gap-1.5">
                      <User size={14} className="text-emerald-600" /> Contact Person Name
                    </label>
                    <input
                      type="text"
                      value={contactPerson}
                      onChange={(e) => setContactPerson(e.target.value)}
                      placeholder="e.g. Alh. Ibrahim Musa"
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 focus:border-emerald-500 focus:bg-white rounded-2xl text-sm font-semibold text-zinc-900 outline-none transition-all"
                    />
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase tracking-wider text-zinc-700 flex items-center gap-1.5">
                      <Phone size={14} className="text-emerald-600" /> Phone Number (WhatsApp Enabled) *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="e.g. +234 803 123 4567"
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 focus:border-emerald-500 focus:bg-white rounded-2xl text-sm font-semibold text-zinc-900 outline-none transition-all font-mono"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase tracking-wider text-zinc-700 flex items-center gap-1.5">
                      <Mail size={14} className="text-emerald-600" /> Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. info@lagoshide.com"
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 focus:border-emerald-500 focus:bg-white rounded-2xl text-sm font-semibold text-zinc-900 outline-none transition-all"
                    />
                  </div>

                  {/* Address */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase tracking-wider text-zinc-700 flex items-center gap-1.5">
                      <MapPin size={14} className="text-emerald-600" /> Office / Warehouse Address in Nigeria *
                    </label>
                    <input
                      type="text"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="e.g. Plot 12 Commercial Avenue, Ikeja / Kano Market"
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 focus:border-emerald-500 focus:bg-white rounded-2xl text-sm font-semibold text-zinc-900 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Section Title */}
                <div className="border-b border-zinc-100 pb-2 pt-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-emerald-700">2. Importation & Operation Profile</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Years of Active Cowhide Importation */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase tracking-wider text-zinc-700 flex items-center gap-1.5">
                      <Calendar size={14} className="text-emerald-600" /> Years of Active Cowhide (Kpomo) Importation
                    </label>
                    <select
                      value={yearsImporting}
                      onChange={(e) => setYearsImporting(e.target.value)}
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 focus:border-emerald-500 focus:bg-white rounded-2xl text-sm font-semibold text-zinc-900 outline-none transition-all"
                    >
                      <option value="Under 1 year">Under 1 Year (New Importer)</option>
                      <option value="1 - 3 years">1 - 3 Years</option>
                      <option value="3 - 5 years">3 - 5 Years</option>
                      <option value="5 - 10 years">5 - 10 Years</option>
                      <option value="Over 10 years">Over 10 Years (Established)</option>
                    </select>
                  </div>

                  {/* Estimated Import Volume */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase tracking-wider text-zinc-700 flex items-center gap-1.5">
                      <Package size={14} className="text-emerald-600" /> Estimated Monthly Import Volume
                    </label>
                    <select
                      value={importVolume}
                      onChange={(e) => setImportVolume(e.target.value)}
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 focus:border-emerald-500 focus:bg-white rounded-2xl text-sm font-semibold text-zinc-900 outline-none transition-all"
                    >
                      <option value="Under 10 Tonnes / Month">Under 10 Tonnes / Month</option>
                      <option value="10 - 50 Tonnes / Month">10 - 50 Tonnes / Month (1-2 Containers)</option>
                      <option value="50 - 200 Tonnes / Month">50 - 200 Tonnes / Month (3-8 Containers)</option>
                      <option value="Over 200 Tonnes / Month">Over 200 Tonnes / Month (Bulk Supply)</option>
                    </select>
                  </div>

                  {/* Primary Port of Entry / Origin */}
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-black uppercase tracking-wider text-zinc-700 flex items-center gap-1.5">
                      <Ship size={14} className="text-emerald-600" /> Primary Port of Entry / Supply Source
                    </label>
                    <input
                      type="text"
                      value={portOfEntry}
                      onChange={(e) => setPortOfEntry(e.target.value)}
                      placeholder="e.g. Apapa Port Lagos, Tin Can, Port Harcourt, Land Border (Seme/Jibiya)"
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 focus:border-emerald-500 focus:bg-white rounded-2xl text-sm font-semibold text-zinc-900 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Other Relevant Information */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-zinc-700 flex items-center gap-1.5">
                    <FileText size={14} className="text-emerald-600" /> Other Relevant Information & Requirements
                  </label>
                  <textarea
                    rows={3}
                    value={additionalInfo}
                    onChange={(e) => setAdditionalInfo(e.target.value)}
                    placeholder="Provide details about your target markets, storage facilities, required financing, or specific partnership requirements..."
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 focus:border-emerald-500 focus:bg-white rounded-2xl text-sm font-semibold text-zinc-900 outline-none transition-all resize-none"
                  />
                </div>

                {/* Submit button */}
                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl text-sm transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Submitting Partner Application...</span>
                      </>
                    ) : (
                      <>
                        <Handshake size={18} />
                        <span>Submit Importer Partner Application</span>
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleResetAndClose}
                    className="py-4 px-6 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 font-bold rounded-2xl text-sm transition-colors cursor-pointer"
                  >
                    Cancel
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

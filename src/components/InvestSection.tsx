import React, { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { PRODUCE_OPTIONS } from "../constants";
import { formatCurrency } from "../lib/utils";
import { ArrowRight, ShieldCheck, Info, Handshake, Building2, Sparkles, ChevronLeft, ChevronRight, Sprout, TrendingUp } from "lucide-react";
import { CowIcon as Cow } from "./CowIcon";
import { useAuth } from "../lib/AuthContext";
import { addDoc, collection, doc, updateDoc, increment } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { PartnerFormModal } from "./PartnerFormModal";
import { processUserFirstInvestment } from "../lib/referralService";
import { ReferAndEarnBanner } from "./ReferAndEarnBanner";

interface InvestSectionProps {
  onOpenInvite?: () => void;
  onOpenMyReferrals?: () => void;
  onOpenTerms?: () => void;
  onOpenReferralPackage?: () => void;
}

export function InvestSection({ 
  onOpenInvite, 
  onOpenMyReferrals, 
  onOpenTerms,
  onOpenReferralPackage
}: InvestSectionProps) {
  const { profile } = useAuth();
  const [selectedProduce, setSelectedProduce] = useState<typeof PRODUCE_OPTIONS[0] | null>(null);
  const [amount, setAmount] = useState<number>(100000);
  const [investing, setInvesting] = useState(false);
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);

  // Mobile carousel navigation ref & state
  const carouselRef = useRef<HTMLDivElement>(null);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  const scrollCarousel = (direction: "left" | "right") => {
    if (!carouselRef.current) return;
    const cardWidth = 300;
    const scrollAmount = direction === "left" ? -cardWidth : cardWidth;
    carouselRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  const handleCarouselScroll = () => {
    if (!carouselRef.current) return;
    const scrollLeft = carouselRef.current.scrollLeft;
    const cardWidth = 280;
    const index = Math.round(scrollLeft / cardWidth);
    setActiveSlideIndex(Math.min(Math.max(index, 0), PRODUCE_OPTIONS.length - 1));
  };

  const scrollToSlide = (index: number) => {
    if (!carouselRef.current) return;
    const cardWidth = 280;
    carouselRef.current.scrollTo({ left: index * cardWidth, behavior: "smooth" });
    setActiveSlideIndex(index);
  };

  const handleInvest = async () => {
    if (!profile || !selectedProduce) return;
    
    // In a real app, we'd check if balance is sufficient.
    // For this demo, we'll allow it and record it.
    setInvesting(true);
    try {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 6);

      const investment = {
        userId: profile.uid,
        amount,
        produceType: selectedProduce.type,
        status: "active",
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        expectedReturn: amount * 0.2,
        payoutAmount: amount * 1.2,
      };

      try {
        await addDoc(collection(db, "investments"), investment);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, "investments");
      }
      
      // Update user stats (atomic increment)
      const userRef = doc(db, "users", profile.uid);
      try {
        await updateDoc(userRef, {
          totalInvested: increment(amount),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${profile.uid}`);
      }

      // Log activity
      try {
        await addDoc(collection(db, "activities"), {
          userId: profile.uid,
          type: "investment",
          amount,
          timestamp: new Date().toISOString(),
          description: `Invested ${formatCurrency(amount)} in ${selectedProduce.type} produce.`,
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, "activities");
      }

      // Trigger Referral Reward for first investment
      const refResult = await processUserFirstInvestment(profile.uid, amount);

      setSelectedProduce(null);
      if (refResult) {
        alert(`Investment successful! You earned a welcome referral bonus of ₦${refResult.newInvestorBonus.toLocaleString()} pending approval. You can track it in your dashboard.`);
      } else {
        alert("Investment successful! You can track it in your dashboard.");
      }
    } catch (error) {
      console.error(error);
      alert("Error processing investment.");
    } finally {
      setInvesting(false);
    }
  };

  return (
    <section className="py-12" id="invest-section">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight">Available Products</h2>
            <span className="sm:hidden text-xs font-bold px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded-full border border-emerald-200">
              {PRODUCE_OPTIONS.length} cycles
            </span>
          </div>
          <p className="text-zinc-500 text-xs sm:text-sm font-medium">Select a livestock or produce project to start your investment journey.</p>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2.5">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200/80 rounded-full text-xs font-bold uppercase tracking-wider shadow-xs">
            <ShieldCheck size={15} className="text-emerald-600" />
            <span>Insured Assets</span>
          </div>

          {/* Mobile Quick Arrow Navigation Controls */}
          <div className="flex sm:hidden items-center gap-1.5">
            <button
              type="button"
              onClick={() => scrollCarousel("left")}
              disabled={activeSlideIndex === 0}
              className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
                activeSlideIndex === 0 
                  ? "border-zinc-200 text-zinc-300 bg-zinc-50 cursor-not-allowed" 
                  : "border-zinc-300 text-zinc-800 bg-white hover:bg-zinc-50 shadow-xs cursor-pointer active:scale-95"
              }`}
              title="Previous product"
              aria-label="Previous product"
            >
              <ChevronLeft size={16} />
            </button>

            <button
              type="button"
              onClick={() => scrollCarousel("right")}
              disabled={activeSlideIndex === PRODUCE_OPTIONS.length - 1}
              className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
                activeSlideIndex === PRODUCE_OPTIONS.length - 1
                  ? "border-zinc-200 text-zinc-300 bg-zinc-50 cursor-not-allowed"
                  : "border-zinc-300 text-zinc-800 bg-white hover:bg-zinc-50 shadow-xs cursor-pointer active:scale-95"
              }`}
              title="Next product"
              aria-label="Next product"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Swipe Guidance */}
      <div className="sm:hidden flex items-center justify-between text-[11px] font-bold text-zinc-400 mb-3 px-1">
        <span className="text-emerald-700 flex items-center gap-1">
          <span>← Swipe horizontally to explore cycles →</span>
        </span>
        <span className="font-mono text-zinc-500 font-extrabold">
          {activeSlideIndex + 1} / {PRODUCE_OPTIONS.length}
        </span>
      </div>

      {/* Slidable Carousel (Mobile) / Responsive Grid (Tablet & Desktop) */}
      <div 
        ref={carouselRef}
        onScroll={handleCarouselScroll}
        className="flex sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 overflow-x-auto sm:overflow-x-visible pb-4 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none snap-x snap-mandatory items-stretch"
      >
        {PRODUCE_OPTIONS.map((option, i) => {
          const isInvestable = option.type === "Cowhide (Kpomo)" || option.type === "Sesame Seed";
          return (
            <motion.div
              key={option.type}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className={`group bg-white rounded-3xl border border-zinc-150 overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col justify-between shrink-0 snap-center w-[82vw] max-w-[320px] xs:w-[290px] sm:w-auto sm:max-w-none ${
                isInvestable
                  ? "hover:border-emerald-300 cursor-pointer"
                  : "cursor-not-allowed opacity-80"
              }`}
              onClick={() => {
                if (isInvestable) {
                  setSelectedProduce(option);
                }
              }}
            >
              <div>
                <div className="relative h-48 overflow-hidden bg-zinc-100">
                  <img 
                    src={option.image} 
                    alt={option.type}
                    referrerPolicy="no-referrer"
                    className={`w-full h-full object-cover transition-transform duration-500 ${
                      isInvestable ? "group-hover:scale-110" : ""
                    }`}
                  />
                  <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-xs px-3 py-1 rounded-full flex items-center gap-1.5 text-xs sm:text-sm font-extrabold text-emerald-800 shadow-xs border border-zinc-200/60">
                    {option.type === "Sesame Seed" ? (
                      <Sprout size={14} className="text-emerald-600" />
                    ) : (
                      <Cow size={14} className="text-emerald-600" />
                    )}
                    <span>{option.type}</span>
                  </div>
                  {!isInvestable && (
                    <div className="absolute top-4 right-4 bg-amber-500/90 backdrop-blur-xs text-white px-3 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider shadow-md">
                      Coming Soon
                    </div>
                  )}
                </div>
                
                <div className="p-5 sm:p-6">
                  <p className="text-zinc-500 text-xs sm:text-sm mb-4 line-clamp-2 leading-relaxed">{option.description}</p>
                  <div className="flex items-center justify-between pb-5 border-b border-zinc-100">
                    <div>
                      <p className="text-[10px] sm:text-xs text-zinc-400 font-bold tracking-wide uppercase">Returns</p>
                      <p className="text-base sm:text-lg font-black text-emerald-600 font-mono">{option.returns}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] sm:text-xs text-zinc-400 font-bold tracking-wide uppercase">Investment Range</p>
                      <p className="text-xs sm:text-sm font-black text-zinc-950 font-mono">
                        {formatCurrency(option.minAmount)} - {formatCurrency(option.maxAmount)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-5 sm:px-6 pb-5 sm:pb-6">
                {isInvestable ? (
                  <div className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl flex items-center justify-center gap-2 text-xs sm:text-sm font-extrabold shadow-sm shadow-emerald-600/20 group-hover:shadow-md transition-all">
                    <span>Invest Now</span>
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                ) : (
                  <div className="w-full py-2.5 bg-zinc-100 text-zinc-400 rounded-2xl flex items-center justify-center text-xs sm:text-sm font-extrabold">
                    <span>Coming Soon</span>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Mobile Dot Indicators */}
      <div className="sm:hidden flex items-center justify-center gap-2 pt-3 pb-2">
        {PRODUCE_OPTIONS.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => scrollToSlide(idx)}
            className={`transition-all rounded-full cursor-pointer ${
              activeSlideIndex === idx 
                ? "w-6 h-2 bg-emerald-600" 
                : "w-2 h-2 bg-zinc-300 hover:bg-zinc-400"
            }`}
            title={`Go to product ${idx + 1}`}
            aria-label={`Go to product ${idx + 1}`}
          />
        ))}
      </div>

      {/* CowVest Referral Clickable Banner (Opens Full Referral Package) */}
      {(onOpenReferralPackage || onOpenInvite) && (
        <ReferAndEarnBanner 
          onClick={() => {
            if (onOpenReferralPackage) {
              onOpenReferralPackage();
            } else if (onOpenInvite) {
              onOpenInvite();
            }
          }}
        />
      )}

      {/* Become A Partner Callout Bar */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-8 relative overflow-hidden bg-gradient-to-r from-zinc-950 via-emerald-950 to-zinc-900 rounded-3xl p-6 md:p-8 text-white border border-emerald-500/30 shadow-xl"
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 border border-emerald-500/40 rounded-full text-xs font-bold text-emerald-300 uppercase tracking-widest">
              <Handshake size={14} className="text-emerald-400" />
              <span>Commercial Importers Trade Network</span>
            </div>

            <h3 className="text-xl md:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              Become A Partner
            </h3>

            <p className="text-zinc-300 text-xs md:text-sm font-medium leading-relaxed">
              Are you an active cowhide (kpomo) importer in Nigeria? Partner with Cowvest to access guaranteed off-take contracts, liquidity financing, and streamlined nationwide distribution.
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400 font-semibold pt-1">
              <span className="flex items-center gap-1 text-emerald-300">
                <Building2 size={14} className="text-emerald-400" /> Verified Nigerian Importers
              </span>
              <span className="w-1 h-1 bg-zinc-700 rounded-full" />
              <span className="flex items-center gap-1 text-emerald-300">
                <Sparkles size={14} className="text-emerald-400" /> Trade Off-Take & Liquidity
              </span>
            </div>
          </div>

          <div className="shrink-0">
            <button
              onClick={() => setIsPartnerModalOpen(true)}
              className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-sm font-black transition-all shadow-lg shadow-emerald-600/30 flex items-center gap-2 cursor-pointer group"
            >
              <span>Partner With Us</span>
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Partner Form Modal */}
      <PartnerFormModal 
        isOpen={isPartnerModalOpen} 
        onClose={() => setIsPartnerModalOpen(false)} 
      />

      {/* Investment Modal */}
      {selectedProduce && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 bg-zinc-900/70 backdrop-blur-sm overflow-y-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl my-auto max-h-[92vh] flex flex-col"
          >
            <div className="p-5 sm:p-8 overflow-y-auto">
              <div className="flex justify-between items-start mb-5 sm:mb-6">
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-zinc-900">Invest in {selectedProduce.type}</h3>
                  <p className="text-xs sm:text-sm text-zinc-500">Secure your spot in this agricultural project.</p>
                </div>
                <button 
                  onClick={() => setSelectedProduce(null)}
                  className="w-9 h-9 sm:w-10 sm:h-10 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-500 hover:bg-zinc-200 transition-colors cursor-pointer text-lg shrink-0"
                >
                  &times;
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-zinc-700 mb-2">Investment Amount (NGN)</label>
                  <div className="relative mb-4">
                    <input 
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      min={selectedProduce.minAmount}
                      max={selectedProduce.maxAmount}
                      className="w-full px-5 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-xl font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">
                      MAX: 10M
                    </div>
                  </div>

                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Quick Select Amount Preset</p>
                  <div className="grid grid-cols-3 gap-2">
                    {[100000, 500000, 1000000, 2500000, 5000000, 10000000].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setAmount(preset)}
                        className={`py-2 px-1 text-xs font-extrabold rounded-xl border transition-all text-center ${
                          amount === preset
                            ? "bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-100"
                            : "bg-zinc-50 border-zinc-100 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                        }`}
                      >
                        {preset === 100000 ? "₦100K (Min)" : preset === 10000000 ? "₦10M (Max)" : `₦${preset >= 1000000 ? (preset / 1000000).toFixed(preset % 1000000 === 0 ? 0 : 1) + "M" : (preset / 1000) + "K"}`}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-emerald-50 p-6 rounded-2xl flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-emerald-600 shadow-sm">
                    <TrendingUp size={24} />
                  </div>
                  <div>
                    <p className="text-xs text-emerald-700 font-bold uppercase tracking-wider">Estimated Profit (6 Months)</p>
                    <p className="text-2xl font-black text-emerald-900">{formatCurrency(amount * 0.2)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl">
                  <Info size={18} className="text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-800 leading-relaxed">
                    By proceeding, you agree to locking your funds for a period of 6 months. Your initial capital and 20% profit will be paid out automatically on completion.
                  </p>
                </div>

                <button 
                  disabled={investing || amount < selectedProduce.minAmount || amount > selectedProduce.maxAmount}
                  onClick={handleInvest}
                  className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold text-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-emerald-200 transition-all"
                >
                  {investing ? "Processing..." : "Confirm Investment"}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </section>
  );
}


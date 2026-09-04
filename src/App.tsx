import React, { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./lib/AuthContext";
import { Navbar } from "./components/Navbar";
import { DashboardHero } from "./components/DashboardHero";
import { UserSimulationVideo } from "./components/UserSimulationVideo";
import { OriginStoryVideo } from "./components/OriginStoryVideo";
import { MarketInsights } from "./components/MarketInsights";
import { InvestSection } from "./components/InvestSection";
import { PortfolioPage } from "./components/PortfolioPage";
import { SplashAndAuth } from "./components/SplashAndAuth";
import { KycPromptModal } from "./components/KycPromptModal";
import { CowIcon as Cow } from "./components/CowIcon";
import { FooterModal, FooterTab } from "./components/FooterModal";
import { AppFooter } from "./components/AppFooter";
import { ReferAndEarnBanner } from "./components/ReferAndEarnBanner";
import { ReferralPackageModal } from "./components/ReferralPackageModal";
import { InviteFriendsModal } from "./components/InviteFriendsModal";
import { MyReferralsModal } from "./components/MyReferralsModal";
import { ReferralTermsModal } from "./components/ReferralTermsModal";
import { AdminReferralPanel } from "./components/AdminReferralPanel";
import { LiveChatWidget } from "./components/LiveChatWidget";
import { motion, AnimatePresence } from "motion/react";
import { ShieldAlert, ArrowRight, Sparkles, CheckCircle2, Gift, X } from "lucide-react";

function AppContent() {
  const { user, profile, loading } = useAuth();
  const [showSplashAndAuth, setShowSplashAndAuth] = useState(true);
  const [currentPage, setCurrentPage] = useState<"dashboard" | "portfolio">("dashboard");
  const [footerModalOpen, setFooterModalOpen] = useState(false);
  const [footerModalTab, setFooterModalTab] = useState<FooterTab>("faq");
  const [isKycModalOpen, setIsKycModalOpen] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  // Referral Modal States
  const [isReferralPackageOpen, setIsReferralPackageOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isMyReferralsModalOpen, setIsMyReferralsModalOpen] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);

  // Check if current user was invited by someone
  const [invitedByCode, setInvitedByCode] = useState<string | null>(null);
  const [invitedBannerDismissed, setInvitedBannerDismissed] = useState(false);

  useEffect(() => {
    const code = localStorage.getItem("cowvest_referred_by");
    if (code) {
      setInvitedByCode(code);
    }
  }, []);

  const openFooterModal = (tab: FooterTab) => {
    setFooterModalTab(tab);
    setFooterModalOpen(true);
  };

  // Handle splash & auth flow based on user session state
  useEffect(() => {
    if (!loading) {
      if (user) {
        setShowSplashAndAuth(false);
        // Prompt KYC modal on load if unverified
        if (profile && !profile.kycVerified) {
          const timer = setTimeout(() => {
            setIsKycModalOpen(true);
          }, 1200);
          return () => clearTimeout(timer);
        }
      } else {
        setShowSplashAndAuth(true);
      }
    }
  }, [user, profile, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-emerald-600 rounded-3xl flex items-center justify-center text-white animate-bounce shadow-2xl shadow-emerald-500/20">
            <Cow size={32} />
          </div>
          <p className="font-bold text-zinc-500 animate-pulse uppercase tracking-[0.2em] text-xs">Securing Connection...</p>
        </div>
      </div>
    );
  }

  if (showSplashAndAuth) {
    return <SplashAndAuth onComplete={() => setShowSplashAndAuth(false)} />;
  }

  return (
    <div className="min-h-screen bg-zinc-50 font-sans selection:bg-emerald-100 selection:text-emerald-900 pt-16">
      <Navbar 
        currentPage={currentPage}
        onNavigate={(page) => {
          setIsAdminPanelOpen(false);
          setCurrentPage(page);
        }}
        onOpenKyc={() => setIsKycModalOpen(true)}
        onOpenInvite={() => setIsReferralPackageOpen(true)}
        onOpenAdminReferral={() => setIsAdminPanelOpen(!isAdminPanelOpen)}
      />

      {/* Invited By Friend Welcome Banner */}
      {invitedByCode && !invitedBannerDismissed && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-emerald-900 via-teal-950 to-zinc-950 text-white py-2.5 px-4 border-b border-emerald-500/30 relative z-40"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="p-1 bg-emerald-500/20 border border-emerald-500/40 rounded-lg text-emerald-300">
                <Gift size={16} />
              </span>
              <span>
                <strong>You were invited by a friend!</strong> Complete KYC and make your first investment to earn a welcome referral bonus (up to ₦2,500).
              </span>
            </div>
            <button 
              onClick={() => setInvitedBannerDismissed(true)}
              className="text-zinc-400 hover:text-white p-1"
            >
              <X size={14} />
            </button>
          </div>
        </motion.div>
      )}

      {/* Persistent KYC Alert Prompt Banner */}
      {profile && !profile.kycVerified && !bannerDismissed && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-zinc-900 via-emerald-950 to-zinc-950 text-white py-3 px-4 border-b border-emerald-500/30 shadow-md relative z-40"
        >
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center shrink-0 border border-emerald-500/30">
                <ShieldAlert size={18} />
              </span>
              <div>
                <span className="font-black text-xs md:text-sm tracking-wide text-emerald-300 uppercase mr-2">Action Required:</span>
                <span className="font-bold text-xs md:text-sm text-zinc-100">
                  Submit your KYC to Start your investment journey
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => setIsKycModalOpen(true)}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>Submit KYC Now</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      <main className="max-w-7xl mx-auto px-4 pb-32">
        {isAdminPanelOpen ? (
          <div className="pt-4">
            <button
              onClick={() => setIsAdminPanelOpen(false)}
              className="mb-4 px-4 py-2 bg-zinc-200 hover:bg-zinc-300 text-zinc-800 font-extrabold text-xs rounded-xl transition-colors cursor-pointer"
            >
              ← Return to User Dashboard
            </button>
            <AdminReferralPanel />
          </div>
        ) : currentPage === "portfolio" ? (
          <PortfolioPage 
            onBack={() => setCurrentPage("dashboard")}
            onInvestMore={() => {
              setCurrentPage("dashboard");
              setTimeout(() => {
                const el = document.getElementById("invest-section");
                el?.scrollIntoView({ behavior: "smooth" });
              }, 100);
            }}
          />
        ) : (
          <>
            <DashboardHero onOpenPortfolio={() => setCurrentPage("portfolio")} />
            <UserSimulationVideo />
            <OriginStoryVideo />
            <MarketInsights />
            <InvestSection 
              onOpenReferralPackage={() => setIsReferralPackageOpen(true)}
              onOpenInvite={() => setIsInviteModalOpen(true)}
              onOpenMyReferrals={() => setIsMyReferralsModalOpen(true)}
              onOpenTerms={() => setIsTermsModalOpen(true)}
            />
          </>
        )}
      </main>
      
      {/* 9 Interactive App Infrastructure Thumbnails Footer */}
      <AppFooter
        currentPage={currentPage}
        onNavigate={(page) => setCurrentPage(page)}
        onOpenReferralPackage={() => setIsReferralPackageOpen(true)}
        onOpenFooterModal={(tab) => openFooterModal(tab)}
        onOpenReferralTerms={() => setIsTermsModalOpen(true)}
        onOpenKyc={() => setIsKycModalOpen(true)}
      />

      <FooterModal
        isOpen={footerModalOpen}
        onClose={() => setFooterModalOpen(false)}
        initialTab={footerModalTab}
        onOpenKyc={() => setIsKycModalOpen(true)}
      />

      <KycPromptModal
        isOpen={isKycModalOpen}
        onClose={() => setIsKycModalOpen(false)}
      />

      <ReferralPackageModal
        isOpen={isReferralPackageOpen}
        onClose={() => setIsReferralPackageOpen(false)}
        onOpenMyReferrals={() => setIsMyReferralsModalOpen(true)}
        onOpenTerms={() => setIsTermsModalOpen(true)}
      />

      <InviteFriendsModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
      />

      <MyReferralsModal
        isOpen={isMyReferralsModalOpen}
        onClose={() => setIsMyReferralsModalOpen(false)}
        onOpenInvite={() => setIsInviteModalOpen(true)}
      />

      <ReferralTermsModal
        isOpen={isTermsModalOpen}
        onClose={() => setIsTermsModalOpen(false)}
      />

      {/* Floating 24/7 AI Live Chat widget */}
      <LiveChatWidget
        onOpenKyc={() => setIsKycModalOpen(true)}
        onOpenInvite={() => setIsInviteModalOpen(true)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

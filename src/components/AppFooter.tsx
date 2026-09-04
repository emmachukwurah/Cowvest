import React from "react";
import { motion } from "motion/react";
import { 
  LayoutDashboard, 
  Briefcase, 
  Sparkles, 
  HelpCircle, 
  ShieldCheck, 
  Lock, 
  FileText, 
  LifeBuoy, 
  Award,
  ChevronRight,
  ArrowUpRight
} from "lucide-react";
import { CowIcon as Cow } from "./CowIcon";
import { FooterTab } from "./FooterModal";

interface AppFooterProps {
  currentPage: "dashboard" | "portfolio";
  onNavigate: (page: "dashboard" | "portfolio") => void;
  onOpenReferralPackage: () => void;
  onOpenFooterModal: (tab: FooterTab) => void;
  onOpenReferralTerms: () => void;
  onOpenKyc?: () => void;
}

export function AppFooter({
  currentPage,
  onNavigate,
  onOpenReferralPackage,
  onOpenFooterModal,
  onOpenReferralTerms,
  onOpenKyc
}: AppFooterProps) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const navThumbnails = [
    {
      id: "dashboard",
      title: "Dashboard",
      subtitle: "Capital overview & produce hub",
      category: "Core App",
      icon: LayoutDashboard,
      color: "text-emerald-700 bg-emerald-50 border-emerald-200/80 group-hover:bg-emerald-600 group-hover:text-white",
      badge: currentPage === "dashboard" ? "Active View" : undefined,
      onClick: () => {
        onNavigate("dashboard");
        scrollToTop();
      }
    },
    {
      id: "portfolio",
      title: "Portfolio",
      subtitle: "Active cattle & cycle yields",
      category: "Investments",
      icon: Briefcase,
      color: "text-blue-700 bg-blue-50 border-blue-200/80 group-hover:bg-blue-600 group-hover:text-white",
      badge: currentPage === "portfolio" ? "Active View" : "20% ROI",
      onClick: () => {
        onNavigate("portfolio");
        scrollToTop();
      }
    },
    {
      id: "refer-and-earn",
      title: "Refer & Earn",
      subtitle: "Up to 1.0% bonus & rewards",
      category: "Rewards",
      icon: Sparkles,
      color: "text-amber-700 bg-amber-50 border-amber-200/80 group-hover:bg-amber-500 group-hover:text-zinc-950",
      badge: "Up to 1%",
      onClick: () => {
        onOpenReferralPackage();
      }
    },
    {
      id: "faq",
      title: "FAQ",
      subtitle: "Top questions on cycles & payout",
      category: "Knowledge",
      icon: HelpCircle,
      color: "text-purple-700 bg-purple-50 border-purple-200/80 group-hover:bg-purple-600 group-hover:text-white",
      onClick: () => {
        onOpenFooterModal("faq");
      }
    },
    {
      id: "security",
      title: "Security & Verification",
      subtitle: "Insured assets & KYC verification",
      category: "Compliance",
      icon: ShieldCheck,
      color: "text-teal-700 bg-teal-50 border-teal-200/80 group-hover:bg-teal-600 group-hover:text-white",
      badge: "Insured",
      onClick: () => {
        onOpenFooterModal("security");
      }
    },
    {
      id: "privacy",
      title: "Privacy Policy",
      subtitle: "Data encryption & safety rules",
      category: "Legal",
      icon: Lock,
      color: "text-slate-700 bg-slate-100 border-slate-200/80 group-hover:bg-slate-800 group-hover:text-white",
      onClick: () => {
        onOpenFooterModal("privacy");
      }
    },
    {
      id: "terms",
      title: "Terms & Conditions",
      subtitle: "Platform policies & disclosures",
      category: "Legal",
      icon: FileText,
      color: "text-zinc-700 bg-zinc-100 border-zinc-200 group-hover:bg-zinc-900 group-hover:text-white",
      onClick: () => {
        onOpenFooterModal("terms");
      }
    },
    {
      id: "support",
      title: "Contact Support",
      subtitle: "24/7 client desk & assistance",
      category: "Helpdesk",
      icon: LifeBuoy,
      color: "text-rose-700 bg-rose-50 border-rose-200/80 group-hover:bg-rose-600 group-hover:text-white",
      badge: "24/7 Live",
      onClick: () => {
        onOpenFooterModal("support");
      }
    },
    {
      id: "referral-terms",
      title: "Referral Terms",
      subtitle: "Commission rules & user caps",
      category: "Compliance",
      icon: Award,
      color: "text-amber-800 bg-amber-100/70 border-amber-300/80 group-hover:bg-amber-600 group-hover:text-white",
      badge: "Rules",
      onClick: () => {
        onOpenReferralTerms();
      }
    }
  ];

  return (
    <footer className="mt-16 bg-zinc-950 text-white border-t border-zinc-850 pt-14 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-6 border-b border-white/10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/15 border border-emerald-500/30 rounded-full text-[11px] font-black text-emerald-400 uppercase tracking-widest mb-2">
              <span>Platform Infrastructure & Hubs</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Explore Cowvest System
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 font-medium max-w-xl mt-1 leading-relaxed">
              Navigate quickly to every core destination, policy document, reward center, and customer support portal.
            </p>
          </div>

          <button
            onClick={scrollToTop}
            className="self-start md:self-auto text-xs font-extrabold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span>Back to top</span>
            <ArrowUpRight size={14} />
          </button>
        </div>

        {/* Mobile Swipe Hint */}
        <div className="sm:hidden flex items-center justify-between text-[11px] text-zinc-400 font-extrabold mb-3 px-1">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span>← Swipe horizontally on a line →</span>
          </span>
          <span className="text-zinc-500 font-mono text-[10px]">9 Hubs</span>
        </div>

        {/* 9 Clickable Thumbnails Grid / Horizontal Line on Mobile */}
        <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 overflow-x-auto sm:overflow-x-visible pb-4 sm:pb-0 mb-10 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none snap-x snap-mandatory items-stretch">
          {navThumbnails.map((item) => {
            const Icon = item.icon;
            return (
              <motion.button
                key={item.id}
                type="button"
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.98 }}
                onClick={item.onClick}
                className="group flex-shrink-0 w-[240px] xs:w-[260px] sm:w-full snap-start text-left p-4 sm:p-5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-emerald-500/50 transition-all flex items-start gap-3.5 sm:gap-4 cursor-pointer relative overflow-hidden shadow-xs"
              >
                {/* Visual Thumbnail Icon Box */}
                <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center border transition-all shrink-0 ${item.color}`}>
                  <Icon size={20} className="transition-transform group-hover:scale-110 sm:hidden" />
                  <Icon size={22} className="transition-transform group-hover:scale-110 hidden sm:block" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1.5 mb-0.5">
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 truncate">
                      {item.category}
                    </span>
                    {item.badge && (
                      <span className="text-[9px] sm:text-[10px] font-black uppercase px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                        {item.badge}
                      </span>
                    )}
                  </div>

                  <h4 className="text-xs sm:text-base font-black text-white group-hover:text-emerald-300 transition-colors flex items-center gap-1 truncate">
                    <span className="truncate">{item.title}</span>
                    <ChevronRight size={13} className="text-zinc-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </h4>

                  <p className="text-[11px] sm:text-xs text-zinc-400 font-medium truncate mt-0.5">
                    {item.subtitle}
                  </p>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Brand Bottom Meta & Copyright Row */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                onNavigate("dashboard");
                scrollToTop();
              }}
              className="flex items-center gap-2 text-white font-extrabold text-sm hover:text-emerald-400 transition-colors cursor-pointer"
            >
              <div className="w-7 h-7 bg-emerald-500 text-zinc-950 rounded-lg flex items-center justify-center">
                <Cow size={16} />
              </div>
              <span className="tracking-tight">Cowvest</span>
            </button>
            <span className="text-zinc-600">|</span>
            <span>Agricultural Asset Finance</span>
          </div>

          <p className="text-center sm:text-right font-medium">
            © 2026 Cowvest Agricultural Finance. All rights reserved. Securely powered by Gemini AI.
          </p>
        </div>
      </div>
    </footer>
  );
}

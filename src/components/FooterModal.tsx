import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, HelpCircle, Shield, FileText, LifeBuoy, Mail, Phone, MapPin, Send, CheckCircle2, ChevronDown, MessageSquare } from "lucide-react";
import { formatCurrency } from "../lib/utils";

export type FooterTab = "faq" | "privacy" | "terms" | "support" | "security";

interface FooterModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab: FooterTab;
  onOpenKyc?: () => void;
}

interface FAQItem {
  question: string;
  answer: string;
  category: "General" | "Investments" | "Risks & Security" | "Account & Wallet";
}

export function FooterModal({ isOpen, onClose, initialTab, onOpenKyc }: FooterModalProps) {
  const [activeTab, setActiveTab] = useState<FooterTab>(initialTab);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  
  // Support Form State
  const [supportName, setSupportName] = useState("");
  const [supportEmail, setSupportEmail] = useState("");
  const [supportSubject, setSupportSubject] = useState("");
  const [supportMessage, setSupportMessage] = useState("");
  const [supportSubmitted, setSupportSubmitted] = useState(false);
  const [supportLoading, setSupportLoading] = useState(false);

  // Sync state with prop changes when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setSupportSubmitted(false);
      setSupportName("");
      setSupportEmail("");
      setSupportSubject("");
      setSupportMessage("");
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const faqs: FAQItem[] = [
    {
      category: "General",
      question: "What is Cowvest?",
      answer: "Cowvest is an African agricultural investment platform. We enable retail and institutional investors worldwide to power local food production and earn competitive returns by directly funding high-yield agro-produce portfolios, such as cattle breeding, crop farming, and local distribution channels."
    },
    {
      category: "General",
      question: "Who can invest on Cowvest?",
      answer: "Anyone over the age of 18 with a verified Cowvest account can invest. We are committed to democratizing access to institutional-grade agricultural opportunities in emerging markets."
    },
    {
      category: "Investments",
      question: "How do agricultural investments earn profit?",
      answer: "When you fund a produce portfolio (e.g., Cattle Breeding, Dairy Production, or Leather & Hides), your capital goes directly to buying inputs, breeding animals, or scale-processing. Our local agricultural operators manage the lifecycle. After harvest or product sale, profits from the real physical sales are distributed back to your wallet."
    },
    {
      category: "Investments",
      question: "What is the investment lifecycle and duration?",
      answer: "Each agro-produce type has a distinct cycle length (usually between 45 to 180 days). During this period, your capital is locked in physical agricultural operations. Upon maturity, your total payout (capital + guaranteed cycle profits) is automatically paid into your account wallet."
    },
    {
      category: "Risks & Security",
      question: "What are the risks associated with agro-investments?",
      answer: "Agriculture carries inherent biological and environmental risks like weather anomalies, pest outbreaks, or market price drops. To protect your investment, Cowvest secures comprehensive agricultural insurance covering crop and livestock losses, works with experienced agronomists, and spreads projects across geographically diverse farm centers."
    },
    {
      category: "Risks & Security",
      question: "Is my capital guaranteed?",
      answer: "Through our robust risk mitigation framework, partner insurance policies, and conservative underwriting, we guarantee the safety of your principal investment. However, target profit payouts are subject to slight market variations, though historically we have achieved a 98.7% success rate in hitting projected yields."
    },
    {
      category: "Account & Wallet",
      question: "How do I deposit and withdraw funds?",
      answer: "You can deposit funds into your secure Cowvest wallet using your bank card, local wire transfers, or direct digital payment gateways. Withdrawals are processed within 24 hours back to your verified bank account."
    },
    {
      category: "Account & Wallet",
      question: "Are there any hidden platform fees?",
      answer: "No. Cowvest is completely transparent. Our platform fee is already factored into the net projected returns shown on the investment interface. What you see as the payout amount is exactly what you get upon maturity."
    }
  ];

  const handleSupportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportName || !supportEmail || !supportSubject || !supportMessage) {
      alert("Please fill in all support fields.");
      return;
    }
    setSupportLoading(true);
    setTimeout(() => {
      setSupportLoading(false);
      setSupportSubmitted(true);
    }, 1000);
  };

  const tabs = [
    { id: "faq" as FooterTab, label: "FAQ", icon: HelpCircle },
    { id: "security" as FooterTab, label: "Security & Verification", icon: Shield },
    { id: "privacy" as FooterTab, label: "Privacy Policy", icon: FileText },
    { id: "terms" as FooterTab, label: "Terms of Service", icon: FileText },
    { id: "support" as FooterTab, label: "Contact Support", icon: LifeBuoy }
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 md:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-zinc-900/60 backdrop-blur-sm"
        />

        {/* Modal Panel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="relative bg-white w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden z-10 max-h-[90vh] md:max-h-[80vh] border border-zinc-100"
        >
          {/* Close button - Top Right */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50 rounded-full transition-all"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>

          {/* Sidebar Navigation */}
          <div className="w-full md:w-64 bg-zinc-50 p-6 flex flex-col border-b md:border-b-0 md:border-r border-zinc-100 shrink-0">
            <div className="mb-6 hidden md:block">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest block mb-2">Platform Docs</span>
              <h2 className="text-xl font-extrabold text-emerald-900">Information</h2>
            </div>

            <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 scrollbar-none">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setExpandedFaq(null);
                    }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold tracking-tight whitespace-nowrap transition-all duration-200 ${
                      isActive
                        ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/10"
                        : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
                    }`}
                  >
                    <Icon size={18} className={isActive ? "text-white" : "text-zinc-400"} />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8">
            <AnimatePresence mode="wait">
              {activeTab === "faq" && (
                <motion.div
                  key="faq"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="text-2xl font-black text-zinc-900 tracking-tight mb-2">Frequently Asked Questions</h3>
                    <p className="text-sm text-zinc-500">Everything you need to know about Cowvest, our operations, and security model.</p>
                  </div>

                  {/* FAQ Accordion */}
                  <div className="space-y-3">
                    {faqs.map((faq, index) => {
                      const isExpanded = expandedFaq === index;
                      return (
                        <div
                          key={index}
                          className="border border-zinc-100 rounded-xl overflow-hidden bg-zinc-50/50 hover:bg-zinc-50 transition-all duration-150"
                        >
                          <button
                            onClick={() => setExpandedFaq(isExpanded ? null : index)}
                            className="w-full flex justify-between items-center px-5 py-4 text-left font-bold text-zinc-800 hover:text-zinc-950 transition-colors"
                          >
                            <span className="flex items-center gap-3 pr-4">
                              <span className="text-[10px] font-black tracking-widest text-emerald-600 uppercase bg-emerald-50 px-2 py-0.5 rounded-full shrink-0">
                                {faq.category}
                              </span>
                              <span className="text-sm tracking-tight">{faq.question}</span>
                            </span>
                            <motion.div
                              animate={{ rotate: isExpanded ? 180 : 0 }}
                              transition={{ duration: 0.2 }}
                              className="text-zinc-400 shrink-0"
                            >
                              <ChevronDown size={18} />
                            </motion.div>
                          </button>

                          <AnimatePresence initial={false}>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.25, ease: "easeInOut" }}
                              >
                                <div className="px-5 pb-5 pt-1 text-sm leading-relaxed text-zinc-600 border-t border-zinc-100/50">
                                  {faq.answer}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {activeTab === "security" && (
                <motion.div
                  key="security"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="text-2xl font-black text-zinc-900 tracking-tight mb-2">Security & Identity Verification</h3>
                    <p className="text-sm text-zinc-500">How Cowvest safeguards your agricultural capital, assets, and verified account data.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl">
                      <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-sm mb-2 shadow-xs">
                        🛡️
                      </div>
                      <h4 className="font-extrabold text-sm text-emerald-950 mb-1">100% Insured Livestock</h4>
                      <p className="text-xs text-emerald-800 leading-relaxed">
                        Every single cattle head and crop acre is underwritten by NAIC (Nigerian Agricultural Insurance Corporation) and Leadway Assurance against biological loss.
                      </p>
                    </div>

                    <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl">
                      <div className="w-8 h-8 rounded-xl bg-zinc-900 text-white flex items-center justify-center font-black text-sm mb-2 shadow-xs">
                        🔐
                      </div>
                      <h4 className="font-extrabold text-sm text-zinc-950 mb-1">256-Bit Data Encryption</h4>
                      <p className="text-xs text-zinc-600 leading-relaxed">
                        Bank-grade SSL/TLS 1.3 encryption across all payment gateways, wallet transactions, and database operations.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4 text-sm leading-relaxed text-zinc-600 pt-2">
                    <div>
                      <h4 className="font-bold text-zinc-900 mb-1">Mandatory KYC Compliance</h4>
                      <p>
                        To comply with national anti-money laundering (AML) frameworks, all investors must complete identity verification via Bank Verification Number (BVN) or National Identity Number (NIN) prior to payout processing.
                      </p>
                    </div>

                    <div>
                      <h4 className="font-bold text-zinc-900 mb-1">Segregated Capital Custody</h4>
                      <p>
                        Investor capital is held in regulated escrow and custodial institutions, separate from operational overhead, ensuring total principal security.
                      </p>
                    </div>

                    {onOpenKyc && (
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onOpenKyc();
                          }}
                          className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer inline-flex items-center gap-2"
                        >
                          <Shield size={16} />
                          <span>Launch KYC Verification Form</span>
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === "privacy" && (
                <motion.div
                  key="privacy"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="text-2xl font-black text-zinc-900 tracking-tight mb-2">Privacy Policy</h3>
                    <p className="text-sm text-zinc-500">Last updated: July 11, 2026</p>
                  </div>

                  <div className="space-y-4 text-sm leading-relaxed text-zinc-600">
                    <p>
                      At Cowvest, we take your privacy and data security seriously. This privacy statement explains how we collect, use, store, and safeguard your personal information when you use our platform.
                    </p>

                    <div>
                      <h4 className="font-bold text-zinc-900 mb-1">1. Information We Collect</h4>
                      <p>
                        We collect personal information that you provide to us directly, including but not limited to your name, email address, password, identification documents for KYC verification, and transaction history.
                      </p>
                    </div>

                    <div>
                      <h4 className="font-bold text-zinc-900 mb-1">2. How We Use Your Information</h4>
                      <p>
                        We use your collected details to facilitate secure investments, process deposits/withdrawals, satisfy regulatory KYC guidelines, optimize platform usability, prevent fraud, and keep you updated on active portfolio yields.
                      </p>
                    </div>

                    <div>
                      <h4 className="font-bold text-zinc-900 mb-1">3. Data Retention & Sharing</h4>
                      <p>
                        We do not sell or lease your personal information. We only share essential records with fully compliant payment processors or specialized agricultural insurance underwriters necessary to secure and facilitate your contracts.
                      </p>
                    </div>

                    <div>
                      <h4 className="font-bold text-zinc-900 mb-1">4. Bank-Grade Security Measures</h4>
                      <p>
                        All user profiles, wallets, and transaction sequences are protected under strict TLS 1.3 encryption protocols, firewalled databases, and continuous threat monitoring systems.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "terms" && (
                <motion.div
                  key="terms"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="text-2xl font-black text-zinc-900 tracking-tight mb-2">Terms of Service</h3>
                    <p className="text-sm text-zinc-500">Last updated: July 11, 2026</p>
                  </div>

                  <div className="space-y-4 text-sm leading-relaxed text-zinc-600">
                    <p>
                      Welcome to Cowvest. By registering an account and committing capital to agricultural produce portfolios, you agree to comply with and be bound by the following Terms of Service.
                    </p>

                    <div>
                      <h4 className="font-bold text-zinc-900 mb-1">1. Eligibility & Registration</h4>
                      <p>
                        You represent that you are at least 18 years old and capable of forming a binding legal contract. You are responsible for ensuring that all credentials provided during registration are accurate and up-to-date.
                      </p>
                    </div>

                    <div>
                      <h4 className="font-bold text-zinc-900 mb-1">2. Agricultural Investments</h4>
                      <p>
                        Any funds placed into an agro-produce cycle are linked to real-world biological operations. Capital remains locked for the duration specified in the listing. Profits are calculated based on successful final commodity sales.
                      </p>
                    </div>

                    <div>
                      <h4 className="font-bold text-zinc-900 mb-1">3. Mitigation & Risk Disclosures</h4>
                      <p>
                        While Cowvest utilizes robust mitigation strategies—including comprehensive crop and livestock insurance through certified underwriters—agriculture is inherently susceptible to natural phenomena. Users acknowledge these risks.
                      </p>
                    </div>

                    <div>
                      <h4 className="font-bold text-zinc-900 mb-1">4. Payouts and Withdrawals</h4>
                      <p>
                        Mature investment returns are paid out in full to the user's on-platform wallet balance. Withdrawals can be requested to verified bank accounts and are processed subject to network limits and compliance checks.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "support" && (
                <motion.div
                  key="support"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="text-2xl font-black text-zinc-900 tracking-tight mb-2">Get in Touch</h3>
                    <p className="text-sm text-zinc-500">Have any questions? Send us a direct message or use our official support lines.</p>
                  </div>

                  {/* 24/7 Live AI Chat quick banner */}
                  <div className="bg-gradient-to-r from-emerald-900 via-zinc-900 to-emerald-950 text-white p-4 rounded-2xl border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
                    <div className="flex items-center gap-3 text-left">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/40">
                        <MessageSquare size={20} />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm text-white">24/7 Automated AI Live Chat</h4>
                        <p className="text-xs text-emerald-300">Instant answers in real-time on investments, ROI, & KYC</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        const chatBtn = document.getElementById("cowvest-live-chat-toggle");
                        if (chatBtn) chatBtn.click();
                      }}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all shrink-0 cursor-pointer w-full sm:w-auto"
                    >
                      Open Live Chat
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 border border-zinc-100 rounded-2xl bg-zinc-50/50 flex flex-col items-center text-center">
                      <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 mb-2">
                        <Mail size={18} />
                      </div>
                      <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Email</span>
                      <a href="mailto:support@cowvest.com" className="text-sm font-semibold text-zinc-700 hover:text-emerald-600 mt-1 transition-colors">
                        support@cowvest.com
                      </a>
                    </div>

                    <div className="p-4 border border-zinc-100 rounded-2xl bg-zinc-50/50 flex flex-col items-center text-center">
                      <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 mb-2">
                        <Phone size={18} />
                      </div>
                      <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Phone</span>
                      <a href="tel:+2341234567" className="text-sm font-semibold text-zinc-700 hover:text-emerald-600 mt-1 transition-colors">
                        +234 (0) 1 234 5678
                      </a>
                    </div>

                    <div className="p-4 border border-zinc-100 rounded-2xl bg-zinc-50/50 flex flex-col items-center text-center">
                      <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 mb-2">
                        <MapPin size={18} />
                      </div>
                      <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Headquarters</span>
                      <span className="text-xs font-semibold text-zinc-700 mt-1">
                        Ikoyi, Lagos, Nigeria
                      </span>
                    </div>
                  </div>

                  {supportSubmitted ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-6 border border-emerald-100 bg-emerald-50/50 rounded-2xl flex flex-col items-center text-center"
                    >
                      <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center mb-3 shadow-lg shadow-emerald-500/20">
                        <CheckCircle2 size={24} />
                      </div>
                      <h4 className="text-lg font-black text-emerald-950 mb-1">Message Sent Successfully!</h4>
                      <p className="text-sm text-emerald-800 max-w-md leading-relaxed">
                        Thank you for reaching out, {supportName}. Our technical support desk has received your ticket and will reply back to your email ({supportEmail}) within 12 hours.
                      </p>
                      <button
                        onClick={() => setSupportSubmitted(false)}
                        className="mt-4 px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700 transition-all shadow-md"
                      >
                        Send Another Message
                      </button>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleSupportSubmit} className="space-y-4 pt-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Your Name</label>
                          <input
                            type="text"
                            required
                            value={supportName}
                            onChange={(e) => setSupportName(e.target.value)}
                            placeholder="e.g. Chinedu Okafor"
                            className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 focus:border-emerald-500 focus:bg-white rounded-xl text-sm font-semibold text-zinc-800 placeholder-zinc-400 outline-none transition-all"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Email Address</label>
                          <input
                            type="email"
                            required
                            value={supportEmail}
                            onChange={(e) => setSupportEmail(e.target.value)}
                            placeholder="e.g. chinedu@example.com"
                            className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 focus:border-emerald-500 focus:bg-white rounded-xl text-sm font-semibold text-zinc-800 placeholder-zinc-400 outline-none transition-all"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Subject</label>
                        <input
                          type="text"
                          required
                          value={supportSubject}
                          onChange={(e) => setSupportSubject(e.target.value)}
                          placeholder="How can we help you?"
                          className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 focus:border-emerald-500 focus:bg-white rounded-xl text-sm font-semibold text-zinc-800 placeholder-zinc-400 outline-none transition-all"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Your Message</label>
                        <textarea
                          required
                          rows={3}
                          value={supportMessage}
                          onChange={(e) => setSupportMessage(e.target.value)}
                          placeholder="Please supply details about your inquiry or investment ticket..."
                          className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 focus:border-emerald-500 focus:bg-white rounded-xl text-sm font-semibold text-zinc-800 placeholder-zinc-400 outline-none transition-all resize-none"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={supportLoading}
                        className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] disabled:bg-zinc-300 text-white py-3.5 px-6 rounded-xl font-bold tracking-tight shadow-lg shadow-emerald-600/15 hover:shadow-xl hover:shadow-emerald-600/25 transition-all duration-200"
                      >
                        {supportLoading ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <Send size={16} />
                            Send Support Ticket
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export interface ReferralStats {
  totalReferrals: number;
  successfulReferrals: number;
  pendingRewards: number;
  availableReferralEarnings: number;
  totalReferralEarnings: number;
  monthlyEarnings: number;
  currentTier: "Bronze" | "Silver" | "Gold";
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  balance: number;
  totalInvested: number;
  totalProfit: number;
  createdAt: string;
  // Custom Profile Fields
  avatarUrl?: string;
  bvn?: string;
  twoFactorEnabled?: boolean;
  kycVerified?: boolean;
  kycDetails?: {
    fullName: string;
    idType: string;
    idNumber: string;
    address: string;
  };
  fingerprintEnabled?: boolean;
  bankAccount?: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
  // Referral Fields
  referralCode?: string;
  referredByCode?: string;
  referredByUid?: string;
  isAdmin?: boolean;
  referralStats?: ReferralStats;
}

export type ProduceType = "Cattle Breeding" | "Beef Processing" | "Dairy Production" | "Leather & Hides" | "Organic Manure" | "Cowhide (Kpomo)" | "Sesame Seed";

export interface Investment {
  id: string;
  userId: string;
  amount: number;
  produceType: ProduceType;
  status: "active" | "completed";
  startDate: string;
  endDate: string;
  expectedReturn: number;
  payoutAmount: number;
}

export interface Activity {
  id: string;
  userId: string;
  type: "investment" | "payout" | "deposit" | "referral_bonus";
  amount: number;
  timestamp: string;
  description: string;
}

export interface MarketAnalysis {
  summary: string;
  riskLevel: "Low" | "Medium" | "High";
  trend: "Up" | "Down" | "Stable";
}

export type ReferralRewardStatus = "Pending" | "Approved" | "Paid" | "Rejected";
export type ReferralKycStatus = "Pending" | "KYC Completed";
export type ReferralInvestmentStatus = "No Investment" | "Invested";

export interface Referral {
  id: string;
  referrerUid: string;
  referrerCode: string;
  referredUid: string;
  referredName: string;
  referredEmail: string;
  registeredAt: string;
  kycStatus: ReferralKycStatus;
  kycCompletedAt?: string;
  investmentStatus: ReferralInvestmentStatus;
  firstInvestmentAmount?: number;
  firstInvestmentDate?: string;
  rewardAmount: number;
  newInvestorBonus: number;
  tierRate: number; // percentage applied (0.5, 0.75, 1.0)
  rewardStatus: ReferralRewardStatus;
  fraudFlag?: boolean;
  fraudReason?: string;
  updatedAt: string;
}

export type ReferralNotificationType = 
  | "referral_registered" 
  | "referral_kyc" 
  | "referral_investment" 
  | "referral_approved" 
  | "referral_paid" 
  | "tier_upgrade" 
  | "limit_warning" 
  | "system";

export interface ReferralNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: ReferralNotificationType;
  read: boolean;
  createdAt: string;
}

export interface ReferralSettings {
  bronzeRate: number;            // Default 0.5%
  silverRate: number;            // Default 0.75%
  goldRate: number;              // Default 1.0%
  newInvestorBonusRate: number;  // Default 0.25%
  maxReferrerRewardCap: number;  // Default ₦5,000
  maxNewInvestorBonusCap: number;// Default ₦2,500
  monthlyLimitPerUser: number;   // Default ₦50,000
  minQualifyingInvestment: number;// Default ₦10,000
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
  source?: "gemini-3.7-flash" | "cowvest-knowledge-engine";
  quickActions?: { label: string; actionType: "prompt" | "link" | "modal"; payload: string }[];
}


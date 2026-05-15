export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  balance: number;
  totalInvested: number;
  totalProfit: number;
  createdAt: string;
}

export type ProduceType = "Cattle Breeding" | "Beef Processing" | "Dairy Production" | "Leather & Hides" | "Organic Manure" | "Cowhide (Kpomo)";

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
  type: "investment" | "payout" | "deposit";
  amount: number;
  timestamp: string;
  description: string;
}

export interface MarketAnalysis {
  summary: string;
  riskLevel: "Low" | "Medium" | "High";
  trend: "Up" | "Down" | "Stable";
}

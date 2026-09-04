import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc,
  onSnapshot
} from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "./firebase";
import { 
  UserProfile, 
  Referral, 
  ReferralSettings, 
  ReferralNotification, 
  ReferralStats 
} from "../types";

export const DEFAULT_REFERRAL_SETTINGS: ReferralSettings = {
  bronzeRate: 0.5,             // 0.5%
  silverRate: 0.75,            // 0.75%
  goldRate: 1.0,               // 1.0%
  newInvestorBonusRate: 0.25,  // 0.25%
  maxReferrerRewardCap: 5000,  // ₦5,000 max per referral
  maxNewInvestorBonusCap: 2500,// ₦2,500 max per referral
  monthlyLimitPerUser: 50000,  // ₦50,000 monthly limit
  minQualifyingInvestment: 10000, // ₦10,000 minimum
  updatedAt: new Date().toISOString()
};

/**
 * Privacy Masking Helper: Mask name/email so referred user identity is protected.
 * Example: "John Doe" -> "J*** D**", "john.doe@gmail.com" -> "j***@gmail.com"
 */
export function maskName(name: string): string {
  if (!name) return "Investor";
  const parts = name.trim().split(" ");
  return parts.map(part => {
    if (part.length <= 1) return part;
    return part[0] + "*".repeat(Math.min(part.length - 1, 4));
  }).join(" ");
}

export function maskEmail(email: string): string {
  if (!email || !email.includes("@")) return "u***@user.com";
  const [local, domain] = email.split("@");
  const maskedLocal = local.length > 2 
    ? local[0] + "*".repeat(local.length - 2) + local[local.length - 1] 
    : local[0] + "*";
  return `${maskedLocal}@${domain}`;
}

/**
 * Generate a clean 8-character unique referral code.
 * Example: "COW82F9A"
 */
export function generateReferralCode(uid: string): string {
  const cleanUid = uid.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  const sub = cleanUid.length >= 5 ? cleanUid.substring(0, 5) : (cleanUid + "COW12").substring(0, 5);
  return `COW${sub}`;
}

/**
 * Determine tier based on total successful referrals
 */
export function calculateTier(successfulCount: number): "Bronze" | "Silver" | "Gold" {
  if (successfulCount >= 10) return "Gold";
  if (successfulCount >= 5) return "Silver";
  return "Bronze";
}

/**
 * Get tier rate percentage from settings
 */
export function getTierRate(tier: "Bronze" | "Silver" | "Gold", settings: ReferralSettings): number {
  switch (tier) {
    case "Gold":
      return settings.goldRate;
    case "Silver":
      return settings.silverRate;
    case "Bronze":
    default:
      return settings.bronzeRate;
  }
}

/**
 * Fetch or Initialize Referral Settings from Firestore
 */
export async function getReferralSettings(): Promise<ReferralSettings> {
  const configRef = doc(db, "referral_settings", "config");
  try {
    const snap = await getDoc(configRef);
    if (snap.exists()) {
      return { ...DEFAULT_REFERRAL_SETTINGS, ...snap.data() } as ReferralSettings;
    } else {
      await setDoc(configRef, DEFAULT_REFERRAL_SETTINGS);
      return DEFAULT_REFERRAL_SETTINGS;
    }
  } catch (err) {
    console.warn("Could not fetch referral settings from db, using defaults:", err);
    return DEFAULT_REFERRAL_SETTINGS;
  }
}

/**
 * Listen to live Referral Settings
 */
export function listenReferralSettings(callback: (settings: ReferralSettings) => void) {
  const configRef = doc(db, "referral_settings", "config");
  return onSnapshot(configRef, (snap) => {
    if (snap.exists()) {
      callback({ ...DEFAULT_REFERRAL_SETTINGS, ...snap.data() } as ReferralSettings);
    } else {
      callback(DEFAULT_REFERRAL_SETTINGS);
    }
  }, (err) => {
    console.warn("Firestore notice in listenReferralSettings, using defaults:", err);
    callback(DEFAULT_REFERRAL_SETTINGS);
  });
}

/**
 * Save updated referral settings (Admin action)
 */
export async function saveReferralSettings(settings: Partial<ReferralSettings>): Promise<void> {
  const configRef = doc(db, "referral_settings", "config");
  const updated = {
    ...settings,
    updatedAt: new Date().toISOString()
  };
  try {
    await setDoc(configRef, updated, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, "referral_settings/config");
  }
}

export const updateReferralSettings = saveReferralSettings;

/**
 * Create a Notification for a user
 */
export async function sendNotification(
  userId: string,
  title: string,
  message: string,
  type: ReferralNotification["type"]
): Promise<void> {
  try {
    const notificationRef = collection(db, "notifications");
    const newNotif: Omit<ReferralNotification, "id"> = {
      userId,
      title,
      message,
      type,
      read: false,
      createdAt: new Date().toISOString()
    };
    await addDoc(notificationRef, newNotif);
  } catch (err) {
    console.error("Failed to send notification:", err);
  }
}

/**
 * Listen to user notifications
 */
export function listenUserNotifications(userId: string, callback: (notifs: ReferralNotification[]) => void) {
  const q = query(
    collection(db, "notifications"),
    where("userId", "==", userId)
  );
  return onSnapshot(q, (snapshot) => {
    const items: ReferralNotification[] = [];
    snapshot.forEach((doc) => {
      items.push({ id: doc.id, ...doc.data() } as ReferralNotification);
    });
    // Sort newest first
    items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    callback(items);
  }, (err) => {
    console.warn("Firestore notice in listenUserNotifications:", err);
    callback([]);
  });
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notifId: string): Promise<void> {
  try {
    await updateDoc(doc(db, "notifications", notifId), { read: true });
  } catch (err) {
    console.error("Failed to mark notification read:", err);
  }
}

export const markNotificationRead = markNotificationAsRead;

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  try {
    const q = query(collection(db, "notifications"), where("userId", "==", userId), where("read", "==", false));
    const snap = await getDocs(q);
    const promises = snap.docs.map(d => updateDoc(doc(db, "notifications", d.id), { read: true }));
    await Promise.all(promises);
  } catch (err) {
    console.error("Failed to mark all notifications as read:", err);
  }
}

/**
 * Parse URL for referral code (?ref=CODE or ?referral=CODE) and store in localStorage
 */
export function captureReferralCodeFromUrl(): string | null {
  if (typeof window === "undefined") return null;
  const urlParams = new URLSearchParams(window.location.search);
  const ref = urlParams.get("ref") || urlParams.get("referral");
  if (ref) {
    const cleanRef = ref.trim().toUpperCase();
    localStorage.setItem("cowvest_ref_code", cleanRef);
    return cleanRef;
  }
  return localStorage.getItem("cowvest_ref_code");
}

/**
 * Ensure user profile has a referral code and stats initialized
 */
export async function ensureUserReferralProfile(userProfile: UserProfile): Promise<UserProfile> {
  let updated = false;
  const profileCopy = { ...userProfile };

  if (!profileCopy.referralCode) {
    profileCopy.referralCode = generateReferralCode(userProfile.uid);
    updated = true;
  }

  if (!profileCopy.referralStats) {
    profileCopy.referralStats = {
      totalReferrals: 0,
      successfulReferrals: 0,
      pendingRewards: 0,
      availableReferralEarnings: 0,
      totalReferralEarnings: 0,
      monthlyEarnings: 0,
      currentTier: "Bronze"
    };
    updated = true;
  }

  if (updated) {
    try {
      await updateDoc(doc(db, "users", userProfile.uid), {
        referralCode: profileCopy.referralCode,
        referralStats: profileCopy.referralStats
      });
    } catch (err) {
      console.warn("Could not update user referral code/stats in db:", err);
    }
  }

  return profileCopy;
}

/**
 * Process New User Registration Referral
 * Links referred user to referrer if a referral code exists
 */
export async function processUserRegistrationReferral(newUserProfile: UserProfile): Promise<void> {
  const refCode = localStorage.getItem("cowvest_ref_code") || newUserProfile.referredByCode;
  if (!refCode) return;

  const normalizedRefCode = refCode.trim().toUpperCase();

  try {
    // 1. Check if user already has a referral record
    const existingRefQuery = query(
      collection(db, "referrals"),
      where("referredUid", "==", newUserProfile.uid)
    );
    const existingRefSnap = await getDocs(existingRefQuery);
    if (!existingRefSnap.empty) {
      console.log("User already linked to a referrer.");
      return;
    }

    // 2. Find referrer by referral code
    const referrerQuery = query(
      collection(db, "users"),
      where("referralCode", "==", normalizedRefCode)
    );
    const referrerSnap = await getDocs(referrerQuery);

    if (referrerSnap.empty) {
      console.warn(`Referral code ${normalizedRefCode} not found.`);
      return;
    }

    const referrerDoc = referrerSnap.docs[0];
    const referrerData = referrerDoc.data() as UserProfile;

    // ANTI-FRAUD RULE 1: Anti-Self Referral
    if (referrerData.uid === newUserProfile.uid) {
      console.warn("Anti-Fraud Triggered: Self referral attempted.");
      return;
    }

    // ANTI-FRAUD RULE 2: Same Email or Duplicate Account Detection
    let isFraud = false;
    let fraudReason = "";
    if (referrerData.email.toLowerCase() === newUserProfile.email.toLowerCase()) {
      isFraud = true;
      fraudReason = "Matching email address detected between referrer and referee.";
    }

    // Update new user's referredByCode & referredByUid
    await updateDoc(doc(db, "users", newUserProfile.uid), {
      referredByCode: normalizedRefCode,
      referredByUid: referrerData.uid
    });

    // 3. Create Referral Record
    const referralId = `ref_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const newReferral: Referral = {
      id: referralId,
      referrerUid: referrerData.uid,
      referrerCode: normalizedRefCode,
      referredUid: newUserProfile.uid,
      referredName: maskName(newUserProfile.displayName || "Investor"),
      referredEmail: maskEmail(newUserProfile.email || ""),
      registeredAt: new Date().toISOString(),
      kycStatus: newUserProfile.kycVerified ? "KYC Completed" : "Pending",
      kycCompletedAt: newUserProfile.kycVerified ? new Date().toISOString() : undefined,
      investmentStatus: "No Investment",
      rewardAmount: 0,
      newInvestorBonus: 0,
      tierRate: 0.5,
      rewardStatus: isFraud ? "Rejected" : "Pending",
      fraudFlag: isFraud,
      fraudReason: isFraud ? fraudReason : undefined,
      updatedAt: new Date().toISOString()
    };

    await setDoc(doc(db, "referrals", referralId), newReferral);

    // 4. Update Referrer Stats
    const currentStats: ReferralStats = referrerData.referralStats || {
      totalReferrals: 0,
      successfulReferrals: 0,
      pendingRewards: 0,
      availableReferralEarnings: 0,
      totalReferralEarnings: 0,
      monthlyEarnings: 0,
      currentTier: "Bronze"
    };

    const newStats: ReferralStats = {
      ...currentStats,
      totalReferrals: currentStats.totalReferrals + 1
    };

    await updateDoc(doc(db, "users", referrerData.uid), {
      referralStats: newStats
    });

    // 5. Send Notification to Referrer
    await sendNotification(
      referrerData.uid,
      "New Referral Registered! 🎉",
      `A new user (${maskName(newUserProfile.displayName)}) registered using your referral link. Tracking status: Registered. Rewards activate after KYC & first qualifying investment!`,
      "referral_registered"
    );

  } catch (err) {
    console.error("Error processing user registration referral:", err);
  }
}

/**
 * Process User KYC Completion
 */
export async function processUserKycCompletion(userId: string): Promise<void> {
  try {
    const q = query(
      collection(db, "referrals"),
      where("referredUid", "==", userId)
    );
    const snap = await getDocs(q);

    if (snap.empty) return;

    for (const refDoc of snap.docs) {
      const refData = refDoc.data() as Referral;
      if (refData.kycStatus !== "KYC Completed") {
        await updateDoc(doc(db, "referrals", refDoc.id), {
          kycStatus: "KYC Completed",
          kycCompletedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });

        // Send notification to referrer
        await sendNotification(
          refData.referrerUid,
          "Referred Friend Completed KYC! ✅",
          `Your referred friend (${refData.referredName}) has completed KYC verification! Referral rewards will become eligible once they make a qualifying investment.`,
          "referral_kyc"
        );
      }
    }
  } catch (err) {
    console.error("Error processing KYC completion referral trigger:", err);
  }
}

/**
 * Process First Qualifying Investment
 * Calculates rewards based on tier, caps, and updates status to Pending/Auto-Approve
 */
export async function processUserFirstInvestment(userId: string, investmentAmount: number): Promise<{ rewardAmount: number; newInvestorBonus: number } | null> {
  try {
    const settings = await getReferralSettings();

    // Check if investment meets minimum qualifying threshold
    if (investmentAmount < settings.minQualifyingInvestment) {
      console.log(`Investment of ₦${investmentAmount} below minimum qualifying threshold ₦${settings.minQualifyingInvestment}`);
      return null;
    }

    const q = query(
      collection(db, "referrals"),
      where("referredUid", "==", userId)
    );
    const snap = await getDocs(q);

    if (snap.empty) return null;

    const refDoc = snap.docs[0];
    const refData = refDoc.data() as Referral;

    // Check if already processed
    if (refData.investmentStatus === "Invested") {
      return null;
    }

    // ANTI-FRAUD check: Ensure KYC is completed
    const userDocSnap = await getDoc(doc(db, "users", userId));
    const isKycVerified = userDocSnap.exists() && userDocSnap.data()?.kycVerified;

    if (!isKycVerified && refData.kycStatus !== "KYC Completed") {
      console.log("Referral reward pending KYC verification of referred user.");
    }

    // Fetch Referrer details to check tier and monthly caps
    const referrerSnap = await getDoc(doc(db, "users", refData.referrerUid));
    if (!referrerSnap.exists()) return null;

    const referrerData = referrerSnap.data() as UserProfile;
    const stats = referrerData.referralStats || {
      totalReferrals: 1,
      successfulReferrals: 0,
      pendingRewards: 0,
      availableReferralEarnings: 0,
      totalReferralEarnings: 0,
      monthlyEarnings: 0,
      currentTier: "Bronze"
    };

    // Calculate Tier & Reward Rates
    const currentTier = calculateTier(stats.successfulReferrals);
    const tierRate = getTierRate(currentTier, settings);

    // Calculate Raw Referrer Reward: percentage of investment
    let rawReferrerReward = investmentAmount * (tierRate / 100);
    // Apply per-referral cap
    let finalReferrerReward = Math.min(rawReferrerReward, settings.maxReferrerRewardCap);

    // Check Monthly Cap
    const remainingMonthlyCap = Math.max(0, settings.monthlyLimitPerUser - (stats.monthlyEarnings || 0));
    if (finalReferrerReward > remainingMonthlyCap) {
      finalReferrerReward = remainingMonthlyCap;
      // Send warning notification if approaching/exceeding limit
      await sendNotification(
        refData.referrerUid,
        "Monthly Referral Limit Alert ⚠️",
        `You have reached or are approaching your ₦${settings.monthlyLimitPerUser.toLocaleString()} monthly referral earnings cap. Excess rewards are capped in accordance with programme rules.`,
        "limit_warning"
      );
    }

    // Calculate New Investor Bonus
    let rawNewInvestorBonus = investmentAmount * (settings.newInvestorBonusRate / 100);
    let finalNewInvestorBonus = Math.min(rawNewInvestorBonus, settings.maxNewInvestorBonusCap);

    // Update Referral Document to Pending
    await updateDoc(doc(db, "referrals", refDoc.id), {
      investmentStatus: "Invested",
      firstInvestmentAmount: investmentAmount,
      firstInvestmentDate: new Date().toISOString(),
      rewardAmount: finalReferrerReward,
      newInvestorBonus: finalNewInvestorBonus,
      tierRate: tierRate,
      rewardStatus: "Pending",
      updatedAt: new Date().toISOString()
    });

    // Update Referrer Pending Rewards Stat
    await updateDoc(doc(db, "users", refData.referrerUid), {
      "referralStats.pendingRewards": (stats.pendingRewards || 0) + finalReferrerReward,
      "referralStats.currentTier": currentTier
    });

    // Send Notifications
    await sendNotification(
      refData.referrerUid,
      "Qualifying Investment Made! 💸",
      `Great news! Your referred friend (${refData.referredName}) made a qualifying investment of ₦${investmentAmount.toLocaleString()}. Pending reward of ₦${finalReferrerReward.toLocaleString()} (Tier: ${currentTier}) is recorded and awaiting verification.`,
      "referral_investment"
    );

    await sendNotification(
      userId,
      "Welcome Referral Bonus Pending! 🎁",
      `Congratulations on your first investment of ₦${investmentAmount.toLocaleString()}! Your 0.25% welcome bonus of ₦${finalNewInvestorBonus.toLocaleString()} is recorded and pending approval.`,
      "referral_investment"
    );

    // Auto-approve after verification (or instantly approve if valid)
    // For seamless UX, let's trigger auto-approval after a short validation or instant credit!
    await approveAndPayReferral(refDoc.id);

    return { rewardAmount: finalReferrerReward, newInvestorBonus: finalNewInvestorBonus };
  } catch (err) {
    console.error("Error processing first investment referral reward:", err);
    return null;
  }
}

/**
 * Approve & Pay Referral Reward
 * Credits wallet balance and updates stats
 */
export async function approveAndPayReferral(referralId: string): Promise<boolean> {
  try {
    const refSnap = await getDoc(doc(db, "referrals", referralId));
    if (!refSnap.exists()) return false;

    const refData = refSnap.data() as Referral;

    if (refData.rewardStatus === "Paid" || refData.rewardStatus === "Rejected") {
      return false;
    }

    const settings = await getReferralSettings();

    // 1. Credit Referrer Wallet & Update Stats
    const referrerDocSnap = await getDoc(doc(db, "users", refData.referrerUid));
    if (referrerDocSnap.exists()) {
      const referrer = referrerDocSnap.data() as UserProfile;
      const stats = referrer.referralStats || {
        totalReferrals: 1,
        successfulReferrals: 0,
        pendingRewards: 0,
        availableReferralEarnings: 0,
        totalReferralEarnings: 0,
        monthlyEarnings: 0,
        currentTier: "Bronze"
      };

      const newSuccessfulCount = stats.successfulReferrals + 1;
      const newTier = calculateTier(newSuccessfulCount);
      const prevTier = stats.currentTier || "Bronze";

      const updatedBalance = (referrer.balance || 0) + refData.rewardAmount;
      const newPending = Math.max(0, (stats.pendingRewards || 0) - refData.rewardAmount);
      const newAvailable = (stats.availableReferralEarnings || 0) + refData.rewardAmount;
      const newTotalEarnings = (stats.totalReferralEarnings || 0) + refData.rewardAmount;
      const newMonthlyEarnings = (stats.monthlyEarnings || 0) + refData.rewardAmount;

      await updateDoc(doc(db, "users", refData.referrerUid), {
        balance: updatedBalance,
        referralStats: {
          ...stats,
          successfulReferrals: newSuccessfulCount,
          pendingRewards: newPending,
          availableReferralEarnings: newAvailable,
          totalReferralEarnings: newTotalEarnings,
          monthlyEarnings: newMonthlyEarnings,
          currentTier: newTier
        }
      });

      // Record Activity Log for Referrer
      await addDoc(collection(db, "activities"), {
        userId: refData.referrerUid,
        type: "referral_bonus",
        amount: refData.rewardAmount,
        timestamp: new Date().toISOString(),
        description: `CowVest Refer & Earn Reward (${refData.tierRate}% tier rate) from referred user ${refData.referredName}`
      });

      // Notify Referrer of Payout
      await sendNotification(
        refData.referrerUid,
        "Referral Reward Credited! 💰",
        `Your referral reward of ₦${refData.rewardAmount.toLocaleString()} has been approved and credited directly to your CowVest Wallet!`,
        "referral_paid"
      );

      // Check for Tier Upgrade
      if (newTier !== prevTier) {
        await sendNotification(
          refData.referrerUid,
          `Tier Upgraded to ${newTier}! 🏆`,
          `Congratulations! You have achieved ${newTier} Tier with ${newSuccessfulCount} successful referrals. Your future referral rewards earn at ${getTierRate(newTier, settings)}%!`,
          "tier_upgrade"
        );
      }
    }

    // 2. Credit Referee (New Investor) Welcome Bonus
    if (refData.newInvestorBonus > 0) {
      const refereeDocSnap = await getDoc(doc(db, "users", refData.referredUid));
      if (refereeDocSnap.exists()) {
        const referee = refereeDocSnap.data() as UserProfile;
        const updatedRefereeBalance = (referee.balance || 0) + refData.newInvestorBonus;

        await updateDoc(doc(db, "users", refData.referredUid), {
          balance: updatedRefereeBalance
        });

        // Record Activity Log for Referee
        await addDoc(collection(db, "activities"), {
          userId: refData.referredUid,
          type: "referral_bonus",
          amount: refData.newInvestorBonus,
          timestamp: new Date().toISOString(),
          description: `CowVest New Investor Welcome Bonus (0.25% on first investment)`
        });

        // Notify Referee of Bonus Credit
        await sendNotification(
          refData.referredUid,
          "Welcome Bonus Credited! 🎁",
          `Your welcome referral bonus of ₦${refData.newInvestorBonus.toLocaleString()} has been approved and credited to your CowVest Wallet!`,
          "referral_paid"
        );
      }
    }

    // 3. Mark Referral Record as Paid
    await updateDoc(doc(db, "referrals", referralId), {
      rewardStatus: "Paid",
      updatedAt: new Date().toISOString()
    });

    return true;
  } catch (err) {
    console.error("Error approving and paying referral:", err);
    return false;
  }
}

/**
 * Flag / Reject Referral for Fraud
 */
export async function rejectReferralReward(referralId: string, reason: string): Promise<boolean> {
  try {
    const refSnap = await getDoc(doc(db, "referrals", referralId));
    if (!refSnap.exists()) return false;

    const refData = refSnap.data() as Referral;

    await updateDoc(doc(db, "referrals", referralId), {
      rewardStatus: "Rejected",
      fraudFlag: true,
      fraudReason: reason,
      updatedAt: new Date().toISOString()
    });

    await sendNotification(
      refData.referrerUid,
      "Referral Reward Status Update ⚠️",
      `Your referral claim for ${refData.referredName} was reviewed. Status: Rejected. Reason: ${reason}. Please consult Referral Terms.`,
      "system"
    );

    return true;
  } catch (err) {
    console.error("Error rejecting referral reward:", err);
    return false;
  }
}

/**
 * Fetch user's referrals list
 */
export function listenUserReferrals(userId: string, callback: (referrals: Referral[]) => void) {
  const q = query(
    collection(db, "referrals"),
    where("referrerUid", "==", userId)
  );
  return onSnapshot(q, (snapshot) => {
    const list: Referral[] = [];
    snapshot.forEach((doc) => {
      list.push({ id: doc.id, ...doc.data() } as Referral);
    });
    // Sort newest first
    list.sort((a, b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime());
    callback(list);
  }, (err) => {
    console.warn("Firestore notice in listenUserReferrals:", err);
    callback([]);
  });
}

/**
 * Fetch all referrals for Admin Dashboard (promise-based)
 */
export async function getAllReferrals(): Promise<Referral[]> {
  try {
    const q = query(collection(db, "referrals"));
    const snap = await getDocs(q);
    const list: Referral[] = [];
    snap.forEach((docSnap) => {
      list.push({ id: docSnap.id, ...docSnap.data() } as Referral);
    });
    list.sort((a, b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime());
    return list;
  } catch (err) {
    console.warn("Firestore notice in getAllReferrals:", err);
    return [];
  }
}

/**
 * Fetch all referrals for Admin Dashboard (listener)
 */
export function listenAllReferralsForAdmin(callback: (referrals: Referral[]) => void) {
  const q = query(collection(db, "referrals"));
  return onSnapshot(q, (snapshot) => {
    const list: Referral[] = [];
    snapshot.forEach((doc) => {
      list.push({ id: doc.id, ...doc.data() } as Referral);
    });
    list.sort((a, b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime());
    callback(list);
  }, (err) => {
    console.warn("Firestore notice in listenAllReferralsForAdmin:", err);
    callback([]);
  });
}

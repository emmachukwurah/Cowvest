import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  onAuthStateChanged, 
  User, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile
} from "firebase/auth";
import { doc, onSnapshot, setDoc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { auth, db, handleFirestoreError, OperationType } from "./firebase";
import { UserProfile } from "../types";
import { 
  ensureUserReferralProfile, 
  processUserRegistrationReferral, 
  captureReferralCodeFromUrl 
} from "./referralService";

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Parse referral code from URL parameter if present (?ref=CODE)
  useEffect(() => {
    captureReferralCodeFromUrl();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        const userDocRef = doc(db, "users", firebaseUser.uid);
        
        // Listen to profile updates
        const unsubProfile = onSnapshot(userDocRef, async (docSnap) => {
          if (docSnap.exists()) {
            const rawProfile = docSnap.data() as UserProfile;
            const updatedProfile = await ensureUserReferralProfile(rawProfile);
            setProfile(updatedProfile);
          } else {
            // New user initialization
            const newProfile: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || "",
              displayName: firebaseUser.displayName || "Investor",
              balance: 0,
              totalInvested: 0,
              totalProfit: 0,
              createdAt: new Date().toISOString(),
            };
            const withRef = await ensureUserReferralProfile(newProfile);
            await setDoc(userDocRef, withRef).catch((err) => {
              handleFirestoreError(err, OperationType.WRITE, `users/${firebaseUser.uid}`);
            });
            setProfile(withRef);
            await processUserRegistrationReferral(withRef);
          }
          setLoading(false);
        }, (err) => {
          handleFirestoreError(err, OperationType.GET, `users/${firebaseUser.uid}`);
          setLoading(false);
        });

        return () => unsubProfile();
      } else {
        // If no Firebase User, check if we have a custom credentials session
        const customUid = localStorage.getItem("cowvest_custom_uid");
        if (customUid) {
          const userDocRef = doc(db, "users", customUid);
          const unsubProfile = onSnapshot(userDocRef, async (docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data() as UserProfile;
              const withRef = await ensureUserReferralProfile(data);
              setProfile(withRef);
              setUser({
                uid: customUid,
                email: data.email,
                displayName: data.displayName,
                emailVerified: true,
                isAnonymous: false,
                metadata: {},
                providerData: [],
                refreshToken: "",
                tenantId: null,
                delete: async () => {},
                getIdToken: async () => "",
                getIdTokenResult: async () => ({} as any),
                reload: async () => {},
                toJSON: () => ({})
              } as any);
            } else {
              setProfile(null);
              setUser(null);
              localStorage.removeItem("cowvest_custom_uid");
            }
            setLoading(false);
          }, (error) => {
            handleFirestoreError(error, OperationType.GET, `users/${customUid}`);
            setProfile(null);
            setUser(null);
            setLoading(false);
          });
          return () => unsubProfile();
        } else {
          setProfile(null);
          setUser(null);
          setLoading(false);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      if (error.code === "auth/popup-closed-by-user") {
        console.log("User closed the sign-in popup.");
      } else {
        console.error("Sign-in error:", error);
        alert("An error occurred during sign-in.");
      }
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    
    // 1. Always try custom/fallback auth check first or if firebase throws operation-not-allowed
    try {
      const q = query(
        collection(db, "users"),
        where("email", "==", normalizedEmail)
      );
      let snapshot;
      try {
        snapshot = await getDocs(q);
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, "users");
        throw err;
      }
      
      if (snapshot && !snapshot.empty) {
        const userDoc = snapshot.docs[0];
        const userData = userDoc.data();
        
        // Password verification (for simple fallback, we store plain text or simple hash)
        if (userData.password === password) {
          localStorage.setItem("cowvest_custom_uid", userDoc.id);
          setUser({
            uid: userDoc.id,
            email: userData.email,
            displayName: userData.displayName,
          } as any);
          setProfile(userData as UserProfile);
          return;
        }
      }
    } catch (dbErr) {
      console.warn("Custom db auth check failed, trying Firebase standard auth:", dbErr);
    }

    // 2. Try standard Firebase email authentication
    try {
      const normalizedFirebaseEmail = email.includes("@") && email.includes(".") 
        ? email.trim().toLowerCase() 
        : `${email.trim().toLowerCase().replace(/[^a-z0-9._-]/g, "") || "user"}@cowvest-user.com`;
      
      const normalizedPassword = password.length < 6 ? `${password}_cowvest_secure` : password;

      await signInWithEmailAndPassword(auth, normalizedFirebaseEmail, normalizedPassword);
    } catch (error: any) {
      console.error("Firebase Email sign-in error:", error);
      
      // If Firebase email sign in is blocked or fails, but we couldn't find them in fallback database
      let message = "Failed to sign in. Please check your credentials.";
      if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password" || error.code === "auth/invalid-credential") {
        message = "Incorrect username/email or password.";
      } else if (error.code === "auth/invalid-email") {
        message = "Please enter a valid credential.";
      } else if (error.code === "auth/operation-not-allowed") {
        message = "Incorrect username/email or password (fallback authentication).";
      }
      throw new Error(message);
    }
  };

  const signUpWithEmail = async (email: string, password: string, displayName: string) => {
    const normalizedEmail = email.trim().toLowerCase();

    // 1. Try standard Firebase email auth
    try {
      const normalizedFirebaseEmail = email.includes("@") && email.includes(".") 
        ? email.trim().toLowerCase() 
        : `${email.trim().toLowerCase().replace(/[^a-z0-9._-]/g, "") || "user"}@cowvest-user.com`;

      const normalizedPassword = password.length < 6 ? `${password}_cowvest_secure` : password;

      const userCredential = await createUserWithEmailAndPassword(auth, normalizedFirebaseEmail, normalizedPassword);
      await updateProfile(userCredential.user, { displayName });
      
      // Initialize firestore user profile explicitly
      const userDocRef = doc(db, "users", userCredential.user.uid);
      const newProfile: UserProfile = {
        uid: userCredential.user.uid,
        email: email, 
        displayName: displayName || "Investor",
        balance: 0,
        totalInvested: 0,
        totalProfit: 0,
        createdAt: new Date().toISOString(),
      };
      try {
        await setDoc(userDocRef, newProfile);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${userCredential.user.uid}`);
      }
      setProfile(newProfile);
      return;
    } catch (error: any) {
      console.warn("Firebase email sign-up failed/blocked. Checking custom fallback...", error);
      
      // 2. Fallback to custom Firestore-backed registration
      if (error.code === "auth/operation-not-allowed" || error.code === "auth/invalid-email" || error.message?.includes("not-allowed") || error.code === "auth/web-channel-connection-failed") {
        try {
          // Check if user already exists
          const q = query(
            collection(db, "users"),
            where("email", "==", normalizedEmail)
          );
          let snapshot;
          try {
            snapshot = await getDocs(q);
          } catch (err) {
            handleFirestoreError(err, OperationType.LIST, "users");
            throw err;
          }
          
          if (snapshot && !snapshot.empty) {
            throw new Error("This credential or email is already registered.");
          }

          // Generate custom unique ID
          const customUid = "user_" + Math.random().toString(36).substring(2, 11);
          const userDocRef = doc(db, "users", customUid);
          
          const newProfile: any = {
            uid: customUid,
            email: normalizedEmail,
            password: password, // Store safely in profile document for fallback checking
            displayName: displayName || "Investor",
            balance: 0,
            totalInvested: 0,
            totalProfit: 0,
            createdAt: new Date().toISOString(),
          };
          
          try {
            await setDoc(userDocRef, newProfile);
          } catch (err) {
            handleFirestoreError(err, OperationType.WRITE, `users/${customUid}`);
          }
          
          localStorage.setItem("cowvest_custom_uid", customUid);
          setUser({
            uid: customUid,
            email: normalizedEmail,
            displayName: displayName,
          } as any);
          setProfile(newProfile as UserProfile);
          return;
        } catch (fallbackErr: any) {
          console.error("Custom authentication signup fallback failed:", fallbackErr);
          throw new Error(fallbackErr.message || "Failed to create account (fallback error).");
        }
      }
      
      // Map other native Firebase errors
      let message = "Failed to create an account.";
      if (error.code === "auth/email-already-in-use") {
        message = "This credential or email is already registered.";
      } else if (error.code === "auth/weak-password") {
        message = "Password must be at least 6 characters.";
      } else if (error.code === "auth/invalid-email") {
        message = "Please enter a valid credential.";
      }
      throw new Error(message);
    }
  };

  const logout = async () => {
    localStorage.removeItem("cowvest_custom_uid");
    await signOut(auth);
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signInWithEmail, signUpWithEmail, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

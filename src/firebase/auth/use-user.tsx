'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { User, onAuthStateChanged, getRedirectResult } from 'firebase/auth';
import { useAuth, useFirestore } from '../provider';
import { doc, onSnapshot, setDoc, getDoc, updateDoc } from 'firebase/firestore';

interface ProfileContextType {
  user: User | null;
  profile: any | null;
  loading: boolean;
  initialized: boolean;
}

const ProfileContext = createContext<ProfileContextType>({
  user: null,
  profile: null,
  loading: true,
  initialized: false,
});

/**
 * ProfileProvider - Master Identity Manager
 * Handles global auth state, persistence restoration, and Google Redirect results.
 */
export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const db = useFirestore();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // AUTH LIFECYCLE & REDIRECT HANDLING
  useEffect(() => {
    let isMounted = true;
    console.log("[Auth] 🛡️ Identity initialization sequence started...");

    // 1. Listen for auth state changes (Persistence restoration)
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (!isMounted) return;
      console.log("[Auth] 👤 State Change:", firebaseUser ? `Logged in as ${firebaseUser.email}` : "No active session");
      setUser(firebaseUser);
      
      // If we are not in a redirect flow, this will be the primary source of 'user'
      if (!firebaseUser) {
        setProfile(null);
      }
    });

    // 2. Process Redirect Results (The "Google Login" return)
    const processRedirect = async () => {
      try {
        console.log("[Auth] 🔄 Checking for Google redirect result...");
        const result = await getRedirectResult(auth);
        
        if (result?.user && isMounted) {
          console.log("[Auth] ✅ Redirect success for:", result.user.email);
          const uid = result.user.uid;
          const userDocRef = doc(db, 'users', uid);
          const userSnap = await getDoc(userDocRef);
          
          if (!userSnap.exists()) {
            console.log("[Auth] 📝 Creating new profile for Google user...");
            await setDoc(userDocRef, {
              uid,
              fullName: result.user.displayName || 'Member',
              email: result.user.email || '',
              role: 'user',
              lifetimeSpend: 0,
              currentRank: 'Warrior',
              rankId: 'warrior',
              createdAt: new Date().toISOString(),
              authProvider: 'google.com'
            });
          }
        } else {
          console.log("[Auth] ℹ️ No pending redirect result found.");
        }
      } catch (error: any) {
        console.error("[Auth] ❌ Redirect error:", error.code, error.message);
      } finally {
        if (isMounted) {
          console.log("[Auth] 🏁 Initialization complete.");
          setInitialized(true);
        }
      }
    };

    processRedirect();

    return () => {
      isMounted = false;
      unsubscribeAuth();
    };
  }, [auth, db]);

  // PROFILE SNAPSHOT LISTENER
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const userDocRef = doc(db, 'users', user.uid);
    
    const unsubscribeProfile = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        
        // Immediate local rank expiry check
        if (data.rankExpiry && data.rankId !== 'warrior') {
          const now = new Date();
          const expiry = new Date(data.rankExpiry);
          if (now > expiry) {
            updateDoc(userDocRef, {
              currentRank: 'Warrior',
              rankId: 'warrior',
              rankExpiry: null,
              updatedAt: new Date().toISOString()
            });
            return;
          }
        }
        setProfile(data);
      } else {
        // Fallback profile creation for edge cases
        const newProfile = {
          uid: user.uid,
          fullName: user.displayName || 'Member',
          email: user.email!,
          role: 'user',
          lifetimeSpend: 0,
          currentRank: 'Warrior',
          rankId: 'warrior',
          createdAt: new Date().toISOString(),
        };
        setDoc(userDocRef, newProfile).catch(() => {});
      }
      setLoading(false);
    }, (err) => {
      console.error("[Auth] Profile sync error:", err);
      setLoading(false);
    });

    return () => unsubscribeProfile();
  }, [user, db]);

  const value = useMemo(() => ({ user, profile, loading, initialized }), [user, profile, loading, initialized]);

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useUser() {
  return useContext(ProfileContext);
}

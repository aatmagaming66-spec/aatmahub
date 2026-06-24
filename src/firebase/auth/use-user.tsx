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
 * ProfileProvider - Master Identity & Session Manager
 * Optimized for Redirect Auth and Session Persistence.
 */
export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const db = useFirestore();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // AUTH LIFECYCLE: REDIRECT -> SESSION RESTORE -> PROFILE SYNC
  useEffect(() => {
    let isMounted = true;
    console.log("[Auth] 🛡️ Initializing Master Identity Layer...");

    const initAuth = async () => {
      try {
        // 1. Check for Google Redirect Result FIRST
        // This is critical when returning from accounts.google.com
        console.log("[Auth] 🔄 Checking for Google redirect outcome...");
        const result = await getRedirectResult(auth);
        
        if (result?.user && isMounted) {
          console.log("[Auth] ✅ Google redirect confirmed user:", result.user.email);
          const uid = result.user.uid;
          const userDocRef = doc(db, 'users', uid);
          const userSnap = await getDoc(userDocRef);
          
          if (!userSnap.exists()) {
            console.log("[Auth] 📝 Syncing new Google profile to Firestore...");
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
        }

        // 2. Wait for the persistent session listener to fire at least once
        // This ensures u is accurate (either non-null from persistence or null if signed out)
        await new Promise<void>((resolve) => {
          const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            if (isMounted) {
              console.log("[Auth] 👤 Session Restored:", firebaseUser ? firebaseUser.email : "No active session");
              setUser(firebaseUser);
            }
            unsubscribe();
            resolve();
          });
        });

      } catch (error: any) {
        console.error("[Auth] ❌ Initialization failure:", error.code, error.message);
      } finally {
        if (isMounted) {
          console.log("[Auth] 🏁 Authentication lifecycle settled.");
          setInitialized(true);
        }
      }
    };

    initAuth();

    // 3. Permanent listener for state changes (logouts, etc)
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (isMounted) setUser(firebaseUser);
      if (!firebaseUser && isMounted) {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      unsubscribeAuth();
    };
  }, [auth, db]);

  // PROFILE SNAPSHOT: Fires only after user is confirmed and app is initialized
  useEffect(() => {
    if (!user || !initialized) {
      if (initialized && !user) setLoading(false);
      return;
    }

    setLoading(true);
    const userDocRef = doc(db, 'users', user.uid);
    
    const unsubscribeProfile = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        
        // Immediate Rank Expiry Check
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
        // Fallback for missing profile
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
      console.error("[Auth] Profile listener error:", err);
      setLoading(false);
    });

    return () => unsubscribeProfile();
  }, [user, initialized, db]);

  const value = useMemo(() => ({ 
    user, 
    profile, 
    loading: loading || !initialized, 
    initialized 
  }), [user, profile, loading, initialized]);

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useUser() {
  return useContext(ProfileContext);
}

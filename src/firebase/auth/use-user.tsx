'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { User, onAuthStateChanged, getRedirectResult } from 'firebase/auth';
import { useAuth, useFirestore } from '../provider';
import { doc, onSnapshot, setDoc, updateDoc, getDoc } from 'firebase/firestore';

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
 * ProfileProvider - Dynamic Membership Backend
 * Refactored to handle Google Redirects centrally to prevent login loops.
 */
export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const db = useFirestore();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Initialize Auth and handle Redirects
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        // 1. Check if we just returned from a Google Redirect
        const result = await getRedirectResult(auth);
        if (result?.user && isMounted) {
          const uid = result.user.uid;
          const userDocRef = doc(db, 'users', uid);
          const userSnap = await getDoc(userDocRef);
          
          if (!userSnap.exists()) {
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
      } catch (error) {
        console.error("[Auth] Redirect processing error:", error);
      }

      // 2. Start the main Auth State Listener
      const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
        if (isMounted) {
          setUser(firebaseUser);
          // Only mark as initialized once we've checked the redirect AND the current state
          setInitialized(true);
          if (!firebaseUser) {
            setProfile(null);
            setLoading(false);
          }
        }
      });

      return unsubscribeAuth;
    };

    const cleanupPromise = initAuth();

    return () => {
      isMounted = false;
      cleanupPromise.then(unsubscribe => unsubscribe && typeof unsubscribe === 'function' && unsubscribe());
    };
  }, [auth, db]);

  // Profile Snapshot Listener
  useEffect(() => {
    if (!user) return;

    const userDocRef = doc(db, 'users', user.uid);
    
    const unsubscribeProfile = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        
        // BACKEND RANK SYNC: Immediate local expiry check
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
        // Create profile if standard email login happened but no doc exists
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
    }, () => {
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

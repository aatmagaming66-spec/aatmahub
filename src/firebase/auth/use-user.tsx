'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { useAuth, useFirestore } from '../provider';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

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
 * ProfileProvider - Stable Shell Refactor
 * Ensures {children} are ALWAYS rendered immediately to prevent navigation "blank flashes".
 * Auth and Profile hydration happens optimistically in the background.
 */
export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const db = useFirestore();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Stage 1: Detect Auth Session (Immediate logic-only)
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      // We signal initialized immediately on the first check to unlock the UI shell
      setInitialized(true);
      
      if (!firebaseUser) {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, [auth]);

  useEffect(() => {
    if (!user) return;

    const userDocRef = doc(db, 'users', user.uid);
    
    // Stage 2: Background Profile Hydration
    const unsubscribeProfile = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setProfile(docSnap.data());
      } else {
        const newProfile = {
          uid: user.uid,
          fullName: user.displayName || 'Aatma Member',
          email: user.email!,
          role: 'user',
          lifetimeSpend: 0,
          currentRank: 'Warrior',
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
      {/* 
        CRITICAL: We render children immediately. 
        Pages handle their own skeleton states internally to prevent a blank full-page flash.
      */}
      {children}
    </ProfileContext.Provider>
  );
}

export function useUser() {
  return useContext(ProfileContext);
}

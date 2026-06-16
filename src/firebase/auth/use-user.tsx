'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { useAuth, useFirestore } from '../provider';
import { doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';

export interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  photoURL?: string;
  role: 'user' | 'admin' | 'super_admin';
  lifetimeSpend: number;
  currentRank: string;
  rankId: string;
  createdAt: string;
  active?: boolean;
  permissions?: string[];
  banned?: boolean;
  notifications?: {
    orderUpdates: boolean;
    walletUpdates: boolean;
    promotional: boolean;
    securityAlerts: boolean;
  };
}

interface ProfileContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  initialized: boolean;
}

const ProfileContext = createContext<ProfileContextType>({
  user: null,
  profile: null,
  loading: true,
  initialized: false,
});

const SUPER_ADMIN_EMAIL = 'aatmagaming66@gmail.com';
const SUPER_ADMIN_UID = 'iDeDaksq2hUmkyyIxvlNHgvb2y43';

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const db = useFirestore();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // 1. Auth Handshake (Identity Determination)
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      console.log('[PROFILE_PROVIDER] Auth resolved:', firebaseUser?.uid || 'Guest');
      setUser(firebaseUser);
      setInitialized(true);
      
      // If no user, we are definitively not loading a profile
      if (!firebaseUser) {
        setProfile(null);
        setLoading(false);
      }
    });

    // 2. Hard timeout for initialization (Fail-safe)
    const failSafe = setTimeout(() => {
      setInitialized(true);
      setLoading(false);
    }, 3000);

    return () => {
      unsubscribeAuth();
      clearTimeout(failSafe);
    };
  }, [auth]);

  useEffect(() => {
    if (!user) return;

    // 3. Profile Hydration (Background Async)
    console.log('[PROFILE_PROVIDER] Syncing profile document...');
    const userDocRef = doc(db, 'users', user.uid);
    const unsubscribeProfile = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as UserProfile;
        
        // Auto-promote Super Admins
        const isSuperAdminTarget = user.uid === SUPER_ADMIN_UID || user.email?.toLowerCase() === SUPER_ADMIN_EMAIL;
        if (isSuperAdminTarget && data.role !== 'super_admin') {
           updateDoc(userDocRef, { role: 'super_admin', active: true, permissions: ['all'] }).catch(() => {});
        }
        
        setProfile(data);
        console.log('[PROFILE_PROVIDER] Profile document hydrated.');
      } else {
        // Handle new user profile creation if it doesn't exist
        const isSuperAdminTarget = user.uid === SUPER_ADMIN_UID || user.email?.toLowerCase() === SUPER_ADMIN_EMAIL;
        const newProfile: UserProfile = {
          uid: user.uid,
          fullName: user.displayName || (isSuperAdminTarget ? 'Super Admin' : 'Aatma Member'),
          email: user.email!,
          role: isSuperAdminTarget ? 'super_admin' : 'user',
          active: isSuperAdminTarget,
          permissions: isSuperAdminTarget ? ['all'] : [],
          lifetimeSpend: 0,
          currentRank: 'Warrior',
          rankId: 'warrior',
          createdAt: new Date().toISOString(),
          notifications: {
            orderUpdates: true,
            walletUpdates: true,
            promotional: false,
            securityAlerts: true
          }
        };
        setDoc(userDocRef, newProfile).catch(() => {});
      }
      setLoading(false);
    }, (error) => {
      console.error('[PROFILE_PROVIDER] Error syncing profile:', error);
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
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a ProfileProvider');
  }
  return context;
}

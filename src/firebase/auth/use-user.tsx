'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { useAuth, useFirestore } from '../provider';
import { doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';

export interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  role: 'user' | 'admin' | 'super_admin';
  lifetimeSpend: number;
  currentRank: string;
  rankId: string;
  createdAt: string;
  active?: boolean;
  permissions?: string[];
  banned?: boolean;
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

  // 1. Auth Listener - Resolved Identity DETERMINES INITIALIZED STATE
  useEffect(() => {
    console.log('[PERF_HUB] Auth Listener Initializing...');
    
    // Fail-safe timeout to prevent UI freeze
    const failSafe = setTimeout(() => {
      setLoading(false);
      setInitialized(true);
    }, 3000);

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      clearTimeout(failSafe);
      console.log('[PERF_HUB] Auth Resolved:', firebaseUser ? `UID: ${firebaseUser.uid}` : 'Guest');
      
      setUser(firebaseUser);
      setInitialized(true); 
      
      // If no user, we are done loading immediately
      if (!firebaseUser) {
        setProfile(null);
        setLoading(false);
      } else {
        // If user exists, we set loading to false so UI shows "ACCOUNT"
        // Profile will hydrate in the background
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      clearTimeout(failSafe);
    };
  }, [auth]);

  // 2. Profile Listener - Hydrates Data in Background ASYNCHRONOUSLY
  useEffect(() => {
    if (!user) return;

    console.log('[PERF_HUB] Background Profile Hydration Started:', user.uid);
    const userDocRef = doc(db, 'users', user.uid);
    
    const unsubscribeProfile = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as UserProfile;
        
        // Handle Admin Sync logic silently
        const isSuperAdminTarget = user.uid === SUPER_ADMIN_UID || user.email?.toLowerCase() === SUPER_ADMIN_EMAIL;
        if (isSuperAdminTarget && data.role !== 'super_admin') {
           updateDoc(userDocRef, { role: 'super_admin', active: true, permissions: ['all'] }).catch(() => {});
        }

        setProfile(data);
      } else {
        // Create profile if missing, but don't block UI
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
        };
        setDoc(userDocRef, newProfile).catch(() => {});
      }
    }, (error) => {
      console.error('[PERF_HUB] Profile background sync error:', error);
    });

    return () => unsubscribeProfile();
  }, [user, db]);

  return (
    <ProfileContext.Provider value={{ user, profile, loading, initialized }}>
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

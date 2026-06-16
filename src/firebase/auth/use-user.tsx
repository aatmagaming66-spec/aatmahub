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

  useEffect(() => {
    console.log('[PERF_HUB] Auth Listener Initializing...');
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      console.log('[PERF_HUB] Auth State Resolved:', firebaseUser ? `UID: ${firebaseUser.uid}` : 'Guest Session');
      
      setUser(firebaseUser);
      
      // CRITICAL FIX: Resolve loading/initialized as soon as Auth is confirmed.
      // This prevents the UI from hanging while waiting for the profile fetch.
      if (!firebaseUser) {
        setProfile(null);
        setLoading(false);
        setInitialized(true);
      } else {
        // We have a user, but profile is still fetching. 
        // We set initialized true so the UI can render the 'Account' state.
        setInitialized(true);
      }
    });

    return () => unsubscribeAuth();
  }, [auth]);

  useEffect(() => {
    if (!user) return;

    console.log('[PERF_HUB] Profile Listener Initializing for:', user.uid);
    const userDocRef = doc(db, 'users', user.uid);
    
    const unsubscribeProfile = onSnapshot(userDocRef, (docSnap) => {
      console.log('[PERF_HUB] Profile Snapshot Received');
      
      if (docSnap.exists()) {
        const data = docSnap.data() as UserProfile;
        const isSuperAdminTarget = user.uid === SUPER_ADMIN_UID || user.email?.toLowerCase() === SUPER_ADMIN_EMAIL;
        
        const updatePayload: Partial<UserProfile> = {};
        let needsUpdate = false;

        if (isSuperAdminTarget && data.role !== 'super_admin') {
           updatePayload.role = 'super_admin';
           updatePayload.active = true;
           updatePayload.permissions = ['all'];
           needsUpdate = true;
        }

        if (data.lifetimeSpend === undefined || data.currentRank === undefined || data.rankId === undefined) {
           updatePayload.lifetimeSpend = data.lifetimeSpend ?? 0;
           updatePayload.currentRank = data.currentRank ?? 'Warrior';
           updatePayload.rankId = data.rankId ?? 'warrior';
           needsUpdate = true;
        }

        if (needsUpdate) {
          console.log('[PERF_HUB] Syncing Profile Schema Defaults...');
          updateDoc(userDocRef, updatePayload).catch(e => console.error('Silent update failure', e));
        }
        
        setProfile({ ...data, ...updatePayload });
      } else {
        console.log('[PERF_HUB] Creating New User Profile...');
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
        setDoc(userDocRef, newProfile).catch(e => console.error('Silent create failure', e));
      }
      
      setLoading(false);
      setInitialized(true);
    }, (error) => {
      console.error(`[PERF_HUB] Profile Read Error:`, error);
      setLoading(false);
      setInitialized(true);
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

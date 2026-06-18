'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { useAuth, useFirestore } from '../provider';
import { doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';

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

const SUPER_ADMIN_EMAIL = 'aatmagaming66@gmail.com';
const SUPER_ADMIN_UID = 'iDeDaksq2hUmkyyIxvlNHgvb2y43';

/**
 * ProfileProvider - Optimized for zero-block rendering.
 * Sets initialized: true as soon as the Auth state is determined,
 * allowing the UI to mount immediately with background profile hydration.
 */
export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const db = useFirestore();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Initial handshake with Firebase Auth - HIGH PRIORITY
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      // PERFORMANCE: Signal that we know the auth state so UI can render immediately
      // This is the key to fixing the first-click delay.
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
    
    // Non-blocking background hydration
    const unsubscribeProfile = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const isSuperAdminTarget = user.uid === SUPER_ADMIN_UID || user.email?.toLowerCase() === SUPER_ADMIN_EMAIL;
        
        if (isSuperAdminTarget && data.role !== 'super_admin') {
           updateDoc(userDocRef, { 
             role: 'super_admin', 
             active: true,
             updatedAt: new Date().toISOString()
           }).catch(() => {});
        }
        setProfile(data);
      } else {
        const isSuperAdminTarget = user.uid === SUPER_ADMIN_UID || user.email?.toLowerCase() === SUPER_ADMIN_EMAIL;
        const newProfile = {
          uid: user.uid,
          fullName: user.displayName || (isSuperAdminTarget ? 'Super Admin' : 'Aatma Member'),
          email: user.email!,
          role: isSuperAdminTarget ? 'super_admin' : 'user',
          lifetimeSpend: 0,
          currentRank: 'Warrior',
          createdAt: new Date().toISOString(),
        };
        setDoc(userDocRef, newProfile).catch(() => {});
      }
      setLoading(false);
    }, (error) => {
      console.error('[AUTH_SYNC] Background hydration failed', error);
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

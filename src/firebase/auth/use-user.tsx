'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { User, onAuthStateChanged, getRedirectResult, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { useAuth, useFirestore } from '../provider';
import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';

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

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const db = useFirestore();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    const initAuth = async () => {
      try {
        await setPersistence(auth, browserLocalPersistence);
        const result = await getRedirectResult(auth).catch(() => null);
        
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
              createdAt: new Date().toISOString(),
              authProvider: 'google.com'
            });
          }
        }

        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
          if (isMounted) {
            setUser(firebaseUser);
            setInitialized(true);
            if (!firebaseUser) setLoading(false);
          }
        });

        return () => unsubscribe();

      } catch (error) {
        if (isMounted) {
          setInitialized(true);
          setLoading(false);
        }
      }
    };

    initAuth();
    return () => { isMounted = false; };
  }, [auth, db]);

  useEffect(() => {
    if (!user || !initialized) return;

    setLoading(true);
    const userDocRef = doc(db, 'users', user.uid);
    
    const unsubscribeProfile = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setProfile(docSnap.data());
      } else {
        const newProfile = {
          uid: user.uid,
          fullName: user.displayName || 'Member',
          email: user.email!,
          role: 'user',
          lifetimeSpend: 0,
          createdAt: new Date().toISOString(),
        };
        setDoc(userDocRef, newProfile).catch(() => {});
      }
      setLoading(false);
    }, () => {
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
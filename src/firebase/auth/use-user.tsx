'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { User, onAuthStateChanged, setPersistence, browserLocalPersistence } from 'firebase/auth';
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
    if (!user || !initialized) {
      setProfile(null);
      return;
    }

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

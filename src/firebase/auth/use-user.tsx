'use client';

import { useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { useAuth } from '../provider';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { useFirestore } from '../provider';

export interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  role: 'user' | 'admin' | 'super_admin';
  createdAt: string;
  active?: boolean;
  permissions?: string[];
}

const SUPER_ADMIN_EMAIL = 'aatmagaming66@gmail.com';
const SUPER_ADMIN_UID = 'iDeDaksq2hUmkyyIxvlNHgvb2y43';

export function useUser() {
  const auth = useAuth();
  const db = useFirestore();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
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
    const unsubscribeProfile = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as UserProfile;
        
        // Auto-elevate to super_admin if UID or Email matches and role is different
        const isSuperAdmin = user.uid === SUPER_ADMIN_UID || user.email?.toLowerCase() === SUPER_ADMIN_EMAIL;
        
        if (isSuperAdmin && data.role !== 'super_admin') {
           setDoc(userDocRef, { 
             role: 'super_admin',
             active: true,
             permissions: ['all']
           }, { merge: true });
        }
        
        setProfile(data);
      } else {
        // If document doesn't exist but it's the super admin UID or email, create it
        const isSuperAdmin = user.uid === SUPER_ADMIN_UID || user.email?.toLowerCase() === SUPER_ADMIN_EMAIL;
        
        if (isSuperAdmin) {
          const newProfile: UserProfile = {
            uid: user.uid,
            fullName: user.displayName || 'Super Admin',
            email: user.email!,
            role: 'super_admin',
            active: true,
            permissions: ['all'],
            createdAt: new Date().toISOString(),
          };
          setDoc(userDocRef, newProfile);
        }
      }
      setLoading(false);
    }, (error) => {
      setLoading(false);
    });

    return () => unsubscribeProfile();
  }, [user, db]);

  return { user, profile, loading };
}

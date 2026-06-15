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
  banned?: boolean;
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
      if (firebaseUser) {
        console.log(`[Admin Audit] Auth Detected: UID=${firebaseUser.uid} Email=${firebaseUser.email}`);
      } else {
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
        
        // Auto-elevate to super_admin if UID or Email matches
        const isSuperAdminTarget = user.uid === SUPER_ADMIN_UID || user.email?.toLowerCase() === SUPER_ADMIN_EMAIL;
        
        if (isSuperAdminTarget && data.role !== 'super_admin') {
           console.warn(`[Admin Audit] Target UID detected. Elevating to super_admin role.`);
           setDoc(userDocRef, { 
             role: 'super_admin',
             active: true,
             permissions: ['all']
           }, { merge: true });
        }
        
        console.log(`[Admin Audit] Profile Loaded: ROLE=${data.role}`);
        setProfile(data);
      } else {
        const isSuperAdminTarget = user.uid === SUPER_ADMIN_UID || user.email?.toLowerCase() === SUPER_ADMIN_EMAIL;
        
        if (isSuperAdminTarget) {
          console.warn(`[Admin Audit] Super Admin document missing. Initializing registry...`);
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
      console.error(`[Admin Audit] Firestore Read Failure:`, error);
      setLoading(false);
    });

    return () => unsubscribeProfile();
  }, [user, db]);

  return { user, profile, loading };
}

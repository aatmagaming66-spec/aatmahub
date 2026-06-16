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
    // 1. Listen for Auth State
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      
      if (!firebaseUser) {
        setProfile(null);
        setLoading(false);
        console.log('[Admin Audit] No Session Detected.');
      } else {
        console.log(`[Admin Audit] Auth Detected: UID=${firebaseUser.uid}`);
      }
    });

    return () => unsubscribeAuth();
  }, [auth]);

  useEffect(() => {
    if (!user) return;

    // 2. Listen for Profile Changes
    const userDocRef = doc(db, 'users', user.uid);
    const unsubscribeProfile = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as UserProfile;
        
        // Auto-elevate to super_admin if UID or Email matches
        const isSuperAdminTarget = user.uid === SUPER_ADMIN_UID || user.email?.toLowerCase() === SUPER_ADMIN_EMAIL;
        
        if (isSuperAdminTarget && data.role !== 'super_admin') {
           console.warn(`[Admin Audit] Super Admin UID detected. Elevating role in registry...`);
           setDoc(userDocRef, { 
             role: 'super_admin',
             active: true,
             permissions: ['all']
           }, { merge: true });
        }
        
        console.log(`[Admin Audit] Role Verified: ${data.role}`);
        setProfile(data);
      } else {
        // Handle new Super Admin auto-initialization
        const isSuperAdminTarget = user.uid === SUPER_ADMIN_UID || user.email?.toLowerCase() === SUPER_ADMIN_EMAIL;
        
        if (isSuperAdminTarget) {
          console.warn(`[Admin Audit] New Super Admin initialization sequence started.`);
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
      console.error(`[Admin Audit] Firestore Read Error:`, error);
      setLoading(false);
    });

    return () => unsubscribeProfile();
  }, [user, db]);

  return { user, profile, loading };
}

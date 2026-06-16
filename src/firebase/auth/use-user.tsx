
'use client';

import { useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { useAuth } from '../provider';
import { doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { useFirestore } from '../provider';

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
        
        const updatePayload: Partial<UserProfile> = {};
        let needsUpdate = false;

        if (isSuperAdminTarget && data.role !== 'super_admin') {
           console.warn(`[Admin Audit] Super Admin UID detected. Elevating role in registry...`);
           updatePayload.role = 'super_admin';
           updatePayload.active = true;
           updatePayload.permissions = ['all'];
           needsUpdate = true;
        }

        // Initialize Membership Persistence Fields if missing
        if (data.lifetimeSpend === undefined || data.currentRank === undefined || data.rankId === undefined) {
           updatePayload.lifetimeSpend = data.lifetimeSpend ?? 0;
           updatePayload.currentRank = data.currentRank ?? 'Warrior';
           updatePayload.rankId = data.rankId ?? 'warrior';
           needsUpdate = true;
        }

        if (needsUpdate) {
          updateDoc(userDocRef, updatePayload);
        }
        
        console.log(`[Admin Audit] Role Verified: ${data.role}`);
        setProfile({ ...data, ...updatePayload });
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
            lifetimeSpend: 0,
            currentRank: 'Warrior',
            rankId: 'warrior',
            createdAt: new Date().toISOString(),
          };
          setDoc(userDocRef, newProfile);
        } else {
          // Default profile for new users if doc doesn't exist
          const newProfile: Partial<UserProfile> = {
            uid: user.uid,
            fullName: user.displayName || 'Aatma Member',
            email: user.email!,
            role: 'user',
            lifetimeSpend: 0,
            currentRank: 'Warrior',
            rankId: 'warrior',
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

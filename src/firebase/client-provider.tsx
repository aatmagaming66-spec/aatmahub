'use client';

import React, { useMemo } from 'react';
import { initializeFirebase } from './init';
import { FirebaseProvider } from './provider';
import { ProfileProvider } from './auth/use-user';
import { SettingsProvider } from './settings-context';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

export function FirebaseClientProvider({ children }: { children: React.ReactNode }) {
  const { app, auth, db, storage } = useMemo(() => initializeFirebase(), []);

  return (
    <FirebaseProvider app={app} auth={auth} db={db} storage={storage}>
      <SettingsProvider>
        <ProfileProvider>
          <FirebaseErrorListener />
          {children}
        </ProfileProvider>
      </SettingsProvider>
    </FirebaseProvider>
  );
}

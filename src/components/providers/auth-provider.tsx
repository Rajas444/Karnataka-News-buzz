
"use client";

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { UserProfile, UserRole } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  userRole: UserRole | null;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  userRole: null,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('[AuthProvider] onAuthStateChanged triggered. User:', user?.email);
      setLoading(true);
      if (user) {
        setUser(user);
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const profile = userDoc.data() as UserProfile;
          console.log('[AuthProvider] User profile found:', profile);
          setUserProfile(profile);
          setUserRole(profile.role);
        } else {
          console.log('[AuthProvider] No user profile found in Firestore. Creating default.');
          // For this scaffold, we assume a default role of 'user' if no profile exists.
          // In a real app, you might want to create a profile here or handle it differently.
          const defaultProfile: UserProfile = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            role: 'user',
          };
          setUserProfile(defaultProfile);
          setUserRole('user');
        }
      } else {
        console.log('[AuthProvider] No user is logged in.');
        setUser(null);
        setUserProfile(null);
        setUserRole(null);
      }
      console.log('[AuthProvider] Auth state loading finished.');
      setLoading(false);
    });

    return () => {
        console.log('[AuthProvider] Unsubscribing from onAuthStateChanged.');
        unsubscribe();
    }
  }, []);

  const value = { user, userProfile, loading, userRole };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

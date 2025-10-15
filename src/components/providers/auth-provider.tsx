
"use client";

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getUser } from '@/services/users';
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
      setLoading(true);
      if (user) {
        setUser(user);
        try {
          const profile = await getUser(user.uid);
          if (profile) {
            setUserProfile(profile);
            setUserRole(profile.role);
          } else {
            const defaultProfile: UserProfile = {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              role: 'user',
            };
            setUserProfile(defaultProfile);
            setUserRole('user');
          }
        } catch (error) {
           console.error("AuthProvider: Failed to get user profile", error);
           // Setting user to null to force re-authentication or error state
           setUser(null);
           setUserProfile(null);
           setUserRole(null);
        }

      } else {
        setUser(null);
        setUserProfile(null);
        setUserRole(null);
      }
      setLoading(false);
    });

    return () => {
        unsubscribe();
    }
  }, []);

  const value = { user, userProfile, loading, userRole };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

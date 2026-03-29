"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { getUserProfile, createUserProfile, updateUserProfile } from "@/lib/firebase/firestore";
import type { UserProfile } from "@/types";

interface UserContextType {
  profile: UserProfile | null;
  loading: boolean;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const UserContext = createContext<UserContextType>({
  profile: null,
  loading: true,
  updateProfile: async () => {},
  refreshProfile: async () => {},
});

export function UserProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }
    try {
      const p = await getUserProfile(user.uid);
      setProfile(p);
    } catch (e) {
      console.error("Error fetching profile:", e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateProfileHandler = async (data: Partial<UserProfile>) => {
    if (!user) return;
    try {
      if (profile) {
        await updateUserProfile(user.uid, data);
      } else {
        await createUserProfile(user.uid, data);
      }
      setProfile((prev) => (prev ? { ...prev, ...data } : ({ ...data } as UserProfile)));
    } catch (e) {
      console.error("Error updating profile:", e);
    }
  };

  return (
    <UserContext.Provider
      value={{
        profile,
        loading,
        updateProfile: updateProfileHandler,
        refreshProfile: fetchProfile,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);

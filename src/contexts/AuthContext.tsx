"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "firebase/auth";
import { onAuthChange } from "@/lib/firebase/auth";
import { isFirebaseConfigured } from "@/lib/firebase/config";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isConfigured: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isConfigured: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false);
      return;
    }
    try {
      const unsubscribe = onAuthChange((u) => {
        setUser(u);
        setLoading(false);
      });
      return unsubscribe;
    } catch (e) {
      console.warn("Auth listener failed:", e);
      setLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, isConfigured: isFirebaseConfigured }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

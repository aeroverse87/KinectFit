"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.replace("/dashboard");
      } else {
        router.replace("/auth");
      }
    }
  }, [user, loading, router]);

  return (
    <div className="flex-1 flex items-center justify-center bg-surface min-h-screen">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <h1 className="text-3xl font-display font-extrabold text-primary tracking-tight">
          Ethereal Coach
        </h1>
        <div className="mt-4 w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
      </motion.div>
    </div>
  );
}

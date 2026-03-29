"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, LogOut, User, Target, Scale, Flame } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useUser } from "@/contexts/UserContext";
import { signOut } from "@/lib/firebase/auth";

export default function ProfilePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { profile } = useUser();

  const handleSignOut = async () => {
    await signOut();
    router.replace("/auth");
  };

  const goalLabels: Record<string, string> = {
    fat_loss: "Fat Loss",
    maintenance: "Maintenance",
    muscle_gain: "Muscle Gain",
  };

  return (
    <div className="px-5 pt-4 pb-6 max-w-md mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="p-1">
          <ArrowLeft size={20} className="text-on-surface-variant" />
        </button>
        <h1 className="text-xl font-display font-extrabold tracking-tight">Profile</h1>
      </div>

      {/* Avatar & Name */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center mb-8"
      >
        <div className="w-20 h-20 rounded-full bg-surface-container-highest flex items-center justify-center mb-3">
          <User size={32} className="text-on-surface-variant" />
        </div>
        <h2 className="text-lg font-display font-bold">{profile?.name || user?.email || "User"}</h2>
        <p className="text-xs text-on-surface-variant">{user?.email}</p>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-3 mb-8"
      >
        {[
          { icon: Scale, label: "Weight", value: `${profile?.weight || "—"} kg` },
          { icon: Target, label: "Goal", value: goalLabels[profile?.goal || ""] || "—" },
          { icon: Flame, label: "Calorie Target", value: `${profile?.calorieTarget || "—"} kcal` },
          { icon: Flame, label: "Protein Target", value: `${profile?.proteinTarget || "—"}g` },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center gap-3 p-4 rounded-2xl bg-surface-container-low">
            <div className="w-10 h-10 rounded-xl bg-surface-container-highest flex items-center justify-center">
              <Icon size={16} className="text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-on-surface-variant">{label}</p>
              <p className="text-sm font-semibold text-on-surface">{value}</p>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Actions */}
      <div className="space-y-3">
        <button
          onClick={() => router.push("/onboarding")}
          className="w-full p-4 rounded-2xl bg-surface-container-low text-left text-sm font-medium text-on-surface"
        >
          Edit Profile →
        </button>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl bg-error/10 text-error text-sm font-semibold"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </div>
  );
}

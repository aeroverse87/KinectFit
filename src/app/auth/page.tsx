"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { signIn, signUp, signInWithGoogle } from "@/lib/firebase/auth";
import GradientButton from "@/components/GradientButton";
import { Mail, Lock, Eye, EyeOff, Globe } from "lucide-react";

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
      router.replace("/dashboard");
    } catch (err: unknown) {
      setError((err as Error).message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    setLoading(true);
    try {
      await signInWithGoogle();
      router.replace("/dashboard");
    } catch (err: unknown) {
      setError((err as Error).message || "Google sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-surface px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full"
      >
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-display font-extrabold tracking-tight">
            <span className="text-primary">Ethereal</span>{" "}
            <span className="text-on-surface">Coach</span>
          </h1>
          <p className="text-on-surface-variant text-sm mt-2">
            AI-powered nutrition, reimagined.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              required
              className="w-full bg-surface-container-low rounded-xl py-3.5 pl-11 pr-4 text-sm text-on-surface placeholder:text-on-surface-variant/50 ghost-border focus:outline-none focus:ghost-border-active transition"
            />
          </div>
          <div className="relative">
            <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" />
            <input
              id="password"
              type={showPass ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              minLength={6}
              className="w-full bg-surface-container-low rounded-xl py-3.5 pl-11 pr-11 text-sm text-on-surface placeholder:text-on-surface-variant/50 ghost-border focus:outline-none focus:ghost-border-active transition"
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant"
            >
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="text-error text-xs px-1"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          <GradientButton type="submit" loading={loading}>
            {isLogin ? "Sign In" : "Create Account"}
          </GradientButton>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-surface-container-highest" />
          <span className="text-xs text-on-surface-variant">or</span>
          <div className="flex-1 h-px bg-surface-container-highest" />
        </div>

        {/* Google */}
        <button
          onClick={handleGoogle}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl glass-light text-on-surface font-medium text-sm no-select disabled:opacity-50"
        >
          <Globe size={18} />
          Continue with Google
        </button>

        {/* Toggle */}
        <p className="text-center text-sm text-on-surface-variant mt-8">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-primary font-semibold"
          >
            {isLogin ? "Sign Up" : "Sign In"}
          </button>
        </p>
      </motion.div>
    </div>
  );
}

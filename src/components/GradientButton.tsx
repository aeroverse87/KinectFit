"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface GradientButtonProps {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
  icon?: ReactNode;
  loading?: boolean;
}

export default function GradientButton({
  children,
  onClick,
  type = "button",
  disabled = false,
  className = "",
  icon,
  loading = false,
}: GradientButtonProps) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileTap={{ scale: 0.97 }}
      whileHover={{ scale: 1.01 }}
      className={`
        w-full gradient-primary text-surface font-bold text-base
        rounded-full py-4 px-6 flex items-center justify-center gap-2
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-shadow shadow-glow-primary no-select
        ${className}
      `}
    >
      {loading ? (
        <span className="inline-block w-5 h-5 border-2 border-surface border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          {icon}
          {children}
        </>
      )}
    </motion.button>
  );
}

export function SecondaryButton({
  children,
  onClick,
  className = "",
  icon,
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  icon?: ReactNode;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      className={`
        glass-light text-primary font-semibold text-sm
        rounded-full py-3 px-5 flex items-center justify-center gap-2
        no-select ${className}
      `}
    >
      {icon}
      {children}
    </motion.button>
  );
}

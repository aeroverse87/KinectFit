"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

interface CoachInsightProps {
  message: string;
  type?: "tip" | "warning" | "success";
  tags?: string[];
  title?: string;
}

export default function CoachInsight({
  message,
  type = "tip",
  tags,
  title = "Coach Insight",
}: CoachInsightProps) {
  const colors = {
    tip: { bg: "bg-surface-container-high", icon: "text-primary" },
    warning: { bg: "bg-surface-container-high", icon: "text-warning" },
    success: { bg: "bg-surface-container-high", icon: "text-success" },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`${colors[type].bg} rounded-2xl p-5 shadow-glow-primary`}
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-surface-container-highest flex items-center justify-center shrink-0">
          <Sparkles size={18} className={colors[type].icon} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="label-editorial mb-2">{title}</p>
          <p
            className="text-sm text-on-surface leading-relaxed"
            dangerouslySetInnerHTML={{ __html: message }}
          />
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full bg-primary/10 text-primary"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

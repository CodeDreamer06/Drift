"use client";
import React from "react";

interface ProgressBarProps {
  progress: number; // 0-100
  label?: string;
}

export default function ProgressBar({ progress, label }: ProgressBarProps) {
  return (
    <div className="w-full">
      {label && <div className="text-xs mb-1 text-zinc-500 dark:text-zinc-300">{label}</div>}
      <div className="h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 transition-all duration-200"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

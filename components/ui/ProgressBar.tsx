import React from "react";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  progress: number;
  message: string;
  className?: string;
  colorClass?: string;
}

export default function ProgressBar({
  progress,
  message,
  className,
  colorClass = "text-amber-400"
}: ProgressBarProps) {
  // SVG circular path setup
  // Radius = 24, strokeWidth = 4
  // Circumference = 2 * Math.PI * r = 2 * 3.14159 * 24 = 150.8
  const radius = 24;
  const strokeWidth = 4;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className={cn("absolute inset-0 bg-[#08090f]/95 flex flex-col items-center justify-center p-4 z-20 transition-all duration-300", className)}>
      <div className="relative flex items-center justify-center h-20 w-20">
        {/* Track circle */}
        <svg className="absolute transform -rotate-90 w-full h-full" viewBox="0 0 60 60">
          <circle
            cx="30"
            cy="30"
            r={radius}
            stroke="rgba(255, 255, 255, 0.05)"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx="30"
            cy="30"
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className={cn("transition-all duration-200 ease-out", colorClass)}
            strokeLinecap="round"
          />
        </svg>
        {/* Centered Percentage */}
        <span className={cn("text-xs font-mono font-black absolute tracking-tighter", colorClass)}>
          {progress}%
        </span>
      </div>
      
      {/* Label/Message */}
      <span className="text-[9px] font-bold text-white uppercase text-center mt-3 tracking-wider max-w-[90%] line-clamp-2 leading-relaxed">
        {message}
      </span>
    </div>
  );
}

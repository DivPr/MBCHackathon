"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface RematchButtonProps {
  groupId: bigint;
  stakeAmount: string;
  currency?: "ETH" | "USDC";
  duration: number; // in seconds
  description: string;
  className?: string;
}

interface RematchData {
  groupId: string;
  stakeAmount: string;
  currency: string;
  duration: number;
  description: string;
}

// Storage key for rematch data
const REMATCH_KEY = "stride_rematch_data";

// Save rematch data for pre-filling create form
export function saveRematchData(data: RematchData) {
  if (typeof window === "undefined") return;
  localStorage.setItem(REMATCH_KEY, JSON.stringify(data));
}

// Get and clear rematch data
export function getRematchData(): RematchData | null {
  if (typeof window === "undefined") return null;
  try {
    const saved = localStorage.getItem(REMATCH_KEY);
    if (saved) {
      localStorage.removeItem(REMATCH_KEY);
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error("Error reading rematch data:", e);
  }
  return null;
}

export function RematchButton({
  groupId,
  stakeAmount,
  currency = "ETH",
  duration,
  description,
  className = "",
}: RematchButtonProps) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  const handleRematch = () => {
    // Save rematch data
    saveRematchData({
      groupId: groupId.toString(),
      stakeAmount,
      currency,
      duration,
      description: `${description} (Rematch)`,
    });

    // Navigate to group page to create challenge
    router.push(`/groups/${groupId}?rematch=true`);
  };

  return (
    <button
      onClick={handleRematch}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative overflow-hidden flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-stride-purple to-pink-500 hover:from-stride-purple/90 hover:to-pink-500/90 rounded-xl font-bold transition-all hover:scale-[1.02] active:scale-[0.98] ${className}`}
    >
      {/* Animated background */}
      <div 
        className={`absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 transition-opacity duration-300 ${
          isHovered ? "opacity-100" : "opacity-0"
        }`}
      />
      
      {/* Icon */}
      <div className="relative z-10 w-6 h-6 flex items-center justify-center">
        <svg 
          className={`w-6 h-6 transition-transform duration-300 ${isHovered ? "rotate-180" : ""}`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
          />
        </svg>
      </div>
      
      {/* Text */}
      <span className="relative z-10">
        {isHovered ? "Let's Go Again! 🔥" : "Rematch Challenge"}
      </span>
    </button>
  );
}

// Quick rematch card component for settled challenges
export function RematchCard({
  groupId,
  stakeAmount,
  currency = "ETH",
  duration,
  description,
  participantCount,
  onClose,
}: RematchButtonProps & { participantCount: number; onClose?: () => void }) {
  const router = useRouter();

  const handleRematch = () => {
    // Save rematch data
    saveRematchData({
      groupId: groupId.toString(),
      stakeAmount,
      currency,
      duration,
      description: `${description} (Rematch)`,
    });

    // Navigate to group page to create challenge
    router.push(`/groups/${groupId}?rematch=true`);
  };

  // Format duration for display
  const formatDuration = (seconds: number) => {
    if (seconds >= 86400) {
      return `${Math.floor(seconds / 86400)} day${seconds >= 172800 ? "s" : ""}`;
    }
    if (seconds >= 3600) {
      return `${Math.floor(seconds / 3600)} hour${seconds >= 7200 ? "s" : ""}`;
    }
    return `${Math.floor(seconds / 60)} min`;
  };

  return (
    <div className="bg-gradient-to-br from-stride-purple/10 to-pink-500/10 border border-stride-purple/30 rounded-2xl p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-stride-purple to-pink-500 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-lg">Run It Back! 🏃‍♂️</h3>
            <p className="text-sm text-stride-muted">Same challenge, new opportunity</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors text-stride-muted"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Rematch details */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-white/5 rounded-xl p-3 text-center">
          <p className="text-xs text-stride-muted mb-1">Stake</p>
          <p className={`font-bold ${currency === "USDC" ? "text-usdc-blue" : "text-stride-purple"}`}>
            {stakeAmount} {currency}
          </p>
        </div>
        <div className="bg-white/5 rounded-xl p-3 text-center">
          <p className="text-xs text-stride-muted mb-1">Duration</p>
          <p className="font-bold">{formatDuration(duration)}</p>
        </div>
        <div className="bg-white/5 rounded-xl p-3 text-center">
          <p className="text-xs text-stride-muted mb-1">Prev Runners</p>
          <p className="font-bold">{participantCount}</p>
        </div>
      </div>

      <button
        onClick={handleRematch}
        className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-stride-purple to-pink-500 hover:opacity-90 rounded-xl font-bold transition-opacity"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Create Rematch
      </button>
    </div>
  );
}


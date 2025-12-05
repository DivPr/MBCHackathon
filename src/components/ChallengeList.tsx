"use client";

import { useChallengeCount } from "@/hooks/useChallenge";
import { ChallengeCard } from "./ChallengeCard";
import { useState, useEffect } from "react";

export function ChallengeList() {
  const { data: count, isLoading, error } = useChallengeCount();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Active Challenges</h2>
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card animate-pulse border-white/10">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 bg-white/5 rounded-xl" />
                <div className="flex-1">
                  <div className="h-5 bg-white/5 rounded w-2/3 mb-2" />
                  <div className="h-4 bg-white/5 rounded w-1/2" />
                </div>
              </div>
              <div className="h-2 bg-white/5 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    // Check if it's a network error or just no challenges
    const isNetworkError = error.message.includes("chain") || error.message.includes("network");
    
    return (
      <div className="card border-orange-500/30 bg-orange-500/5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center shrink-0">
            <svg className="w-6 h-6 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold mb-2 text-orange-400">
              {isNetworkError ? "Switch to Base Sepolia" : "Connect to Base Sepolia"}
            </h2>
            <p className="text-stride-muted text-sm mb-3">
              Make sure your wallet is connected to Base Sepolia testnet to view and create challenges.
            </p>
            <div className="text-xs text-stride-muted font-mono bg-stride-dark/50 px-3 py-2 rounded-lg">
              RPC: https://sepolia.base.org • Chain ID: 84532
            </div>
          </div>
        </div>
      </div>
    );
  }

  const challengeCount = Number(count || 0);

  if (challengeCount === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Active Challenges</h2>
        </div>
        <div className="card text-center py-12 border-dashed border-2 border-white/10 bg-transparent">
          <div className="w-16 h-16 bg-gradient-to-br from-stride-purple/20 to-pink-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-float">
            <svg className="w-8 h-8 text-stride-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <h3 className="text-lg font-medium mb-2">No Challenges Yet</h3>
          <p className="text-stride-muted max-w-sm mx-auto">
            Be the first to create a challenge! Set a goal, stake some ETH, and invite your friends.
          </p>
        </div>
      </div>
    );
  }

  const challengeIds = Array.from({ length: challengeCount }, (_, i) => BigInt(challengeCount - i - 1));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Active Challenges</h2>
        <span className="px-3 py-1.5 bg-stride-purple/10 border border-stride-purple/30 rounded-full text-sm text-stride-purple font-medium">
          {challengeCount} total
        </span>
      </div>
      <div className="grid gap-4">
        {challengeIds.map((id, index) => (
          <div 
            key={id.toString()} 
            className="animate-slide-up"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <ChallengeCard challengeId={id} />
          </div>
        ))}
      </div>
    </div>
  );
}

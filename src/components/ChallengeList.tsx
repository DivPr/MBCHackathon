"use client";

import { useChallengeCount } from "@/hooks/useChallenge";
import { ChallengeCard } from "./ChallengeCard";

export function ChallengeList() {
  const { data: count, isLoading, error } = useChallengeCount();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Challenges</h2>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-6 bg-stride-muted/20 rounded w-1/3 mb-4" />
              <div className="h-4 bg-stride-muted/20 rounded w-1/2 mb-2" />
              <div className="h-4 bg-stride-muted/20 rounded w-1/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card border-red-500/30">
        <h2 className="text-xl font-bold mb-4 text-red-400">Error Loading Challenges</h2>
        <p className="text-stride-muted">
          Make sure the contract is deployed and your wallet is connected to Base Sepolia.
        </p>
        <p className="text-sm text-red-400 mt-2 font-mono">
          {error.message}
        </p>
      </div>
    );
  }

  const challengeCount = Number(count || 0);

  if (challengeCount === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Challenges</h2>
        <div className="card text-center py-12">
          <div className="w-16 h-16 bg-stride-lime/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-stride-lime"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium mb-2">No Challenges Yet</h3>
          <p className="text-stride-muted">
            Be the first to create a challenge and invite your friends!
          </p>
        </div>
      </div>
    );
  }

  // Display challenges in reverse order (newest first)
  const challengeIds = Array.from({ length: challengeCount }, (_, i) => BigInt(challengeCount - i - 1));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Challenges</h2>
        <span className="text-sm text-stride-muted">
          {challengeCount} total
        </span>
      </div>
      <div className="grid gap-4">
        {challengeIds.map((id) => (
          <ChallengeCard key={id.toString()} challengeId={id} />
        ))}
      </div>
    </div>
  );
}


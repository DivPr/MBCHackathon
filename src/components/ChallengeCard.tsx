"use client";

import { useChallenge, useParticipants } from "@/hooks/useChallenge";
import { formatEther } from "viem";
import Link from "next/link";

interface ChallengeCardProps {
  challengeId: bigint;
}

export function ChallengeCard({ challengeId }: ChallengeCardProps) {
  const { data: challenge, isLoading } = useChallenge(challengeId);
  const { data: participants } = useParticipants(challengeId);

  if (isLoading || !challenge) {
    return (
      <div className="card animate-pulse">
        <div className="h-6 bg-stride-muted/20 rounded w-1/3 mb-4" />
        <div className="h-4 bg-stride-muted/20 rounded w-1/2" />
      </div>
    );
  }

  const endTime = new Date(Number(challenge.endTime) * 1000);
  const now = new Date();
  const isEnded = endTime < now;
  const timeLeft = isEnded
    ? "Ended"
    : formatTimeLeft(endTime.getTime() - now.getTime());

  const participantCount = participants?.length || 0;
  const stakeEth = formatEther(challenge.stakeAmount);
  const poolEth = formatEther(challenge.totalPool);

  return (
    <Link href={`/challenge/${challengeId}`}>
      <div className="card hover:border-stride-lime/50 transition-all duration-200 cursor-pointer group">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-bold text-lg group-hover:text-stride-lime transition-colors">
              {challenge.description || `Challenge #${challengeId}`}
            </h3>
            <p className="text-sm text-stride-muted font-mono">
              ID: {challengeId.toString()}
            </p>
          </div>
          <StatusBadge isSettled={challenge.settled} isEnded={isEnded} />
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <p className="text-xs text-stride-muted mb-1">Stake</p>
            <p className="font-medium">{stakeEth} ETH</p>
          </div>
          <div>
            <p className="text-xs text-stride-muted mb-1">Pool</p>
            <p className="font-medium text-stride-lime">{poolEth} ETH</p>
          </div>
          <div>
            <p className="text-xs text-stride-muted mb-1">Participants</p>
            <p className="font-medium">{participantCount}</p>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isEnded ? "bg-red-500" : "bg-stride-lime"}`} />
            <span className="text-stride-muted">{timeLeft}</span>
          </div>
          <span className="text-stride-lime group-hover:translate-x-1 transition-transform">
            View →
          </span>
        </div>
      </div>
    </Link>
  );
}

function StatusBadge({ isSettled, isEnded }: { isSettled: boolean; isEnded: boolean }) {
  if (isSettled) {
    return (
      <span className="px-2 py-1 text-xs font-medium bg-stride-lime/20 text-stride-lime rounded">
        Settled
      </span>
    );
  }
  if (isEnded) {
    return (
      <span className="px-2 py-1 text-xs font-medium bg-orange-500/20 text-orange-400 rounded">
        Ready to Settle
      </span>
    );
  }
  return (
    <span className="px-2 py-1 text-xs font-medium bg-blue-500/20 text-blue-400 rounded">
      Active
    </span>
  );
}

function formatTimeLeft(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h left`;
  if (hours > 0) return `${hours}h ${minutes % 60}m left`;
  if (minutes > 0) return `${minutes}m left`;
  return `${seconds}s left`;
}


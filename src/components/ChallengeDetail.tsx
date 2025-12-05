"use client";

import { useAccount } from "wagmi";
import {
  useChallenge,
  useParticipants,
  useHasJoined,
  useHasCompleted,
  useCompleters,
  useJoinChallenge,
  useMarkCompleted,
  useSettleChallenge,
} from "@/hooks/useChallenge";
import { formatEther } from "viem";
import { useState } from "react";

interface ChallengeDetailProps {
  challengeId: bigint;
}

export function ChallengeDetail({ challengeId }: ChallengeDetailProps) {
  const { address } = useAccount();
  const { data: challenge, isLoading, refetch } = useChallenge(challengeId);
  const { data: participants, refetch: refetchParticipants } = useParticipants(challengeId);
  const { data: hasJoined, refetch: refetchJoined } = useHasJoined(challengeId, address);
  const { data: hasCompleted, refetch: refetchCompleted } = useHasCompleted(challengeId, address);
  const { data: completers, refetch: refetchCompleters } = useCompleters(challengeId);

  const {
    joinChallenge,
    isPending: isJoining,
    isConfirming: isJoinConfirming,
  } = useJoinChallenge();

  const {
    markCompleted,
    isPending: isMarking,
    isConfirming: isMarkConfirming,
  } = useMarkCompleted();

  const {
    settleChallenge,
    isPending: isSettling,
    isConfirming: isSettleConfirming,
  } = useSettleChallenge();

  const [photoUploaded, setPhotoUploaded] = useState(false);

  if (isLoading || !challenge) {
    return (
      <div className="card animate-pulse">
        <div className="h-8 bg-stride-muted/20 rounded w-1/2 mb-6" />
        <div className="h-4 bg-stride-muted/20 rounded w-1/3 mb-4" />
        <div className="h-4 bg-stride-muted/20 rounded w-2/3" />
      </div>
    );
  }

  const endTime = new Date(Number(challenge.endTime) * 1000);
  const now = new Date();
  const isEnded = endTime < now;
  const stakeEth = formatEther(challenge.stakeAmount);
  const poolEth = formatEther(challenge.totalPool);

  const handleJoin = () => {
    joinChallenge(challengeId, challenge.stakeAmount);
    // Refetch after a delay to allow for confirmation
    setTimeout(() => {
      refetch();
      refetchParticipants();
      refetchJoined();
    }, 3000);
  };

  const handleComplete = () => {
    markCompleted(challengeId);
    setTimeout(() => {
      refetchCompleted();
      refetchCompleters();
    }, 3000);
  };

  const handleSettle = () => {
    settleChallenge(challengeId);
    setTimeout(() => {
      refetch();
      refetchCompleters();
    }, 3000);
  };

  const canJoin = !hasJoined && !isEnded && !challenge.settled;
  const canComplete = hasJoined && !hasCompleted && !isEnded && !challenge.settled;
  const canSettle = isEnded && !challenge.settled;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              {challenge.description || `Challenge #${challengeId}`}
            </h1>
            <p className="text-sm text-stride-muted font-mono">
              Created by {challenge.creator.slice(0, 6)}...{challenge.creator.slice(-4)}
            </p>
          </div>
          <StatusBadge isSettled={challenge.settled} isEnded={isEnded} />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatBox label="Stake" value={`${stakeEth} ETH`} />
          <StatBox label="Total Pool" value={`${poolEth} ETH`} highlight />
          <StatBox label="Participants" value={participants?.length.toString() || "0"} />
          <StatBox
            label="Completers"
            value={completers?.length.toString() || "0"}
          />
        </div>

        <div className="p-4 bg-stride-dark rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-stride-muted mb-1">
                {isEnded ? "Ended at" : "Ends at"}
              </p>
              <p className="font-medium">{endTime.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-stride-muted mb-1">Time</p>
              <p className={`font-medium ${isEnded ? "text-red-400" : "text-stride-lime"}`}>
                {isEnded ? "Challenge Ended" : formatTimeLeft(endTime.getTime() - now.getTime())}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      {!challenge.settled && (
        <div className="card">
          <h2 className="text-lg font-bold mb-4">Actions</h2>

          {canJoin && (
            <div className="mb-4">
              <p className="text-stride-muted mb-4">
                Join this challenge by staking {stakeEth} ETH. Complete your run before
                the deadline to win a share of the prize pool!
              </p>
              <button
                onClick={handleJoin}
                disabled={isJoining || isJoinConfirming}
                className="btn-primary w-full"
              >
                {isJoinConfirming
                  ? "Confirming..."
                  : isJoining
                  ? "Joining..."
                  : `Join Challenge (${stakeEth} ETH)`}
              </button>
            </div>
          )}

          {canComplete && (
            <div className="space-y-4">
              <p className="text-stride-muted">
                Completed your run? Upload a proof photo and mark your completion!
              </p>

              {/* Simulated photo upload */}
              <div className="border-2 border-dashed border-stride-muted/30 rounded-lg p-6 text-center">
                {photoUploaded ? (
                  <div className="flex items-center justify-center gap-2 text-stride-lime">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Photo uploaded (demo only)</span>
                  </div>
                ) : (
                  <button
                    onClick={() => setPhotoUploaded(true)}
                    className="text-stride-muted hover:text-white transition-colors"
                  >
                    <svg className="w-10 h-10 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p>Click to upload proof photo</p>
                    <p className="text-xs mt-1">(Demo only - no actual upload)</p>
                  </button>
                )}
              </div>

              <button
                onClick={handleComplete}
                disabled={isMarking || isMarkConfirming}
                className="btn-primary w-full"
              >
                {isMarkConfirming
                  ? "Confirming..."
                  : isMarking
                  ? "Marking..."
                  : "I Finished My Run!"}
              </button>
            </div>
          )}

          {hasJoined && hasCompleted && !challenge.settled && (
            <div className="p-4 bg-stride-lime/10 border border-stride-lime/30 rounded-lg">
              <div className="flex items-center gap-2 text-stride-lime">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="font-medium">You've completed this challenge!</span>
              </div>
              <p className="text-sm text-stride-muted mt-2">
                Wait for the challenge to end, then settle to claim your share.
              </p>
            </div>
          )}

          {canSettle && (
            <div className="mt-4">
              <p className="text-stride-muted mb-4">
                The challenge has ended. Settle to distribute the prize pool to all completers.
              </p>
              <button
                onClick={handleSettle}
                disabled={isSettling || isSettleConfirming}
                className="btn-primary w-full"
              >
                {isSettleConfirming
                  ? "Confirming..."
                  : isSettling
                  ? "Settling..."
                  : "Settle Challenge"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Settled State */}
      {challenge.settled && (
        <div className="card border-stride-lime/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-stride-lime rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-stride-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold">Challenge Settled</h2>
              <p className="text-sm text-stride-muted">
                {completers?.length || 0} winner{(completers?.length || 0) !== 1 ? "s" : ""} received their share
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Participants List */}
      <div className="card">
        <h2 className="text-lg font-bold mb-4">
          Participants ({participants?.length || 0})
        </h2>
        {participants && participants.length > 0 ? (
          <div className="space-y-2">
            {participants.map((participant: `0x${string}`) => {
              const isCompleter = completers?.includes(participant);
              const isCurrentUser = participant.toLowerCase() === address?.toLowerCase();

              return (
                <div
                  key={participant}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    isCurrentUser ? "bg-stride-lime/10 border border-stride-lime/30" : "bg-stride-dark"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isCompleter ? "bg-stride-lime text-stride-dark" : "bg-stride-muted/30"
                    }`}>
                      {isCompleter ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span className="text-xs">?</span>
                      )}
                    </div>
                    <span className="font-mono text-sm">
                      {participant.slice(0, 8)}...{participant.slice(-6)}
                    </span>
                    {isCurrentUser && (
                      <span className="text-xs text-stride-lime">(You)</span>
                    )}
                  </div>
                  <span className={`text-sm ${isCompleter ? "text-stride-lime" : "text-stride-muted"}`}>
                    {isCompleter ? "Completed" : "In Progress"}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-stride-muted">No participants yet</p>
        )}
      </div>
    </div>
  );
}

function StatBox({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="p-3 bg-stride-dark rounded-lg">
      <p className="text-xs text-stride-muted mb-1">{label}</p>
      <p className={`font-bold ${highlight ? "text-stride-lime" : ""}`}>{value}</p>
    </div>
  );
}

function StatusBadge({ isSettled, isEnded }: { isSettled: boolean; isEnded: boolean }) {
  if (isSettled) {
    return (
      <span className="px-3 py-1 text-sm font-medium bg-stride-lime/20 text-stride-lime rounded-full">
        Settled
      </span>
    );
  }
  if (isEnded) {
    return (
      <span className="px-3 py-1 text-sm font-medium bg-orange-500/20 text-orange-400 rounded-full">
        Ready to Settle
      </span>
    );
  }
  return (
    <span className="px-3 py-1 text-sm font-medium bg-blue-500/20 text-blue-400 rounded-full">
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


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
  useVoteCancelChallenge,
  useCreatorCancelChallenge,
  useHasVotedCancel,
  useCancelVoteStatus,
} from "@/hooks/useChallenge";
import { formatEther } from "viem";
import { useState, useEffect } from "react";
import { ShareModal } from "./ShareModal";

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
  const { data: hasVotedCancel } = useHasVotedCancel(challengeId, address);
  const { data: cancelVoteStatus, refetch: refetchCancelVotes } = useCancelVoteStatus(challengeId);

  const {
    joinChallenge,
    isPending: isJoining,
    isConfirming: isJoinConfirming,
    isSuccess: joinSuccess,
  } = useJoinChallenge();

  const {
    markCompleted,
    isPending: isMarking,
    isConfirming: isMarkConfirming,
    isSuccess: markSuccess,
  } = useMarkCompleted();

  const {
    settleChallenge,
    isPending: isSettling,
    isConfirming: isSettleConfirming,
    isSuccess: settleSuccess,
  } = useSettleChallenge();

  const {
    voteCancelChallenge,
    isPending: isVotingCancel,
    isConfirming: isVoteCancelConfirming,
    isSuccess: voteCancelSuccess,
  } = useVoteCancelChallenge();

  const {
    creatorCancelChallenge,
    isPending: isCreatorCanceling,
    isConfirming: isCreatorCancelConfirming,
    isSuccess: creatorCancelSuccess,
  } = useCreatorCancelChallenge();

  const [showShareModal, setShowShareModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (joinSuccess || markSuccess || settleSuccess || voteCancelSuccess || creatorCancelSuccess) {
      setTimeout(() => {
        refetch();
        refetchParticipants();
        refetchJoined();
        refetchCompleted();
        refetchCompleters();
        refetchCancelVotes();
      }, 2000);
    }
  }, [joinSuccess, markSuccess, settleSuccess, voteCancelSuccess, creatorCancelSuccess, refetch, refetchParticipants, refetchJoined, refetchCompleted, refetchCompleters, refetchCancelVotes]);

  useEffect(() => {
    if (!challenge) return;
    
    const updateTimer = () => {
      const endTime = new Date(Number(challenge.endTime) * 1000);
      const now = new Date();
      const diff = endTime.getTime() - now.getTime();
      
      if (diff <= 0) {
        setTimeLeft("Ended");
        return;
      }
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h ${minutes}m`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      } else {
        setTimeLeft(`${minutes}m ${seconds}s`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [challenge]);

  if (!mounted || isLoading || !challenge) {
    return (
      <div className="space-y-6">
        <div className="card animate-pulse border-white/10">
          <div className="h-8 bg-white/5 rounded w-2/3 mb-6" />
          <div className="grid grid-cols-2 gap-4 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-white/5 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const endTime = new Date(Number(challenge.endTime) * 1000);
  const now = new Date();
  const isEnded = endTime < now;
  const stakeEth = formatEther(challenge.stakeAmount);
  const poolEth = formatEther(challenge.totalPool);
  const participantCount = participants?.length || 0;
  const completerCount = completers?.length || 0;
  const isCancelled = challenge.cancelled;
  const isCreator = address?.toLowerCase() === challenge.creator.toLowerCase();
  const canCreatorCancel = isCreator && participantCount === 1 && !challenge.settled && !isCancelled;

  const handleJoin = () => {
    joinChallenge(challengeId, challenge.stakeAmount);
  };

  const handleComplete = () => {
    markCompleted(challengeId);
  };

  const handleSettle = () => {
    settleChallenge(challengeId);
  };

  const handleVoteCancel = () => {
    voteCancelChallenge(challengeId);
    setShowCancelModal(false);
  };

  const handleCreatorCancel = () => {
    creatorCancelChallenge(challengeId);
    setShowCancelModal(false);
  };

  const canJoin = !hasJoined && !isEnded && !challenge.settled && !isCancelled;
  const canComplete = hasJoined && !hasCompleted && !isEnded && !challenge.settled && !isCancelled;
  const canSettle = isEnded && !challenge.settled && !isCancelled;
  const canVoteCancel = hasJoined && !hasVotedCancel && !challenge.settled && !isCancelled;

  const potentialWinnings = completerCount > 0 
    ? Number(poolEth) / (completerCount + (hasJoined && !hasCompleted ? 1 : 0))
    : Number(poolEth);

  // Cancelled state
  if (isCancelled) {
    return (
      <div className="space-y-6">
        <div className="card border-red-500/30 text-center bg-red-500/5">
          <div className="w-20 h-20 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-2 text-red-400">Challenge Cancelled</h2>
          <p className="text-stride-muted">
            This challenge was cancelled and all participants have been refunded.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Card */}
      <div className="card overflow-hidden border-white/10">
        {/* Status Banner */}
        <div className={`-mx-6 -mt-6 px-6 py-3 mb-6 ${
          challenge.settled 
            ? "bg-green-500/10 border-b border-green-500/20" 
            : isEnded 
              ? "bg-orange-500/10 border-b border-orange-500/20" 
              : "bg-stride-purple/10 border-b border-stride-purple/20"
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                challenge.settled 
                  ? "bg-green-400" 
                  : isEnded 
                    ? "bg-orange-400 animate-pulse" 
                    : "bg-stride-purple animate-pulse"
              }`} />
              <span className={`text-sm font-medium ${
                challenge.settled 
                  ? "text-green-400" 
                  : isEnded 
                    ? "text-orange-400" 
                    : "text-stride-purple"
              }`}>
                {challenge.settled ? "✓ Settled" : isEnded ? "Ready to Settle" : "Active Challenge"}
              </span>
            </div>
            {!challenge.settled && (
              <span className="text-sm font-mono">{timeLeft}</span>
            )}
          </div>
        </div>

        {/* Title & Actions */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              {challenge.description || `Challenge #${challengeId}`}
            </h1>
            <p className="text-sm text-stride-muted flex items-center gap-2">
              <span className="w-5 h-5 bg-gradient-to-br from-stride-purple to-pink-500 rounded-full" />
              {challenge.creator.slice(0, 8)}...{challenge.creator.slice(-6)}
            </p>
          </div>
          <div className="flex gap-2">
            {!challenge.settled && hasJoined && (
              <button
                onClick={() => setShowCancelModal(true)}
                className="p-3 bg-stride-dark border border-white/10 hover:border-red-500/50 rounded-xl transition-colors text-stride-muted hover:text-red-400"
                title="Cancel Challenge"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            {!challenge.settled && (
              <button
                onClick={() => setShowShareModal(true)}
                className="p-3 bg-stride-dark border border-white/10 hover:border-stride-purple/50 rounded-xl transition-colors"
                title="Share Challenge"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Cancel Vote Status */}
        {cancelVoteStatus && Number(cancelVoteStatus[0]) > 0 && !challenge.settled && (
          <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="text-sm text-yellow-400 font-medium">Cancel vote in progress</span>
              </div>
              <span className="text-sm font-mono text-yellow-400">
                {Number(cancelVoteStatus[0])}/{Number(cancelVoteStatus[1])} votes
              </span>
            </div>
            <p className="text-xs text-stride-muted mt-2">
              All participants must vote to cancel. Stakes will be refunded.
            </p>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatCard label="Entry Stake" value={`${stakeEth} ETH`} icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          <StatCard label="Prize Pool" value={`${poolEth} ETH`} icon="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" highlight />
          <StatCard label="Runners" value={participantCount.toString()} icon="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          <StatCard label="Finished" value={`${completerCount}/${participantCount}`} icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-stride-muted">Completion Rate</span>
            <span className="font-medium text-stride-purple">
              {participantCount > 0 ? Math.round((completerCount / participantCount) * 100) : 0}%
            </span>
          </div>
          <div className="h-3 bg-stride-dark rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-stride-purple to-pink-500 transition-all duration-500"
              style={{ width: `${participantCount > 0 ? (completerCount / participantCount) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Potential Winnings */}
        {hasJoined && !challenge.settled && (
          <div className="p-4 bg-gradient-to-r from-stride-purple/10 to-pink-500/10 border border-stride-purple/20 rounded-xl mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-stride-muted mb-1">Your Potential Winnings</p>
                <p className="text-2xl font-bold gradient-text">
                  {potentialWinnings.toFixed(4)} ETH
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* End Time */}
        <div className="flex items-center justify-between p-4 bg-stride-dark border border-white/10 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-stride-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-stride-muted">{isEnded ? "Ended at" : "Deadline"}</p>
              <p className="font-medium">{endTime.toLocaleDateString()} at {endTime.toLocaleTimeString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Card */}
      {!challenge.settled && (
        <div className="card border-white/10">
          {canJoin && (
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-stride-purple/20 to-pink-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-stride-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2">Ready to Run?</h3>
              <p className="text-stride-muted mb-6">
                Stake {stakeEth} ETH and join {participantCount} other runner{participantCount !== 1 ? "s" : ""}!
              </p>
              <button
                onClick={handleJoin}
                disabled={isJoining || isJoinConfirming}
                className="btn-primary w-full text-lg py-4"
              >
                {isJoinConfirming ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Confirming...
                  </span>
                ) : isJoining ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Joining...
                  </span>
                ) : (
                  `Join & Stake ${stakeEth} ETH`
                )}
              </button>
            </div>
          )}

          {canComplete && (
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400/20 to-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2">Finished Your Run?</h3>
              <p className="text-stride-muted mb-6">
                Mark your completion to claim your share of the prize pool!
              </p>
              <button
                onClick={handleComplete}
                disabled={isMarking || isMarkConfirming}
                className="btn-primary w-full text-lg py-4"
              >
                {isMarkConfirming ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Confirming...
                  </span>
                ) : isMarking ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Submitting...
                  </span>
                ) : (
                  "✓ I Finished My Run!"
                )}
              </button>
            </div>
          )}

          {hasJoined && hasCompleted && !challenge.settled && !isEnded && (
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2 text-green-400">You&apos;re All Set! 🎉</h3>
              <p className="text-stride-muted">
                Wait for the challenge to end, then settle to claim your winnings.
              </p>
            </div>
          )}

          {canSettle && (
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400/20 to-orange-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2">Time&apos;s Up!</h3>
              <p className="text-stride-muted mb-6">
                {completerCount > 0 
                  ? `${completerCount} runner${completerCount !== 1 ? "s" : ""} finished! Settle to distribute ${poolEth} ETH.`
                  : "No one finished. Settle to refund all participants."
                }
              </p>
              <button
                onClick={handleSettle}
                disabled={isSettling || isSettleConfirming}
                className="btn-primary w-full text-lg py-4"
              >
                {isSettleConfirming ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Confirming...
                  </span>
                ) : isSettling ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Settling...
                  </span>
                ) : (
                  "Settle & Distribute Prizes"
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Settled State */}
      {challenge.settled && (
        <div className="card border-green-500/30 text-center bg-green-500/5">
          <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-2">Challenge Complete!</h2>
          <p className="text-stride-muted">
            {completerCount > 0 
              ? `${completerCount} winner${completerCount !== 1 ? "s" : ""} split ${poolEth} ETH`
              : "All participants were refunded"
            }
          </p>
        </div>
      )}

      {/* Participants */}
      <div className="card border-white/10">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-stride-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          Participants
          <span className="px-2 py-0.5 bg-stride-dark border border-white/10 rounded-full text-sm font-normal">
            {participantCount}
          </span>
        </h2>
        
        {participants && participants.length > 0 ? (
          <div className="space-y-2">
            {participants.map((participant: `0x${string}`, index: number) => {
              const isCompleter = completers?.includes(participant);
              const isCurrentUser = participant.toLowerCase() === address?.toLowerCase();
              const isParticipantCreator = participant.toLowerCase() === challenge.creator.toLowerCase();

              return (
                <div
                  key={participant}
                  className={`flex items-center justify-between p-3 rounded-xl transition-colors ${
                    isCurrentUser 
                      ? "bg-stride-purple/10 border border-stride-purple/30" 
                      : "bg-stride-dark border border-white/5 hover:border-white/10"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                        isCompleter 
                          ? "bg-gradient-to-br from-green-400 to-emerald-500 text-white" 
                          : "bg-gradient-to-br from-stride-purple to-pink-500 text-white"
                      }`}>
                        {isCompleter ? "✓" : `#${index + 1}`}
                      </div>
                      {isParticipantCreator && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center text-[10px] border-2 border-stride-gray">
                          👑
                        </div>
                      )}
                    </div>
                    <div>
                      <span className="font-mono text-sm">
                        {participant.slice(0, 8)}...{participant.slice(-6)}
                      </span>
                      <div className="flex items-center gap-2 mt-0.5">
                        {isCurrentUser && (
                          <span className="text-xs text-stride-purple font-medium">You</span>
                        )}
                        {isParticipantCreator && !isCurrentUser && (
                          <span className="text-xs text-yellow-400">Creator</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className={`text-sm font-medium px-3 py-1.5 rounded-full ${
                    isCompleter 
                      ? "bg-green-500/20 text-green-400" 
                      : "bg-white/5 text-stride-muted"
                  }`}>
                    {isCompleter ? "✓ Finished" : "Running..."}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-stride-muted text-center py-8">No participants yet</p>
        )}
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <ShareModal
          challengeId={challengeId}
          description={challenge.description || `Challenge #${challengeId}`}
          stakeAmount={stakeEth}
          onClose={() => setShowShareModal(false)}
        />
      )}

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowCancelModal(false)} />
          <div className="relative w-full max-w-md bg-stride-gray border border-white/10 rounded-2xl shadow-2xl p-6">
            <h3 className="text-xl font-bold mb-2">End Challenge Options</h3>
            
            {canCreatorCancel ? (
              <>
                <p className="text-stride-muted mb-6">
                  As the only participant, you can cancel this challenge and get your stake refunded immediately.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowCancelModal(false)}
                    className="btn-secondary flex-1"
                  >
                    Keep Challenge
                  </button>
                  <button
                    onClick={handleCreatorCancel}
                    disabled={isCreatorCanceling || isCreatorCancelConfirming}
                    className="flex-1 py-2.5 px-5 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-all"
                  >
                    {isCreatorCanceling || isCreatorCancelConfirming ? "Cancelling..." : "Cancel & Refund"}
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Info about early ending options */}
                <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl mb-4">
                  <p className="text-xs text-blue-400">
                    <strong>💡 Want to end early with payouts?</strong> If all participants have finished their runs, you can wait for the timer to expire and then settle. Only completers will get paid.
                  </p>
                </div>

                <p className="text-stride-muted mb-4 text-sm">
                  <strong className="text-red-400">Cancel & Refund:</strong> To cancel and refund everyone, all {participantCount} participants must vote. No one wins or loses - all stakes returned.
                </p>
                
                {cancelVoteStatus && (
                  <div className="p-3 bg-stride-dark rounded-xl mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-stride-muted">Cancel votes</span>
                      <span className="font-mono">{Number(cancelVoteStatus[0])}/{Number(cancelVoteStatus[1])}</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full mt-2 overflow-hidden">
                      <div 
                        className="h-full bg-red-500 transition-all"
                        style={{ width: `${(Number(cancelVoteStatus[0]) / Number(cancelVoteStatus[1])) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-stride-muted mt-2">
                      {Number(cancelVoteStatus[1]) - Number(cancelVoteStatus[0])} more vote{Number(cancelVoteStatus[1]) - Number(cancelVoteStatus[0]) !== 1 ? 's' : ''} needed
                    </p>
                  </div>
                )}

                {hasVotedCancel ? (
                  <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl mb-4 text-center">
                    <p className="text-green-400 text-sm">✓ You have voted to cancel</p>
                  </div>
                ) : null}

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowCancelModal(false)}
                    className="btn-secondary flex-1"
                  >
                    Close
                  </button>
                  {canVoteCancel && (
                    <button
                      onClick={handleVoteCancel}
                      disabled={isVotingCancel || isVoteCancelConfirming}
                      className="flex-1 py-2.5 px-5 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-all"
                    >
                      {isVotingCancel || isVoteCancelConfirming ? "Voting..." : "Vote to Cancel & Refund"}
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon, highlight = false }: { label: string; value: string; icon: string; highlight?: boolean }) {
  return (
    <div className="p-4 bg-stride-dark border border-white/10 rounded-xl">
      <div className="flex items-center gap-2 mb-2">
        <svg className={`w-4 h-4 ${highlight ? "text-stride-purple" : "text-stride-muted"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
        </svg>
        <p className="text-xs text-stride-muted">{label}</p>
      </div>
      <p className={`text-lg font-bold ${highlight ? "text-stride-purple" : ""}`}>{value}</p>
    </div>
  );
}

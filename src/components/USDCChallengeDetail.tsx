"use client";

import { useAccount } from "wagmi";
import {
  useUSDCChallenge,
  useUSDCParticipants,
  useUSDCHasJoined,
  useUSDCHasCompleted,
  useUSDCCompleters,
  useJoinUSDCChallenge,
  useMarkUSDCCompleted,
  useSettleUSDCChallenge,
  useVoteCancelUSDCChallenge,
  useCreatorCancelUSDCChallenge,
  useVoteEarlySettleUSDC,
  formatUSDCBalance,
  useUSDCBalance,
  useUSDCAllowance,
  useApproveUSDC,
} from "@/hooks/useUSDC";
import { useState, useEffect, useCallback } from "react";
import { ShareModal } from "./ShareModal";
import { ProofPicCamera, ProofPicDisplay, getProofPic } from "./ProofPic";
import { VictoryCelebration, ReactionBar, fireConfetti } from "./HypeReactions";
import { ShareCard } from "./ShareCard";
import { RematchCard } from "./RematchButton";
import { useStreaks, StreakBadge } from "@/hooks/useStreaks";
import { CircleLogo } from "./USDCStakeButton";

interface USDCChallengeDetailProps {
  challengeId: bigint;
}

export function USDCChallengeDetail({ challengeId }: USDCChallengeDetailProps) {
  const { address } = useAccount();
  const { data: challenge, isLoading, refetch } = useUSDCChallenge(challengeId);
  const { data: participants, refetch: refetchParticipants } = useUSDCParticipants(challengeId);
  const { data: hasJoined, refetch: refetchJoined } = useUSDCHasJoined(challengeId, address);
  const { data: hasCompleted, refetch: refetchCompleted } = useUSDCHasCompleted(challengeId, address);
  const { data: completers, refetch: refetchCompleters } = useUSDCCompleters(challengeId);
  
  // USDC balance and approval
  const { data: usdcBalance, refetch: refetchBalance } = useUSDCBalance(address);
  const { data: usdcAllowance, refetch: refetchAllowance } = useUSDCAllowance(address);
  const { approveMax, isPending: isApproving, isConfirming: isApproveConfirming, isSuccess: approveSuccess } = useApproveUSDC();

  const {
    joinChallenge,
    isPending: isJoining,
    isConfirming: isJoinConfirming,
    isSuccess: joinSuccess,
  } = useJoinUSDCChallenge();

  const {
    markCompleted,
    isPending: isMarking,
    isConfirming: isMarkConfirming,
    isSuccess: markSuccess,
  } = useMarkUSDCCompleted();

  const {
    settleChallenge,
    isPending: isSettling,
    isConfirming: isSettleConfirming,
    isSuccess: settleSuccess,
  } = useSettleUSDCChallenge();

  const {
    isSuccess: voteCancelSuccess,
  } = useVoteCancelUSDCChallenge();

  const {
    isSuccess: creatorCancelSuccess,
  } = useCreatorCancelUSDCChallenge();

  const {
    isSuccess: earlySettleSuccess,
  } = useVoteEarlySettleUSDC();

  const [showShareModal, setShowShareModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");
  const [mounted, setMounted] = useState(false);
  
  // New feature states
  const [showCamera, setShowCamera] = useState(false);
  const [proofPicUrl, setProofPicUrl] = useState<string | null>(null);
  const [showVictory, setShowVictory] = useState(false);
  const [showShareCard, setShowShareCard] = useState(false);
  const [showRematchCard, setShowRematchCard] = useState(false);
  const [hasSeenVictory, setHasSeenVictory] = useState(false);
  
  // Streaks
  const { recordCompletion } = useStreaks();

  useEffect(() => {
    setMounted(true);
    // Load proof pic if exists
    const savedPic = getProofPic(challengeId);
    if (savedPic) {
      setProofPicUrl(savedPic);
    }
  }, [challengeId]);

  // Show victory celebration for winners
  useEffect(() => {
    if (challenge?.settled && hasCompleted && hasJoined && !hasSeenVictory) {
      const victoryKey = `stride_victory_seen_usdc_${challengeId.toString()}`;
      const seen = localStorage.getItem(victoryKey);
      if (!seen) {
        setShowVictory(true);
        setHasSeenVictory(true);
        localStorage.setItem(victoryKey, "true");
      }
    }
  }, [challenge?.settled, hasCompleted, hasJoined, challengeId, hasSeenVictory]);

  // Check approval after success
  useEffect(() => {
    if (approveSuccess) {
      refetchAllowance();
    }
  }, [approveSuccess, refetchAllowance]);

  useEffect(() => {
    if (joinSuccess || markSuccess || settleSuccess || voteCancelSuccess || creatorCancelSuccess || earlySettleSuccess) {
      setTimeout(() => {
        refetch();
        refetchParticipants();
        refetchJoined();
        refetchCompleted();
        refetchCompleters();
        refetchBalance();
      }, 2000);
    }
  }, [joinSuccess, markSuccess, settleSuccess, voteCancelSuccess, creatorCancelSuccess, earlySettleSuccess, refetch, refetchParticipants, refetchJoined, refetchCompleted, refetchCompleters, refetchBalance]);

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

  // Define handlers that use hooks before any conditional returns
  const handleCameraCapture = useCallback((imageUrl: string) => {
    setProofPicUrl(imageUrl);
    setShowCamera(false);
    // Now mark as completed
    markCompleted(challengeId);
    // Record streak
    recordCompletion();
    // Fire confetti!
    fireConfetti();
  }, [challengeId, markCompleted, recordCompletion]);

  if (!mounted || isLoading || !challenge) {
    return (
      <div className="space-y-6">
        <div className="card animate-pulse border-usdc-blue/30">
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
  const stakeUSDC = formatUSDCBalance(challenge.stakeAmount);
  const poolUSDC = formatUSDCBalance(challenge.totalPool);
  const participantCount = participants?.length || 0;
  const completerCount = completers?.length || 0;
  const isCancelled = challenge.cancelled;

  // Check if user has enough allowance
  const hasEnoughAllowance = usdcAllowance !== undefined && usdcAllowance >= challenge.stakeAmount;
  const hasEnoughBalance = usdcBalance !== undefined && usdcBalance >= challenge.stakeAmount;

  const handleJoin = () => {
    if (!hasEnoughAllowance) {
      approveMax();
      return;
    }
    joinChallenge(challengeId);
  };

  const handleComplete = () => {
    // Open camera first for proof pic
    setShowCamera(true);
  };

  const handleSkipPhoto = () => {
    setShowCamera(false);
    markCompleted(challengeId);
    recordCompletion();
    fireConfetti();
  };

  const handleSettle = () => {
    settleChallenge(challengeId);
  };

  const canJoin = !hasJoined && !isEnded && !challenge.settled && !isCancelled;
  const canComplete = hasJoined && !hasCompleted && !isEnded && !challenge.settled && !isCancelled;
  const canSettle = isEnded && !challenge.settled && !isCancelled;

  const potentialWinnings = completerCount > 0 
    ? Number(challenge.totalPool) / (completerCount + (hasJoined && !hasCompleted ? 1 : 0))
    : Number(challenge.totalPool);
  const potentialWinningsFormatted = formatUSDCBalance(BigInt(Math.floor(potentialWinnings)));

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
      {/* USDC Badge */}
      <div className="flex items-center gap-2 mb-2">
        <div className="px-3 py-1 bg-usdc-blue/20 border border-usdc-blue/30 rounded-full flex items-center gap-2">
          <CircleLogo className="w-4 h-4" />
          <span className="text-sm font-medium text-usdc-blue">USDC Challenge</span>
        </div>
      </div>

      {/* Main Card */}
      <div className="card overflow-hidden border-usdc-blue/30">
        {/* Status Banner */}
        <div className={`-mx-6 -mt-6 px-6 py-3 mb-6 ${
          challenge.settled 
            ? "bg-green-500/10 border-b border-green-500/20" 
            : isEnded 
              ? "bg-orange-500/10 border-b border-orange-500/20" 
              : "bg-usdc-blue/10 border-b border-usdc-blue/20"
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                challenge.settled 
                  ? "bg-green-400" 
                  : isEnded 
                    ? "bg-orange-400 animate-pulse" 
                    : "bg-usdc-blue animate-pulse"
              }`} />
              <span className={`text-sm font-medium ${
                challenge.settled 
                  ? "text-green-400" 
                  : isEnded 
                    ? "text-orange-400" 
                    : "text-usdc-blue"
              }`}>
                {challenge.settled ? "✓ Settled" : isEnded ? "Ready to Settle" : "Active USDC Challenge"}
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
              {challenge.description || `USDC Challenge #${challengeId}`}
            </h1>
            <p className="text-sm text-stride-muted flex items-center gap-2">
              <CircleLogo className="w-5 h-5" />
              {challenge.creator.slice(0, 8)}...{challenge.creator.slice(-6)}
            </p>
          </div>
          <div className="flex gap-2">
            {!challenge.settled && (
              <button
                onClick={() => setShowShareModal(true)}
                className="p-3 bg-stride-dark border border-white/10 hover:border-usdc-blue/50 rounded-xl transition-colors"
                title="Share Challenge"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatCard label="Entry Stake" value={`${stakeUSDC} USDC`} isUSDC />
          <StatCard label="Prize Pool" value={`${poolUSDC} USDC`} isUSDC highlight />
          <StatCard label="Runners" value={participantCount.toString()} />
          <StatCard label="Finished" value={`${completerCount}/${participantCount}`} />
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-stride-muted">Completion Rate</span>
            <span className="font-medium text-usdc-blue">
              {participantCount > 0 ? Math.round((completerCount / participantCount) * 100) : 0}%
            </span>
          </div>
          <div className="h-3 bg-stride-dark rounded-full overflow-hidden">
            <div 
              className="h-full bg-usdc-blue transition-all duration-500"
              style={{ width: `${participantCount > 0 ? (completerCount / participantCount) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Potential Winnings */}
        {hasJoined && !challenge.settled && (
          <div className="p-4 bg-usdc-blue/10 border border-usdc-blue/20 rounded-xl mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-stride-muted mb-1">Your Potential Winnings</p>
                <p className="text-2xl font-bold text-usdc-blue">
                  {potentialWinningsFormatted} USDC
                </p>
              </div>
              <CircleLogo className="w-12 h-12" />
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
        <div className="card border-usdc-blue/30">
          {canJoin && (
            <div className="text-center">
              <div className="w-16 h-16 bg-usdc-blue/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CircleLogo className="w-10 h-10" />
              </div>
              <h3 className="text-lg font-bold mb-2">Ready to Run?</h3>
              <p className="text-stride-muted mb-4">
                Stake {stakeUSDC} USDC and join {participantCount} other runner{participantCount !== 1 ? "s" : ""}!
              </p>
              
              {/* USDC Balance */}
              <div className="p-3 bg-usdc-blue/10 border border-usdc-blue/30 rounded-xl mb-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-stride-muted">Your USDC Balance</span>
                  <span className="text-usdc-blue font-medium">{formatUSDCBalance(usdcBalance)} USDC</span>
                </div>
              </div>

              {!hasEnoughBalance && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl mb-4 text-sm text-red-400">
                  Insufficient USDC balance
                </div>
              )}

              <button
                onClick={handleJoin}
                disabled={isJoining || isJoinConfirming || isApproving || isApproveConfirming || !hasEnoughBalance}
                className="btn-primary w-full text-lg py-4 bg-usdc-blue hover:bg-usdc-blue/90"
              >
                {isApproveConfirming || isApproving ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Approving USDC...
                  </span>
                ) : isJoinConfirming ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Confirming...
                  </span>
                ) : isJoining ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Joining...
                  </span>
                ) : !hasEnoughAllowance ? (
                  `Approve & Stake ${stakeUSDC} USDC`
                ) : (
                  `Join & Stake ${stakeUSDC} USDC`
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
              <p className="text-stride-muted mb-4">
                Take a proof pic and claim your share of the prize pool!
              </p>
              
              {/* Streak Badge */}
              <div className="flex justify-center mb-4">
                <StreakBadge />
              </div>
              
              <button
                onClick={handleComplete}
                disabled={isMarking || isMarkConfirming}
                className="btn-primary w-full text-lg py-4 flex items-center justify-center gap-3"
              >
                {isMarkConfirming ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Confirming...
                  </>
                ) : isMarking ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <span className="text-xl">📸</span>
                    Take Proof Pic & Complete
                  </>
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
              <p className="text-stride-muted mb-4">
                Wait for the challenge to end, then settle to claim your winnings.
              </p>
              
              {/* Show proof pic if taken */}
              {proofPicUrl && (
                <div className="mt-4">
                  <ProofPicDisplay 
                    challengeId={challengeId} 
                    imageUrl={proofPicUrl}
                    className="max-w-xs mx-auto aspect-[3/4]"
                  />
                </div>
              )}
              
              {/* Streak Badge */}
              <div className="flex justify-center mt-4">
                <StreakBadge showDetails />
              </div>
            </div>
          )}

          {canSettle && (
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400/20 to-orange-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CircleLogo className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold mb-2">Time&apos;s Up!</h3>
              <p className="text-stride-muted mb-6">
                {completerCount > 0 
                  ? `${completerCount} runner${completerCount !== 1 ? "s" : ""} finished! Settle to distribute ${poolUSDC} USDC.`
                  : "No one finished. Settle to refund all participants."
                }
              </p>
              <button
                onClick={handleSettle}
                disabled={isSettling || isSettleConfirming}
                className="btn-primary w-full text-lg py-4 bg-usdc-blue hover:bg-usdc-blue/90"
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
                  "Settle & Distribute USDC"
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Settled State */}
      {challenge.settled && (
        <div className="space-y-4">
          <div className="card border-green-500/30 text-center bg-green-500/5">
            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-2">Challenge Complete!</h2>
            <p className="text-stride-muted mb-4">
              {completerCount > 0 
                ? `${completerCount} winner${completerCount !== 1 ? "s" : ""} split ${poolUSDC} USDC`
                : "All participants were refunded"
              }
            </p>
            
            {/* Winner's winnings */}
            {hasCompleted && completerCount > 0 && (
              <div className="bg-usdc-blue/10 border border-usdc-blue/30 rounded-xl p-4 mb-4 inline-block">
                <p className="text-sm text-usdc-blue mb-1">You earned</p>
                <p className="text-2xl font-bold text-usdc-blue">
                  {formatUSDCBalance(BigInt(Math.floor(Number(challenge.totalPool) / completerCount)))} USDC
                </p>
              </div>
            )}

            {/* Share button */}
            <button
              onClick={() => setShowShareCard(true)}
              className="btn-primary px-8 py-3 inline-flex items-center gap-2 bg-usdc-blue hover:bg-usdc-blue/90"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Share Your Achievement
            </button>
          </div>

          {/* Hype Reactions */}
          <ReactionBar challengeId={challengeId} />

          {/* Rematch Card */}
          {!showRematchCard ? (
            <button
              onClick={() => setShowRematchCard(true)}
              className="w-full p-4 bg-usdc-blue/10 border border-usdc-blue/20 rounded-xl hover:border-usdc-blue/40 transition-colors flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5 text-usdc-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="font-medium text-usdc-blue">Want a rematch?</span>
            </button>
          ) : (
            <RematchCard
              groupId={BigInt(challenge.groupId || 0)}
              stakeAmount={stakeUSDC}
              currency="USDC"
              duration={Number(challenge.endTime) - Math.floor(Date.now() / 1000) + 86400}
              description={challenge.description || `Challenge #${challengeId}`}
              participantCount={participantCount}
              onClose={() => setShowRematchCard(false)}
            />
          )}
        </div>
      )}

      {/* Participants */}
      <div className="card border-usdc-blue/30">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <CircleLogo className="w-5 h-5" />
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
                      ? "bg-usdc-blue/10 border border-usdc-blue/30" 
                      : "bg-stride-dark border border-white/5 hover:border-white/10"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                        isCompleter 
                          ? "bg-gradient-to-br from-green-400 to-emerald-500 text-white" 
                          : "bg-usdc-blue text-white"
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
                          <span className="text-xs text-usdc-blue font-medium">You</span>
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
          description={challenge.description || `USDC Challenge #${challengeId}`}
          stakeAmount={stakeUSDC}
          onClose={() => setShowShareModal(false)}
        />
      )}

      {/* Camera Modal */}
      {showCamera && (
        <div className="fixed inset-0 z-50">
          <ProofPicCamera
            challengeId={challengeId}
            onCapture={handleCameraCapture}
            onClose={() => setShowCamera(false)}
          />
          {/* Skip photo option */}
          <button
            onClick={handleSkipPhoto}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-6 py-2 bg-white/10 hover:bg-white/20 rounded-full text-sm transition-colors"
          >
            Skip Photo
          </button>
        </div>
      )}

      {/* Victory Celebration Modal */}
      {showVictory && completerCount > 0 && (
        <VictoryCelebration
          winAmount={formatUSDCBalance(BigInt(Math.floor(Number(challenge.totalPool) / completerCount)))}
          currency="USDC"
          onClose={() => setShowVictory(false)}
        />
      )}

      {/* Share Card Modal */}
      {showShareCard && (
        <ShareCard
          challengeId={challengeId}
          description={challenge.description || `USDC Challenge #${challengeId}`}
          stakeAmount={stakeUSDC}
          currency="USDC"
          participantCount={participantCount}
          completerCount={completerCount}
          winAmount={hasCompleted && completerCount > 0 ? formatUSDCBalance(BigInt(Math.floor(Number(challenge.totalPool) / completerCount))) : undefined}
          isWinner={hasCompleted && challenge.settled}
          participants={participants ? [...participants] : undefined}
          onClose={() => setShowShareCard(false)}
        />
      )}
    </div>
  );
}

function StatCard({ label, value, highlight = false, isUSDC = false }: { label: string; value: string; highlight?: boolean; isUSDC?: boolean }) {
  return (
    <div className="p-4 bg-stride-dark border border-white/10 rounded-xl">
      <div className="flex items-center gap-2 mb-2">
        {isUSDC ? (
          <CircleLogo className={`w-4 h-4 ${highlight ? "" : "opacity-60"}`} />
        ) : (
          <svg className={`w-4 h-4 ${highlight ? "text-usdc-blue" : "text-stride-muted"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        )}
        <p className="text-xs text-stride-muted">{label}</p>
      </div>
      <p className={`text-lg font-bold ${highlight ? "text-usdc-blue" : ""}`}>{value}</p>
    </div>
  );
}


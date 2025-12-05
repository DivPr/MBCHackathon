"use client";

import { useChallenge, useParticipants, useCompleters } from "@/hooks/useChallenge";
import { useUSDCChallenge, useUSDCParticipants, useUSDCCompleters, formatUSDCBalance } from "@/hooks/useUSDC";
import { formatEther } from "viem";
import Link from "next/link";
import { useState, useEffect } from "react";
import { CircleLogo } from "./USDCStakeButton";

interface ChallengeCardProps {
  challengeId: bigint;
  challengeType?: "ETH" | "USDC" | "auto"; // Specify which contract to use
}

export function ChallengeCard({ challengeId, challengeType = "auto" }: ChallengeCardProps) {
  // Fetch from ETH contract
  const { 
    data: ethChallenge, 
    isLoading: ethLoading, 
    error: ethError 
  } = useChallenge(challengeId);
  const { data: ethParticipants } = useParticipants(challengeId);
  const { data: ethCompleters } = useCompleters(challengeId);

  // Fetch from USDC contract
  const { 
    data: usdcChallenge, 
    isLoading: usdcLoading, 
    error: usdcError 
  } = useUSDCChallenge(challengeId);
  const { data: usdcParticipants } = useUSDCParticipants(challengeId);
  const { data: usdcCompleters } = useUSDCCompleters(challengeId);

  const [timeLeft, setTimeLeft] = useState("");
  const [mounted, setMounted] = useState(false);
  const [detectedType, setDetectedType] = useState<"ETH" | "USDC" | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Determine which contract the challenge is from
  useEffect(() => {
    if (!mounted) return;
    
    if (challengeType !== "auto") {
      setDetectedType(challengeType);
      return;
    }

    // Auto-detect: check which contract has valid data
    const ethValid = ethChallenge && 
      !ethError && 
      ethChallenge.endTime > BigInt(0) && 
      (ethChallenge.description?.length > 0 || ethChallenge.stakeAmount > BigInt(0));
    
    const usdcValid = usdcChallenge && 
      !usdcError && 
      usdcChallenge.endTime > BigInt(0) && 
      (usdcChallenge.description?.length > 0 || usdcChallenge.stakeAmount > BigInt(0));

    // Prefer USDC if it has a valid description and ETH doesn't
    if (usdcValid && (!ethValid || (usdcChallenge.description?.length > 0 && !ethChallenge?.description?.length))) {
      setDetectedType("USDC");
    } else if (ethValid) {
      setDetectedType("ETH");
    } else if (usdcValid) {
      setDetectedType("USDC");
    }
  }, [ethChallenge, usdcChallenge, ethError, usdcError, mounted, challengeType]);

  // Use the correct data based on detected type
  const challenge = detectedType === "USDC" ? usdcChallenge : ethChallenge;
  const participants = detectedType === "USDC" ? usdcParticipants : ethParticipants;
  const completers = detectedType === "USDC" ? usdcCompleters : ethCompleters;
  const isLoading = detectedType === null ? (ethLoading && usdcLoading) : 
    (detectedType === "USDC" ? usdcLoading : ethLoading);
  const error = detectedType === "USDC" ? usdcError : ethError;
  const currency = detectedType === "USDC" ? "USDC" : "ETH";
  const isUSDC = detectedType === "USDC";

  useEffect(() => {
    if (!challenge || !mounted) return;
    
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
      
      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h left`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m left`);
      } else {
        setTimeLeft(`${minutes}m left`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000);
    return () => clearInterval(interval);
  }, [challenge, mounted]);

  // Show nothing if challenge doesn't exist (cancelled or error)
  if (error || (mounted && !isLoading && !challenge)) {
    return null;
  }

  if (!mounted || isLoading || !detectedType) {
    return (
      <div className="card animate-pulse border-white/10">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-12 h-12 bg-white/5 rounded-xl" />
          <div className="flex-1">
            <div className="h-5 bg-white/5 rounded w-2/3 mb-2" />
            <div className="h-4 bg-white/5 rounded w-1/2" />
          </div>
        </div>
        <div className="h-2 bg-white/5 rounded-full mb-4" />
        <div className="flex items-center justify-between">
          <div className="h-4 bg-white/5 rounded w-1/4" />
          <div className="h-4 bg-white/5 rounded w-1/4" />
        </div>
      </div>
    );
  }

  // TypeScript guard - challenge is defined after loading check
  if (!challenge) {
    return null;
  }
  
  // Skip cancelled challenges
  if (challenge.cancelled) {
    return null;
  }

  const endTime = new Date(Number(challenge.endTime) * 1000);
  const now = new Date();
  const isEnded = endTime < now;

  const participantCount = participants?.length || 0;
  const completerCount = completers?.length || 0;
  
  // Format stake amount based on currency
  const stakeDisplay = isUSDC 
    ? formatUSDCBalance(challenge.stakeAmount)
    : formatEther(challenge.stakeAmount);
  const poolDisplay = isUSDC
    ? formatUSDCBalance(challenge.totalPool)
    : formatEther(challenge.totalPool);
  
  const progressPercent = participantCount > 0 ? (completerCount / participantCount) * 100 : 0;

  return (
    <Link href={`/challenge/${challengeId}${isUSDC ? "?type=usdc" : ""}`}>
      <div className={`card hover:border-stride-purple/50 transition-all duration-300 cursor-pointer group hover:-translate-y-1 border-white/10 ${isUSDC ? "ring-1 ring-usdc-blue/20" : ""}`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform ${
              isUSDC 
                ? "bg-usdc-blue" 
                : "bg-gradient-to-br from-stride-purple to-pink-500"
            }`}>
              {isUSDC ? (
                <CircleLogo className="w-7 h-7" />
              ) : (
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              )}
            </div>
            <div>
              <h3 className="font-bold text-lg group-hover:text-stride-purple transition-colors">
                {challenge.description || `Challenge #${challengeId}`}
              </h3>
              <p className="text-sm text-stride-muted flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {participantCount} runner{participantCount !== 1 ? "s" : ""} • {completerCount} finished
              </p>
            </div>
          </div>
          <StatusBadge isSettled={challenge.settled} isEnded={isEnded} isUSDC={isUSDC} />
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-stride-muted">Completion</span>
            <span className={`font-medium ${isUSDC ? "text-usdc-blue" : "text-stride-purple"}`}>
              {Math.round(progressPercent)}%
            </span>
          </div>
          <div className="h-2 bg-stride-dark rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${
                isUSDC 
                  ? "bg-usdc-blue" 
                  : "bg-gradient-to-r from-stride-purple to-pink-500"
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {isUSDC ? (
                <CircleLogo className="w-4 h-4" />
              ) : (
                <svg className="w-4 h-4 text-stride-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              <span className={`text-sm ${isUSDC ? "text-usdc-blue" : ""}`}>
                {stakeDisplay} {currency}
              </span>
            </div>
            <div className="w-px h-4 bg-white/10" />
            <div className="flex items-center gap-2">
              <svg className={`w-4 h-4 ${isUSDC ? "text-usdc-blue" : "text-stride-purple"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className={`text-sm font-medium ${isUSDC ? "text-usdc-blue" : "text-stride-purple"}`}>
                {poolDisplay} {currency}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-stride-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm text-stride-muted">
              {challenge.settled ? "Settled" : timeLeft || (isEnded ? "Ended" : "...")}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function StatusBadge({ isSettled, isEnded, isUSDC }: { isSettled: boolean; isEnded: boolean; isUSDC: boolean }) {
  if (isSettled) {
    return (
      <span className="px-3 py-1.5 text-xs font-medium bg-green-500/20 text-green-400 rounded-full flex items-center gap-1.5">
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        Settled
      </span>
    );
  }
  if (isEnded) {
    return (
      <span className="px-3 py-1.5 text-xs font-medium bg-orange-500/20 text-orange-400 rounded-full animate-pulse">
        Settle Now
      </span>
    );
  }
  return (
    <span className={`px-3 py-1.5 text-xs font-medium rounded-full flex items-center gap-1.5 ${
      isUSDC 
        ? "bg-usdc-blue/20 text-usdc-blue" 
        : "bg-stride-purple/20 text-stride-purple"
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isUSDC ? "bg-usdc-blue" : "bg-stride-purple"}`} />
      {isUSDC ? "USDC" : "Active"}
    </span>
  );
}

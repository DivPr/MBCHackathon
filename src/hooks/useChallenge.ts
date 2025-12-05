"use client";

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { STRIDE_CHALLENGE_ADDRESS, STRIDE_CHALLENGE_ABI } from "@/config/contracts";
import { parseEther } from "viem";

// ============ Read Hooks ============

export function useChallengeCount() {
  return useReadContract({
    address: STRIDE_CHALLENGE_ADDRESS,
    abi: STRIDE_CHALLENGE_ABI,
    functionName: "challengeCount",
    query: {
      refetchInterval: 5000, // Refetch every 5 seconds
    },
  });
}

export function useChallenge(challengeId: bigint) {
  return useReadContract({
    address: STRIDE_CHALLENGE_ADDRESS,
    abi: STRIDE_CHALLENGE_ABI,
    functionName: "getChallenge",
    args: [challengeId],
    query: {
      retry: 1, // Only retry once
      retryDelay: 500,
    },
  });
}

export function useParticipants(challengeId: bigint) {
  return useReadContract({
    address: STRIDE_CHALLENGE_ADDRESS,
    abi: STRIDE_CHALLENGE_ABI,
    functionName: "getParticipants",
    args: [challengeId],
  });
}

export function useHasJoined(challengeId: bigint, address?: `0x${string}`) {
  return useReadContract({
    address: STRIDE_CHALLENGE_ADDRESS,
    abi: STRIDE_CHALLENGE_ABI,
    functionName: "hasJoined",
    args: address ? [challengeId, address] : undefined,
    query: {
      enabled: !!address,
    },
  });
}

export function useHasCompleted(challengeId: bigint, address?: `0x${string}`) {
  return useReadContract({
    address: STRIDE_CHALLENGE_ADDRESS,
    abi: STRIDE_CHALLENGE_ABI,
    functionName: "hasCompleted",
    args: address ? [challengeId, address] : undefined,
    query: {
      enabled: !!address,
    },
  });
}

export function useCompleters(challengeId: bigint) {
  return useReadContract({
    address: STRIDE_CHALLENGE_ADDRESS,
    abi: STRIDE_CHALLENGE_ABI,
    functionName: "getCompleters",
    args: [challengeId],
  });
}

export function useHasVotedCancel(challengeId: bigint, address?: `0x${string}`) {
  return useReadContract({
    address: STRIDE_CHALLENGE_ADDRESS,
    abi: STRIDE_CHALLENGE_ABI,
    functionName: "hasVotedCancel",
    args: address ? [challengeId, address] : undefined,
    query: {
      enabled: !!address,
    },
  });
}

export function useCancelVoteStatus(challengeId: bigint) {
  return useReadContract({
    address: STRIDE_CHALLENGE_ADDRESS,
    abi: STRIDE_CHALLENGE_ABI,
    functionName: "getCancelVoteStatus",
    args: [challengeId],
  });
}

export function useUserStats(address?: `0x${string}`) {
  return useReadContract({
    address: STRIDE_CHALLENGE_ADDRESS,
    abi: STRIDE_CHALLENGE_ABI,
    functionName: "getUserStats",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });
}

// ============ Write Hooks ============

export function useCreateChallenge() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const createChallenge = async (
    stakeAmount: string,
    duration: number,
    description: string,
    groupId?: number
  ) => {
    const value = parseEther(stakeAmount);
    
    if (groupId && groupId > 0) {
      // Create with group
      writeContract({
        address: STRIDE_CHALLENGE_ADDRESS,
        abi: STRIDE_CHALLENGE_ABI,
        functionName: "createChallenge",
        args: [value, BigInt(duration), description, BigInt(groupId)],
        value,
      });
    } else {
      // Create without group
      writeContract({
        address: STRIDE_CHALLENGE_ADDRESS,
        abi: STRIDE_CHALLENGE_ABI,
        functionName: "createChallenge",
        args: [value, BigInt(duration), description],
        value,
      });
    }
  };

  return {
    createChallenge,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}

export function useJoinChallenge() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const joinChallenge = async (challengeId: bigint, stakeAmount: bigint) => {
    writeContract({
      address: STRIDE_CHALLENGE_ADDRESS,
      abi: STRIDE_CHALLENGE_ABI,
      functionName: "joinChallenge",
      args: [challengeId],
      value: stakeAmount,
    });
  };

  return {
    joinChallenge,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}

export function useMarkCompleted() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const markCompleted = async (challengeId: bigint) => {
    writeContract({
      address: STRIDE_CHALLENGE_ADDRESS,
      abi: STRIDE_CHALLENGE_ABI,
      functionName: "markCompleted",
      args: [challengeId],
    });
  };

  return {
    markCompleted,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}

export function useSettleChallenge() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const settleChallenge = async (challengeId: bigint) => {
    writeContract({
      address: STRIDE_CHALLENGE_ADDRESS,
      abi: STRIDE_CHALLENGE_ABI,
      functionName: "settleChallenge",
      args: [challengeId],
    });
  };

  return {
    settleChallenge,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}

export function useVoteCancelChallenge() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const voteCancelChallenge = async (challengeId: bigint) => {
    writeContract({
      address: STRIDE_CHALLENGE_ADDRESS,
      abi: STRIDE_CHALLENGE_ABI,
      functionName: "voteCancelChallenge",
      args: [challengeId],
    });
  };

  return {
    voteCancelChallenge,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}

export function useCreatorCancelChallenge() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const creatorCancelChallenge = async (challengeId: bigint) => {
    writeContract({
      address: STRIDE_CHALLENGE_ADDRESS,
      abi: STRIDE_CHALLENGE_ABI,
      functionName: "creatorCancelChallenge",
      args: [challengeId],
    });
  };

  return {
    creatorCancelChallenge,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}

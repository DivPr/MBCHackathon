import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { STRIDE_CHALLENGE_ADDRESS, STRIDE_CHALLENGE_ABI } from "@/config/contracts";
import { parseEther } from "viem";

// Types
export interface Challenge {
  id: bigint;
  creator: `0x${string}`;
  stakeAmount: bigint;
  endTime: bigint;
  description: string;
  settled: boolean;
  totalPool: bigint;
}

// Read challenge count
export function useChallengeCount() {
  return useReadContract({
    address: STRIDE_CHALLENGE_ADDRESS,
    abi: STRIDE_CHALLENGE_ABI,
    functionName: "challengeCount",
  });
}

// Read single challenge
export function useChallenge(challengeId: bigint) {
  return useReadContract({
    address: STRIDE_CHALLENGE_ADDRESS,
    abi: STRIDE_CHALLENGE_ABI,
    functionName: "getChallenge",
    args: [challengeId],
  });
}

// Read participants
export function useParticipants(challengeId: bigint) {
  return useReadContract({
    address: STRIDE_CHALLENGE_ADDRESS,
    abi: STRIDE_CHALLENGE_ABI,
    functionName: "getParticipants",
    args: [challengeId],
  });
}

// Check if user has joined
export function useHasJoined(challengeId: bigint, address: `0x${string}` | undefined) {
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

// Check if user has completed
export function useHasCompleted(challengeId: bigint, address: `0x${string}` | undefined) {
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

// Get all completers
export function useCompleters(challengeId: bigint) {
  return useReadContract({
    address: STRIDE_CHALLENGE_ADDRESS,
    abi: STRIDE_CHALLENGE_ABI,
    functionName: "getCompleters",
    args: [challengeId],
  });
}

// Create challenge hook
export function useCreateChallenge() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const createChallenge = async (
    stakeAmountEth: string,
    durationSeconds: number,
    description: string
  ) => {
    const stakeAmount = parseEther(stakeAmountEth);
    
    writeContract({
      address: STRIDE_CHALLENGE_ADDRESS,
      abi: STRIDE_CHALLENGE_ABI,
      functionName: "createChallenge",
      args: [stakeAmount, BigInt(durationSeconds), description],
      value: stakeAmount,
    });
  };

  return {
    createChallenge,
    isPending,
    isConfirming,
    isSuccess,
    hash,
    error,
  };
}

// Join challenge hook
export function useJoinChallenge() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const joinChallenge = (challengeId: bigint, stakeAmount: bigint) => {
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
    hash,
    error,
  };
}

// Mark completed hook
export function useMarkCompleted() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const markCompleted = (challengeId: bigint) => {
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
    hash,
    error,
  };
}

// Settle challenge hook
export function useSettleChallenge() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const settleChallenge = (challengeId: bigint) => {
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
    hash,
    error,
  };
}


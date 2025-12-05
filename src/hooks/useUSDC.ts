"use client";

import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from "wagmi";
import {
  USDC_ADDRESS,
  STRIDE_USDC_CHALLENGE_ADDRESS,
  STRIDE_USDC_CHALLENGE_ABI,
  ERC20_ABI,
  parseUSDC,
  USDC_DECIMALS,
} from "@/config/usdcContract";

// ============ USDC Token Hooks ============

/**
 * Get USDC balance for an address
 */
export function useUSDCBalance(address?: `0x${string}`) {
  return useReadContract({
    address: USDC_ADDRESS,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      refetchInterval: 10000, // Refresh every 10 seconds
    },
  });
}

/**
 * Get USDC allowance for the Stride contract
 */
export function useUSDCAllowance(owner?: `0x${string}`) {
  return useReadContract({
    address: USDC_ADDRESS,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: owner ? [owner, STRIDE_USDC_CHALLENGE_ADDRESS] : undefined,
    query: {
      enabled: !!owner && STRIDE_USDC_CHALLENGE_ADDRESS !== "0x0000000000000000000000000000000000000000",
      refetchInterval: 5000,
    },
  });
}

/**
 * Approve USDC spending for the Stride contract
 */
export function useApproveUSDC() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const approve = async (amount: string) => {
    const parsedAmount = parseUSDC(amount);
    // Approve slightly more to handle any rounding issues
    const approvalAmount = parsedAmount + BigInt(1000);
    
    writeContract({
      address: USDC_ADDRESS,
      abi: ERC20_ABI,
      functionName: "approve",
      args: [STRIDE_USDC_CHALLENGE_ADDRESS, approvalAmount],
    });
  };

  const approveMax = async () => {
    // Approve max uint256 for unlimited approvals
    writeContract({
      address: USDC_ADDRESS,
      abi: ERC20_ABI,
      functionName: "approve",
      args: [STRIDE_USDC_CHALLENGE_ADDRESS, BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff")],
    });
  };

  return {
    approve,
    approveMax,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}

// ============ USDC Challenge Manager Hooks ============

/**
 * Get challenge count from USDC contract
 */
export function useUSDCChallengeCount() {
  return useReadContract({
    address: STRIDE_USDC_CHALLENGE_ADDRESS,
    abi: STRIDE_USDC_CHALLENGE_ABI,
    functionName: "challengeCount",
    query: {
      enabled: STRIDE_USDC_CHALLENGE_ADDRESS !== "0x0000000000000000000000000000000000000000",
      refetchInterval: 5000,
    },
  });
}

/**
 * Get challenge details from USDC contract
 */
export function useUSDCChallenge(challengeId: bigint) {
  return useReadContract({
    address: STRIDE_USDC_CHALLENGE_ADDRESS,
    abi: STRIDE_USDC_CHALLENGE_ABI,
    functionName: "getChallenge",
    args: [challengeId],
    query: {
      enabled: STRIDE_USDC_CHALLENGE_ADDRESS !== "0x0000000000000000000000000000000000000000",
      retry: 1,
      retryDelay: 500,
    },
  });
}

/**
 * Get participants of a USDC challenge
 */
export function useUSDCParticipants(challengeId: bigint) {
  return useReadContract({
    address: STRIDE_USDC_CHALLENGE_ADDRESS,
    abi: STRIDE_USDC_CHALLENGE_ABI,
    functionName: "getParticipants",
    args: [challengeId],
    query: {
      enabled: STRIDE_USDC_CHALLENGE_ADDRESS !== "0x0000000000000000000000000000000000000000",
    },
  });
}

/**
 * Check if user has joined a USDC challenge
 */
export function useUSDCHasJoined(challengeId: bigint, address?: `0x${string}`) {
  return useReadContract({
    address: STRIDE_USDC_CHALLENGE_ADDRESS,
    abi: STRIDE_USDC_CHALLENGE_ABI,
    functionName: "hasJoined",
    args: address ? [challengeId, address] : undefined,
    query: {
      enabled: !!address && STRIDE_USDC_CHALLENGE_ADDRESS !== "0x0000000000000000000000000000000000000000",
    },
  });
}

/**
 * Check if user has completed a USDC challenge
 */
export function useUSDCHasCompleted(challengeId: bigint, address?: `0x${string}`) {
  return useReadContract({
    address: STRIDE_USDC_CHALLENGE_ADDRESS,
    abi: STRIDE_USDC_CHALLENGE_ABI,
    functionName: "hasCompleted",
    args: address ? [challengeId, address] : undefined,
    query: {
      enabled: !!address && STRIDE_USDC_CHALLENGE_ADDRESS !== "0x0000000000000000000000000000000000000000",
    },
  });
}

/**
 * Get completers of a USDC challenge
 */
export function useUSDCCompleters(challengeId: bigint) {
  return useReadContract({
    address: STRIDE_USDC_CHALLENGE_ADDRESS,
    abi: STRIDE_USDC_CHALLENGE_ABI,
    functionName: "getCompleters",
    args: [challengeId],
    query: {
      enabled: STRIDE_USDC_CHALLENGE_ADDRESS !== "0x0000000000000000000000000000000000000000",
    },
  });
}

/**
 * Get user stats from USDC contract
 */
export function useUSDCUserStats(address?: `0x${string}`) {
  return useReadContract({
    address: STRIDE_USDC_CHALLENGE_ADDRESS,
    abi: STRIDE_USDC_CHALLENGE_ABI,
    functionName: "getUserStats",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && STRIDE_USDC_CHALLENGE_ADDRESS !== "0x0000000000000000000000000000000000000000",
    },
  });
}

// ============ Write Hooks ============

/**
 * Create a USDC challenge
 */
export function useCreateUSDCChallenge() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const createChallenge = async (
    stakeAmount: string,
    duration: number,
    description: string,
    groupId?: number
  ) => {
    const parsedAmount = parseUSDC(stakeAmount);
    
    if (groupId && groupId > 0) {
      writeContract({
        address: STRIDE_USDC_CHALLENGE_ADDRESS,
        abi: STRIDE_USDC_CHALLENGE_ABI,
        functionName: "createChallenge",
        args: [parsedAmount, BigInt(duration), description, BigInt(groupId)],
      });
    } else {
      writeContract({
        address: STRIDE_USDC_CHALLENGE_ADDRESS,
        abi: STRIDE_USDC_CHALLENGE_ABI,
        functionName: "createChallenge",
        args: [parsedAmount, BigInt(duration), description],
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

/**
 * Join a USDC challenge
 */
export function useJoinUSDCChallenge() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const joinChallenge = async (challengeId: bigint) => {
    writeContract({
      address: STRIDE_USDC_CHALLENGE_ADDRESS,
      abi: STRIDE_USDC_CHALLENGE_ABI,
      functionName: "joinChallenge",
      args: [challengeId],
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

/**
 * Mark challenge as completed
 */
export function useMarkUSDCCompleted() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const markCompleted = async (challengeId: bigint) => {
    writeContract({
      address: STRIDE_USDC_CHALLENGE_ADDRESS,
      abi: STRIDE_USDC_CHALLENGE_ABI,
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

/**
 * Settle a USDC challenge
 */
export function useSettleUSDCChallenge() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const settleChallenge = async (challengeId: bigint) => {
    writeContract({
      address: STRIDE_USDC_CHALLENGE_ADDRESS,
      abi: STRIDE_USDC_CHALLENGE_ABI,
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

/**
 * Vote to cancel a USDC challenge
 */
export function useVoteCancelUSDCChallenge() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const voteCancelChallenge = async (challengeId: bigint) => {
    writeContract({
      address: STRIDE_USDC_CHALLENGE_ADDRESS,
      abi: STRIDE_USDC_CHALLENGE_ABI,
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

/**
 * Creator cancel a USDC challenge
 */
export function useCreatorCancelUSDCChallenge() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const creatorCancelChallenge = async (challengeId: bigint) => {
    writeContract({
      address: STRIDE_USDC_CHALLENGE_ADDRESS,
      abi: STRIDE_USDC_CHALLENGE_ABI,
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

/**
 * Vote for early settle
 */
export function useVoteEarlySettleUSDC() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const voteEarlySettle = async (challengeId: bigint) => {
    writeContract({
      address: STRIDE_USDC_CHALLENGE_ADDRESS,
      abi: STRIDE_USDC_CHALLENGE_ABI,
      functionName: "voteEarlySettle",
      args: [challengeId],
    });
  };

  return {
    voteEarlySettle,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}

// ============ Utility Hooks ============

/**
 * Check if user has enough USDC and approval for an amount
 */
export function useCanStakeUSDC(amount: string) {
  const { address } = useAccount();
  const { data: balance } = useUSDCBalance(address);
  const { data: allowance } = useUSDCAllowance(address);
  
  const parsedAmount = parseUSDC(amount);
  
  const hasEnoughBalance = balance !== undefined && balance >= parsedAmount;
  const hasEnoughAllowance = allowance !== undefined && allowance >= parsedAmount;
  const needsApproval = hasEnoughBalance && !hasEnoughAllowance;
  
  return {
    hasEnoughBalance,
    hasEnoughAllowance,
    needsApproval,
    canStake: hasEnoughBalance && hasEnoughAllowance,
    balance,
    allowance,
    parsedAmount,
  };
}

/**
 * Format USDC balance for display
 */
export function formatUSDCBalance(balance: bigint | undefined): string {
  if (balance === undefined) return "0.00";
  const formatted = Number(balance) / Math.pow(10, USDC_DECIMALS);
  return formatted.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}


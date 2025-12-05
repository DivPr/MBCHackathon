"use client";

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { STRIDE_GROUPS_ADDRESS, STRIDE_GROUPS_ABI } from "@/config/groupsContract";

// ============ Read Hooks ============

export function useGroupCount() {
  return useReadContract({
    address: STRIDE_GROUPS_ADDRESS,
    abi: STRIDE_GROUPS_ABI,
    functionName: "groupCount",
    query: {
      refetchInterval: 3000, // Refetch every 3 seconds
    },
  });
}

export function useGroup(groupId: bigint) {
  return useReadContract({
    address: STRIDE_GROUPS_ADDRESS,
    abi: STRIDE_GROUPS_ABI,
    functionName: "getGroup",
    args: [groupId],
  });
}

export function useGroupMembers(groupId: bigint) {
  return useReadContract({
    address: STRIDE_GROUPS_ADDRESS,
    abi: STRIDE_GROUPS_ABI,
    functionName: "getGroupMembers",
    args: [groupId],
    query: {
      refetchInterval: 3000, // Refetch every 3 seconds
    },
  });
}

export function useGroupChallenges(groupId: bigint) {
  return useReadContract({
    address: STRIDE_GROUPS_ADDRESS,
    abi: STRIDE_GROUPS_ABI,
    functionName: "getGroupChallenges",
    args: [groupId],
    query: {
      refetchInterval: 3000, // Refetch every 3 seconds
    },
  });
}

export function useUserGroups(userAddress?: `0x${string}`) {
  return useReadContract({
    address: STRIDE_GROUPS_ADDRESS,
    abi: STRIDE_GROUPS_ABI,
    functionName: "getUserGroups",
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress,
    },
  });
}

export function useIsMember(groupId: bigint, userAddress?: `0x${string}`) {
  return useReadContract({
    address: STRIDE_GROUPS_ADDRESS,
    abi: STRIDE_GROUPS_ABI,
    functionName: "isMember",
    args: userAddress ? [groupId, userAddress] : undefined,
    query: {
      enabled: !!userAddress,
    },
  });
}

export function useLeaderboard(groupId: bigint) {
  return useReadContract({
    address: STRIDE_GROUPS_ADDRESS,
    abi: STRIDE_GROUPS_ABI,
    functionName: "getLeaderboard",
    args: [groupId],
  });
}

export function useInviteCode(groupId: bigint, userAddress?: `0x${string}`, creatorAddress?: `0x${string}`) {
  const isCreator = userAddress && creatorAddress && userAddress.toLowerCase() === creatorAddress.toLowerCase();
  
  return useReadContract({
    address: STRIDE_GROUPS_ADDRESS,
    abi: STRIDE_GROUPS_ABI,
    functionName: "getInviteCode",
    args: [groupId],
    account: userAddress,
    query: {
      enabled: !!isCreator, // Only fetch if user is the creator
    },
  });
}

export function useMemberStats(groupId: bigint, memberAddress?: `0x${string}`) {
  return useReadContract({
    address: STRIDE_GROUPS_ADDRESS,
    abi: STRIDE_GROUPS_ABI,
    functionName: "getMemberStats",
    args: memberAddress ? [groupId, memberAddress] : undefined,
    query: {
      enabled: !!memberAddress,
    },
  });
}

export function useGroupStats(groupId: bigint) {
  return useReadContract({
    address: STRIDE_GROUPS_ADDRESS,
    abi: STRIDE_GROUPS_ABI,
    functionName: "getGroupStats",
    args: [groupId],
  });
}

export function useIsGroupDeleted(groupId: bigint) {
  return useReadContract({
    address: STRIDE_GROUPS_ADDRESS,
    abi: STRIDE_GROUPS_ABI,
    functionName: "isGroupDeleted",
    args: [groupId],
  });
}

// ============ Write Hooks ============

export function useCreateGroup() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const createGroup = async (name: string, description: string, isPrivate: boolean) => {
    writeContract({
      address: STRIDE_GROUPS_ADDRESS,
      abi: STRIDE_GROUPS_ABI,
      functionName: "createGroup",
      args: [name, description, isPrivate],
    });
  };

  return {
    createGroup,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}

export function useDeleteGroup() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const deleteGroup = async (groupId: bigint) => {
    writeContract({
      address: STRIDE_GROUPS_ADDRESS,
      abi: STRIDE_GROUPS_ABI,
      functionName: "deleteGroup",
      args: [groupId],
    });
  };

  return {
    deleteGroup,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}

export function useJoinGroup() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const joinGroup = async (groupId: bigint) => {
    writeContract({
      address: STRIDE_GROUPS_ADDRESS,
      abi: STRIDE_GROUPS_ABI,
      functionName: "joinGroup",
      args: [groupId],
    });
  };

  return {
    joinGroup,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}

export function useJoinGroupWithCode() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const joinGroupWithCode = async (inviteCode: `0x${string}`) => {
    writeContract({
      address: STRIDE_GROUPS_ADDRESS,
      abi: STRIDE_GROUPS_ABI,
      functionName: "joinGroupWithCode",
      args: [inviteCode],
    });
  };

  return {
    joinGroupWithCode,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}

export function useLeaveGroup() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const leaveGroup = async (groupId: bigint) => {
    writeContract({
      address: STRIDE_GROUPS_ADDRESS,
      abi: STRIDE_GROUPS_ABI,
      functionName: "leaveGroup",
      args: [groupId],
    });
  };

  return {
    leaveGroup,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}

export function useTransferOwnership() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const transferOwnership = async (groupId: bigint, newCreator: `0x${string}`) => {
    writeContract({
      address: STRIDE_GROUPS_ADDRESS,
      abi: STRIDE_GROUPS_ABI,
      functionName: "transferOwnership",
      args: [groupId, newCreator],
    });
  };

  return {
    transferOwnership,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}

export function useUpdateDescription() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const updateDescription = async (groupId: bigint, description: string) => {
    writeContract({
      address: STRIDE_GROUPS_ADDRESS,
      abi: STRIDE_GROUPS_ABI,
      functionName: "updateDescription",
      args: [groupId, description],
    });
  };

  return {
    updateDescription,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}

export function useRegenerateInviteCode() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const regenerateInviteCode = async (groupId: bigint) => {
    writeContract({
      address: STRIDE_GROUPS_ADDRESS,
      abi: STRIDE_GROUPS_ABI,
      functionName: "regenerateInviteCode",
      args: [groupId],
    });
  };

  return {
    regenerateInviteCode,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}

export function useAddChallengeToGroup() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const addChallengeToGroup = async (groupId: bigint, challengeId: bigint, stakeAmount: bigint) => {
    writeContract({
      address: STRIDE_GROUPS_ADDRESS,
      abi: STRIDE_GROUPS_ABI,
      functionName: "addChallengeToGroup",
      args: [groupId, challengeId, stakeAmount],
    });
  };

  return {
    addChallengeToGroup,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}

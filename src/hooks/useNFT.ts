import { useWriteContract, useReadContract, useWaitForTransactionReceipt } from "wagmi";
import { SIMPLE_BADGE_NFT_ADDRESS, SIMPLE_BADGE_NFT_ABI, isNFTContractDeployed } from "@/config/nftContract";

/**
 * Hook for interacting with the SimpleBadgeNFT contract
 */
export function useNFT() {
  // Write contract hook for minting
  const {
    writeContract,
    data: mintTxHash,
    isPending: isMinting,
    error: mintError,
    reset: resetMint,
  } = useWriteContract();

  // Wait for transaction receipt
  const {
    isLoading: isWaitingForReceipt,
    isSuccess: isMintSuccess,
    data: mintReceipt,
  } = useWaitForTransactionReceipt({
    hash: mintTxHash,
  });

  /**
   * Mint a new badge NFT to the specified address
   */
  const mint = async (toAddress: `0x${string}`) => {
    if (!isNFTContractDeployed) {
      throw new Error("NFT contract not deployed. Please set NEXT_PUBLIC_NFT_CONTRACT_ADDRESS");
    }

    writeContract({
      address: SIMPLE_BADGE_NFT_ADDRESS,
      abi: SIMPLE_BADGE_NFT_ABI,
      functionName: "mint",
      args: [toAddress],
    });
  };

  return {
    // Actions
    mint,
    resetMint,

    // State
    isMinting: isMinting || isWaitingForReceipt,
    isMintSuccess,
    mintError,
    mintTxHash,
    mintReceipt,

    // Contract info
    isContractDeployed: isNFTContractDeployed,
    contractAddress: SIMPLE_BADGE_NFT_ADDRESS,
  };
}

/**
 * Hook to read NFT data
 */
export function useNFTRead() {
  // Read total supply
  const { data: totalSupply, refetch: refetchTotalSupply } = useReadContract({
    address: SIMPLE_BADGE_NFT_ADDRESS,
    abi: SIMPLE_BADGE_NFT_ABI,
    functionName: "totalSupply",
  });

  // Read NFT name
  const { data: name } = useReadContract({
    address: SIMPLE_BADGE_NFT_ADDRESS,
    abi: SIMPLE_BADGE_NFT_ABI,
    functionName: "name",
  });

  // Read NFT symbol
  const { data: symbol } = useReadContract({
    address: SIMPLE_BADGE_NFT_ADDRESS,
    abi: SIMPLE_BADGE_NFT_ABI,
    functionName: "symbol",
  });

  return {
    totalSupply: totalSupply ? Number(totalSupply) : 0,
    name: name as string | undefined,
    symbol: symbol as string | undefined,
    refetchTotalSupply,
    isContractDeployed: isNFTContractDeployed,
  };
}

/**
 * Hook to read user's NFT balance
 */
export function useNFTBalance(userAddress: `0x${string}` | undefined) {
  const { data: balance, refetch: refetchBalance } = useReadContract({
    address: SIMPLE_BADGE_NFT_ADDRESS,
    abi: SIMPLE_BADGE_NFT_ABI,
    functionName: "balanceOf",
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress && isNFTContractDeployed,
    },
  });

  return {
    balance: balance ? Number(balance) : 0,
    refetchBalance,
  };
}

/**
 * Hook to read token URI (metadata + image)
 */
export function useTokenURI(tokenId: number | undefined) {
  const { data: tokenURI, isLoading } = useReadContract({
    address: SIMPLE_BADGE_NFT_ADDRESS,
    abi: SIMPLE_BADGE_NFT_ABI,
    functionName: "tokenURI",
    args: tokenId !== undefined ? [BigInt(tokenId)] : undefined,
    query: {
      enabled: tokenId !== undefined && isNFTContractDeployed,
    },
  });

  // Parse the base64 encoded JSON metadata
  const parseTokenURI = (uri: string | undefined) => {
    if (!uri) return null;
    
    try {
      // Remove the data:application/json;base64, prefix
      const base64Data = uri.replace("data:application/json;base64,", "");
      const jsonString = atob(base64Data);
      return JSON.parse(jsonString);
    } catch (error) {
      console.error("Failed to parse token URI:", error);
      return null;
    }
  };

  const metadata = parseTokenURI(tokenURI as string | undefined);

  return {
    tokenURI: tokenURI as string | undefined,
    metadata,
    imageUrl: metadata?.image,
    isLoading,
  };
}


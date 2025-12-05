import { Address } from "viem";

// ============ Circle USDC Configuration ============
// USDC is the leading dollar-backed stablecoin by Circle
// https://developers.circle.com/

// USDC Contract Addresses
// Localhost Hardhat (MockUSDC): 0xa85233C63b9Ee964Add6F2cffe00Fd84eb32338f
// Base Sepolia: Official Circle USDC testnet deployment
export const USDC_ADDRESS: Address = 
  (process.env.NEXT_PUBLIC_USDC_ADDRESS as Address) ||
  "0xa85233C63b9Ee964Add6F2cffe00Fd84eb32338f"; // Localhost MockUSDC

// Base Sepolia USDC (for production deployment)
export const BASE_SEPOLIA_USDC: Address = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";

// Stride USDC Challenge Manager
// Localhost Hardhat: 0x4A679253410272dd5232B3Ff7cF5dbB88f295319
export const STRIDE_USDC_CHALLENGE_ADDRESS: Address =
  (process.env.NEXT_PUBLIC_USDC_CONTRACT_ADDRESS as Address) ||
  "0x4A679253410272dd5232B3Ff7cF5dbB88f295319";

// Check if USDC contract is deployed
export const isUSDCContractDeployed =
  STRIDE_USDC_CHALLENGE_ADDRESS !== "0x0000000000000000000000000000000000000000";

// USDC has 6 decimals (not 18 like ETH)
export const USDC_DECIMALS = 6;

// Helper to format USDC amounts
export function formatUSDC(amount: bigint): string {
  const formatted = Number(amount) / Math.pow(10, USDC_DECIMALS);
  return formatted.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// Helper to parse USDC amounts (string to bigint)
export function parseUSDC(amount: string): bigint {
  const parsed = parseFloat(amount);
  if (isNaN(parsed)) return BigInt(0);
  return BigInt(Math.floor(parsed * Math.pow(10, USDC_DECIMALS)));
}

// MockUSDC ABI (includes faucet for testing)
export const MOCK_USDC_ABI = [
  {
    type: "function",
    name: "faucet",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "mint",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
] as const;

// Standard ERC20 ABI (for USDC interactions)
export const ERC20_ABI = [
  {
    type: "function",
    name: "name",
    inputs: [],
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "symbol",
    inputs: [],
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "decimals",
    inputs: [],
    outputs: [{ name: "", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "totalSupply",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "balanceOf",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "allowance",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "approve",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "transfer",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "transferFrom",
    inputs: [
      { name: "from", type: "address" },
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "event",
    name: "Transfer",
    inputs: [
      { name: "from", type: "address", indexed: true },
      { name: "to", type: "address", indexed: true },
      { name: "value", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "Approval",
    inputs: [
      { name: "owner", type: "address", indexed: true },
      { name: "spender", type: "address", indexed: true },
      { name: "value", type: "uint256", indexed: false },
    ],
  },
] as const;

// Stride USDC Challenge Manager ABI
export const STRIDE_USDC_CHALLENGE_ABI = [
  // Events
  {
    type: "event",
    name: "ChallengeCreated",
    inputs: [
      { name: "challengeId", type: "uint256", indexed: true },
      { name: "creator", type: "address", indexed: true },
      { name: "stakeAmount", type: "uint256", indexed: false },
      { name: "endTime", type: "uint256", indexed: false },
      { name: "description", type: "string", indexed: false },
      { name: "groupId", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "ParticipantJoined",
    inputs: [
      { name: "challengeId", type: "uint256", indexed: true },
      { name: "participant", type: "address", indexed: true },
      { name: "stakeAmount", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "CompletionMarked",
    inputs: [
      { name: "challengeId", type: "uint256", indexed: true },
      { name: "participant", type: "address", indexed: true },
    ],
  },
  {
    type: "event",
    name: "ChallengeSettled",
    inputs: [
      { name: "challengeId", type: "uint256", indexed: true },
      { name: "winnersCount", type: "uint256", indexed: false },
      { name: "prizePerWinner", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "ChallengeCancelled",
    inputs: [
      { name: "challengeId", type: "uint256", indexed: true },
      { name: "reason", type: "string", indexed: false },
    ],
  },
  {
    type: "event",
    name: "DonatedToCharity",
    inputs: [
      { name: "challengeId", type: "uint256", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
    ],
  },

  // Read functions
  {
    type: "function",
    name: "usdc",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "challengeCount",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getChallenge",
    inputs: [{ name: "challengeId", type: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "id", type: "uint256" },
          { name: "creator", type: "address" },
          { name: "stakeAmount", type: "uint256" },
          { name: "endTime", type: "uint256" },
          { name: "description", type: "string" },
          { name: "settled", type: "bool" },
          { name: "cancelled", type: "bool" },
          { name: "totalPool", type: "uint256" },
          { name: "groupId", type: "uint256" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getParticipants",
    inputs: [{ name: "challengeId", type: "uint256" }],
    outputs: [{ name: "", type: "address[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "hasJoined",
    inputs: [
      { name: "challengeId", type: "uint256" },
      { name: "participant", type: "address" },
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "hasCompleted",
    inputs: [
      { name: "challengeId", type: "uint256" },
      { name: "participant", type: "address" },
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getCompleters",
    inputs: [{ name: "challengeId", type: "uint256" }],
    outputs: [{ name: "", type: "address[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "hasVotedCancel",
    inputs: [
      { name: "challengeId", type: "uint256" },
      { name: "user", type: "address" },
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getCancelVoteStatus",
    inputs: [{ name: "challengeId", type: "uint256" }],
    outputs: [
      { name: "votes", type: "uint256" },
      { name: "required", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "hasVotedEarlySettle",
    inputs: [
      { name: "challengeId", type: "uint256" },
      { name: "user", type: "address" },
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getEarlySettleVoteStatus",
    inputs: [{ name: "challengeId", type: "uint256" }],
    outputs: [
      { name: "votes", type: "uint256" },
      { name: "required", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getUserStats",
    inputs: [{ name: "user", type: "address" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "challengesCreated", type: "uint256" },
          { name: "challengesJoined", type: "uint256" },
          { name: "challengesCompleted", type: "uint256" },
          { name: "challengesWon", type: "uint256" },
          { name: "totalStaked", type: "uint256" },
          { name: "totalWon", type: "uint256" },
          { name: "totalLost", type: "uint256" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "charityAddress",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "totalDonatedToCharity",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getUSDCAddress",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
  },

  // Write functions
  {
    type: "function",
    name: "createChallenge",
    inputs: [
      { name: "stakeAmount", type: "uint256" },
      { name: "duration", type: "uint256" },
      { name: "description", type: "string" },
    ],
    outputs: [{ name: "challengeId", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "createChallenge",
    inputs: [
      { name: "stakeAmount", type: "uint256" },
      { name: "duration", type: "uint256" },
      { name: "description", type: "string" },
      { name: "groupId", type: "uint256" },
    ],
    outputs: [{ name: "challengeId", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "joinChallenge",
    inputs: [{ name: "challengeId", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "markCompleted",
    inputs: [{ name: "challengeId", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "settleChallenge",
    inputs: [{ name: "challengeId", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "voteCancelChallenge",
    inputs: [{ name: "challengeId", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "creatorCancelChallenge",
    inputs: [{ name: "challengeId", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "voteEarlySettle",
    inputs: [{ name: "challengeId", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
] as const;

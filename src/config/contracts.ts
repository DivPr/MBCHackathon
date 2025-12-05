import { Address } from "viem";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000" as Address;
const HARDHAT_STRIDE_CHALLENGE = "0x3Aa5ebB10DC797CAC828524e59A333d0A371443c" as Address;
const isLocalDev = process.env.NEXT_PUBLIC_LOCAL_DEV === "true";

// Contract address - update after deployment
// Localhost Hardhat: 0x3Aa5ebB10DC797CAC828524e59A333d0A371443c
// Base Sepolia: set NEXT_PUBLIC_CONTRACT_ADDRESS
export const STRIDE_CHALLENGE_ADDRESS: Address =
  (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS?.trim() as Address) ||
  (isLocalDev ? HARDHAT_STRIDE_CHALLENGE : ZERO_ADDRESS);

// Check if contract is deployed/configured
export const isContractDeployed = STRIDE_CHALLENGE_ADDRESS !== ZERO_ADDRESS;

// ABI for StrideChallengeManager
export const STRIDE_CHALLENGE_ABI = [
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
    name: "CompletionClaimed",
    inputs: [
      { name: "challengeId", type: "uint256", indexed: true },
      { name: "participant", type: "address", indexed: true },
      { name: "proofCid", type: "string", indexed: false },
    ],
  },
  {
    type: "event",
    name: "CompletionApproved",
    inputs: [
      { name: "challengeId", type: "uint256", indexed: true },
      { name: "runner", type: "address", indexed: true },
      { name: "verifier", type: "address", indexed: true },
      { name: "isValid", type: "bool", indexed: false },
      { name: "approvals", type: "uint256", indexed: false },
      { name: "requiredApprovals", type: "uint256", indexed: false },
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
    name: "CancelVoteCast",
    inputs: [
      { name: "challengeId", type: "uint256", indexed: true },
      { name: "voter", type: "address", indexed: true },
      { name: "totalVotes", type: "uint256", indexed: false },
      { name: "requiredVotes", type: "uint256", indexed: false },
    ],
  },

  // Read functions
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
    name: "getVerifiedCompleters",
    inputs: [{ name: "challengeId", type: "uint256" }],
    outputs: [{ name: "", type: "address[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getCompletionInfo",
    inputs: [
      { name: "challengeId", type: "uint256" },
      { name: "runner", type: "address" },
    ],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "claimed", type: "bool" },
          { name: "approvals", type: "uint256" },
          { name: "verified", type: "bool" },
          { name: "proofCid", type: "string" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "hasApproved",
    inputs: [
      { name: "challengeId", type: "uint256" },
      { name: "runner", type: "address" },
      { name: "voter", type: "address" },
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getApprovalThreshold",
    inputs: [{ name: "challengeId", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }],
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
    stateMutability: "payable",
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
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "joinChallenge",
    inputs: [{ name: "challengeId", type: "uint256" }],
    outputs: [],
    stateMutability: "payable",
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
    name: "markCompletedWithProof",
    inputs: [
      { name: "challengeId", type: "uint256" },
      { name: "proofCid", type: "string" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "approveCompletion",
    inputs: [
      { name: "challengeId", type: "uint256" },
      { name: "runner", type: "address" },
      { name: "isValid", type: "bool" },
    ],
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
] as const;

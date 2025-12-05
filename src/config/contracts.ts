import { Address } from "viem";

// Contract address - update after deployment
// Localhost Hardhat: 0x5FbDB2315678afecb367f032d93F642f64180aa3
export const STRIDE_CHALLENGE_ADDRESS: Address =
  ((process.env.NEXT_PUBLIC_CONTRACT_ADDRESS?.trim()) as Address) ||
  "0x5FbDB2315678afecb367f032d93F642f64180aa3";

// Check if contract is deployed
export const isContractDeployed = 
  STRIDE_CHALLENGE_ADDRESS !== "0x0000000000000000000000000000000000000000";

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
] as const;

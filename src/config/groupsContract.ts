import { Address } from "viem";

// Groups contract address - update after deployment
// Localhost Hardhat: 0xc6e7DF5E7b4f2A278906862b61205850344D4e7d
export const STRIDE_GROUPS_ADDRESS: Address =
  ((process.env.NEXT_PUBLIC_GROUPS_CONTRACT_ADDRESS?.trim()) as Address) ||
  "0xc6e7DF5E7b4f2A278906862b61205850344D4e7d";

export const STRIDE_GROUPS_ABI = [
  // Group Management
  {
    inputs: [
      { name: "_name", type: "string" },
      { name: "_description", type: "string" },
      { name: "_isPrivate", type: "bool" },
    ],
    name: "createGroup",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "_groupId", type: "uint256" }],
    name: "deleteGroup",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "_groupId", type: "uint256" }],
    name: "joinGroup",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "_inviteCode", type: "bytes32" }],
    name: "joinGroupWithCode",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "_groupId", type: "uint256" }],
    name: "leaveGroup",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "_groupId", type: "uint256" },
      { name: "_newCreator", type: "address" },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "_groupId", type: "uint256" },
      { name: "_description", type: "string" },
    ],
    name: "updateDescription",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "_groupId", type: "uint256" }],
    name: "regenerateInviteCode",
    outputs: [{ name: "", type: "bytes32" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "_groupId", type: "uint256" },
      { name: "_challengeId", type: "uint256" },
      { name: "_stakeAmount", type: "uint256" },
    ],
    name: "addChallengeToGroup",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "_groupId", type: "uint256" },
      { name: "_member", type: "address" },
      { name: "_amountWon", type: "uint256" },
      { name: "_didComplete", type: "bool" },
    ],
    name: "recordChallengeCompletion",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  // View Functions
  {
    inputs: [],
    name: "groupCount",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "_groupId", type: "uint256" }],
    name: "getGroup",
    outputs: [
      { name: "id", type: "uint256" },
      { name: "name", type: "string" },
      { name: "description", type: "string" },
      { name: "creator", type: "address" },
      { name: "memberCount", type: "uint256" },
      { name: "challengeCount", type: "uint256" },
      { name: "createdAt", type: "uint256" },
      { name: "isPrivate", type: "bool" },
      { name: "deleted", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "_groupId", type: "uint256" }],
    name: "getGroupMembers",
    outputs: [{ name: "", type: "address[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "_groupId", type: "uint256" }],
    name: "getGroupChallenges",
    outputs: [{ name: "", type: "uint256[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "_user", type: "address" }],
    name: "getUserGroups",
    outputs: [{ name: "", type: "uint256[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "_groupId", type: "uint256" }],
    name: "getInviteCode",
    outputs: [{ name: "", type: "bytes32" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "_groupId", type: "uint256" },
      { name: "_member", type: "address" },
    ],
    name: "getMemberStats",
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "challengesCompleted", type: "uint256" },
          { name: "challengesJoined", type: "uint256" },
          { name: "totalStaked", type: "uint256" },
          { name: "totalWon", type: "uint256" },
          { name: "lastActive", type: "uint256" },
          { name: "winStreak", type: "uint256" },
          { name: "bestWinStreak", type: "uint256" },
        ],
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "_groupId", type: "uint256" }],
    name: "getGroupStats",
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "totalChallenges", type: "uint256" },
          { name: "totalStaked", type: "uint256" },
          { name: "totalDistributed", type: "uint256" },
          { name: "activeChallenges", type: "uint256" },
        ],
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "_groupId", type: "uint256" }],
    name: "getLeaderboard",
    outputs: [
      { name: "members", type: "address[]" },
      { name: "completions", type: "uint256[]" },
      { name: "totalWon", type: "uint256[]" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "", type: "uint256" },
      { name: "", type: "address" },
    ],
    name: "isMember",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "_groupId", type: "uint256" }],
    name: "isGroupDeleted",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  // Events
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "groupId", type: "uint256" },
      { indexed: false, name: "name", type: "string" },
      { indexed: true, name: "creator", type: "address" },
      { indexed: false, name: "isPrivate", type: "bool" },
    ],
    name: "GroupCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "groupId", type: "uint256" },
      { indexed: true, name: "deletedBy", type: "address" },
    ],
    name: "GroupDeleted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "groupId", type: "uint256" },
      { indexed: true, name: "member", type: "address" },
    ],
    name: "MemberJoined",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "groupId", type: "uint256" },
      { indexed: true, name: "member", type: "address" },
    ],
    name: "MemberLeft",
    type: "event",
  },
] as const;

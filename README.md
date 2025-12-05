# Stride - Social Fitness Challenges on Base

<p align="center">
  <img src="https://img.shields.io/badge/Built%20on-Base-0052FF?style=for-the-badge&logo=ethereum" alt="Built on Base" />
  <img src="https://img.shields.io/badge/Powered%20by-Circle%20USDC-2775CA?style=for-the-badge" alt="Powered by Circle USDC" />
  <img src="https://img.shields.io/badge/MBC-Hackathon%202025-A855F7?style=for-the-badge" alt="MBC Hackathon 2025" />
</p>

A social fitness challenge app where friends commit to running goals, stake ETH or USDC, prove they completed the run, and the pot is automatically distributed to winners.

**Built on Base for the MBC Hackathon • Base Track + Circle USDC Bounty**

---

## Table of Contents

1. [Overview](#overview)
2. [Problem & Solution](#problem--solution)
3. [Circle USDC Integration](#-circle-usdc-integration-bounty-submission)
4. [Features](#features)
5. [Tech Stack](#tech-stack)
6. [Architecture](#architecture)
7. [Quick Start](#quick-start)
   - [Local Development](#local-development)
   - [Base Sepolia Deployment](#base-sepolia-deployment)
8. [Smart Contracts](#smart-contracts)
9. [User Flows](#user-flows)
10. [Deployed Contract Addresses](#deployed-contract-addresses)
11. [Resources](#resources)
12. [License](#license)

---

## Overview

**Stride** is a decentralized fitness accountability platform that leverages blockchain-based financial incentives to help users achieve their fitness goals. Users create or join challenges, stake cryptocurrency (ETH or USDC), and winners who complete their goals split the pot.

### Why Base?

- **Low Fees**: Transaction costs are minimal, making small stakes viable
- **Fast Finality**: Quick confirmation times for seamless UX
- **EVM Compatible**: Full Solidity support with familiar tooling
- **Coinbase Ecosystem**: Integration with Coinbase Smart Wallet for easy onboarding

---

## Problem & Solution

### The Problem
- **80% of New Year's resolutions fail** by February
- People struggle with fitness accountability
- Traditional fitness apps lack real skin-in-the-game incentives
- Cross-border participation is difficult with fiat currencies

### Our Solution
**Stride** creates social accountability with financial stakes:
- Put real money on the line with friends
- Complete your fitness goal or lose your stake
- Winners are rewarded with a share of the losers' stakes
- Global participation via USDC (dollar-denominated)

---

## 🏆 Circle USDC Integration (Bounty Submission)

**This project integrates Circle's USDC stablecoin** for fitness challenge staking, demonstrating a real-world payment use case on Base.

### Why USDC for Fitness Challenges?

| Benefit | Description |
|---------|-------------|
| **Price Stability** | Users stake a predictable dollar amount (e.g., $5 USDC) rather than volatile crypto |
| **Global Accessibility** | Anyone worldwide can participate with dollar-equivalent stakes |
| **Low Fees on Base** | Circle's native USDC on Base means minimal transaction costs |
| **Real-World Payments** | Demonstrates practical payment automation use case |

### Circle Integration Features

| Feature | Description |
|---------|-------------|
| **USDC Staking** | Users stake USDC instead of ETH for challenges |
| **ERC20 Approvals** | Smart approval flow with "Approve Max" option |
| **Prize Distribution** | Winners automatically receive USDC payouts |
| **Charity Donations** | Unclaimed pools donated to charity in USDC |
| **Testnet Faucet** | Built-in MockUSDC faucet for local development |

### Smart Contract: `StrideUSDCChallengeManager.sol`

```solidity
// Uses Circle USDC (6 decimals) for all staking
IERC20 public immutable usdc;

// Create challenge with USDC stake
function createChallenge(
    uint256 stakeAmount,    // USDC amount (6 decimals)
    uint256 duration,
    string calldata description,
    uint256 groupId
) external returns (uint256 challengeId)
```

### Get Testnet USDC

- **Circle Faucet**: https://faucet.circle.com/ (Base Sepolia)
- **USDC Address (Base Sepolia)**: `0x036CbD53842c5426634e7929541eC2318f3dCF7e`

---

## Features

-  **Create Challenges** - Set custom fitness goals with descriptions
-  **Dual Currency** - Stake ETH or USDC (Circle integration)
-  **Group Challenges** - Create and join groups with friends
-  **Leaderboards** - Track group member performance and win streaks
-  **Proof of Completion** - Mark runs as complete on-chain
-  **Auto Settlement** - Smart contract distributes prizes automatically
-  **NFT Badges** - On-chain SVG achievement badges
-  **Early Settlement** - Vote to end challenges early (consensus)
-  **Refund Voting** - Democratic cancellation with full refunds

---

## Tech Stack

### Frontend
- **Next.js 15** with TypeScript & App Router
- **Tailwind CSS** for modern styling
- **wagmi v2 + viem** for Web3 interactions
- **Coinbase Wallet** integration (Smart Wallet ready)

### Smart Contracts
- **Solidity 0.8.24** with OpenZeppelin
- **Hardhat** for development, testing, and deployment
- **Circle USDC** integration (ERC20)
- **On-chain SVG** NFT generation

### Networks
- **Base Sepolia** (Testnet)
- **Hardhat** (Local development)

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (Next.js)                       │
├─────────────────────────────────────────────────────────────────┤
│  wagmi hooks │ USDC Components │ Challenge UI │ Group UI │ NFTs │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                    ┌───────▼───────┐
                    │  wagmi/viem   │
                    └───────┬───────┘
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                     Base (L2 Ethereum)                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────┐  ┌───────────────────────────────┐    │
│  │ StrideChallengeManager│  │ StrideUSDCChallengeManager    │    │
│  │      (ETH stakes)     │  │   (Circle USDC stakes)        │    │
│  └──────────┬───────────┘  └──────────────┬────────────────┘    │
│             │                              │                     │
│             │         ┌────────────────────┼───────────────┐     │
│             └────────►│   StrideGroups     │◄──────────────┘     │
│                       │ (Leaderboards &    │                     │
│                       │  Group Management) │                     │
│                       └────────────────────┘                     │
│                                                                  │
│  ┌────────────────────┐   ┌──────────────────────────────────┐  │
│  │   SimpleBadgeNFT   │   │  Circle USDC Token (ERC20)       │  │
│  │  (On-chain SVG)    │   │  0x036CbD53842c5426634e7929...   │  │
│  └────────────────────┘   └──────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Quick Start

### Prerequisites
- Node.js 18+
- A wallet with Base Sepolia ETH ([Faucet](https://www.alchemy.com/faucets/base-sepolia))
- Testnet USDC from [Circle Faucet](https://faucet.circle.com/)

### Local Development

#### 1. Install Dependencies

```bash
# Clone the repository
git clone https://github.com/your-username/stride.git
cd stride

# Install frontend dependencies
npm install

# Install contract dependencies
cd contracts && npm install && cd ..
```

#### 2. Start Local Blockchain

```bash
cd contracts

# Start Hardhat node (keep this running)
npx hardhat node
```

#### 3. Deploy Contracts (New Terminal)

```bash
cd contracts

# Deploy all contracts including MockUSDC
npx hardhat run scripts/deployAll.ts --network localhost
```

You'll see output like:
```
📋 Contract Addresses:
┌────────────────────────────────────────────────────────────┐
│ StrideChallengeManager (ETH):  0x3Aa5ebB10DC797CAC828524...│
│ StrideGroups:                  0xc6e7DF5E7b4f2A278906862...│
│ SimpleBadgeNFT:                0x4ed7c70F96B99c776995fB6...│
│ USDC Token:                    0xa85233C63b9Ee964Add6F2c...│
│ StrideUSDCChallengeManager:    0x4A679253410272dd5232B3F...│
└────────────────────────────────────────────────────────────┘
```

#### 4. Configure Environment

Create `.env.local` in the project root:

```env
# Enable local development mode
NEXT_PUBLIC_LOCAL_DEV=true
```

#### 5. Run Frontend

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

#### 6. Connect Wallet

1. Add Hardhat Network to MetaMask:
   - Network Name: `Hardhat`
   - RPC URL: `http://127.0.0.1:8545`
   - Chain ID: `31337`
   - Currency Symbol: `ETH`

2. Import a test account from Hardhat (use one of the private keys shown when starting the node)

---

### Base Sepolia Deployment

#### 1. Configure Deployment

Create `contracts/.env`:

```env
PRIVATE_KEY=your_wallet_private_key
BASE_SEPOLIA_RPC=https://sepolia.base.org
```

#### 2. Deploy to Base Sepolia

```bash
cd contracts

# Deploy all contracts
npx hardhat run scripts/deployAll.ts --network baseSepolia
```

#### 3. Update Frontend Config

Update `.env.local`:

```env
# Remove local dev flag for production
# NEXT_PUBLIC_LOCAL_DEV=true

# Contract addresses from deployment
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_GROUPS_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_USDC_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_USDC_ADDRESS=0x036CbD53842c5426634e7929541eC2318f3dCF7e
```

---

## Smart Contracts

### Contract Overview

| Contract | Description |
|----------|-------------|
| `StrideChallengeManager.sol` | ETH-based fitness challenges |
| `StrideUSDCChallengeManager.sol` | Circle USDC-based challenges |
| `StrideGroups.sol` | Group management & leaderboards |
| `SimpleBadgeNFT.sol` | On-chain SVG achievement badges |
| `MockUSDC.sol` | Test USDC token for local development |

### Key Functions

#### Create a Challenge
```solidity
function createChallenge(
    uint256 stakeAmount,
    uint256 duration,
    string calldata description,
    uint256 groupId
) external payable returns (uint256 challengeId)
```

#### Join a Challenge
```solidity
function joinChallenge(uint256 challengeId) external payable
```

#### Mark Completion
```solidity
function markCompleted(uint256 challengeId) external
```

#### Settle & Distribute
```solidity
function settleChallenge(uint256 challengeId) external
```

### USDC Approval Flow

1. User enters stake amount in the UI
2. Frontend checks current USDC allowance
3. If insufficient, prompts for approval transaction
4. After approval, user can stake USDC
5. Contract uses `SafeERC20.safeTransferFrom()` for security

### Settlement Logic

| Scenario | Action |
|----------|--------|
| Winners exist | Split pool equally among completers |
| No winners | Refund all participants (for challenge cancellation via unanimous vote) |
| No winners (timeout) | 10% to charity, 90% refunded |

---

## User Flows

### Create a USDC Challenge
1. Connect wallet
2. Navigate to a group or create one
3. Click "Create Challenge"
4. Select USDC as currency
5. Approve USDC spending (one-time or per-challenge)
6. Set description, duration, and stake amount
7. Submit transaction

### Join a Challenge
1. Browse available challenges
2. Click "Join Challenge"
3. Approve USDC if needed
4. Confirm transaction

### Complete & Settle
1. Complete your fitness goal IRL
2. Click "I Finished My Run!"
3. Wait for challenge deadline
4. Anyone can click "Settle" to distribute prizes

---

## Deployed Contract Addresses

### Base Sepolia (Testnet)

| Contract | Address |
|----------|---------|
| StrideChallengeManager | `TBD after deployment` |
| StrideUSDCChallengeManager | `TBD after deployment` |
| StrideGroups | `TBD after deployment` |
| SimpleBadgeNFT | `TBD after deployment` |
| Circle USDC | `0x036CbD53842c5426634e7929541eC2318f3dCF7e` |

### Localhost (Hardhat)

Run `npx hardhat run scripts/deployAll.ts --network localhost` to get fresh addresses.

---

## Resources

### Base
- **Base Docs**: https://docs.base.org/
- **Base Sepolia Faucet**: https://www.alchemy.com/faucets/base-sepolia
- **BaseScan**: https://sepolia.basescan.org/

### Circle
- **Developer Docs**: https://developers.circle.com/
- **USDC on Base**: https://www.circle.com/en/usdc-multichain/base
- **Testnet Faucet**: https://faucet.circle.com/
- **Bridge Kit**: https://developers.circle.com/w3s/bridge-kit

### Network Configuration

| Property | Value |
|----------|-------|
| Network | Base Sepolia (Testnet) |
| Chain ID | 84532 |
| RPC URL | https://sepolia.base.org |
| Explorer | https://sepolia.basescan.org |
| USDC | 0x036CbD53842c5426634e7929541eC2318f3dCF7e |

---

## License

MIT

---

<p align="center">
  <strong>Built for MBC Hackathon 2025 • Powered by Circle USDC • Built on Base</strong>
</p>

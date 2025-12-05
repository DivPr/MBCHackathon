# Stride - Social Fitness Challenges on Base

A social fitness challenge app where friends commit to running goals, stake USDC, prove they completed the run, and the pot is automatically distributed to winners.

Built on **Base** for the MBC Hackathon.

![Stride App](https://base.org/images/base-open-graph.png)

## 🏆 Circle USDC Integration (Bounty Submission)

**This project integrates Circle's USDC stablecoin** for fitness challenge staking, demonstrating a real-world payment use case on Base.

### Why USDC for Fitness Challenges?

- **Price Stability**: Users stake a predictable dollar amount (e.g., $5 USDC) rather than volatile crypto
- **Global Accessibility**: Anyone worldwide can participate with dollar-equivalent stakes
- **Low Fees on Base**: Circle's native USDC on Base means minimal transaction costs
- **Real-World Payments**: Demonstrates practical payment automation use case

### Circle Integration Features

| Feature | Description |
|---------|-------------|
| **USDC Staking** | Users stake USDC instead of ETH for challenges |
| **ERC20 Approvals** | Smart approval flow with "Approve Max" option |
| **Prize Distribution** | Winners automatically receive USDC payouts |
| **Charity Donations** | Unclaimed pools donated to charity in USDC |

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

- 🏃 Create fitness challenges with custom goals
- 💵 Stake **USDC** to stay accountable (powered by Circle)
- 👥 Invite friends to join challenges
- ✅ Mark completion and prove your run
- 🏆 Winners split the prize pool automatically
- 🔗 Built on Base for low fees and fast transactions

## Tech Stack

### Frontend
- **Next.js 15** with TypeScript
- **Tailwind CSS** for styling
- **wagmi + viem** for Web3 interactions
- **Coinbase Wallet** integration (Smart Wallet)

### Smart Contracts
- **Solidity 0.8.24** with OpenZeppelin
- **Hardhat** for development and testing
- **Circle USDC** integration (ERC20)
- Deployed on **Base Sepolia**

## Project Structure

```
├── src/
│   ├── app/                 # Next.js App Router pages
│   ├── components/
│   │   └── USDCStakeButton.tsx  # USDC approval & staking UI
│   ├── config/
│   │   └── usdcContract.ts      # Circle USDC configuration
│   └── hooks/
│       └── useUSDC.ts           # USDC hooks (balance, approval, staking)
├── contracts/
│   ├── contracts/
│   │   └── StrideUSDCChallengeManager.sol  # USDC-based challenges
│   └── scripts/
│       └── deployUSDC.ts        # USDC contract deployment
```

## Quick Start

### Prerequisites
- Node.js 18+
- A wallet with Base Sepolia ETH ([Faucet](https://www.alchemy.com/faucets/base-sepolia))
- Testnet USDC from [Circle Faucet](https://faucet.circle.com/)

### 1. Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install contract dependencies
cd contracts && npm install && cd ..
```

### 2. Deploy Smart Contracts

```bash
cd contracts

# Create .env file
cp .env.example .env
# Add your private key to .env

# Compile contracts
npm run compile

# Deploy USDC Challenge Manager to Base Sepolia
npm run deploy:usdc:sepolia
```

### 3. Configure Frontend

Create a `.env.local` file in the root directory:

```env
# USDC Challenge Manager (from deployment output)
NEXT_PUBLIC_USDC_CONTRACT_ADDRESS=0x...

# Circle USDC on Base Sepolia
NEXT_PUBLIC_USDC_ADDRESS=0x036CbD53842c5426634e7929541eC2318f3dCF7e

# Optional: ETH-based contract
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...

# WalletConnect
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
```

### 4. Run the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Smart Contracts

### StrideUSDCChallengeManager (Powered by Circle)

The main USDC-based contract handles:

- **createChallenge**: Create a challenge by staking USDC
- **joinChallenge**: Join by staking the required USDC amount
- **markCompleted**: Mark yourself as having completed the challenge
- **settleChallenge**: Distribute USDC prize pool after challenge ends

### USDC Approval Flow

1. User enters stake amount
2. Frontend checks USDC allowance
3. If insufficient, prompts for approval (single amount or max)
4. After approval, user can stake USDC
5. Contract transfers USDC using `SafeERC20`

### Settlement Logic

1. **Winners exist**: Split USDC pool equally among completers
2. **No winners**: Donate USDC pool to charity address

## User Flows

### Create a USDC Challenge
1. Connect wallet
2. Approve USDC spending (one-time or per-challenge)
3. Set description (e.g., "5K run")
4. Choose duration and stake amount (in USDC)
5. Submit and stake USDC

### Join a Challenge
1. Browse available challenges
2. Approve USDC if needed
3. Click "Join Challenge" and stake USDC

### Complete & Settle
1. Complete your fitness goal
2. Click "I Finished My Run!"
3. Wait for challenge to end
4. Anyone can settle to distribute USDC

## Circle Developer Resources

- **Developer Docs**: https://developers.circle.com/
- **USDC on Base**: https://www.circle.com/en/usdc-multichain/base
- **Testnet Faucet**: https://faucet.circle.com/
- **Bridge Kit**: https://developers.circle.com/w3s/bridge-kit

## Network Configuration

- **Network**: Base Sepolia (Testnet)
- **Chain ID**: 84532
- **RPC**: https://sepolia.base.org
- **USDC**: 0x036CbD53842c5426634e7929541eC2318f3dCF7e

## Get Test Assets

- **Base Sepolia ETH**: [Alchemy Faucet](https://www.alchemy.com/faucets/base-sepolia)
- **Testnet USDC**: [Circle Faucet](https://faucet.circle.com/)

## License

MIT

---

**Built for MBC Hackathon 2025 • Powered by Circle USDC • Built on Base**

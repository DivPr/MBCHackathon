# Stride - Social Fitness Challenges on Base

A social fitness challenge app where friends commit to running goals, stake crypto, prove they completed the run, and the pot is automatically distributed to winners.

Built on **Base Sepolia** for the MBC Hackathon.

![Stride App](https://base.org/images/base-open-graph.png)

## Features

- 🏃 Create fitness challenges with custom goals
- 💰 Stake ETH to stay accountable
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
- **Solidity 0.8.24**
- **Hardhat** for development and testing
- Deployed on **Base Sepolia**

## Project Structure

```
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── page.tsx         # Home page
│   │   └── challenge/[id]/  # Challenge detail page
│   ├── components/          # React components
│   ├── config/              # Wagmi & contract config
│   └── hooks/               # Custom React hooks
├── contracts/
│   ├── contracts/           # Solidity contracts
│   ├── test/                # Contract tests
│   └── scripts/             # Deployment scripts
```

## Quick Start

### Prerequisites
- Node.js 18+
- A wallet with Base Sepolia ETH ([Faucet](https://www.alchemy.com/faucets/base-sepolia))

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

# Run tests
npm test

# Deploy to Base Sepolia
npm run deploy:sepolia
```

### 3. Configure Frontend

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_CONTRACT_ADDRESS=0x... # From deployment output
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
```

### 4. Run the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Smart Contract

### StrideChallengeManager

The main contract handles:

- **createChallenge**: Create a new challenge with stake amount, duration, and description
- **joinChallenge**: Join an existing challenge by staking ETH
- **markCompleted**: Mark yourself as having completed the challenge
- **settleChallenge**: Distribute prize pool after challenge ends

### Settlement Logic

1. If there are completers: Split pool equally among winners
2. If no completers: Refund everyone their stake

## User Flows

### Create a Challenge
1. Connect wallet
2. Click "Create Challenge"
3. Set description (e.g., "5K run")
4. Choose duration (1 hour, 24 hours, 3 days, 7 days)
5. Set stake amount
6. Submit and stake ETH

### Join a Challenge
1. Browse available challenges
2. Click on a challenge to view details
3. Click "Join Challenge" and stake ETH

### Complete a Challenge
1. Go to your active challenge
2. (Optional) Upload proof photo
3. Click "I Finished My Run!"

### Claim Winnings
1. Wait for challenge to end
2. Anyone can click "Settle Challenge"
3. Winners receive their share automatically

## Network Configuration

- **Network**: Base Sepolia (Testnet)
- **Chain ID**: 84532
- **RPC**: https://sepolia.base.org
- **Block Explorer**: https://sepolia.basescan.org

## Get Test ETH

Get Base Sepolia ETH from:
- [Alchemy Faucet](https://www.alchemy.com/faucets/base-sepolia)
- [QuickNode Faucet](https://faucet.quicknode.com/base/sepolia)

## License

MIT


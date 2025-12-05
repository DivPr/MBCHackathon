import { ethers } from "hardhat";

/**
 * Deploy StrideUSDCChallengeManager
 * 
 * This contract uses Circle USDC for staking instead of ETH.
 * USDC addresses:
 * - Base Sepolia: 0x036CbD53842c5426634e7929541eC2318f3dCF7e
 * - Base Mainnet: 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
 * 
 * For more info: https://developers.circle.com/
 */

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying StrideUSDCChallengeManager with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");

  // USDC address on Base Sepolia
  // Get testnet USDC from: https://faucet.circle.com/
  const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";

  console.log("\n📦 Deploying StrideUSDCChallengeManager...");
  console.log("   Using USDC at:", USDC_ADDRESS);

  const StrideUSDCChallengeManager = await ethers.getContractFactory("StrideUSDCChallengeManager");
  const manager = await StrideUSDCChallengeManager.deploy(USDC_ADDRESS);

  await manager.waitForDeployment();

  const contractAddress = await manager.getAddress();

  console.log("\n✅ StrideUSDCChallengeManager deployed to:", contractAddress);
  console.log("\n📝 Add this to your .env.local:");
  console.log(`   NEXT_PUBLIC_USDC_CONTRACT_ADDRESS=${contractAddress}`);
  console.log(`   NEXT_PUBLIC_USDC_ADDRESS=${USDC_ADDRESS}`);

  console.log("\n🔗 Circle USDC Integration:");
  console.log("   - Get testnet USDC: https://faucet.circle.com/");
  console.log("   - Circle Developer Docs: https://developers.circle.com/");
  console.log("   - USDC on Base: https://www.circle.com/en/usdc-multichain/base");

  console.log("\n⚠️  Important: Users need to approve USDC spending before staking!");
  console.log("   The frontend handles this automatically with the USDCStakeButton component.");

  // Verify contract info
  const usdcAddress = await manager.getUSDCAddress();
  console.log("\n📊 Contract Info:");
  console.log("   USDC Token:", usdcAddress);
  console.log("   Challenge Count:", await manager.challengeCount());
  console.log("   Charity Address:", await manager.charityAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });


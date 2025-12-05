import { ethers, network } from "hardhat";

/**
 * Deploy all Stride contracts including USDC support
 * For Base Sepolia: Uses Circle's official USDC
 * For localhost: Deploys MockUSDC for testing
 */
async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║           STRIDE - Complete Deployment Script              ║");
  console.log("║          Base Track + Circle USDC Integration              ║");
  console.log("╚════════════════════════════════════════════════════════════╝\n");

  console.log("📍 Network:", network.name);
  console.log("👤 Deployer:", deployer.address);
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Balance:", ethers.formatEther(balance), "ETH\n");

  // ============ Step 1: Deploy ETH Challenge Manager ============
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📦 Step 1: Deploying StrideChallengeManager (ETH)...");
  
  const StrideChallengeManager = await ethers.getContractFactory("StrideChallengeManager");
  const ethManager = await StrideChallengeManager.deploy();
  await ethManager.waitForDeployment();
  const ethManagerAddress = await ethManager.getAddress();
  console.log("   ✅ StrideChallengeManager:", ethManagerAddress);

  // ============ Step 2: Deploy StrideGroups ============
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📦 Step 2: Deploying StrideGroups...");
  
  const StrideGroups = await ethers.getContractFactory("StrideGroups");
  const groups = await StrideGroups.deploy(ethManagerAddress);
  await groups.waitForDeployment();
  const groupsAddress = await groups.getAddress();
  console.log("   ✅ StrideGroups:", groupsAddress);

  // Connect ETH Manager to Groups
  const setGroupsTx = await ethManager.setStrideGroups(groupsAddress);
  await setGroupsTx.wait();
  console.log("   🔗 Connected StrideChallengeManager to StrideGroups");

  // ============ Step 3: Deploy SimpleBadgeNFT ============
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📦 Step 3: Deploying SimpleBadgeNFT...");
  
  const SimpleBadgeNFT = await ethers.getContractFactory("SimpleBadgeNFT");
  const nft = await SimpleBadgeNFT.deploy();
  await nft.waitForDeployment();
  const nftAddress = await nft.getAddress();
  console.log("   ✅ SimpleBadgeNFT:", nftAddress);

  // Mint first NFT to deployer
  const mintTx = await nft.mint(deployer.address);
  await mintTx.wait();
  console.log("   🎨 Minted NFT #0 to deployer");

  // ============ Step 4: USDC Setup ============
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📦 Step 4: Setting up USDC...");

  let usdcAddress: string;
  const chainId = network.config.chainId;
  const KNOWN_USDC: Record<number, string> = {
    // Base Mainnet USDC
    8453: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    // Base Sepolia USDC (testnet)
    84532: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
  };

  if (network.name === "localhost" || network.name === "hardhat") {
    // Deploy MockUSDC for local testing
    console.log("   🧪 Deploying MockUSDC for local testing...");
    const MockUSDC = await ethers.getContractFactory("MockUSDC");
    const mockUsdc = await MockUSDC.deploy();
    await mockUsdc.waitForDeployment();
    usdcAddress = await mockUsdc.getAddress();
    console.log("   ✅ MockUSDC:", usdcAddress);

    // Transfer some USDC to deployer's wallet for testing
    const usdcBalance = await mockUsdc.balanceOf(deployer.address);
    console.log("   💵 Deployer USDC Balance:", ethers.formatUnits(usdcBalance, 6), "USDC");
  } else {
    const resolvedChainId = chainId ? Number(chainId) : undefined;
    if (!resolvedChainId || !KNOWN_USDC[resolvedChainId]) {
      throw new Error(
        `No USDC address configured for network ${network.name} (chainId: ${resolvedChainId ?? "unknown"})`
      );
    }

    usdcAddress = KNOWN_USDC[resolvedChainId];
    console.log("   🔵 Using Circle USDC:", usdcAddress);
    if (resolvedChainId === 84532) {
      console.log("   💡 Get testnet USDC: https://faucet.circle.com/");
    }
  }

  // ============ Step 5: Deploy USDC Challenge Manager ============
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📦 Step 5: Deploying StrideUSDCChallengeManager...");
  
  const StrideUSDCChallengeManager = await ethers.getContractFactory("StrideUSDCChallengeManager");
  const usdcManager = await StrideUSDCChallengeManager.deploy(usdcAddress);
  await usdcManager.waitForDeployment();
  const usdcManagerAddress = await usdcManager.getAddress();
  console.log("   ✅ StrideUSDCChallengeManager:", usdcManagerAddress);

  // ============ Summary ============
  console.log("\n╔════════════════════════════════════════════════════════════╗");
  console.log("║                    DEPLOYMENT COMPLETE                      ║");
  console.log("╚════════════════════════════════════════════════════════════╝\n");

  console.log("📋 Contract Addresses:");
  console.log("┌────────────────────────────────────────────────────────────┐");
  console.log(`│ StrideChallengeManager (ETH):  ${ethManagerAddress}  │`);
  console.log(`│ StrideGroups:                  ${groupsAddress}  │`);
  console.log(`│ SimpleBadgeNFT:                ${nftAddress}  │`);
  console.log(`│ USDC Token:                    ${usdcAddress}  │`);
  console.log(`│ StrideUSDCChallengeManager:    ${usdcManagerAddress}  │`);
  console.log("└────────────────────────────────────────────────────────────┘\n");

  console.log("📝 Update your .env.local with:\n");
  console.log(`NEXT_PUBLIC_CONTRACT_ADDRESS=${ethManagerAddress}`);
  console.log(`NEXT_PUBLIC_GROUPS_CONTRACT_ADDRESS=${groupsAddress}`);
  console.log(`NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=${nftAddress}`);
  console.log(`NEXT_PUBLIC_USDC_ADDRESS=${usdcAddress}`);
  console.log(`NEXT_PUBLIC_USDC_CONTRACT_ADDRESS=${usdcManagerAddress}`);

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🔵 Circle USDC Integration:");
  console.log("   • Real USDC on Base Sepolia: 0x036CbD53842c5426634e7929541eC2318f3dCF7e");
  console.log("   • Get testnet USDC: https://faucet.circle.com/");
  console.log("   • Circle Docs: https://developers.circle.com/");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  return {
    ethManager: ethManagerAddress,
    groups: groupsAddress,
    nft: nftAddress,
    usdc: usdcAddress,
    usdcManager: usdcManagerAddress,
  };
}

main()
  .then((addresses) => {
    console.log("✨ All contracts deployed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });


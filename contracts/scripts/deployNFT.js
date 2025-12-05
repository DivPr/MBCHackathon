// Deploy script for SimpleBadgeNFT
// Usage: npx hardhat run scripts/deployNFT.js --network <network>

const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying SimpleBadgeNFT...\n");

  // Get the deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("📍 Deploying with account:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "ETH\n");

  // Deploy the contract
  const SimpleBadgeNFT = await hre.ethers.getContractFactory("SimpleBadgeNFT");
  const nft = await SimpleBadgeNFT.deploy();
  
  await nft.waitForDeployment();
  const nftAddress = await nft.getAddress();
  
  console.log("✅ SimpleBadgeNFT deployed to:", nftAddress);

  // Mint one NFT to the deployer
  console.log("\n🎨 Minting first NFT to deployer...");
  const mintTx = await nft.mint(deployer.address);
  await mintTx.wait();
  
  console.log("✅ NFT #0 minted to:", deployer.address);

  // Get token URI to verify
  const tokenURI = await nft.tokenURI(0);
  console.log("\n📄 Token URI (first 100 chars):", tokenURI.substring(0, 100) + "...");

  // Summary
  console.log("\n" + "=".repeat(50));
  console.log("📋 DEPLOYMENT SUMMARY");
  console.log("=".repeat(50));
  console.log("Contract Name:    SimpleBadgeNFT");
  console.log("Symbol:           SBADGE");
  console.log("Contract Address:", nftAddress);
  console.log("Network:         ", hre.network.name);
  console.log("Total Supply:    ", (await nft.totalSupply()).toString());
  console.log("=".repeat(50));
  
  console.log("\n💡 Add this to your frontend .env file:");
  console.log(`NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=${nftAddress}`);

  // Verify on block explorer if not on localhost
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("\n⏳ Waiting for block confirmations for verification...");
    await new Promise(resolve => setTimeout(resolve, 30000)); // Wait 30 seconds

    try {
      await hre.run("verify:verify", {
        address: nftAddress,
        constructorArguments: [],
      });
      console.log("✅ Contract verified on block explorer!");
    } catch (error) {
      console.log("⚠️  Verification failed:", error.message);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });


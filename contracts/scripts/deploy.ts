import { ethers, run, network } from "hardhat";

async function main() {
  console.log("🚀 Deploying StrideChallengeManager to", network.name);
  console.log("=====================================\n");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH\n");

  // Deploy the contract
  const StrideChallengeManager = await ethers.getContractFactory(
    "StrideChallengeManager"
  );
  
  console.log("Deploying StrideChallengeManager...");
  const manager = await StrideChallengeManager.deploy();
  await manager.waitForDeployment();

  const contractAddress = await manager.getAddress();
  console.log("✅ StrideChallengeManager deployed to:", contractAddress);
  console.log("\n=====================================");
  console.log("📋 Next Steps:");
  console.log("=====================================");
  console.log(`1. Update your .env file with:`);
  console.log(`   NEXT_PUBLIC_CONTRACT_ADDRESS=${contractAddress}`);
  console.log(`\n2. Verify the contract on Basescan (optional):`);
  console.log(`   npx hardhat verify --network ${network.name} ${contractAddress}`);
  console.log("\n=====================================\n");

  // Verify on block explorer if not local
  if (network.name !== "hardhat" && network.name !== "localhost") {
    console.log("⏳ Waiting for block confirmations before verification...");
    
    // Wait for a few block confirmations
    const deployTx = manager.deploymentTransaction();
    if (deployTx) {
      await deployTx.wait(5);
    }

    console.log("🔍 Verifying contract on Basescan...");
    try {
      await run("verify:verify", {
        address: contractAddress,
        constructorArguments: [],
      });
      console.log("✅ Contract verified successfully!");
    } catch (error: any) {
      if (error.message.includes("Already Verified")) {
        console.log("Contract is already verified!");
      } else {
        console.log("⚠️  Verification failed:", error.message);
        console.log("You can try manually with:");
        console.log(`npx hardhat verify --network ${network.name} ${contractAddress}`);
      }
    }
  }

  return contractAddress;
}

main()
  .then((address) => {
    console.log("\n🎉 Deployment complete! Contract address:", address);
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });


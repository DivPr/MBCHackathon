import { ethers, run, network } from "hardhat";

async function main() {
  console.log("🚀 Deploying Stride Contracts to", network.name);
  console.log("=====================================\n");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH\n");

  // Deploy StrideChallengeManager
  const StrideChallengeManager = await ethers.getContractFactory(
    "StrideChallengeManager"
  );
  
  console.log("Deploying StrideChallengeManager...");
  const manager = await StrideChallengeManager.deploy();
  await manager.waitForDeployment();
  const managerAddress = await manager.getAddress();
  console.log("✅ StrideChallengeManager deployed to:", managerAddress);

  // Deploy StrideGroups
  const StrideGroups = await ethers.getContractFactory("StrideGroups");
  
  console.log("\nDeploying StrideGroups...");
  const groups = await StrideGroups.deploy(managerAddress);
  await groups.waitForDeployment();
  const groupsAddress = await groups.getAddress();
  console.log("✅ StrideGroups deployed to:", groupsAddress);

  console.log("\n=====================================");
  console.log("📋 Next Steps:");
  console.log("=====================================");
  console.log(`1. Update your .env file with:`);
  console.log(`   NEXT_PUBLIC_CONTRACT_ADDRESS=${managerAddress}`);
  console.log(`   NEXT_PUBLIC_GROUPS_CONTRACT_ADDRESS=${groupsAddress}`);
  console.log(`\n2. Verify contracts on Basescan (optional):`);
  console.log(`   npx hardhat verify --network ${network.name} ${managerAddress}`);
  console.log(`   npx hardhat verify --network ${network.name} ${groupsAddress} ${managerAddress}`);
  console.log("\n=====================================\n");

  // Verify on block explorer if not local
  if (network.name !== "hardhat" && network.name !== "localhost") {
    console.log("⏳ Waiting for block confirmations before verification...");
    
    const deployTx = manager.deploymentTransaction();
    if (deployTx) {
      await deployTx.wait(5);
    }

    console.log("🔍 Verifying StrideChallengeManager on Basescan...");
    try {
      await run("verify:verify", {
        address: managerAddress,
        constructorArguments: [],
      });
      console.log("✅ StrideChallengeManager verified!");
    } catch (error: any) {
      if (error.message.includes("Already Verified")) {
        console.log("Contract is already verified!");
      } else {
        console.log("⚠️  Verification failed:", error.message);
      }
    }

    console.log("🔍 Verifying StrideGroups on Basescan...");
    try {
      await run("verify:verify", {
        address: groupsAddress,
        constructorArguments: [managerAddress],
      });
      console.log("✅ StrideGroups verified!");
    } catch (error: any) {
      if (error.message.includes("Already Verified")) {
        console.log("Contract is already verified!");
      } else {
        console.log("⚠️  Verification failed:", error.message);
      }
    }
  }

  return { managerAddress, groupsAddress };
}

main()
  .then(({ managerAddress, groupsAddress }) => {
    console.log("\n🎉 Deployment complete!");
    console.log("   StrideChallengeManager:", managerAddress);
    console.log("   StrideGroups:", groupsAddress);
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });

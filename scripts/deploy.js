const hre = require("hardhat");

async function main() {
  console.log("Deploying CoinPay contract...");

  // Get the deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  // Check balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH");

  // Set fee recipient (can be deployer address or a specific address)
  const feeRecipient = process.env.FEE_RECIPIENT || deployer.address;
  console.log("Fee recipient:", feeRecipient);

  // Deploy the contract
  const CoinPay = await hre.ethers.getContractFactory("CoinPay");
  const coinPay = await CoinPay.deploy(feeRecipient);

  await coinPay.waitForDeployment();

  const contractAddress = await coinPay.getAddress();
  console.log("CoinPay deployed to:", contractAddress);
  console.log("Network:", hre.network.name);
  console.log("Chain ID:", (await hre.ethers.provider.getNetwork()).chainId);

  // Verify contract on BaseScan if on mainnet/testnet
  if (hre.network.name === "base" || hre.network.name === "baseSepolia") {
    console.log("\nWaiting for block confirmations before verification...");
    await coinPay.deploymentTransaction().wait(5);

    try {
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [feeRecipient],
      });
      console.log("Contract verified on BaseScan!");
    } catch (error) {
      if (error.message.toLowerCase().includes("already verified")) {
        console.log("Contract already verified");
      } else {
        console.log("Verification error:", error.message);
      }
    }
  }

  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    chainId: (await hre.ethers.provider.getNetwork()).chainId.toString(),
    contractAddress: contractAddress,
    deployer: deployer.address,
    feeRecipient: feeRecipient,
    timestamp: new Date().toISOString(),
    blockNumber: (await hre.ethers.provider.getBlockNumber()).toString(),
  };

  console.log("\n=== Deployment Info ===");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  // Write to file for reference
  const fs = require("fs");
  const deploymentsDir = "./deployments";
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  fs.writeFileSync(
    `${deploymentsDir}/${hre.network.name}.json`,
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log(`\nDeployment info saved to: ${deploymentsDir}/${hre.network.name}.json`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });


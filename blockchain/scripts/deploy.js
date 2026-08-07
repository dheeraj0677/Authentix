const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("[INFO] Deploying AuthenticityRegistry smart contract...");

  const AuthenticityRegistry = await hre.ethers.getContractFactory("AuthenticityRegistry");
  const registry = await AuthenticityRegistry.deploy();
  // Support both ethers v5 (.deployed) and ethers v6 (.waitForDeployment)
  if (typeof registry.waitForDeployment === 'function') {
    await registry.waitForDeployment();
  } else {
    await registry.deployed();
  }

  const address = registry.target ?? registry.address;
  console.log(`[SUCCESS] AuthenticityRegistry deployed to: ${address}`);

  // Save deployed address for frontend & Python web3_client
  const deployData = {
    address: address,
    network: hre.network.name,
    timestamp: new Date().toISOString()
  };

  const outputPath = path.join(__dirname, "..", "deployed_address.json");
  fs.writeFileSync(outputPath, JSON.stringify(deployData, null, 2));
  console.log(`[INFO] Deployed address saved to '${outputPath}'`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

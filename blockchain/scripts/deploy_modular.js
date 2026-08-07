const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("==================================================");
  console.log("  AUTHENTIX MODULAR BLOCKCHAIN SYSTEM DEPLOYMENT");
  console.log("==================================================");

  const [deployer] = await hre.ethers.getSigners();
  console.log(`[INFO] Deploying contracts with account: ${deployer.address}`);

  // Helper for contract deployment (handles ethers v5 and v6)
  async function deployContract(name, ...args) {
    console.log(`\n[DEPLOYING] ${name}...`);
    const Factory = await hre.ethers.getContractFactory(name);
    const contract = await Factory.deploy(...args);
    if (typeof contract.waitForDeployment === "function") {
      await contract.waitForDeployment();
    } else {
      await contract.deployed();
    }
    const addr = contract.target ?? contract.address;
    console.log(`  └─ SUCCESS: ${name} deployed at ${addr}`);
    return { contract, addr };
  }

  // 1. Deploy Infrastructure: VersionManager
  const { contract: vm, addr: vmAddr } = await deployContract("VersionManager");

  // 2. Deploy Module Registries (initially setting deployer as temporary controller)
  const { contract: media, addr: mediaAddr } = await deployContract("MediaRegistry", deployer.address);
  const { contract: ownership, addr: ownershipAddr } = await deployContract("OwnershipRegistry", deployer.address);
  const { contract: verification, addr: verificationAddr } = await deployContract("VerificationRegistry", deployer.address);
  const { contract: log, addr: logAddr } = await deployContract("VerificationLog", deployer.address);

  // 3. Register Modules in VersionManager
  console.log("\n[INFO] Registering modules in VersionManager...");
  await (await vm.registerModule("MediaRegistry", mediaAddr)).wait();
  await (await vm.registerModule("OwnershipRegistry", ownershipAddr)).wait();
  await (await vm.registerModule("VerificationRegistry", verificationAddr)).wait();
  await (await vm.registerModule("VerificationLog", logAddr)).wait();
  console.log("  └─ All modules registered successfully.");

  // 4. Deploy Main Façade: RegistryController (points to VersionManager)
  const { contract: controller, addr: controllerAddr } = await deployContract("RegistryController", vmAddr);

  // 5. Transfer Controller Authorities from Deployer -> RegistryController
  console.log("\n[INFO] Transferring module write permissions to RegistryController...");
  await (await media.setController(controllerAddr)).wait();
  await (await ownership.setController(controllerAddr)).wait();
  await (await verification.setController(controllerAddr)).wait();
  await (await log.setController(controllerAddr)).wait();
  console.log("  └─ Permissions updated.");

  // Summary
  const deployedAddresses = {
    network: hre.network.name,
    address: controllerAddr, // Primary entry point for client compatibility
    RegistryController: controllerAddr,
    VersionManager: vmAddr,
    MediaRegistry: mediaAddr,
    OwnershipRegistry: ownershipAddr,
    VerificationRegistry: verificationAddr,
    VerificationLog: logAddr,
    timestamp: new Date().toISOString()
  };

  const addressFile = path.join(__dirname, "..", "deployed_address.json");
  fs.writeFileSync(addressFile, JSON.stringify(deployedAddresses, null, 2));

  console.log("\n==================================================");
  console.log("   DEPLOYMENT COMPLETE — SUMMARY");
  console.log("==================================================");
  console.log(`RegistryController (Entry Point) : ${controllerAddr}`);
  console.log(`VersionManager                    : ${vmAddr}`);
  console.log(`MediaRegistry                     : ${mediaAddr}`);
  console.log(`OwnershipRegistry                 : ${ownershipAddr}`);
  console.log(`VerificationRegistry              : ${verificationAddr}`);
  console.log(`VerificationLog                   : ${logAddr}`);
  console.log(`\n[SUCCESS] Deployed addresses written to: ${addressFile}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

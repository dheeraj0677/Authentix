const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AuthenticityRegistry Smart Contract Tests", function () {
  let registry;
  let owner, addr1;
  const sampleHash = ethers.utils.id("sample_file_content_sha256");

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();
    const AuthenticityRegistry = await ethers.getContractFactory("AuthenticityRegistry");
    registry = await AuthenticityRegistry.deploy();
    await registry.deployed();
  });

  it("Should allow registering a new file hash and emit FileRegistered event", async function () {
    await expect(registry.connect(owner).registerFile(sampleHash, "REAL"))
      .to.emit(registry, "FileRegistered");

    const [exists, recordOwner, timestamp, prediction] = await registry.verifyFile(sampleHash);
    expect(exists).to.equal(true);
    expect(recordOwner).to.equal(owner.address);
    expect(prediction).to.equal("REAL");
    expect(timestamp).to.be.gt(0);
  });

  it("Should revert if attempting to register a duplicate hash", async function () {
    await registry.connect(owner).registerFile(sampleHash, "FAKE");
    await expect(
      registry.connect(addr1).registerFile(sampleHash, "REAL")
    ).to.be.revertedWith("AuthenticityRegistry: File hash already registered on-chain");
  });

  it("Should revert if registering zero bytes32 hash", async function () {
    const zeroHash = ethers.constants.HashZero;
    await expect(
      registry.registerFile(zeroHash, "REAL")
    ).to.be.revertedWith("AuthenticityRegistry: Invalid zero hash");
  });

  it("Should return exists=false for an un-registered file hash", async function () {
    const randomHash = ethers.utils.id("random_unregistered_file");
    const [exists, recordOwner, timestamp, prediction] = await registry.verifyFile(randomHash);
    expect(exists).to.equal(false);
    expect(recordOwner).to.equal(ethers.constants.AddressZero);
    expect(prediction).to.equal("");
  });

  it("Should revert if prediction is not 'REAL' or 'FAKE'", async function () {
    await expect(
      registry.registerFile(sampleHash, "MALICIOUS")
    ).to.be.revertedWith("AuthenticityRegistry: prediction must be 'REAL' or 'FAKE'");
  });
});

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Authentix Modular System Integration Tests", function () {
  let vm, media, ownership, verification, log, controller;
  let owner, addr1, addr2;
  const sampleHash = ethers.utils.id("sample_file_hash_123");

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    // 1. Deploy VersionManager
    const VMFactory = await ethers.getContractFactory("VersionManager");
    vm = await VMFactory.deploy();
    if (typeof vm.waitForDeployment === "function") await vm.waitForDeployment();

    // 2. Deploy Registries
    const MediaFactory = await ethers.getContractFactory("MediaRegistry");
    media = await MediaFactory.deploy(owner.address);
    if (typeof media.waitForDeployment === "function") await media.waitForDeployment();

    const OwnershipFactory = await ethers.getContractFactory("OwnershipRegistry");
    ownership = await OwnershipFactory.deploy(owner.address);
    if (typeof ownership.waitForDeployment === "function") await ownership.waitForDeployment();

    const VerFactory = await ethers.getContractFactory("VerificationRegistry");
    verification = await VerFactory.deploy(owner.address);
    if (typeof verification.waitForDeployment === "function") await verification.waitForDeployment();

    const LogFactory = await ethers.getContractFactory("VerificationLog");
    log = await LogFactory.deploy(owner.address);
    if (typeof log.waitForDeployment === "function") await log.waitForDeployment();

    // 3. Register Modules
    await vm.registerModule("MediaRegistry", media.target ?? media.address);
    await vm.registerModule("OwnershipRegistry", ownership.target ?? ownership.address);
    await vm.registerModule("VerificationRegistry", verification.target ?? verification.address);
    await vm.registerModule("VerificationLog", log.target ?? log.address);

    // 4. Deploy Controller
    const ControllerFactory = await ethers.getContractFactory("RegistryController");
    controller = await ControllerFactory.deploy(vm.target ?? vm.address);
    if (typeof controller.waitForDeployment === "function") await controller.waitForDeployment();

    // 5. Transfer permissions
    const ctrlAddr = controller.target ?? controller.address;
    await media.setController(ctrlAddr);
    await ownership.setController(ctrlAddr);
    await verification.setController(ctrlAddr);
    await log.setController(ctrlAddr);
  });

  describe("Backward Compatibility", function () {
    it("Should register a file via registerFile() and emit FileRegistered event", async function () {
      await expect(controller.connect(owner).registerFile(sampleHash, "REAL"))
        .to.emit(controller, "FileRegistered");

      const [exists, recordOwner, timestamp, prediction] = await controller.verifyFile(sampleHash);
      expect(exists).to.equal(true);
      expect(recordOwner).to.equal(owner.address);
      expect(prediction).to.equal("REAL");
      expect(timestamp).to.be.gt(0);
    });

    it("Should revert duplicate registration", async function () {
      await controller.connect(owner).registerFile(sampleHash, "REAL");
      await expect(
        controller.connect(addr1).registerFile(sampleHash, "FAKE")
      ).to.be.revertedWith("RegistryController: file hash already registered on-chain");
    });

    it("Should revert invalid prediction string", async function () {
      await expect(
        controller.registerFile(sampleHash, "INVALID")
      ).to.be.revertedWith("RegistryController: prediction must be 'REAL' or 'FAKE'");
    });
  });

  describe("Enhanced Features & Modular Interactions", function () {
    it("Should support registerFileEnhanced with rich metadata", async function () {
      await controller.connect(addr1).registerFileEnhanced(
        sampleHash,
        "FAKE",
        95,
        "EfficientNetB0-v2.0",
        "image/jpeg",
        "test.jpg",
        102450
      );

      const full = await controller.getFullRecord(sampleHash);
      expect(full.exists).to.equal(true);
      expect(full.prediction).to.equal("FAKE");
      expect(full.confidenceScore).to.equal(95);
      expect(full.modelVersion).to.equal("EfficientNetB0-v2.0");
      expect(full.fileType).to.equal("image/jpeg");
      expect(full.filename).to.equal("test.jpg");
      expect(full.fileSizeBytes).to.equal(102450);
      expect(full.currentOwner).to.equal(addr1.address);
    });

    it("Should support ownership transfer", async function () {
      await controller.connect(addr1).registerFile(sampleHash, "REAL");
      await controller.connect(addr1).transferFileOwnership(sampleHash, addr2.address);

      const full = await controller.getFullRecord(sampleHash);
      expect(full.currentOwner).to.equal(addr2.address);
      expect(full.originalRegistrar).to.equal(addr1.address);
    });

    it("Should record audit events in VerificationLog", async function () {
      await controller.connect(addr1).registerFile(sampleHash, "REAL");
      await controller.connect(addr2).verifyAndLog(sampleHash);

      const count = await controller.getTotalAuditEventCount();
      expect(count).to.equal(2); // 1 registration + 1 query
    });
  });
});

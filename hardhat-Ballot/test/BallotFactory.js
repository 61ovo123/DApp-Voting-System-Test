const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");

describe("BallotFactory", function () {
  async function deployBallotFactoryFixture() {
    const [owner, user1, user2, user3] = await ethers.getSigners();
    const BallotFactory = await ethers.getContractFactory("BallotFactory");
    const factory = await BallotFactory.deploy();

    return { factory, owner, user1, user2, user3 };
  }

  async function createBallotAndReturnAddress(factory, user, proposalNames, description) {
    const tx = await factory.connect(user).createBallot(proposalNames, description);
    const receipt = await tx.wait();
    const ballotAddress = receipt.logs[0].args.ballotAddress;
    return ballotAddress;
  }

  describe("Deployment", function () {
    it("Should set the owner correctly", async function () {
      const { factory, owner } = await loadFixture(deployBallotFactoryFixture);
      expect(await factory.owner()).to.equal(owner.address);
    });

    it("Should start with zero ballots", async function () {
      const { factory } = await loadFixture(deployBallotFactoryFixture);
      expect(await factory.getBallotCount()).to.equal(0);
    });
  });

  describe("createBallot", function () {
    it("Should create a new ballot successfully", async function () {
      const { factory, user1 } = await loadFixture(deployBallotFactoryFixture);
      const proposalNames = [
        ethers.encodeBytes32String("Proposal 1"),
        ethers.encodeBytes32String("Proposal 2"),
      ];
      const description = "First voting session";

      await expect(factory.connect(user1).createBallot(proposalNames, description))
        .to.emit(factory, "BallotCreated")
        .withArgs(
          (value) => value !== ethers.ZeroAddress,
          user1.address,
          2,
          description
        );
    });

    it("Should store the ballot address", async function () {
      const { factory, user1 } = await loadFixture(deployBallotFactoryFixture);
      const proposalNames = [
        ethers.encodeBytes32String("Proposal 1"),
        ethers.encodeBytes32String("Proposal 2"),
      ];
      const description = "Test voting";

      const ballotAddress = await createBallotAndReturnAddress(
        factory,
        user1,
        proposalNames,
        description
      );

      expect(await factory.getBallotCount()).to.equal(1);
      expect(await factory.getBallot(0)).to.equal(ballotAddress);
    });

    it("Should store the ballot description", async function () {
      const { factory, user1 } = await loadFixture(deployBallotFactoryFixture);
      const proposalNames = [
        ethers.encodeBytes32String("Proposal 1"),
        ethers.encodeBytes32String("Proposal 2"),
      ];
      const description = "Test voting";

      const ballotAddress = await createBallotAndReturnAddress(
        factory,
        user1,
        proposalNames,
        description
      );

      expect(await factory.getBallotDescription(ballotAddress)).to.equal(description);
    });

    it("Should store the ballot creator", async function () {
      const { factory, user1 } = await loadFixture(deployBallotFactoryFixture);
      const proposalNames = [
        ethers.encodeBytes32String("Proposal 1"),
        ethers.encodeBytes32String("Proposal 2"),
      ];
      const description = "Test voting";

      const ballotAddress = await createBallotAndReturnAddress(
        factory,
        user1,
        proposalNames,
        description
      );

      expect(await factory.getBallotCreator(ballotAddress)).to.equal(user1.address);
    });

    it("Should revert if less than two proposals", async function () {
      const { factory, user1 } = await loadFixture(deployBallotFactoryFixture);
      const proposalNames = [ethers.encodeBytes32String("Only One")];
      const description = "Invalid voting";

      await expect(
        factory.connect(user1).createBallot(proposalNames, description)
      ).to.be.revertedWith("At least two proposals required");
    });

    it("Should revert if description is empty", async function () {
      const { factory, user1 } = await loadFixture(deployBallotFactoryFixture);
      const proposalNames = [
        ethers.encodeBytes32String("Proposal 1"),
        ethers.encodeBytes32String("Proposal 2"),
      ];

      await expect(
        factory.connect(user1).createBallot(proposalNames, "")
      ).to.be.revertedWith("Description cannot be empty");
    });

    it("Should allow creating multiple ballots", async function () {
      const { factory, user1, user2 } = await loadFixture(deployBallotFactoryFixture);

      const proposalNames1 = [
        ethers.encodeBytes32String("A"),
        ethers.encodeBytes32String("B"),
      ];
      await factory.connect(user1).createBallot(proposalNames1, "First ballot");

      const proposalNames2 = [
        ethers.encodeBytes32String("C"),
        ethers.encodeBytes32String("D"),
      ];
      await factory.connect(user2).createBallot(proposalNames2, "Second ballot");

      expect(await factory.getBallotCount()).to.equal(2);
    });
  });

  describe("getBallot", function () {
    it("Should return correct ballot address by index", async function () {
      const { factory, user1 } = await loadFixture(deployBallotFactoryFixture);
      const proposalNames = [
        ethers.encodeBytes32String("Proposal 1"),
        ethers.encodeBytes32String("Proposal 2"),
      ];
      const description = "Test voting";

      const ballotAddress = await createBallotAndReturnAddress(
        factory,
        user1,
        proposalNames,
        description
      );

      expect(await factory.getBallot(0)).to.equal(ballotAddress);
    });

    it("Should revert if index is out of bounds", async function () {
      const { factory } = await loadFixture(deployBallotFactoryFixture);
      await expect(factory.getBallot(0)).to.be.revertedWith("Index out of bounds");
    });
  });

  describe("getAllBallots", function () {
    it("Should return all ballot addresses", async function () {
      const { factory, user1 } = await loadFixture(deployBallotFactoryFixture);

      const proposalNames = [
        ethers.encodeBytes32String("Proposal 1"),
        ethers.encodeBytes32String("Proposal 2"),
      ];

      const ballot1 = await createBallotAndReturnAddress(
        factory,
        user1,
        proposalNames,
        "Ballot 1"
      );

      const ballot2 = await createBallotAndReturnAddress(
        factory,
        user1,
        proposalNames,
        "Ballot 2"
      );

      const allBallots = await factory.getAllBallots();
      expect(allBallots).to.have.lengthOf(2);
      expect(allBallots[0]).to.equal(ballot1);
      expect(allBallots[1]).to.equal(ballot2);
    });

    it("Should return empty array when no ballots created", async function () {
      const { factory } = await loadFixture(deployBallotFactoryFixture);
      const allBallots = await factory.getAllBallots();
      expect(allBallots).to.have.lengthOf(0);
    });
  });

  describe("getBallotInfo", function () {
    it("Should return complete ballot info", async function () {
      const { factory, user1 } = await loadFixture(deployBallotFactoryFixture);
      const proposalNames = [
        ethers.encodeBytes32String("Proposal 1"),
        ethers.encodeBytes32String("Proposal 2"),
      ];
      const description = "Test voting";

      const ballotAddress = await createBallotAndReturnAddress(
        factory,
        user1,
        proposalNames,
        description
      );

      const info = await factory.getBallotInfo(0);
      expect(info.ballotAddress).to.equal(ballotAddress);
      expect(info.description).to.equal(description);
      expect(info.creator).to.equal(user1.address);
    });

    it("Should revert if index is out of bounds", async function () {
      const { factory } = await loadFixture(deployBallotFactoryFixture);
      await expect(factory.getBallotInfo(0)).to.be.revertedWith("Index out of bounds");
    });
  });

  describe("getBallotDescription", function () {
    it("Should return correct description", async function () {
      const { factory, user1 } = await loadFixture(deployBallotFactoryFixture);
      const proposalNames = [
        ethers.encodeBytes32String("Proposal 1"),
        ethers.encodeBytes32String("Proposal 2"),
      ];
      const description = "Test voting";

      const ballotAddress = await createBallotAndReturnAddress(
        factory,
        user1,
        proposalNames,
        description
      );

      expect(await factory.getBallotDescription(ballotAddress)).to.equal(description);
    });
  });

  describe("getBallotCreator", function () {
    it("Should return correct creator", async function () {
      const { factory, user1 } = await loadFixture(deployBallotFactoryFixture);
      const proposalNames = [
        ethers.encodeBytes32String("Proposal 1"),
        ethers.encodeBytes32String("Proposal 2"),
      ];
      const description = "Test voting";

      const ballotAddress = await createBallotAndReturnAddress(
        factory,
        user1,
        proposalNames,
        description
      );

      expect(await factory.getBallotCreator(ballotAddress)).to.equal(user1.address);
    });

    it("Should return zero address for non-existent ballot", async function () {
      const { factory } = await loadFixture(deployBallotFactoryFixture);
      const randomAddress = ethers.ZeroAddress;
      expect(await factory.getBallotCreator(randomAddress)).to.equal(ethers.ZeroAddress);
    });
  });

  describe("Created Ballot Integration", function () {
    it("Should create a valid Ballot contract", async function () {
      const { factory, user1 } = await loadFixture(deployBallotFactoryFixture);
      const proposalNames = [
        ethers.encodeBytes32String("Option X"),
        ethers.encodeBytes32String("Option Y"),
      ];
      const description = "Integration test ballot";

      const ballotAddress = await createBallotAndReturnAddress(
        factory,
        user1,
        proposalNames,
        description
      );

      const Ballot = await ethers.getContractFactory("Ballot");
      const ballot = Ballot.attach(ballotAddress);

      expect(await ballot.chairperson()).to.equal(factory.target);
      const proposal0 = await ballot.proposals(0);
      expect(proposal0.name).to.equal(proposalNames[0]);
    });
  });
});
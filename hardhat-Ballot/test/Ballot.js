const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");

describe("Ballot", function () {
  async function deployBallotFixture() {
    const proposalNames = [
      ethers.encodeBytes32String("Proposal 1"),
      ethers.encodeBytes32String("Proposal 2"),
      ethers.encodeBytes32String("Proposal 3"),
    ];

    const [chairperson, voter1, voter2, voter3, nonVoter] = await ethers.getSigners();

    const Ballot = await ethers.getContractFactory("Ballot");
    const ballot = await Ballot.deploy(proposalNames);

    return { ballot, proposalNames, chairperson, voter1, voter2, voter3, nonVoter };
  }

  describe("Deployment", function () {
    it("Should set the chairperson correctly", async function () {
      const { ballot, chairperson } = await loadFixture(deployBallotFixture);
      expect(await ballot.chairperson()).to.equal(chairperson.address);
    });

    it("Should initialize chairperson with voting weight of 1", async function () {
      const { ballot, chairperson } = await loadFixture(deployBallotFixture);
      const chairpersonVoter = await ballot.voters(chairperson.address);
      expect(chairpersonVoter.weight).to.equal(1);
    });

    it("Should have correct number of proposals", async function () {
      const { ballot, proposalNames } = await loadFixture(deployBallotFixture);
      const proposal0 = await ballot.proposals(0);
      const proposal1 = await ballot.proposals(1);
      const proposal2 = await ballot.proposals(2);
      expect(proposal0[0]).to.equal(proposalNames[0]);
      expect(proposal1[0]).to.equal(proposalNames[1]);
      expect(proposal2[0]).to.equal(proposalNames[2]);
    });

    it("Should initialize proposals with zero votes", async function () {
      const { ballot } = await loadFixture(deployBallotFixture);
      const proposal0 = await ballot.proposals(0);
      const proposal1 = await ballot.proposals(1);
      const proposal2 = await ballot.proposals(2);
      expect(proposal0.voteCount).to.equal(0);
      expect(proposal1.voteCount).to.equal(0);
      expect(proposal2.voteCount).to.equal(0);
    });
  });

  describe("giveRightToVote", function () {
    it("Should allow chairperson to give voting rights", async function () {
      const { ballot, voter1 } = await loadFixture(deployBallotFixture);
      await ballot.giveRightToVote(voter1.address);
      const voter = await ballot.voters(voter1.address);
      expect(voter.weight).to.equal(1);
    });

    it("Should revert if non-chairperson tries to give voting rights", async function () {
      const { ballot, voter1 } = await loadFixture(deployBallotFixture);
      await expect(ballot.connect(voter1).giveRightToVote(voter1.address)).to.be.revertedWith(
        "Only chairperson can give right to vote."
      );
    });

    it("Should revert if voter already voted", async function () {
      const { ballot, voter1 } = await loadFixture(deployBallotFixture);
      await ballot.giveRightToVote(voter1.address);
      await ballot.connect(voter1).vote(0);
      await expect(ballot.giveRightToVote(voter1.address)).to.be.revertedWith(
        "The voter already voted."
      );
    });

    it("Should revert if voter already has voting rights", async function () {
      const { ballot, voter1 } = await loadFixture(deployBallotFixture);
      await ballot.giveRightToVote(voter1.address);
      await expect(ballot.giveRightToVote(voter1.address)).to.be.reverted;
    });
  });

  describe("vote", function () {
    it("Should allow voter to vote", async function () {
      const { ballot, voter1 } = await loadFixture(deployBallotFixture);
      await ballot.giveRightToVote(voter1.address);
      await ballot.connect(voter1).vote(0);
      const proposal = await ballot.proposals(0);
      expect(proposal.voteCount).to.equal(1);
    });

    it("Should revert if voter has no voting rights", async function () {
      const { ballot, nonVoter } = await loadFixture(deployBallotFixture);
      await expect(ballot.connect(nonVoter).vote(0)).to.be.revertedWith(
        "Has no right to vote"
      );
    });

    it("Should revert if voter already voted", async function () {
      const { ballot, voter1 } = await loadFixture(deployBallotFixture);
      await ballot.giveRightToVote(voter1.address);
      await ballot.connect(voter1).vote(0);
      await expect(ballot.connect(voter1).vote(1)).to.be.revertedWith(
        "Already voted."
      );
    });

    it("Should revert if proposal index is out of bounds", async function () {
      const { ballot, voter1 } = await loadFixture(deployBallotFixture);
      await ballot.giveRightToVote(voter1.address);
      await expect(ballot.connect(voter1).vote(10)).to.be.reverted;
    });
  });

  describe("delegate", function () {
    it("Should allow voter to delegate to another voter", async function () {
      const { ballot, voter1, voter2 } = await loadFixture(deployBallotFixture);
      await ballot.giveRightToVote(voter1.address);
      await ballot.giveRightToVote(voter2.address);
      await ballot.connect(voter1).delegate(voter2.address);
      
      const voter1Info = await ballot.voters(voter1.address);
      const voter2Info = await ballot.voters(voter2.address);
      
      expect(voter1Info.voted).to.equal(true);
      expect(voter1Info.delegate).to.equal(voter2.address);
      expect(voter2Info.weight).to.equal(2);
    });

    it("Should revert if voter has no voting rights", async function () {
      const { ballot, nonVoter, voter1 } = await loadFixture(deployBallotFixture);
      await ballot.giveRightToVote(voter1.address);
      await expect(ballot.connect(nonVoter).delegate(voter1.address)).to.be.revertedWith(
        "You have no right to vote"
      );
    });

    it("Should revert if voter already voted", async function () {
      const { ballot, voter1, voter2 } = await loadFixture(deployBallotFixture);
      await ballot.giveRightToVote(voter1.address);
      await ballot.giveRightToVote(voter2.address);
      await ballot.connect(voter1).vote(0);
      await expect(ballot.connect(voter1).delegate(voter2.address)).to.be.revertedWith(
        "You already voted."
      );
    });

    it("Should revert if self-delegation is attempted", async function () {
      const { ballot, voter1 } = await loadFixture(deployBallotFixture);
      await ballot.giveRightToVote(voter1.address);
      await expect(ballot.connect(voter1).delegate(voter1.address)).to.be.revertedWith(
        "Self-delegation is disallowed."
      );
    });

    it("Should revert if delegate has no voting rights", async function () {
      const { ballot, voter1, nonVoter } = await loadFixture(deployBallotFixture);
      await ballot.giveRightToVote(voter1.address);
      await expect(ballot.connect(voter1).delegate(nonVoter.address)).to.be.reverted;
    });

    it("Should handle transitive delegation", async function () {
      const { ballot, voter1, voter2, voter3 } = await loadFixture(deployBallotFixture);
      await ballot.giveRightToVote(voter1.address);
      await ballot.giveRightToVote(voter2.address);
      await ballot.giveRightToVote(voter3.address);
      
      await ballot.connect(voter1).delegate(voter2.address);
      await ballot.connect(voter2).delegate(voter3.address);
      
      const voter3Info = await ballot.voters(voter3.address);
      expect(voter3Info.weight).to.equal(3);
    });

    it("Should revert if delegation loop is detected", async function () {
      const { ballot, voter1, voter2 } = await loadFixture(deployBallotFixture);
      await ballot.giveRightToVote(voter1.address);
      await ballot.giveRightToVote(voter2.address);
      
      await ballot.connect(voter1).delegate(voter2.address);
      await expect(ballot.connect(voter2).delegate(voter1.address)).to.be.revertedWith(
        "Found loop in delegation."
      );
    });

    it("Should add to vote count if delegate already voted", async function () {
      const { ballot, voter1, voter2 } = await loadFixture(deployBallotFixture);
      await ballot.giveRightToVote(voter1.address);
      await ballot.giveRightToVote(voter2.address);
      
      await ballot.connect(voter2).vote(0);
      await ballot.connect(voter1).delegate(voter2.address);
      
      const proposal = await ballot.proposals(0);
      expect(proposal.voteCount).to.equal(2);
    });
  });

  describe("winningProposal", function () {
    it("Should return the winning proposal", async function () {
      const { ballot, voter1, voter2, voter3 } = await loadFixture(deployBallotFixture);
      await ballot.giveRightToVote(voter1.address);
      await ballot.giveRightToVote(voter2.address);
      await ballot.giveRightToVote(voter3.address);
      
      await ballot.connect(voter1).vote(0);
      await ballot.connect(voter2).vote(1);
      await ballot.connect(voter3).vote(1);
      
      expect(await ballot.winningProposal()).to.equal(1);
    });

    it("Should return first proposal if all have zero votes", async function () {
      const { ballot } = await loadFixture(deployBallotFixture);
      expect(await ballot.winningProposal()).to.equal(0);
    });
  });

  describe("winnerName", function () {
    it("Should return the name of the winning proposal", async function () {
      const { ballot, voter1, voter2 } = await loadFixture(deployBallotFixture);
      await ballot.giveRightToVote(voter1.address);
      await ballot.giveRightToVote(voter2.address);
      
      await ballot.connect(voter1).vote(2);
      await ballot.connect(voter2).vote(2);
      
      const winner = await ballot.winnerName();
      expect(winner).to.equal(ethers.encodeBytes32String("Proposal 3"));
    });
  });
});
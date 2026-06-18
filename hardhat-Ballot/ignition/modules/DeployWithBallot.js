const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const { ethers } = require("hardhat");

function stringToBytes32(str) {
  return ethers.encodeBytes32String(str);
}

module.exports = buildModule("DeployWithBallotModule", (m) => {
  const factory = m.contract("BallotFactory");

  const proposalStrings = m.getParameter("proposalStrings", [
    "Proposal A",
    "Proposal B",
    "Proposal C",
  ]);
  const ballotDescription = m.getParameter(
    "ballotDescription",
    "Test Ballot from Factory"
  );

  const proposalNames = proposalStrings.map((str) => stringToBytes32(str));

  const createBallotTx = m.call(
    factory,
    "createBallot",
    [proposalNames, ballotDescription]
  );

  const ballotAddress = m.readEventArgument(createBallotTx, "BallotCreated", "ballotAddress");

  const ballot = m.contractAt("Ballot", ballotAddress);

  return { factory, ballot, ballotAddress };
});
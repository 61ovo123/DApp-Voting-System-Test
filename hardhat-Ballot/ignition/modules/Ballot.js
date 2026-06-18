const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const { ethers } = require("ethers");

function stringToBytes32(str) {
  return ethers.encodeBytes32String(str);
}
function bytes32ToString(bytes32) {
  return ethers.utils.decodeBytes32String(bytes32);
}

module.exports = buildModule("BallotModule", (m) => {
  const proposalStrings = m.getParameter(
    "proposalStrings",
    ["提案A", "提案B", "提案C"]
  );
console.log(proposalStrings);
  const proposalNames = proposalStrings.defaultValue.map(str => stringToBytes32(str));

  const ballot = m.contract("Ballot", [proposalNames]);

  return { ballot };
});
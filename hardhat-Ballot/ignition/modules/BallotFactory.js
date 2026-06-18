const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("BallotFactoryModule", (m) => {
  const factory = m.contract("BallotFactory");

  return { factory };
});
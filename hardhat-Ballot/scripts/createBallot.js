const hre = require("hardhat");

async function main() {
  const factoryAddress = process.env.BALLOT_FACTORY_ADDRESS;
  
  if (!factoryAddress) {
    console.error("Please set BALLOT_FACTORY_ADDRESS in your .env file");
    process.exit(1);
  }

  console.log(`Using BallotFactory at: ${factoryAddress}`);

  const factory = await hre.ethers.getContractAt("BallotFactory", factoryAddress);

  const proposals = process.argv.slice(2);
  const description = "Test Ballot from Script";

  if (proposals.length < 2) {
    console.error("Please provide at least 2 proposal names as arguments");
    console.log("Example: npx hardhat run scripts/createBallot.js 'Proposal A' 'Proposal B' 'Proposal C'");
    process.exit(1);
  }

  console.log(`\nCreating ballot with ${proposals.length} proposals...`);
  console.log(`Proposals: ${proposals.join(", ")}`);
  console.log(`Description: ${description}`);

  const proposalBytes32 = proposals.map((p) => hre.ethers.encodeBytes32String(p));

  const tx = await factory.createBallot(proposalBytes32, description);
  const receipt = await tx.wait();

  const ballotAddress = receipt.logs[0].args.ballotAddress;

  console.log(`\nBallot created successfully!`);
  console.log(`Ballot address: ${ballotAddress}`);

  const ballot = await hre.ethers.getContractAt("Ballot", ballotAddress);
  console.log(`\nBallot Details:`);
  console.log(`  Chairperson: ${await ballot.chairperson()}`);

  const proposalCount = await ballot.proposals([]);
  console.log(`  Proposal count: ${(await ballot.proposals.length)}`);

  for (let i = 0; i < proposals.length; i++) {
    const proposal = await ballot.proposals(i);
    const name = hre.ethers.decodeBytes32String(proposal[0]);
    console.log(`  Proposal ${i}: ${name} (${proposal[1]} votes)`);
  }

  return ballotAddress;
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  });
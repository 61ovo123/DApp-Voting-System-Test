const hre = require("hardhat");

async function main() {
  console.log("Deploying BallotFactory...");

  const BallotFactory = await hre.ethers.getContractFactory("BallotFactory");
  const factory = await BallotFactory.deploy();

  await factory.waitForDeployment();
  const factoryAddress = await factory.getAddress();

  console.log(`BallotFactory deployed to: ${factoryAddress}`);

  console.log("\n--- Factory Contract Details ---");
  console.log(`Owner: ${await factory.owner()}`);
  console.log(`Ballot Count: ${await factory.getBallotCount()}`);

  console.log("\n--- Next Steps ---");
  console.log(`1. Update your .env file:`);
  console.log(`   NEXT_PUBLIC_BALLOT_FACTORY_ADDRESS=${factoryAddress}`);
  console.log("");
  console.log(`2. To verify on scaner:`);
  console.log(`   npx hardhat verify --network sepolia ${factoryAddress}`);

  return factoryAddress;
}

main()
  .then((address) => {
    console.log(`\nDeployment successful!`);
    process.exit(0);
  })
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
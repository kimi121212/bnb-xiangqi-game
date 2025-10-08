const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying BNB Xiangqi contracts...");

  // Get the contract factories
  const BNBStaking = await ethers.getContractFactory("BNBStaking");
  const XiangqiGame = await ethers.getContractFactory("XiangqiGame");

  // Deploy BNBStaking contract
  console.log("Deploying BNBStaking contract...");
  const bnbStaking = await BNBStaking.deploy();
  await bnbStaking.waitForDeployment();
  console.log("BNBStaking deployed to:", await bnbStaking.getAddress());

  // Deploy XiangqiGame contract
  console.log("Deploying XiangqiGame contract...");
  const xiangqiGame = await XiangqiGame.deploy();
  await xiangqiGame.waitForDeployment();
  console.log("XiangqiGame deployed to:", await xiangqiGame.getAddress());

  // Save contract addresses
  const contractAddresses = {
    BNBStaking: await bnbStaking.getAddress(),
    XiangqiGame: await xiangqiGame.getAddress(),
    network: await ethers.provider.getNetwork()
  };

  console.log("Contract addresses:", contractAddresses);

  // Verify contracts on BSCScan (if on mainnet/testnet)
  const network = await ethers.provider.getNetwork();
  if (network.chainId === 56n || network.chainId === 97n) {
    console.log("Waiting for block confirmations...");
    await bnbStaking.deploymentTransaction().wait(5);
    await xiangqiGame.deploymentTransaction().wait(5);

    console.log("Verifying contracts on BSCScan...");
    try {
      await hre.run("verify:verify", {
        address: await bnbStaking.getAddress(),
        constructorArguments: [],
      });
    } catch (error) {
      console.log("BNBStaking verification failed:", error.message);
    }

    try {
      await hre.run("verify:verify", {
        address: await xiangqiGame.getAddress(),
        constructorArguments: [],
      });
    } catch (error) {
      console.log("XiangqiGame verification failed:", error.message);
    }
  }

  console.log("Deployment completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

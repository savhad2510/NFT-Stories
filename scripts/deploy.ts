import { ethers } from "hardhat";

async function main() {
  console.log("Deploying StoryNFT contract...");

  const StoryNFT = await ethers.getContractFactory("StoryNFT");
  const storyNFT = await StoryNFT.deploy();

  await storyNFT.deployed();

  console.log("StoryNFT deployed to:", storyNFT.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

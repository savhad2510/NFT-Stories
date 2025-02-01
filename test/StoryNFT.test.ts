import { expect } from "chai";
import { ethers } from "hardhat";
import { StoryNFT } from "../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("StoryNFT", function () {
  let storyNFT: StoryNFT;
  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;
  let addr2: SignerWithAddress;

  beforeEach(async function () {
    // Get signers
    [owner, addr1, addr2] = await ethers.getSigners();

    // Deploy contract
    const StoryNFTFactory = await ethers.getContractFactory("StoryNFT");
    storyNFT = await StoryNFTFactory.deploy();
    await storyNFT.deployed();
  });

  describe("Minting", function () {
    it("Should mint a new story NFT", async function () {
      const title = "Test Story";
      const initialStory = "Once upon a time...";

      // Mint new story
      await expect(storyNFT.connect(addr1).mint(title, initialStory))
        .to.emit(storyNFT, "StoryMinted")
        .withArgs(0, title, initialStory);

      // Verify owner
      expect(await storyNFT.ownerOf(0)).to.equal(addr1.address);
      
      // Verify content
      expect(await storyNFT.getStoryContent(0)).to.equal(initialStory);
      expect(await storyNFT.getStoryTitle(0)).to.equal(title);
    });
  });

  describe("Evolution", function () {
    beforeEach(async function () {
      // Mint a story for testing evolution
      await storyNFT.connect(addr1).mint("Test Story", "Initial chapter");
    });

    it("Should evolve a story", async function () {
      const newContent = "The story continues...";
      
      // Evolve story
      await expect(storyNFT.connect(addr1).evolveStory(0, newContent))
        .to.emit(storyNFT, "StoryEvolved");

      // Verify new content
      expect(await storyNFT.getStoryContent(0)).to.equal(newContent);
    });

    it("Should prevent non-owners from evolving stories", async function () {
      await expect(
        storyNFT.connect(addr2).evolveStory(0, "Unauthorized evolution")
      ).to.be.revertedWith("Not the story owner");
    });
  });

  describe("Verification", function () {
    it("Should verify story evolution proofs", async function () {
      // Mint and evolve a story
      await storyNFT.connect(addr1).mint("Test Story", "Initial chapter");
      await storyNFT.connect(addr1).evolveStory(0, "Evolved chapter");

      // Get and verify proof
      const proof = await storyNFT.getProof(0);
      expect(await storyNFT.verify(0, proof)).to.be.true;
    });
  });
});

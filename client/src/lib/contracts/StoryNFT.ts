import { ethers } from 'ethers';

// ERC-7007 interface for evolving story NFTs
export const StoryNFTABI = [
  // Mint function
  "function mint(string memory title, string memory initialStory) public returns (uint256)",

  // Evolution functions
  "function evolveStory(uint256 tokenId, string memory newContent) public",
  "function getStoryContent(uint256 tokenId) public view returns (string memory)",

  // ERC-7007 specific functions
  "function verify(uint256 tokenId, bytes memory proof) public view returns (bool)",
  "function getProof(uint256 tokenId) public view returns (bytes memory)",

  // Events
  "event StoryEvolved(uint256 indexed tokenId, string newContent, bytes proof)",
  "event StoryMinted(uint256 indexed tokenId, string title, string initialStory)"
];

export class StoryNFT {
  private contract: ethers.Contract;

  constructor(address: string, signerOrProvider: ethers.Signer | ethers.Provider) {
    this.contract = new ethers.Contract(address, StoryNFTABI, signerOrProvider);
  }

  async mint(title: string, initialStory: string, signer: ethers.Signer) {
    const contract = this.contract.connect(signer);
    return await contract.mint(title, initialStory);
  }

  async evolveStory(tokenId: string, newContent: string, signer: ethers.Signer) {
    const contract = this.contract.connect(signer);
    return await contract.evolveStory(tokenId, newContent);
  }

  async getStoryContent(tokenId: string) {
    return await this.contract.getStoryContent(tokenId);
  }

  async verifyStory(tokenId: string, proof: string) {
    return await this.contract.verify(tokenId, proof);
  }
}
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract StoryNFT is ERC721 {
    uint256 private _nextTokenId;
    mapping(uint256 => string) private _storyContent;
    mapping(uint256 => string) private _storyTitles;
    mapping(uint256 => bytes) private _proofs;

    event StoryEvolved(uint256 indexed tokenId, string newContent, bytes proof);
    event StoryMinted(uint256 indexed tokenId, string title, string initialStory);

    constructor() ERC721("NFT Stories", "STORY") {}

    function mint(string memory title, string memory initialStory) public returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        _safeMint(msg.sender, tokenId);
        _storyContent[tokenId] = initialStory;
        _storyTitles[tokenId] = title;
        
        emit StoryMinted(tokenId, title, initialStory);
        return tokenId;
    }

    function evolveStory(uint256 tokenId, string memory newContent) public {
        require(_exists(tokenId), "Story does not exist");
        require(ownerOf(tokenId) == msg.sender, "Not the story owner");
        
        _storyContent[tokenId] = newContent;
        bytes memory proof = abi.encodePacked(msg.sender, block.timestamp, newContent);
        _proofs[tokenId] = proof;
        
        emit StoryEvolved(tokenId, newContent, proof);
    }

    function getStoryContent(uint256 tokenId) public view returns (string memory) {
        require(_exists(tokenId), "Story does not exist");
        return _storyContent[tokenId];
    }

    function getStoryTitle(uint256 tokenId) public view returns (string memory) {
        require(_exists(tokenId), "Story does not exist");
        return _storyTitles[tokenId];
    }

    function verify(uint256 tokenId, bytes memory proof) public view returns (bool) {
        require(_exists(tokenId), "Story does not exist");
        return keccak256(_proofs[tokenId]) == keccak256(proof);
    }

    function getProof(uint256 tokenId) public view returns (bytes memory) {
        require(_exists(tokenId), "Story does not exist");
        return _proofs[tokenId];
    }
}

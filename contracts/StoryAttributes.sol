
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./StoryNFT.sol";

contract StoryAttributes is Ownable {
    StoryNFT public storyNFT;
    
    struct Attributes {
        uint8 drama;
        uint8 mystery;
        uint8 action;
        uint8 romance;
        uint8 scifi;
        string genre;
        uint256 evolutionCount;
        uint256 lastEvolutionTimestamp;
    }

    mapping(uint256 => Attributes) public storyAttributes;
    mapping(uint256 => string[]) public storyEvolutionHistory;
    
    event AttributesUpdated(uint256 indexed tokenId, string genre);
    event EvolutionRecorded(uint256 indexed tokenId, uint256 evolutionCount);
    event GenreAssigned(uint256 indexed tokenId, string genre);

    constructor(address _storyNFT) Ownable(msg.sender) {
        storyNFT = StoryNFT(_storyNFT);
    }

    function setAttributes(
        uint256 tokenId,
        uint8 drama,
        uint8 mystery,
        uint8 action,
        uint8 romance,
        uint8 scifi,
        string memory genre
    ) external onlyOwner {
        require(storyNFT.ownerOf(tokenId) != address(0), "Story does not exist");
        
        storyAttributes[tokenId] = Attributes(
            drama,
            mystery,
            action,
            romance,
            scifi,
            genre,
            0,
            block.timestamp
        );
        
        emit AttributesUpdated(tokenId, genre);
        emit GenreAssigned(tokenId, genre);
    }

    function recordEvolution(uint256 tokenId, string memory evolutionContent) external {
        require(msg.sender == address(storyNFT), "Only StoryNFT can record evolution");
        
        Attributes storage attrs = storyAttributes[tokenId];
        attrs.evolutionCount++;
        attrs.lastEvolutionTimestamp = block.timestamp;
        storyEvolutionHistory[tokenId].push(evolutionContent);
        
        emit EvolutionRecorded(tokenId, attrs.evolutionCount);
    }

    function getAttributes(uint256 tokenId) external view returns (Attributes memory) {
        return storyAttributes[tokenId];
    }

    function getEvolutionHistory(uint256 tokenId) external view returns (string[] memory) {
        return storyEvolutionHistory[tokenId];
    }
}

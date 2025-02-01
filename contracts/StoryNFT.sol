// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title StoryNFT
 * @dev Implementation of a dynamic storytelling NFT that can evolve over time
 * with AI-generated content and on-chain verification.
 */
contract StoryNFT is ERC721, ReentrancyGuard {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    // Story content storage
    mapping(uint256 => string) private _storyContent;
    mapping(uint256 => string) private _storyTitles;
    mapping(uint256 => bytes32) private _proofs;
    mapping(uint256 => uint256) private _lastEvolutionTime;

    // Evolution cooldown (6 hours)
    uint256 public constant EVOLUTION_COOLDOWN = 6 hours;

    // Events
    event StoryMinted(
        uint256 indexed tokenId,
        address indexed creator,
        string title,
        string initialStory,
        bytes32 proof
    );

    event StoryEvolved(
        uint256 indexed tokenId,
        address indexed owner,
        string newContent,
        bytes32 proof,
        uint256 timestamp
    );

    // Custom errors
    error StoryDoesNotExist();
    error NotStoryOwner();
    error EmptyContent();
    error EmptyTitle();
    error EvolutionTooSoon(uint256 timeRemaining);

    constructor() ERC721("NFT Stories", "STORY") {}

    /**
     * @dev Creates a new story NFT with the given title and initial content
     * @param title The title of the story
     * @param initialStory The initial content of the story
     * @return The ID of the newly minted NFT
     */
    function mint(string memory title, string memory initialStory) 
        public 
        nonReentrant 
        returns (uint256) 
    {
        if (bytes(title).length == 0) revert EmptyTitle();
        if (bytes(initialStory).length == 0) revert EmptyContent();

        _tokenIds.increment();
        uint256 tokenId = _tokenIds.current();

        _safeMint(msg.sender, tokenId);
        _storyContent[tokenId] = initialStory;
        _storyTitles[tokenId] = title;

        bytes32 proof = generateProof(msg.sender, tokenId, initialStory);
        _proofs[tokenId] = proof;
        _lastEvolutionTime[tokenId] = block.timestamp;

        emit StoryMinted(tokenId, msg.sender, title, initialStory, proof);
        return tokenId;
    }

    /**
     * @dev Evolves an existing story with new content
     * @param tokenId The ID of the story to evolve
     * @param newContent The new content to add to the story
     */
    function evolveStory(uint256 tokenId, string memory newContent) 
        public 
        payable
        nonReentrant 
    {
        require(msg.value >= 0.1 ether, "Must send 0.1 ETH to evolve story");
        if (!_exists(tokenId)) revert StoryDoesNotExist();
        if (ownerOf(tokenId) != msg.sender) revert NotStoryOwner();
        if (bytes(newContent).length == 0) revert EmptyContent();

        uint256 timeSinceLastEvolution = block.timestamp - _lastEvolutionTime[tokenId];
        if (timeSinceLastEvolution < EVOLUTION_COOLDOWN) {
            revert EvolutionTooSoon(EVOLUTION_COOLDOWN - timeSinceLastEvolution);
        }

        _storyContent[tokenId] = newContent;
        bytes32 proof = generateProof(msg.sender, tokenId, newContent);
        _proofs[tokenId] = proof;
        _lastEvolutionTime[tokenId] = block.timestamp;

        emit StoryEvolved(tokenId, msg.sender, newContent, proof, block.timestamp);
    }

    /**
     * @dev Retrieves the current content of a story
     * @param tokenId The ID of the story to query
     * @return The current content of the story
     */
    function getStoryContent(uint256 tokenId) 
        public 
        view 
        returns (string memory) 
    {
        if (!_exists(tokenId)) revert StoryDoesNotExist();
        return _storyContent[tokenId];
    }

    /**
     * @dev Retrieves the title of a story
     * @param tokenId The ID of the story to query
     * @return The title of the story
     */
    function getStoryTitle(uint256 tokenId) 
        public 
        view 
        returns (string memory) 
    {
        if (!_exists(tokenId)) revert StoryDoesNotExist();
        return _storyTitles[tokenId];
    }

    /**
     * @dev Verifies a proof for a story evolution
     * @param tokenId The ID of the story
     * @param proof The proof to verify
     * @return Whether the proof is valid
     */
    function verify(uint256 tokenId, bytes32 proof) 
        public 
        view 
        returns (bool) 
    {
        if (!_exists(tokenId)) revert StoryDoesNotExist();
        return _proofs[tokenId] == proof;
    }

    /**
     * @dev Gets the latest proof for a story
     * @param tokenId The ID of the story
     * @return The latest proof
     */
    function getProof(uint256 tokenId) 
        public 
        view 
        returns (bytes32) 
    {
        if (!_exists(tokenId)) revert StoryDoesNotExist();
        return _proofs[tokenId];
    }

    /**
     * @dev Gets the time remaining until the next evolution is allowed
     * @param tokenId The ID of the story
     * @return The time remaining in seconds, 0 if evolution is allowed
     */
    function timeUntilNextEvolution(uint256 tokenId)
        public
        view
        returns (uint256)
    {
        if (!_exists(tokenId)) revert StoryDoesNotExist();

        uint256 timeSinceLastEvolution = block.timestamp - _lastEvolutionTime[tokenId];
        if (timeSinceLastEvolution >= EVOLUTION_COOLDOWN) {
            return 0;
        }
        return EVOLUTION_COOLDOWN - timeSinceLastEvolution;
    }

    /**
     * @dev Internal function to generate a proof for story evolution
     */
    function generateProof(
        address owner,
        uint256 tokenId,
        string memory content
    ) internal view returns (bytes32) {
        return keccak256(
            abi.encodePacked(
                owner,
                tokenId,
                content,
                block.timestamp,
                block.number
            )
        );
    }
}
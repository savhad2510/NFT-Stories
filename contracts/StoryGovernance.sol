
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./StoryNFT.sol";

contract StoryGovernance is AccessControl, ReentrancyGuard {
    bytes32 public constant EDITOR_ROLE = keccak256("EDITOR_ROLE");
    bytes32 public constant CURATOR_ROLE = keccak256("CURATOR_ROLE");

    struct EvolutionProposal {
        uint256 storyId;
        string proposedContent;
        uint256 votes;
        bool executed;
        uint256 deadline;
        mapping(address => bool) hasVoted;
    }

    StoryNFT public storyNFT;
    mapping(uint256 => EvolutionProposal) public proposals;
    uint256 public proposalCount;
    uint256 public constant VOTING_PERIOD = 2 days;
    uint256 public constant MIN_VOTES_REQUIRED = 10;

    event ProposalCreated(uint256 indexed proposalId, uint256 storyId, string content);
    event VoteCast(uint256 indexed proposalId, address voter);
    event ProposalExecuted(uint256 indexed proposalId);
    event StoryEvolved(uint256 indexed storyId, string newContent);

    constructor(address _storyNFT) {
        storyNFT = StoryNFT(_storyNFT);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(EDITOR_ROLE, msg.sender);
    }

    function proposeEvolution(uint256 storyId, string memory content) external {
        require(hasRole(EDITOR_ROLE, msg.sender), "Must have editor role");
        proposalCount++;
        EvolutionProposal storage proposal = proposals[proposalCount];
        proposal.storyId = storyId;
        proposal.proposedContent = content;
        proposal.deadline = block.timestamp + VOTING_PERIOD;
        proposal.executed = false;

        emit ProposalCreated(proposalCount, storyId, content);
    }

    function vote(uint256 proposalId) external nonReentrant {
        require(hasRole(CURATOR_ROLE, msg.sender), "Must have curator role");
        EvolutionProposal storage proposal = proposals[proposalId];
        require(block.timestamp <= proposal.deadline, "Voting period ended");
        require(!proposal.hasVoted[msg.sender], "Already voted");
        
        proposal.votes++;
        proposal.hasVoted[msg.sender] = true;
        
        emit VoteCast(proposalId, msg.sender);

        if (proposal.votes >= MIN_VOTES_REQUIRED) {
            executeProposal(proposalId);
        }
    }

    function executeProposal(uint256 proposalId) internal {
        EvolutionProposal storage proposal = proposals[proposalId];
        require(!proposal.executed, "Already executed");
        require(proposal.votes >= MIN_VOTES_REQUIRED, "Not enough votes");

        proposal.executed = true;
        storyNFT.evolveStory(proposal.storyId, proposal.proposedContent);
        
        emit ProposalExecuted(proposalId);
        emit StoryEvolved(proposal.storyId, proposal.proposedContent);
    }
}

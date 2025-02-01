
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./StoryNFT.sol";

contract StoryRewards is ERC20, Ownable {
    StoryNFT public storyNFT;
    mapping(address => uint256) public lastRewardTimestamp;
    mapping(uint256 => uint256) public storyContributions;
    
    uint256 public constant REWARD_COOLDOWN = 1 days;
    uint256 public constant DAILY_REWARD = 100 * 10**18;
    uint256 public constant EVOLUTION_REWARD = 50 * 10**18;

    event RewardClaimed(address indexed user, uint256 amount);
    event EvolutionRewarded(address indexed contributor, uint256 storyId, uint256 amount);

    constructor(address _storyNFT) ERC20("Story Rewards", "SREWARD") Ownable(msg.sender) {
        storyNFT = StoryNFT(_storyNFT);
    }

    function claimDailyReward() external {
        require(block.timestamp >= lastRewardTimestamp[msg.sender] + REWARD_COOLDOWN, "Too soon");
        require(storyNFT.balanceOf(msg.sender) > 0, "Must own a story NFT");
        
        lastRewardTimestamp[msg.sender] = block.timestamp;
        _mint(msg.sender, DAILY_REWARD);
        emit RewardClaimed(msg.sender, DAILY_REWARD);
    }

    function rewardEvolution(address contributor, uint256 storyId) external onlyOwner {
        require(storyNFT.ownerOf(storyId) == contributor, "Not story owner");
        
        storyContributions[storyId]++;
        _mint(contributor, EVOLUTION_REWARD);
        emit EvolutionRewarded(contributor, storyId, EVOLUTION_REWARD);
    }

    function getContributions(uint256 storyId) external view returns (uint256) {
        return storyContributions[storyId];
    }
}

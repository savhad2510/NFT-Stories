
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "./StoryNFT.sol";

contract StoryMarketplace is ReentrancyGuard {
    StoryNFT public storyNFT;
    
    struct Listing {
        address seller;
        uint256 price;
        bool active;
        uint256 evolutionCount;
    }

    mapping(uint256 => Listing) public listings;
    uint256 public platformFee = 25; // 2.5%
    
    event StoryListed(uint256 indexed tokenId, address seller, uint256 price);
    event StorySold(uint256 indexed tokenId, address seller, address buyer, uint256 price);
    event ListingCanceled(uint256 indexed tokenId);
    event PriceUpdated(uint256 indexed tokenId, uint256 newPrice);

    constructor(address _storyNFT) {
        storyNFT = StoryNFT(_storyNFT);
    }

    function listStory(uint256 tokenId, uint256 price) external {
        require(storyNFT.ownerOf(tokenId) == msg.sender, "Not owner");
        require(storyNFT.getApproved(tokenId) == address(this), "Not approved");
        
        listings[tokenId] = Listing(
            msg.sender,
            price,
            true,
            0 // Initial evolution count
        );
        
        emit StoryListed(tokenId, msg.sender, price);
    }

    function buyStory(uint256 tokenId) external payable nonReentrant {
        Listing storage listing = listings[tokenId];
        require(listing.active, "Not for sale");
        require(msg.value >= listing.price, "Insufficient payment");
        
        uint256 fee = (listing.price * platformFee) / 1000;
        uint256 sellerAmount = listing.price - fee;
        
        listing.active = false;
        payable(listing.seller).transfer(sellerAmount);
        storyNFT.transferFrom(listing.seller, msg.sender, tokenId);
        
        emit StorySold(tokenId, listing.seller, msg.sender, listing.price);
    }

    function updatePrice(uint256 tokenId, uint256 newPrice) external {
        require(listings[tokenId].seller == msg.sender, "Not seller");
        require(listings[tokenId].active, "Not active");
        
        listings[tokenId].price = newPrice;
        emit PriceUpdated(tokenId, newPrice);
    }

    function cancelListing(uint256 tokenId) external {
        require(listings[tokenId].seller == msg.sender, "Not seller");
        require(listings[tokenId].active, "Not active");
        
        listings[tokenId].active = false;
        emit ListingCanceled(tokenId);
    }
}


# Dynamic Storytelling NFT Platform 🚀

A cutting-edge platform that generates unique, blockchain-powered narrative experiences through advanced generative AI capabilities. Create, evolve, and own dynamic story NFTs that grow and change over time.

![NFT Stories Features](client/public/images/Screenshot_20250201_011307.png)

## 🌟 Key Features

- **Story Branches**: Choose from 3 paths every 6 hours
- **Story Stats**: Track your story attributes
- **Achievements**: Unlock special rewards
- **AI-Powered Story Generation**: Create unique narratives using advanced AI models
- **ERC-7007 NFTs**: Mint your stories as evolving NFTs on the Ethereum network

![Story Creation Interface](client/public/images/Screenshot_20250201_011419.png)

## 📖 Story Experience

Each story features:
- Dynamic chapter progression
- Word count and reading time tracking
- Co-authoring capabilities
- Multiple unique narrative paths
- Beautiful illustrations

![Story Reader Interface](client/public/images/Screenshot_20250201_011525.png)

## 🛠️ Tech Stack

### Frontend
- React with TypeScript
- TailwindCSS + shadcn/ui for styling
- Wouter for routing
- TanStack Query for data fetching
- Ethers.js for blockchain interaction

### Backend
- Express.js server
- PostgreSQL with Drizzle ORM
- DeepSeek AI for story generation
- Web3 integration for NFT interactions

### Smart Contracts
- Hardhat development framework
- ERC-7007 standard implementation
- OpenZeppelin contracts
- Solidity ^0.8.20

## 🏗️ Project Structure

```
├── client/                 # Frontend React application
├── contracts/             # Solidity smart contracts
├── server/               # Express.js backend
├── scripts/              # Deployment and testing scripts
├── test/                # Contract test files
└── db/                  # Database schema and migrations
```

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18
- PostgreSQL database
- MetaMask wallet
- Ethereum testnet (Sepolia) account with test ETH
- API keys for:
  - DeepSeek AI
  - Etherscan (for contract verification)
  - Alchemy/Infura (for Ethereum RPC)

### Environment Setup

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Fill in the required environment variables:
```env
# Network RPC URLs
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/your-api-key

# Private Key (without 0x prefix)
PRIVATE_KEY=your-private-key-here

# Etherscan API Key for verification
ETHERSCAN_API_KEY=your-etherscan-api-key

# DeepSeek AI API Key
DEEPSEEK_API_KEY=your-deepseek-api-key

# Contract Address (after deployment)
STORY_NFT_ADDRESS=
```

### Installation & Running

```bash
# Install dependencies
npm install

# Deploy smart contracts
npm run deploy:sepolia

# Start development server
npm run dev
```

## 🎭 Story Evolution System

### Evolution Mechanics
- Stories evolve every 6 hours through AI generation
- Choose from 3 unique paths at each evolution point
- Each choice affects story attributes and unlocks achievements

### Story Attributes
- Drama Level: Influences plot twists and character conflicts
- Mystery Rating: Affects the complexity of story revelations
- Action Intensity: Controls the pace and excitement level

## 💎 NFT Features

- **ERC-7007 Standard**: Advanced NFT implementation with dynamic metadata
- **On-chain History**: All story evolutions permanently recorded
- **Co-authoring**: Collaborate with others on story development
- **Trading**: Buy and sell unique story NFTs in the marketplace
- **Achievements**: Unlock special rewards through story choices

## 🎯 Smart Contract Architecture

```solidity
// Core Contracts
StoryNFT.sol         // Main NFT implementation
StoryAttributes.sol   // Manages story properties
StoryGovernance.sol  // Community voting system
StoryMarketplace.sol // Trading functionality
StoryRewards.sol     // Achievement system
```

## 🔒 Security Measures

- Smart contracts audited and thoroughly tested
- Implements OpenZeppelin's secure standards:
  - ReentrancyGuard for NFT operations
  - Pausable for emergency stops
  - AccessControl for permissions
- Story evolution cooldown prevents spam
- On-chain verification of all changes

## 🧪 Development

### Testing
```bash
# Run the full test suite
npm test

# Run specific test file
npm test test/StoryNFT.test.ts
```

### Local Development
```bash
# Start development server
npm run dev

# Deploy contracts to testnet
npm run deploy:sepolia
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- OpenZeppelin for secure contract implementations
- DeepSeek AI for story generation capabilities
- shadcn/ui for beautiful UI components
- Ethereum community for ERC-7007 standard support

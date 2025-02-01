import { useState, useEffect } from "react";
import { useToast } from "./use-toast";
import { ethers } from "ethers";
import { StoryNFT } from "@/lib/contracts/StoryNFT";

declare global {
  interface Window {
    ethereum?: any;
  }
}

const SEPOLIA_CHAIN_ID = 11155111;
const SEPOLIA_EXPLORER = "https://sepolia.etherscan.io";
const STORY_NFT_ADDRESS = "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"; // Update after deployment

export function useWeb3() {
  const [address, setAddress] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [storyContract, setStoryContract] = useState<StoryNFT | null>(null);
  const { toast } = useToast();

  async function checkAndSwitchNetwork() {
    if (!window.ethereum) return false;

    try {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      const currentChainId = parseInt(chainId, 16);

      if (currentChainId !== SEPOLIA_CHAIN_ID) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: `0x${SEPOLIA_CHAIN_ID.toString(16)}` }],
          });
        } catch (switchError: any) {
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: `0x${SEPOLIA_CHAIN_ID.toString(16)}`,
                chainName: 'Sepolia',
                nativeCurrency: {
                  name: 'SepoliaETH',
                  symbol: 'ETH',
                  decimals: 18
                },
                rpcUrls: ['https://eth-sepolia.g.alchemy.com/v2/'],
                blockExplorerUrls: [SEPOLIA_EXPLORER]
              }]
            });
          } else {
            throw switchError;
          }
        }
      }
      return true;
    } catch (error) {
      console.error('Failed to switch to Sepolia:', error);
      return false;
    }
  }

  const handleTransaction = async (tx: ethers.ContractTransactionResponse, description: string) => {
    toast({
      title: "Transaction Submitted",
      description: `${description}. Waiting for confirmation...`,
    });

    try {
      const receipt = await tx.wait();
      if (!receipt) throw new Error("Transaction failed");

      const txHash = receipt.hash;
      const message = `${description} successful! View on Explorer: ${SEPOLIA_EXPLORER}/tx/${txHash}`;

      toast({
        title: "Transaction Confirmed",
        description: message,
      });

      return receipt;
    } catch (error) {
      console.error("Transaction failed:", error);
      toast({
        variant: "destructive",
        title: "Transaction Failed",
        description: "The transaction was not successful. Please try again.",
      });
      throw error;
    }
  };

  async function initializeWeb3() {
    if (!window.ethereum) {
      setIsInitialized(true);
      return;
    }

    try {
      const networkSwitched = await checkAndSwitchNetwork();
      if (!networkSwitched) {
        toast({
          variant: "destructive",
          title: "Network Error",
          description: "Please switch to Sepolia testnet in your wallet",
        });
        setIsInitialized(true);
        return;
      }

      // Create provider
      const provider = new ethers.BrowserProvider(window.ethereum);
      setProvider(provider);

      // Get accounts
      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });

      if (accounts.length > 0) {
        const address = accounts[0];
        setAddress(address);

        try {
          const signer = await provider.getSigner();
          setSigner(signer);

          const contract = new StoryNFT(STORY_NFT_ADDRESS, signer);
          setStoryContract(contract);

          console.log("Web3 initialized with address:", address);
        } catch (error) {
          console.error("Failed to get signer or setup contract:", error);
          toast({
            variant: "destructive",
            title: "Web3 Error",
            description: "Failed to initialize Web3 connection",
          });
        }
      }
    } catch (e) {
      console.error("Failed to initialize web3:", e);
      toast({
        variant: "destructive",
        title: "Initialization Error",
        description: "Failed to initialize Web3 connection",
      });
    }
    setIsInitialized(true);
  }

  useEffect(() => {
    initializeWeb3();

    if (window.ethereum) {
      window.ethereum.on("accountsChanged", async (accounts: string[]) => {
        if (accounts.length > 0) {
          const address = accounts[0];
          setAddress(address);
          if (provider) {
            try {
              const signer = await provider.getSigner();
              setSigner(signer);
              const contract = new StoryNFT(STORY_NFT_ADDRESS, signer);
              setStoryContract(contract);
            } catch (error) {
              console.error("Failed to get signer after account change:", error);
            }
          }
        } else {
          setAddress(null);
          setSigner(null);
          setStoryContract(null);
        }
      });

      window.ethereum.on("chainChanged", () => {
        window.location.reload();
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners();
      }
    };
  }, []);

  async function connect() {
    if (!window.ethereum) {
      toast({
        variant: "destructive",
        title: "Wallet Error",
        description: "Please install MetaMask to use this app",
      });
      return;
    }

    try {
      const networkSwitched = await checkAndSwitchNetwork();
      if (!networkSwitched) {
        toast({
          variant: "destructive",
          title: "Network Error",
          description: "Please switch to Sepolia testnet in your wallet",
        });
        return;
      }

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts.length > 0) {
        const currentAddress = accounts[0];
        setAddress(currentAddress);

        if (provider) {
          try {
            const signer = await provider.getSigner();
            setSigner(signer);

            const contract = new StoryNFT(STORY_NFT_ADDRESS, signer);
            setStoryContract(contract);

            console.log("Connected with address:", currentAddress);
            toast({
              title: "Connected",
              description: "Successfully connected to wallet",
            });
          } catch (error) {
            console.error("Failed to setup Web3 after connection:", error);
            toast({
              variant: "destructive",
              title: "Connection Error", 
              description: "Failed to initialize Web3 connection",
            });
          }
        }
      }
    } catch (e: any) {
      console.error("Connection error:", e);
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: e.message || "Failed to connect to wallet",
      });
    }
  }

  async function disconnect() {
    setAddress(null);
    setSigner(null);
    setStoryContract(null);
  }

  return {
    address,
    isInitialized,
    connect,
    disconnect,
    signer,
    provider,
    storyContract,
    handleTransaction,
  };
}
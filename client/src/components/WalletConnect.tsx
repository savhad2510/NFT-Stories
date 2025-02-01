import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWeb3 } from "@/hooks/use-web3";
import { Book, Wand2, Binary, Sparkles } from "lucide-react";

export function WalletConnect() {
  const { connect } = useWeb3();

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-b from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
            Dynamic NFT Storytelling
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Create evolving narratives powered by AI and secured by ERC-7007 on Ethereum Network
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card className="border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[10px_10px_0_0_rgba(0,0,0,1)] transition-all">
            <CardHeader className="border-b-4 border-black bg-purple-100">
              <CardTitle className="flex items-center gap-2">
                <Book className="h-6 w-6" />
                Interactive Stories
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p>Create unique story NFTs that evolve through AI-generated narratives and user interactions.</p>
            </CardContent>
          </Card>

          <Card className="border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[10px_10px_0_0_rgba(0,0,0,1)] transition-all">
            <CardHeader className="border-b-4 border-black bg-purple-100">
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="h-6 w-6" />
                AI-Powered
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p>Leverage advanced AI to generate compelling story segments that adapt to your choices.</p>
            </CardContent>
          </Card>

          <Card className="border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[10px_10px_0_0_rgba(0,0,0,1)] transition-all">
            <CardHeader className="border-b-4 border-black bg-purple-100">
              <CardTitle className="flex items-center gap-2">
                <Binary className="h-6 w-6" />
                ERC-7007 Standard
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p>Built on the innovative ERC-7007 protocol for verifiable on-chain AI-generated content.</p>
            </CardContent>
          </Card>

          <Card className="border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[10px_10px_0_0_rgba(0,0,0,1)] transition-all">
            <CardHeader className="border-b-4 border-black bg-purple-100">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-6 w-6" />
                Ethereum Network
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p>Deployed on Sepolia testnet for secure and reliable story evolution.</p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[10px_10px_0_0_rgba(0,0,0,1)] transition-all">
          <CardHeader className="border-b-4 border-black bg-purple-100">
            <CardTitle className="text-center">Start Your Story</CardTitle>
          </CardHeader>
          <CardContent className="text-center pt-6">
            <p className="mb-6">Connect your wallet to begin creating evolving story NFTs</p>
            <Button
              onClick={connect}
              className="bg-[#94fb1f] text-black font-bold hover:bg-[#85e619] border-2 border-black px-8"
            >
              Connect to Ethereum Network
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
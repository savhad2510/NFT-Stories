import { StoryCard } from "@/components/StoryCard";
import { StoryGenerator } from "@/components/StoryGenerator";
import { WalletConnect } from "@/components/WalletConnect";
import { useWeb3 } from "@/hooks/use-web3";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

export default function Home() {
  const { address, isInitialized } = useWeb3();
  const { data: stories, isLoading } = useQuery({
    queryKey: ["/api/stories"],
    enabled: !!address,
  });

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-500">Initializing wallet...</p>
        </div>
      </div>
    );
  }

  if (!address) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 via-purple-50 to-pink-50 p-6">
        <WalletConnect />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-purple-50 to-pink-50 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center pt-16 pb-12">
          <div className="inline-block bg-[#94fb1f] p-6 border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] transform hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[10px_10px_0_0_rgba(0,0,0,1)] transition-all rotate-2">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-black">
              NFT STORIES
            </h1>
          </div>
        </div>

        <div className="max-w-3xl mx-auto mb-16">
          <StoryGenerator />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {stories?.map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
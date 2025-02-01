import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Story } from "@db/schema";
import { useWeb3 } from "@/hooks/use-web3";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

type StoryCardProps = {
  story: Story;
};

export function StoryCard({ story }: StoryCardProps) {
  const { address, storyContract, signer } = useWeb3();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const evolutionMutation = useMutation({
    mutationFn: async () => {
      if (!storyContract || !signer) {
        throw new Error("Please connect your wallet");
      }

      // First evolve the story through the AI
      const res = await fetch(`/api/stories/${story.id}/evolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet: address }),
        credentials: "include",
      });

      if (!res.ok) throw new Error(await res.text());
      const updatedStory = await res.json();

      // Then update it on the blockchain
      try {
        await storyContract.evolveStory(
          story.tokenId,
          updatedStory.currentChapter,
          signer
        );
        return updatedStory;
      } catch (error) {
        console.error("NFT evolution failed:", error);
        throw new Error("Failed to evolve NFT");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stories"] });
      toast({
        title: "Story evolved!",
        description: "New chapter has been added to your story NFT.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  });

  return (
    <Card className="border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[10px_10px_0_0_rgba(0,0,0,1)] transition-all h-full flex flex-col">
      <CardHeader className="border-b-4 border-black bg-purple-100">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-black truncate">{story.title}</h3>
          <span className="px-3 py-1 bg-[#94fb1f] text-black font-bold border-2 border-black rounded-full flex-shrink-0 ml-2">
            #{story.tokenId}
          </span>
        </div>
      </CardHeader>
      <CardContent className="pt-6 flex-grow flex flex-col">
        <p className="mb-6 font-bold flex-grow">{story.currentChapter}</p>
        <div className="flex justify-between items-center gap-4 mt-auto pt-4 border-t-2 border-black">
          <span className="font-mono text-sm truncate">
            Owner: {story.owner.slice(0, 6)}...{story.owner.slice(-4)}
          </span>
          {story.owner.toLowerCase() === address?.toLowerCase() && (
            <Button
              onClick={() => evolutionMutation.mutate()}
              disabled={evolutionMutation.isPending}
              className="bg-[#94fb1f] text-black font-bold hover:bg-[#85e619] border-2 border-black whitespace-nowrap"
            >
              {evolutionMutation.isPending ? "Evolving..." : "Evolve Story"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
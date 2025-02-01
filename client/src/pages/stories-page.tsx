import { StoryGenerator } from "@/components/StoryGenerator";
import { StoryCard } from "@/components/StoryCard";
import { useQuery } from "@tanstack/react-query";
import { Story } from "@db/schema";
import { useWeb3 } from "@/hooks/use-web3";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function StoriesPage() {
  const { address } = useWeb3();
  const [, setLocation] = useLocation();

  // If not connected, redirect to home
  if (!address) {
    setLocation("/");
    return null;
  }

  const { data: stories, isLoading, error } = useQuery<Story[]>({
    queryKey: ["/api/stories"],
    queryFn: async () => {
      const response = await fetch("/api/stories", {
        credentials: "include",
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Failed to fetch stories:", errorText);
        throw new Error(errorText || "Failed to fetch stories");
      }
      return response.json();
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-purple-50 to-pink-50">
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
            Your NFT Stories
          </h1>
          <Button
            onClick={() => setLocation("/")}
            variant="outline"
            className="border-2 border-black"
          >
            Back to Home
          </Button>
        </div>

        <div className="mb-12">
          <StoryGenerator />
        </div>

        <h2 className="text-2xl font-bold mb-6">All Stories</h2>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mb-4" />
            <p className="text-gray-500">Loading stories...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">Failed to load stories</p>
            <Button 
              onClick={() => window.location.reload()}
              variant="outline"
              className="border-2 border-black"
            >
              Retry
            </Button>
          </div>
        ) : !stories?.length ? (
          <p className="text-center py-12 text-gray-500">
            No stories found. Create your first one!
          </p>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {stories.map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
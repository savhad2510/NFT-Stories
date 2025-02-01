
import { useEffect, useState } from 'react';
import { useWeb3 } from "@/hooks/use-web3";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ethers } from "ethers";
import { Loader2, Store } from "lucide-react";

interface Listing {
  tokenId: number;
  price: string;
  seller: string;
}

export default function MarketplacePage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const { marketplaceContract, address } = useWeb3();
  const { toast } = useToast();

  useEffect(() => {
    loadListings();
  }, [marketplaceContract]);

  const loadListings = async () => {
    if (!marketplaceContract) return;
    try {
      const activeListings = await marketplaceContract.getActiveListings();
      setListings(activeListings);
    } catch (error) {
      console.error("Failed to load listings:", error);
    } finally {
      setLoading(false);
    }
  };

  const buyStory = async (tokenId: number, price: string) => {
    if (!marketplaceContract || !address) return;
    try {
      const tx = await marketplaceContract.buyStory(tokenId, {
        value: ethers.utils.parseEther(price)
      });
      await tx.wait();
      toast({
        title: "Success",
        description: "Story purchased successfully!",
      });
      loadListings();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-purple-50 to-pink-50">
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center gap-4 mb-8">
          <Store className="h-8 w-8 text-purple-600" />
          <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
            Story Marketplace
          </h1>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : !listings.length ? (
          <p className="text-center py-12 text-gray-500">No stories listed for sale</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => (
              <Card key={listing.tokenId} className="border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
                <CardHeader className="border-b-4 border-black bg-gradient-to-r from-purple-100 to-pink-100">
                  <CardTitle>Story #{listing.tokenId}</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="font-bold">Price</span>
                      <Badge className="bg-[#94fb1f] text-black border-2 border-black">
                        {listing.price} ETH
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-bold">Seller</span>
                      <span className="text-sm">
                        {listing.seller.slice(0, 6)}...{listing.seller.slice(-4)}
                      </span>
                    </div>
                    <Button
                      onClick={() => buyStory(listing.tokenId, listing.price)}
                      className="w-full bg-[#94fb1f] text-black border-2 border-black hover:bg-[#85e619]"
                    >
                      Buy Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


import { useState, useEffect } from 'react';
import { useWeb3 } from "@/hooks/use-web3";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Trophy, Gift, Clock } from "lucide-react";

export default function RewardsPage() {
  const [balance, setBalance] = useState("0");
  const [canClaim, setCanClaim] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const { rewardsContract, address } = useWeb3();
  const { toast } = useToast();

  useEffect(() => {
    if (rewardsContract && address) {
      loadBalanceAndStatus();
    }
  }, [rewardsContract, address]);

  const loadBalanceAndStatus = async () => {
    if (!rewardsContract || !address) return;
    try {
      const bal = await rewardsContract.balanceOf(address);
      setBalance(bal.toString());
      
      const lastClaim = await rewardsContract.lastRewardTimestamp(address);
      const cooldown = await rewardsContract.REWARD_COOLDOWN();
      const nextClaimTime = lastClaim.add(cooldown).toNumber() * 1000;
      setCanClaim(Date.now() >= nextClaimTime);
      setTimeLeft(Math.max(0, nextClaimTime - Date.now()));
    } catch (error) {
      console.error("Failed to load rewards data:", error);
    }
  };

  const claimReward = async () => {
    if (!rewardsContract) return;
    try {
      const tx = await rewardsContract.claimReward();
      await tx.wait();
      toast({
        title: "Success",
        description: "Rewards claimed successfully!",
      });
      loadBalanceAndStatus();
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
          <Trophy className="h-8 w-8 text-purple-600" />
          <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
            Story Rewards
          </h1>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <Card className="border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
            <CardHeader className="border-b-4 border-black bg-gradient-to-r from-purple-100 to-pink-100">
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5" />
                Your Balance
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-4xl font-bold mb-2">{balance}</p>
                <Badge className="bg-[#94fb1f] text-black border-2 border-black">
                  SREWARD Tokens
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
            <CardHeader className="border-b-4 border-black bg-gradient-to-r from-purple-100 to-pink-100">
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Daily Reward
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {canClaim ? (
                <Button
                  onClick={claimReward}
                  className="w-full bg-[#94fb1f] text-black border-2 border-black hover:bg-[#85e619]"
                >
                  Claim 100 SREWARD
                </Button>
              ) : (
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-2">Next claim available in:</p>
                  <p className="font-bold">{Math.ceil(timeLeft / (1000 * 60 * 60))} hours</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

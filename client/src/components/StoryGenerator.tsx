import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useWeb3 } from "@/hooks/use-web3";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  prompt: z.string().min(10, "Prompt must be at least 10 characters"),
});

export function StoryGenerator() {
  const { toast } = useToast();
  const { address, storyContract, signer, handleTransaction } = useWeb3();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      prompt: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      if (!storyContract || !signer) {
        throw new Error("Please connect your wallet first");
      }

      const res = await fetch("/api/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          wallet: address?.toLowerCase(),
        }),
        credentials: "include",
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Failed to create story");
      }

      const story = await res.json();

      try {
        const tx = await storyContract.mint(values.title, story.currentChapter, signer);
        const receipt = await handleTransaction(tx, "Minting story NFT");
        const tokenId = receipt.events?.find(e => e.event === 'StoryMinted')?.args?.tokenId.toString();

        const updateRes = await fetch(`/api/stories/${story.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tokenId }),
          credentials: "include",
        });

        if (!updateRes.ok) {
          throw new Error("Failed to update story with token ID");
        }

        return { ...story, tokenId };
      } catch (error) {
        console.error("NFT minting failed:", error);
        throw new Error("Failed to mint NFT");
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/stories"] });
      form.reset();
      toast({
        title: "Success!",
        description: "Your story NFT has been created! Check the transaction details in your wallet.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!address) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please connect your wallet first",
      });
      return;
    }

    try {
      await mutation.mutateAsync(values);
    } catch (e) {
      console.error("Story generation failed:", e);
    }
  }

  return (
    <Card className="border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[10px_10px_0_0_rgba(0,0,0,1)] transition-all">
      <CardHeader className="border-b-4 border-black bg-purple-100">
        <CardTitle className="text-2xl font-black">Create New Story NFT</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-bold">Story Title</FormLabel>
                  <FormControl>
                    <Input {...field} className="border-2 border-black" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="prompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-bold">Story Prompt</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      className="min-h-[120px] border-2 border-black"
                      placeholder="Describe the initial setting and theme of your story..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              disabled={mutation.isPending}
              className="w-full bg-[#94fb1f] text-black font-bold hover:bg-[#85e619] border-2 border-black"
            >
              {mutation.isPending ? "Creating NFT..." : "Create Story NFT"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
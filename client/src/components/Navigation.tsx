import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/use-user";
import { useWeb3 } from "@/hooks/use-web3";

export default function Navigation() {
  const { logout } = useUser();
  const { address, disconnect } = useWeb3();

  return (
    <nav className="border-b-4 border-black bg-white">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <div className="font-black text-2xl">NFT STORIES</div>
        <div className="flex items-center gap-4">
          {address && (
            <span className="font-mono">
              {address.slice(0, 6)}...{address.slice(-4)}
            </span>
          )}
          <Button
            onClick={async () => {
              await disconnect();
              await logout();
            }}
            variant="outline"
            className="border-2 border-black"
          >
            Disconnect
          </Button>
        </div>
      </div>
    </nav>
  );
}

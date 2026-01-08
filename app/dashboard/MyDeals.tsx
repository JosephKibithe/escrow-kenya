import { 
  getContract, 
  prepareContractCall, 
  prepareEvent, 
} from "thirdweb";
import { useActiveAccount, useSendTransaction, useContractEvents } from "thirdweb/react";
import { client } from "@/app/client"; 
import { polygon } from "thirdweb/chains"; 

const ESCROW_CONTRACT_ADDRESS = "0x9e2bb48da7C201a379C838D9FACfB280819Ca104"; 

// 1. Adjusted Block: Lowered by ~5000 blocks to ensure we catch the event
// If this still fails, try setting it to 'undefined' temporarily to scan further back
const DEPLOYMENT_BLOCK = 80000000n; 

export function MyDeals() {
  const account = useActiveAccount();
  const { mutate: sendTransaction } = useSendTransaction();

  const contract = getContract({
    client,
    chain: polygon,
    address: ESCROW_CONTRACT_ADDRESS,
  });

  const { data: events, isLoading, error } = useContractEvents({
    contract,
    events: [
      prepareEvent({
        signature: "event Deposited(uint256 indexed dealId, address indexed buyer, address indexed seller, uint256 amount, uint256 timeoutInSeconds)",
      }),
    ],
    fromBlock: DEPLOYMENT_BLOCK,
    queryOptions: {
        refetchOnWindowFocus: false,
        staleTime: 60000, 
    }
  });

  // 🔍 DEBUGGING LOGS (Check Console F12)
  if (events) {
    console.log("✅ Raw Events Found on Blockchain:", events);
    console.log("👤 Current Wallet:", account?.address);
  }
  if (error) console.error("❌ Event Fetch Error:", error);

  // Client-side filtering with Safety Checks
  const myDeals = events?.filter(e => {
    if (!account) return false;
    const buyer = e.args.buyer.toLowerCase();
    const seller = e.args.seller.toLowerCase();
    const user = account.address.toLowerCase();
    return buyer === user || seller === user;
  }).reverse() || [];

  const handleRelease = (dealId: bigint) => {
    if(!confirm("Release funds to Seller? This cannot be undone.")) return;
    const tx = prepareContractCall({
      contract,
      method: "function releaseFunds(uint256 _dealId)",
      params: [dealId],
    });
    sendTransaction(tx);
  };

  if (isLoading) return <div className="text-center p-4 text-gray-500">Scanning blockchain for deals...</div>;

  return (
    <div className="mt-8">
      <h3 className="text-lg font-bold mb-4 text-gray-800">Your Active Promises</h3>
      
      {myDeals.length === 0 ? (
        <div className="text-center bg-white p-6 rounded-lg border border-gray-100">
            <p className="text-gray-500 mb-2">No active deals found.</p>
            <p className="text-xs text-gray-400">
                (Wallet: {account?.address ? `${account.address.slice(0,6)}...${account.address.slice(-4)}` : "Not Connected"})
            </p>
            <p className="text-xs text-blue-400 mt-2 cursor-pointer" onClick={() => window.location.reload()}>
                Click to Refresh
            </p>
        </div>
      ) : (
        <div className="space-y-4">
          {myDeals.map((event, i) => {
            const amount = Number(event.args.amount) / 1_000_000; 
            const dealId = event.args.dealId;
            const isBuyer = account && event.args.buyer.toLowerCase() === account.address.toLowerCase();

            return (
              <div key={i} className="bg-white border border-gray-200 p-4 rounded-xl flex justify-between items-center shadow-sm">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded font-bold ${isBuyer ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}`}>
                        {isBuyer ? "YOU BUY" : "YOU SELL"}
                    </span>
                    <span className="font-bold text-gray-800">Deal #{dealId.toString()}</span>
                  </div>
                  <p className="text-sm text-gray-500">Locked: <span className="text-gray-900 font-bold">{amount} USDT</span></p>
                </div>
                
                {isBuyer ? (
                  <button 
                    onClick={() => handleRelease(dealId)}
                    className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-2 px-3 rounded shadow-sm transition"
                  >
                    ✅ Release
                  </button>
                ) : (
                    <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded font-medium">
                        Waiting for Release
                    </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { getContract, prepareContractCall } from "thirdweb";
import { useActiveAccount, useSendTransaction } from "thirdweb/react";
import { client } from "@/app/client"; 
import { polygon } from "thirdweb/chains"; 

const ESCROW_CONTRACT_ADDRESS = "0x9e2bb48da7C201a379C838D9FACfB280819Ca104"; 

// ⚠️ REPLACE THIS WITH YOUR NEW GRAPH STUDIO URL 👇
const GRAPH_QUERY_URL = "https://api.studio.thegraph.com/query/1722688/ahadi-escrow-v-1/v0.0.1";

export function MyDeals() {
  const account = useActiveAccount();
  const { mutate: sendTransaction } = useSendTransaction();
  
  // Local state for graph data
  const [deals, setDeals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 1. Fetch Data from The Graph
  useEffect(() => {
    if (!account) return;

    const fetchDeals = async () => {
      setIsLoading(true);
      try {
        const userAddress = account.address.toLowerCase();
        
        // GraphQL Query
        const query = `
          {
            deals(
              where: { or: [{ buyer: "${userAddress}" }, { seller: "${userAddress}" }] }
              orderBy: createdAtTimestamp
              orderDirection: desc
            ) {
              id
              amount
              buyer { id }
              seller { id }
              isCompleted
              isDisputed
            }
          }
        `;

        const response = await fetch(GRAPH_QUERY_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query }),
        });

        const json = await response.json();
        
        if (json.data && json.data.deals) {
          setDeals(json.data.deals);
        }
      } catch (error) {
        console.error("Graph Error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDeals();
    
    // Poll every 10 seconds for updates
    const interval = setInterval(fetchDeals, 10000);
    return () => clearInterval(interval);

  }, [account]);

  // 2. Handle Release Funds (Blockchain Action)
  const handleRelease = (dealId: string) => {
    if(!confirm("Release funds to Seller?")) return;
    
    const contract = getContract({
        client,
        chain: polygon,
        address: ESCROW_CONTRACT_ADDRESS,
    });

    const tx = prepareContractCall({
      contract,
      method: "function releaseFunds(uint256 _dealId)",
      params: [BigInt(dealId)],
    });
    sendTransaction(tx);
  };

  if (isLoading && deals.length === 0) return <div className="text-center p-4 text-gray-500 animate-pulse">Loading data from The Graph...</div>;

  return (
    <div className="mt-8">
      <h3 className="text-lg font-bold mb-4 text-gray-800">Your Active Promises</h3>
      
      {deals.length === 0 ? (
        <div className="text-center bg-white p-6 rounded-lg border border-gray-100">
            <p className="text-gray-500 mb-2">No active deals found.</p>
            <p className="text-xs text-gray-400">
                (Wallet: {account?.address.slice(0,6)}...{account?.address.slice(-4)})
            </p>
        </div>
      ) : (
        <div className="space-y-4">
          {deals.map((deal: any) => {
            const amount = Number(deal.amount) / 1_000_000; 
            const isBuyer = account && deal.buyer.id === account.address.toLowerCase();
            const statusColor = deal.isCompleted ? "bg-gray-100 text-gray-500" : "bg-white border-gray-200";

            return (
              <div key={deal.id} className={`${statusColor} border p-4 rounded-xl flex justify-between items-center shadow-sm`}>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded font-bold ${isBuyer ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}`}>
                        {isBuyer ? "YOU BUY" : "YOU SELL"}
                    </span>
                    <span className="font-bold text-gray-800">Deal #{deal.id}</span>
                    {deal.isCompleted && <span className="text-xs bg-gray-200 px-2 rounded">COMPLETED</span>}
                  </div>
                  <p className="text-sm text-gray-500">Locked: <span className="text-gray-900 font-bold">{amount} USDT</span></p>
                </div>
                
                {!deal.isCompleted && isBuyer ? (
                  <button 
                    onClick={() => handleRelease(deal.id)}
                    className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-2 px-3 rounded shadow-sm transition"
                  >
                    ✅ Release
                  </button>
                ) : !deal.isCompleted ? (
                    <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded font-medium">
                        Waiting...
                    </span>
                ) : (
                    <span className="text-xl">🏁</span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

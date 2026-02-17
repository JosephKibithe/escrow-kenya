"use client";

import { useState, useEffect } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { ESCROW_CONTRACT_ADDRESS, ESCROW_ABI } from "@/constants";
import { CheckCheck, Flag } from 'lucide-react';

// ⚠️ REPLACE THIS WITH YOUR GRAPH STUDIO URL
const GRAPH_QUERY_URL = "https://api.studio.thegraph.com/query/1722688/ahadi-escrow-v-1/version/latest";

interface Deal {
  id: string;
  amount: string;
  buyer: { id: string };
  seller: { id: string };
  isCompleted: boolean;
  isDisputed: boolean;
}

export function MyDeals() {
  const { address } = useAccount();
  
  // Wagmi Write Hooks
  const { data: hash, writeContractAsync } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash });

  const [deals, setDeals] = useState<Deal[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 1. Fetch Data from The Graph
  useEffect(() => {
    if (!address) return;

    const fetchDeals = async () => {
      setIsLoading(true);
      try {
        const userAddress = address.toLowerCase();
        
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
        // Log error without exposing details to users in production
        if (process.env.NODE_ENV === 'development') {
          console.error("Graph Error:", error);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchDeals();
    const interval = setInterval(fetchDeals, 10000);
    return () => clearInterval(interval);

  }, [address]);

  // 2. Handle Release Funds
  const handleRelease = async (dealId: string) => {
    if(!confirm("Release funds to Seller?")) return;
    
    try {
      await writeContractAsync({
        address: ESCROW_CONTRACT_ADDRESS,
        abi: ESCROW_ABI,
        functionName: 'releaseFunds',
        args: [BigInt(dealId)]
      });
      // The UI will update automatically on next poll after block confirmation
    } catch (e) {
      console.error(e);
      alert("Failed to release funds");
    }
  };

  if (isLoading && deals.length === 0) return <div className="text-center p-4 text-yellow-500/50 animate-pulse">Loading data...</div>;

  return (
    <div className="mt-8">
      <h3 className="text-lg font-bold mb-4 text-white">Your Active Promises</h3>
      
      {deals.length === 0 ? (
        <div className="text-center liquid-glass p-6 rounded-lg">
            <p className="text-gray-500 mb-2">No active deals found.</p>
            <p className="text-xs text-gray-600">
                (Wallet: {address?.slice(0,6)}...{address?.slice(-4)})
            </p>
        </div>
      ) : (
        <div className="space-y-4">
          {deals.map((deal) => {
            const amount = Number(deal.amount) / 1_000_000; 
            const isBuyer = address && deal.buyer.id === address.toLowerCase();

            return (
              <div key={deal.id} className={`${deal.isCompleted ? 'liquid-glass opacity-60' : 'liquid-glass-yellow'} p-4 rounded-xl flex justify-between items-center`}>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded font-bold ${isBuyer ? "bg-yellow-500/15 text-yellow-400 border border-yellow-500/20" : "bg-white/5 text-gray-300 border border-white/10"}`}>
                        {isBuyer ? "YOU BUY" : "YOU SELL"}
                    </span>
                    <span className="font-bold text-white">Deal #{deal.id}</span>
                    {deal.isCompleted && <span className="text-xs bg-white/10 text-gray-400 px-2 rounded">COMPLETED</span>}
                  </div>
                  <p className="text-sm text-gray-500">Locked: <span className="text-yellow-400 font-bold">{amount} USDT</span></p>
                </div>
                


                {!deal.isCompleted && isBuyer ? (
                  <button 
                    onClick={() => handleRelease(deal.id)}
                    disabled={isConfirming}
                    className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-black text-xs font-bold py-2 px-3 rounded transition-all active:scale-95"
                  >
                    {isConfirming ? "Processing..." : <span className="flex items-center gap-1"><CheckCheck className="w-3 h-3" /> Release</span>}
                  </button>
                ) : !deal.isCompleted ? (
                    <span className="text-xs liquid-glass-yellow px-2 py-1 rounded font-medium text-yellow-400">
                        Waiting...
                    </span>
                ) : (
                    <Flag className="w-5 h-5 text-gray-500" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

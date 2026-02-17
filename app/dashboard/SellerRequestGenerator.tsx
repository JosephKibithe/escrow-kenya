"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { Link } from 'lucide-react';
import { useUsdtKesRate } from "@/app/hooks/useCoingeckoPrice";

// --------------------------------------------------------------------------------------
// TYPES
// --------------------------------------------------------------------------------------
interface SellerRequestGeneratorProps {
  account?: {
    address?: string;
  };
}

export function SellerRequestGenerator({ account }: SellerRequestGeneratorProps) {
  // Allow using passed 'account' (Thirdweb) OR internal hook (Wagmi)
  const { address: wagmiAddress, isConnected: wagmiConnected } = useAccount();

  const address = account?.address || wagmiAddress;
  const isConnected = !!address || wagmiConnected; // If we have an address, we are connected enough
  
  const [amount, setAmount] = useState("");
  const [item, setItem] = useState("");
  const [description, setDescription] = useState("");
  const [days, setDays] = useState("3");
  const [generatedLink, setGeneratedLink] = useState("");
  const { toKes, isLoading: rateLoading } = useUsdtKesRate();

  const generateLink = () => {
    if (!isConnected || !address) return alert("Connect wallet first!");
    
    // Calculate seconds
    const timeoutSeconds = Number(days) * 24 * 60 * 60;

    // Build URL
    const baseUrl = window.location.origin + "/dashboard";
    const params = new URLSearchParams({
      tab: "buy", // Force buyer view
      seller: address,
      price: amount,
      item: item,
      desc: description,
      timeout: timeoutSeconds.toString()
    });

    setGeneratedLink(`${baseUrl}?${params.toString()}`);
  };

  return (
    <div className="liquid-glass p-6 rounded-xl relative overflow-hidden shimmer-overlay">
      <h3 className="text-xl font-bold mb-4 text-yellow-400">Create Payment Link</h3>
      <p className="text-sm text-gray-500 mb-6">
        Generate a link to send to your buyer via WhatsApp/SMS.
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Item Name</label>
          <input 
            type="text" 
            placeholder="e.g. Toyota Vitz 2017"
            className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-gray-600 focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/30 outline-none transition-all"
            onChange={(e) => setItem(e.target.value)}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Price (USDT)</label>
          <input 
            type="number" 
            placeholder="5000"
            className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-gray-600 focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/30 outline-none transition-all"
            onChange={(e) => setAmount(e.target.value)}
          />
          {amount && Number(amount) > 0 && (
            <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1">
              ≈{" "}
              {rateLoading ? (
                <span className="animate-pulse">loading rate…</span>
              ) : toKes(Number(amount)) ? (
                <span className="text-yellow-400 font-semibold">KES {toKes(Number(amount))}</span>
              ) : (
                <span className="text-gray-600">rate unavailable</span>
              )}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Description / Notes</label>
          <textarea 
            placeholder="Condition, meeting place, included accessories..."
            className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-gray-600 focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/30 outline-none h-24 transition-all"
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Offer Expires In</label>
          <select 
            className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white"
            value={days}
            onChange={(e) => setDays(e.target.value)}
          >
            <option value="1" className="bg-[#18181B]">1 Day (Quick Sale)</option>
            <option value="3" className="bg-[#18181B]">3 Days (Standard)</option>
            <option value="7" className="bg-[#18181B]">7 Days (Shipping)</option>
            <option value="30" className="bg-[#18181B]">30 Days (Long Term)</option>
          </select>
        </div>



        <button 
          onClick={generateLink}
          className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 text-black font-bold py-3 rounded-lg hover:from-yellow-400 hover:to-amber-400 transition-all glow-yellow active:scale-[0.98]"
        >
          <div className="flex items-center justify-center gap-2">
            <Link className="w-4 h-4" /> Generate Link
          </div>
        </button>

        {generatedLink && (
          <div className="mt-4 p-4 liquid-glass-yellow rounded-lg break-all">
            <p className="text-xs text-yellow-300 font-mono mb-2">{generatedLink}</p>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(generatedLink);
                alert("Link Copied!");
              }}
              className="text-xs liquid-glass-button px-3 py-1 rounded text-yellow-400 font-bold"
            >
              Copy to Clipboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
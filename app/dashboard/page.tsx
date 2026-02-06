"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { 
  useAccount, 
  useWriteContract, 
  usePublicClient,
} from "wagmi";
import { parseUnits } from "viem";
import { ESCROW_CONTRACT_ADDRESS, USDT_TOKEN_ADDRESS, ERC20_ABI, ESCROW_ABI } from "@/constants";

// Components
import { SellerRequestGenerator } from "./SellerRequestGenerator";
import { MyDeals } from "./MyDeals";
import { AdminStats } from "./AdminStats";

const ADMIN_WALLET = "0x..."; // Put your admin wallet address here

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">Loading AHADI...</div>}>
      <DashboardContent />
    </Suspense>
  );
}

function DashboardContent() {
  const { address, isConnected } = useAccount();
  const searchParams = useSearchParams();
  const publicClient = usePublicClient();
  
  const { writeContractAsync } = useWriteContract();
  
  const [viewMode, setViewMode] = useState<"seller" | "buyer">("seller");
  const [statusMsg, setStatusMsg] = useState("");
  const [success, setSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Params from URL
  const paramSeller = searchParams.get("seller");
  const paramPrice = searchParams.get("price");
  const paramItem = searchParams.get("item");
  const paramDesc = searchParams.get("desc");
  const paramTimeout = searchParams.get("timeout");

  const [formData, setFormData] = useState({
    title: "",
    price: "",
    description: "",
    sellerAddress: "",
    timeout: "259200" 
  });

  useEffect(() => {
    if (paramSeller) {
      setViewMode("buyer");
      setFormData({
        title: paramItem || "",
        price: paramPrice || "",
        description: paramDesc || "",
        sellerAddress: paramSeller,
        timeout: paramTimeout || "259200"
      });
    } else {
      setViewMode("seller");
    }
  }, [paramSeller, paramPrice, paramItem, paramDesc, paramTimeout]);

  const handleLockFunds = async () => {
    if (!isConnected || !address) return alert("Please connect wallet first");
    if (!publicClient) return alert("Network not ready");

    setIsProcessing(true);
    
    try {
      const amountInUnits = parseUnits(formData.price, 6); 
      const timeoutBigInt = BigInt(Math.floor(Number(formData.timeout) || 259200));

      // 1. APPROVE USDT
      setStatusMsg("Step 1/2: Approving USDT...");
      const approveHash = await writeContractAsync({
        address: USDT_TOKEN_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [ESCROW_CONTRACT_ADDRESS, amountInUnits],
      });

      setStatusMsg("Waiting for Approval confirmation...");
      await publicClient.waitForTransactionReceipt({ hash: approveHash });

      // 2. CREATE DEAL
      setStatusMsg("Step 2/2: Locking Funds...");
      const depositHash = await writeContractAsync({
        address: ESCROW_CONTRACT_ADDRESS,
        abi: ESCROW_ABI,
        functionName: 'createDeal',
        args: [
            formData.sellerAddress as `0x${string}`, 
            amountInUnits, 
            timeoutBigInt
        ],
      });

      setStatusMsg("Confirming Deposit...");
      await publicClient.waitForTransactionReceipt({ hash: depositHash });

      setSuccess(true);

    } catch (error: any) {
      console.error("Full Error Object:", error); // Check Console F12 for details
      console.error("Full Error Object:", error);
      
      let msg = "Transaction failed";
      if (typeof error === 'string') {
        msg = error;
      } else if (error instanceof Error) {
        // Wagmi/Viem errors often have a shortMessage
        msg = (error as any).shortMessage || error.message;
      } else if (typeof error === 'object' && error !== null) {
        // Try to stringify, fallback to generic message if circular
        try {
          msg = JSON.stringify(error, null, 2);
          if (msg === '{}') msg = "Unknown error (empty object)";
        } catch {
          msg = "Unknown error (circular object)";
        }
      }

      alert(`Transaction Failed: ${msg}`);
    } finally {
      setIsProcessing(false);
      setStatusMsg("");
    }
  };

  const clearUrlAndReset = () => {
    setSuccess(false);
    setViewMode("seller");
    window.history.replaceState(null, '', '/dashboard');
  };

  // 🎨 STYLES: Common styles to ensure visibility
  const inputStyle = "w-full p-3 border-2 border-gray-300 rounded-lg mb-4 bg-white text-gray-900 focus:border-blue-500 focus:outline-none font-medium";
  const labelStyle = "block text-sm font-bold text-gray-800 mb-1";

  return (
    <div className="pb-10">
      
      {/* BUYER MODE */}
      {viewMode === "buyer" && !success && (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-blue-100 relative animate-in fade-in zoom-in-95 duration-300">
            <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                    <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                        INCOMING INVOICE
                    </span>
                </div>
                
                {/* Visual Fix: Ensure Title is Dark Black */}
                <h2 className="text-3xl font-extrabold text-slate-900 mb-1">{formData.title}</h2>
                <p className="text-gray-600 text-sm mb-4">
                    Seller: <span className="font-mono bg-gray-200 px-2 py-1 rounded text-black font-bold">{formData.sellerAddress.slice(0,6)}...{formData.sellerAddress.slice(-4)}</span>
                </p>
                
                {formData.description && (
                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mb-4 text-sm text-slate-700">
                        <span className="font-bold block text-yellow-900 mb-1">Item Details:</span>
                        {formData.description}
                    </div>
                )}
                
                <div className="bg-blue-50 p-6 rounded-xl text-center border-2 border-blue-200 border-dashed">
                    <p className="text-gray-600 text-sm mb-1 font-bold">Total Due</p>
                    <p className="text-5xl font-extrabold text-blue-700">
                        {Number(formData.price).toLocaleString()} <span className="text-xl text-blue-500">USDT</span>
                    </p>
                </div>
            </div>

            <button 
            onClick={handleLockFunds} 
            disabled={isProcessing}
            className={`w-full font-bold py-4 rounded-lg transition shadow-lg text-lg text-white
                ${isProcessing ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700 shadow-green-200"}`}
            >
            {isProcessing ? (statusMsg || "Processing...") : "✅ Accept & Lock Funds"}
            </button>
        </div>
      )}

      {/* SELLER MODE */}
      {viewMode === "seller" && !success && (
         <SellerRequestGenerator /> 
      )}

      {/* SUCCESS SCREEN */}
      {success && (
        <div className="bg-white p-8 rounded-xl shadow-lg text-center border-2 border-green-100 animate-in fade-in zoom-in-95">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-5xl">✅</span>
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Funds Locked!</h2>
            <p className="text-gray-600 mb-8 text-lg">
            We are holding <strong>{formData.price} USDT</strong> safely on Polygon.
            Notify the seller to deliver the item.
            </p>
            <button 
            onClick={clearUrlAndReset}
            className="w-full border-2 border-gray-300 text-gray-700 font-bold py-3 rounded-lg hover:bg-gray-100 transition"
            >
            Back to Dashboard
            </button>
        </div>
      )}

      <hr className="my-8 border-gray-200" />
      <MyDeals />
      
      {address === ADMIN_WALLET && <AdminStats />}
    </div>
  );
}
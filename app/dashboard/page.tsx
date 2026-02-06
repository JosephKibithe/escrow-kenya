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

const ADMIN_WALLET = "0x9e2bb48da7C201a379C838D9FACfB280819Ca104"; // Your admin wallet address

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500 animate-pulse">Loading AHADI...</div>}>
      <DashboardContent />
    </Suspense>
  );
}

function DashboardContent() {
  // 1. Hook Initialization
  const { address, isConnected } = useAccount();
  const searchParams = useSearchParams();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();
  
  // 2. State Management
  const [mounted, setMounted] = useState(false);
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

  // 3. Hydration & URL Effect
  useEffect(() => {
    setMounted(true); // Signal that client has mounted
    
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

  // 4. Secure Transaction Logic
  const handleLockFunds = async () => {
    if (!mounted) return;
    if (!isConnected || !address) return alert("Please connect wallet first");
    if (!publicClient) return alert("Network connection issue. Please refresh.");

    // Input Validation
    if (!formData.price || Number(formData.price) <= 0) return alert("Invalid price detected.");
    if (!formData.sellerAddress) return alert("Invalid seller address.");

    setIsProcessing(true);
    
    try {
      const amountInUnits = parseUnits(formData.price, 6); 
      const timeoutBigInt = BigInt(formData.timeout);

      // A. APPROVE USDT
      setStatusMsg("Step 1/2: Approving USDT...");
      const approveHash = await writeContractAsync({
        address: USDT_TOKEN_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [ESCROW_CONTRACT_ADDRESS, amountInUnits],
      });

      setStatusMsg("Waiting for Approval confirmation...");
      await publicClient.waitForTransactionReceipt({ hash: approveHash });

      // B. CREATE DEAL
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
      console.error("Transaction Error:", error);
      // Clean error messaging for user
      const msg = error?.shortMessage || error?.message || "Transaction failed. Check wallet balance.";
      alert(`Error: ${msg}`);
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

  // Prevent flash of unauthenticated content
  if (!mounted) return null;

  return (
    <div className="pb-10 font-sans">
      
      {/* --- SCENARIO A: BUYER MODE (Invoice) --- */}
      {viewMode === "buyer" && !success && (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-blue-100 relative animate-in fade-in zoom-in-95 duration-300 mx-auto w-full max-w-lg">
            <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                    <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full animate-pulse tracking-wide">
                        INCOMING INVOICE
                    </span>
                </div>
                
                <h2 className="text-3xl font-extrabold text-gray-900 mb-2 leading-tight">{formData.title}</h2>
                <div className="text-gray-500 text-sm mb-6 flex flex-wrap items-center gap-2">
                    <span>Seller:</span>
                    <span className="font-mono bg-gray-100 px-2 py-1 rounded text-gray-700 font-bold border border-gray-200">
                      {formData.sellerAddress.slice(0,6)}...{formData.sellerAddress.slice(-4)}
                    </span>
                </div>
                
                {formData.description && (
                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mb-6 text-sm text-gray-800">
                        <span className="font-bold block text-yellow-900 mb-1 uppercase text-xs tracking-wider">Item Details</span>
                        {formData.description}
                    </div>
                )}
                
                <div className="bg-blue-50 p-6 rounded-xl text-center border-2 border-blue-200 border-dashed mb-6">
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-2">Total Due</p>
                    <div className="flex justify-center items-baseline gap-1">
                      <span className="text-5xl font-extrabold text-blue-600 tracking-tight">
                          {Number(formData.price).toLocaleString()}
                      </span>
                      <span className="text-xl font-bold text-blue-400">USDT</span>
                    </div>
                </div>
            </div>

            <button 
              onClick={handleLockFunds} 
              disabled={isProcessing}
              className={`w-full font-bold py-4 px-6 rounded-xl transition-all shadow-md text-lg text-white
                  ${isProcessing 
                    ? "bg-gray-400 cursor-not-allowed" 
                    : "bg-green-600 hover:bg-green-700 active:scale-[0.98] shadow-green-200"}`}
            >
              {isProcessing ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                  {statusMsg || "Processing..."}
                </span>
              ) : "✅ Accept & Lock Funds"}
            </button>
        </div>
      )}

      {/* --- SCENARIO B: SELLER MODE (Generator) --- */}
      {viewMode === "seller" && !success && (
         <SellerRequestGenerator /> 
      )}

      {/* --- SCENARIO C: SUCCESS --- */}
      {success && (
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center border-2 border-green-100 animate-in fade-in zoom-in-95 max-w-lg mx-auto">
            <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-5xl">✅</span>
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Funds Locked!</h2>
            <p className="text-gray-500 mb-8 text-lg leading-relaxed">
              We are holding <strong>{formData.price} USDT</strong> safely on Polygon.
              Notify the seller to deliver the item.
            </p>
            <button 
              onClick={clearUrlAndReset}
              className="w-full border-2 border-gray-200 text-gray-700 font-bold py-4 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-[0.98]"
            >
              Back to Dashboard
            </button>
        </div>
      )}

      <hr className="my-10 border-gray-200" />
      
      {/* Lazy Load Heavy Components */}
      <MyDeals />
      
      {mounted && address === ADMIN_WALLET && <AdminStats />}
    </div>
  );
}
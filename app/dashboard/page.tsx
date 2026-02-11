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
    <Suspense fallback={<div className="p-8 text-center text-yellow-500/50 animate-pulse">Loading AHADI...</div>}>
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

    } catch (error: unknown) {
      // Log error without exposing details to users in production
      if (process.env.NODE_ENV === 'development') {
        console.error("Transaction Error:", error);
      }
      // Clean error messaging for user
      const msg = error instanceof Error ? error.message : "Transaction failed. Check wallet balance.";
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
        <div className="liquid-glass-yellow p-6 rounded-xl relative mx-auto w-full max-w-lg">
            <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                    <span className="bg-yellow-500/15 text-yellow-400 text-xs font-bold px-3 py-1 rounded-full animate-pulse tracking-wide border border-yellow-500/20">
                        INCOMING INVOICE
                    </span>
                </div>
                
                <h2 className="text-3xl font-extrabold text-white mb-2 leading-tight">{formData.title}</h2>
                <div className="text-gray-400 text-sm mb-6 flex flex-wrap items-center gap-2">
                    <span>Seller:</span>
                    <span className="font-mono bg-white/5 px-2 py-1 rounded text-yellow-400 font-bold border border-white/10">
                      {formData.sellerAddress.slice(0,6)}...{formData.sellerAddress.slice(-4)}
                    </span>
                </div>
                
                {formData.description && (
                    <div className="liquid-glass p-4 rounded-lg mb-6 text-sm text-gray-300">
                        <span className="font-bold block text-yellow-400 mb-1 uppercase text-xs tracking-wider">Item Details</span>
                        {formData.description}
                    </div>
                )}
                
                <div className="liquid-glass p-6 rounded-xl text-center border-2 border-yellow-500/20 border-dashed mb-6">
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-2">Total Due</p>
                    <div className="flex justify-center items-baseline gap-1">
                      <span className="text-5xl font-extrabold text-yellow-400 tracking-tight text-glow-yellow">
                          {Number(formData.price).toLocaleString()}
                      </span>
                      <span className="text-xl font-bold text-yellow-600">USDT</span>
                    </div>
                </div>
            </div>

            <button 
              onClick={handleLockFunds} 
              disabled={isProcessing}
              className={`w-full font-bold py-4 px-6 rounded-xl transition-all text-lg
                  ${isProcessing 
                    ? "bg-gray-700 cursor-not-allowed text-gray-400" 
                    : "bg-gradient-to-r from-yellow-500 to-amber-500 text-black hover:from-yellow-400 hover:to-amber-400 active:scale-[0.98] glow-yellow"}`}
            >
              {isProcessing ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-yellow-300/30 border-t-yellow-300 rounded-full animate-spin"/>
                  {statusMsg || "Processing..."}
                </span>
              ) : "🔒 Accept & Lock Funds"}
            </button>
        </div>
      )}

      {/* --- SCENARIO B: SELLER MODE (Generator) --- */}
      {viewMode === "seller" && !success && (
         <SellerRequestGenerator /> 
      )}

      {/* --- SCENARIO C: SUCCESS --- */}
      {success && (
        <div className="liquid-glass-yellow p-8 rounded-2xl text-center max-w-lg mx-auto">
            <div className="w-24 h-24 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-5xl">✅</span>
            </div>
            <h2 className="text-3xl font-extrabold text-white mb-3">Funds Locked!</h2>
            <p className="text-gray-400 mb-8 text-lg leading-relaxed">
              We are holding <strong className="text-yellow-400">{formData.price} USDT</strong> safely on Polygon.
              Notify the seller to deliver the item.
            </p>
            <button 
              onClick={clearUrlAndReset}
              className="w-full liquid-glass-button text-yellow-400 font-bold py-4 rounded-xl transition-all active:scale-[0.98]"
            >
              Back to Dashboard
            </button>
        </div>
      )}

      <hr className="my-10 border-white/5" />
      
      {/* Lazy Load Heavy Components */}
      <MyDeals />
      
      {mounted && address === ADMIN_WALLET && <AdminStats />}
    </div>
  );
}
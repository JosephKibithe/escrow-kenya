"use client";

import { useState, useEffect, Suspense } from "react";
import { useActiveAccount } from "thirdweb/react";
import { getContract, prepareContractCall, toUnits, waitForReceipt } from "thirdweb";
import { polygon } from "thirdweb/chains";
import { useSendTransaction } from "thirdweb/react";
import { client } from "@/app/client"; 
import { useSearchParams } from "next/navigation";

// Components
import { SellerRequestGenerator } from "./SellerRequestGenerator";
import { MyDeals } from "./MyDeals";
import { AdminStats } from "./AdminStats";

// ---------------------------------------------
// 🚀 MAINNET CONFIGURATION
// ---------------------------------------------
const ESCROW_CONTRACT_ADDRESS = "0x9e2bb48da7C201a379C838D9FACfB280819Ca104"; 
const USDT_TOKEN_ADDRESS = "0xc2132D05D31c914a87C6611C10748AEb04B58e8F"; 
const ADMIN_WALLET = "0x5a9Fd60147C8cff476513D74Ad393853623bAa74"; // Put your admin wallet address here

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">Loading AHADI...</div>}>
      <DashboardContent />
    </Suspense>
  );
}

function DashboardContent() {
  const account = useActiveAccount();
  const searchParams = useSearchParams();
  const { mutateAsync: sendTransaction, isPending } = useSendTransaction();
  
  // STATE CHANGES: Removed 'activeTab' and 'step'. Added 'viewMode'.
  const [viewMode, setViewMode] = useState<"seller" | "buyer">("seller");
  const [statusMsg, setStatusMsg] = useState("");
  const [success, setSuccess] = useState(false);
  
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
    timeout: "259200" // Default 3 days
  });

  // LOGIC CHANGE: Determine Mode based purely on URL
  useEffect(() => {
    if (paramSeller) {
      // If URL has seller, we are in BUYER mode (Invoice View)
      setViewMode("buyer");
      setFormData({
        title: paramItem || "",
        price: paramPrice || "",
        description: paramDesc || "",
        sellerAddress: paramSeller,
        timeout: paramTimeout || "259200"
      });
    } else {
      // If no URL params, we are in SELLER mode (Generator View)
      setViewMode("seller");
    }
  }, [paramSeller, paramPrice, paramItem, paramDesc, paramTimeout]);

  const handleLockFunds = async () => {
    if (!account) return alert("Please login first");
    
    try {
      const amountInUnits = toUnits(formData.price, 6); // USDT 6 decimals
      const timeoutBigInt = BigInt(formData.timeout);

      const escrowContract = getContract({ client, chain: polygon, address: ESCROW_CONTRACT_ADDRESS });
      const tokenContract = getContract({ client, chain: polygon, address: USDT_TOKEN_ADDRESS });

      // 1. Approve
      setStatusMsg("Step 1/2: Approving USDT...");
      const approveTx = prepareContractCall({
        contract: tokenContract,
        method: "function approve(address spender, uint256 amount)",
        params: [ESCROW_CONTRACT_ADDRESS, amountInUnits],
      });
      const approveResult = await sendTransaction(approveTx);
      await waitForReceipt({ client, chain: polygon, transactionHash: approveResult.transactionHash });

      // 2. Create Deal
      setStatusMsg("Step 2/2: Locking Funds...");
      const depositTx = prepareContractCall({
        contract: escrowContract,
        method: "function createDeal(address _seller, uint256 _amount, uint256 _timeoutSeconds)",
        params: [formData.sellerAddress, amountInUnits, timeoutBigInt],
      });
      const depositResult = await sendTransaction(depositTx);
      await waitForReceipt({ client, chain: polygon, transactionHash: depositResult.transactionHash });

      setSuccess(true);

    } catch (error: any) {
      console.error(error);
      alert(`Error: ${error.message || "Transaction failed"}`);
    } finally {
      setStatusMsg("");
    }
  };

  const clearUrlAndReset = () => {
    setSuccess(false);
    setViewMode("seller");
    // Visually clear URL so user can start fresh as a seller
    window.history.replaceState(null, '', '/dashboard');
  };

  return (
    <div className="pb-10">
      
      {/* SCENARIO A: BUYER MODE (INVOICE VIEW) 
        Only shows if URL has params. No editable inputs.
      */}
      {viewMode === "buyer" && !success && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-50 relative animate-in fade-in zoom-in-95 duration-300">
            <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                    <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                        INCOMING INVOICE
                    </span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">{formData.title}</h2>
                <p className="text-gray-500 text-sm mb-4">
                    Seller <span className="font-mono bg-gray-100 px-1 rounded">{formData.sellerAddress.slice(0,6)}...{formData.sellerAddress.slice(-4)}</span> is requesting payment.
                </p>
                
                {formData.description && (
                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 mb-4 text-sm text-gray-700">
                        <span className="font-bold block text-yellow-800 mb-1">Item Details:</span>
                        {formData.description}
                    </div>
                )}
                
                <div className="bg-blue-50 p-6 rounded-xl text-center border-2 border-blue-100 border-dashed">
                    <p className="text-gray-500 text-sm mb-1">Total Due</p>
                    <p className="text-4xl font-extrabold text-blue-600">
                        {Number(formData.price).toLocaleString()} <span className="text-lg text-blue-400">USDT</span>
                    </p>
                </div>

                <div className="mt-4 flex justify-between text-xs text-gray-400 px-2">
                    <span>Protocol Fee (2.5%): {Number(formData.price) * 0.025} USDT</span>
                    <span>Gas Fee: Sponsored (Free)</span>
                </div>
            </div>

            <button 
            onClick={handleLockFunds} 
            disabled={isPending}
            className={`w-full font-bold py-4 rounded-lg transition shadow-lg text-lg
                ${isPending ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700 text-white shadow-green-200"}`}
            >
            {isPending ? (statusMsg || "Processing...") : "✅ Accept & Lock Funds"}
            </button>
        </div>
      )}

      {/* SCENARIO B: SELLER MODE (GENERATOR VIEW) 
        This is now the DEFAULT view if no link is present.
      */}
      {viewMode === "seller" && !success && (
         <SellerRequestGenerator account={account} />
      )}

      {/* SCENARIO C: SUCCESS SCREEN */}
      {success && (
        <div className="bg-white p-8 rounded-xl shadow-sm text-center border border-green-50 animate-in fade-in zoom-in-95">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">✅</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Funds Locked!</h2>
            <p className="text-gray-500 mb-6">
            We are holding <strong>{formData.price} USDT</strong> safely on Polygon.
            Notify the seller to deliver the item.
            </p>
            <button 
            onClick={clearUrlAndReset}
            className="w-full border border-gray-300 text-gray-600 font-bold py-3 rounded-lg hover:bg-gray-50"
            >
            Back to Dashboard
            </button>
        </div>
      )}

      {/* FOOTER: MY DEALS & ADMIN */}
      <hr className="my-8 border-gray-200" />
      <MyDeals />
      
      {account?.address === ADMIN_WALLET && <AdminStats />}
    </div>
  );
}
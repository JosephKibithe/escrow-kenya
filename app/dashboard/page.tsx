"use client";

import { useState, useEffect, Suspense } from "react";
import { useActiveAccount } from "thirdweb/react";
import {
  getContract,
  prepareContractCall,
  toUnits,
  waitForReceipt,
} from "thirdweb";
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
// ⚠️ REPLACE THIS WITH YOUR FINAL V4 DEPLOYED ADDRESS
const ESCROW_CONTRACT_ADDRESS = "0xB85CcC1edc1070a378da6A5Fbc662bdC703Ce296";
const USDT_TOKEN_ADDRESS = "0xc2132D05D31c914a87C6611C10748AEb04B58e8F";
const ADMIN_WALLET = "0x..."; // PUT YOUR WALLET ADDRESS HERE TO SEE ADMIN STATS

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-gray-500">Loading AHADI...</div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}

function DashboardContent() {
  const account = useActiveAccount();
  const searchParams = useSearchParams();
  const { mutateAsync: sendTransaction, isPending } = useSendTransaction();

  const [activeTab, setActiveTab] = useState("buy");
  const [step, setStep] = useState(1);
  const [statusMsg, setStatusMsg] = useState("");

  // Params from URL
  const paramSeller = searchParams.get("seller");
  const paramPrice = searchParams.get("price");
  const paramItem = searchParams.get("item");
  const paramTimeout = searchParams.get("timeout");

  const [formData, setFormData] = useState({
    title: "",
    price: "",
    description: "",
    sellerAddress: "",
    timeout: "259200", // Default 3 days
  });

  // Auto-fill from Link
  useEffect(() => {
    if (paramSeller) {
      setFormData((prev) => ({
        ...prev,
        title: paramItem || prev.title,
        price: paramPrice || prev.price,
        sellerAddress: paramSeller,
        timeout: paramTimeout || "259200",
      }));
      // Auto-switch to BUY tab if link present
      setActiveTab("buy");
      // If price is there, maybe jump to step 2?
      // setStep(2);
    } else if (searchParams.get("tab") === "sell") {
      setActiveTab("sell");
    }
  }, [paramSeller, paramPrice, paramItem, paramTimeout, searchParams]);

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const handleLockFunds = async () => {
    if (!account) return alert("Please login first");

    // Safety check
    const targetSeller = formData.sellerAddress || account.address; // Fallback for testing
    if (targetSeller === account.address && !paramSeller) {
      // Allow self-deal only if testing manually, but warn
      console.warn("Self-dealing for test");
    }

    try {
      const amountInUnits = toUnits(formData.price, 6); // USDT 6 decimals
      const timeoutBigInt = BigInt(formData.timeout);

      const escrowContract = getContract({
        client,
        chain: polygon,
        address: ESCROW_CONTRACT_ADDRESS,
      });
      const tokenContract = getContract({
        client,
        chain: polygon,
        address: USDT_TOKEN_ADDRESS,
      });

      // 1. Approve
      setStatusMsg("Step 1/2: Approving USDT...");
      const approveTx = prepareContractCall({
        contract: tokenContract,
        method: "function approve(address spender, uint256 amount)",
        params: [ESCROW_CONTRACT_ADDRESS, amountInUnits],
      });
      const approveResult = await sendTransaction(approveTx);
      await waitForReceipt({
        client,
        chain: polygon,
        transactionHash: approveResult.transactionHash,
      });

      // 2. Create Deal (3 Arguments: Seller, Amount, Timeout)
      setStatusMsg("Step 2/2: Locking Funds...");
      const depositTx = prepareContractCall({
        contract: escrowContract,
        method:
          "function createDeal(address _seller, uint256 _amount, uint256 _timeoutSeconds)",
        params: [targetSeller, amountInUnits, timeoutBigInt],
      });
      const depositResult = await sendTransaction(depositTx);
      await waitForReceipt({
        client,
        chain: polygon,
        transactionHash: depositResult.transactionHash,
      });

      setStep(3);
    } catch (error: any) {
      console.error(error);
      alert(`Error: ${error.message || "Transaction failed"}`);
    } finally {
      setStatusMsg("");
    }
  };

  return (
    <div className="pb-10">
      {/* TABS */}
      <div className="flex justify-center mb-6">
        <div className="bg-gray-200 p-1 rounded-lg flex">
          <button
            onClick={() => setActiveTab("buy")}
            className={`px-6 py-2 rounded-md text-sm font-bold transition ${
              activeTab === "buy"
                ? "bg-white shadow text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            I'm Buying
          </button>
          <button
            onClick={() => setActiveTab("sell")}
            className={`px-6 py-2 rounded-md text-sm font-bold transition ${
              activeTab === "sell"
                ? "bg-white shadow text-green-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            I'm Selling
          </button>
        </div>
      </div>

      {/* CONTENT AREA */}
      {activeTab === "sell" ? (
        <SellerRequestGenerator account={account} />
      ) : (
        <>
          {/* BUYER WIZARD */}
          {step === 1 && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-50">
              <h2 className="text-xl font-bold mb-4 text-blue-900">
                Deal Details
              </h2>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Item Name
              </label>
              <input
                type="text"
                value={formData.title}
                placeholder="e.g. iPhone 14 Pro"
                className="w-full p-3 border rounded-lg mb-4 bg-gray-50 text-gray-900"
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description / Notes
              </label>
              <textarea
                value={formData.description}
                placeholder="Condition, meeting place, etc."
                className="w-full p-3 border rounded-lg mb-6 bg-gray-50 h-24 text-gray-900"
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
              <button
                onClick={handleNext}
                className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition"
              >
                Next Step ➡️
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-50">
              <button
                onClick={handleBack}
                className="text-gray-400 text-sm mb-4"
              >
                ← Back
              </button>
              <h2 className="text-xl font-bold mb-4 text-blue-900">
                Secure Payment
              </h2>

              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price (USDT)
              </label>
              <input
                type="number"
                value={formData.price}
                placeholder="0"
                className="w-full p-3 border rounded-lg mb-4 bg-gray-50 text-3xl font-bold text-gray-900"
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
              />

              {formData.sellerAddress && (
                <div className="text-xs bg-yellow-50 text-yellow-800 p-2 rounded mb-4 border border-yellow-100">
                  Paying Seller:{" "}
                  <span className="font-mono">
                    {formData.sellerAddress.slice(0, 6)}...
                    {formData.sellerAddress.slice(-4)}
                  </span>
                </div>
              )}

              <div className="bg-blue-50 p-4 rounded-lg mb-6 text-sm">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Item Price:</span>
                  <span className="font-medium">
                    USDT {Number(formData.price).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Secure Fee (2.5%):</span>
                  <span className="font-medium">
                    USDT {(Number(formData.price) * 0.025).toLocaleString()}
                  </span>
                </div>
                <div className="border-t border-blue-200 my-2 pt-2 flex justify-between text-blue-900 font-bold text-lg">
                  <span>Total Lock:</span>
                  <span>
                    USDT {(Number(formData.price) * 1.025).toLocaleString()}
                  </span>
                </div>
              </div>

              <button
                onClick={handleLockFunds}
                disabled={isPending}
                className={`w-full font-bold py-3 rounded-lg transition shadow-lg ${
                  isPending
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700 text-white shadow-green-200"
                }`}
              >
                {isPending ? statusMsg || "Processing..." : "🔒 Lock Cash"}
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="bg-white p-8 rounded-xl shadow-sm text-center border border-green-50">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">✅</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Funds Locked!
              </h2>
              <p className="text-gray-500 mb-6">
                We are holding <strong>{formData.price} USDT</strong> safely on
                Polygon. Notify the seller to deliver the item.
              </p>
              <button
                onClick={() => {
                  setStep(1);
                  setFormData({ ...formData, price: "" });
                }}
                className="w-full border border-gray-300 text-gray-600 font-bold py-3 rounded-lg hover:bg-gray-50"
              >
                Start Another Deal
              </button>
            </div>
          )}
        </>
      )}

      {/* FOOTER COMPONENTS */}
      <hr className="my-8 border-gray-200" />
      <MyDeals />

      {account?.address === ADMIN_WALLET && <AdminStats />}
    </div>
  );
}

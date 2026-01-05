"use client";

import { useState } from "react";
import { useActiveAccount } from "thirdweb/react";
import {
  getContract,
  prepareContractCall,
  toUnits,
  waitForReceipt, // <--- NEW IMPORT
} from "thirdweb";
import { polygon } from "thirdweb/chains";
import { useSendTransaction } from "thirdweb/react"; // Remove useWaitForReceipt if you had it
import { client } from "@/app/client";

// ---------------------------------------------
// 🚀 MAINNET CONFIGURATION
// ---------------------------------------------
const ESCROW_CONTRACT_ADDRESS = "0xB85CcC1edc1070a378da6A5Fbc662bdC703Ce296";
const USDT_TOKEN_ADDRESS = "0xc2132D05D31c914a87C6611C10748AEb04B58e8F";

export default function DashboardPage() {
  const account = useActiveAccount();
  // Change 'mutate' to 'mutateAsync' to allow waiting
  const { mutateAsync: sendTransaction, isPending } = useSendTransaction();

  const [step, setStep] = useState(1);
  const [statusMsg, setStatusMsg] = useState(""); // To show live updates
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    description: "",
  });

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  // THE REAL BLOCKCHAIN FUNCTION
  const handleLockFunds = async () => {
    if (!account) return alert("Please login first");

    try {
      const amountInWei = toUnits(formData.price, 6);

      // 1. Define Contracts
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

      // ---------------------------------------------------------
      // STEP A: APPROVE USDT
      // ---------------------------------------------------------
      setStatusMsg("Step 1/2: Please Approve USDT...");

      const approveTx = prepareContractCall({
        contract: tokenContract,
        method: "function approve(address spender, uint256 amount)",
        params: [ESCROW_CONTRACT_ADDRESS, amountInWei],
      });

      // Send & Wait for confirmation
      const approveResult = await sendTransaction(approveTx);
      console.log("Approve Tx Hash:", approveResult.transactionHash);

      // Wait for it to be indexed on Polygon
      await waitForReceipt({
        client,
        chain: polygon,
        transactionHash: approveResult.transactionHash,
      });

      // ---------------------------------------------------------
      // STEP B: DEPOSIT (LOCK FUNDS)
      // ---------------------------------------------------------
      setStatusMsg("Step 2/2: Locking Funds...");

      const dealId = BigInt(Math.floor(Math.random() * 1000000));
      const sellerPlaceholder = account.address;

      const depositTx = prepareContractCall({
        contract: escrowContract,
        method:
          "function createDeal(uint256 _dealId, address _seller, uint256 _amount)",
        params: [dealId, sellerPlaceholder, amountInWei],
      });

      const depositResult = await sendTransaction(depositTx);
      console.log("Deposit Tx Hash:", depositResult.transactionHash);

      // Wait for confirmation again
      await waitForReceipt({
        client,
        chain: polygon,
        transactionHash: depositResult.transactionHash,
      });

      // ✅ ONLY NOW do we show success
      setStep(3);
    } catch (error: any) {
      console.error(error);
      alert(`Transaction Failed: ${error.message || "Unknown error"}`);
    } finally {
      setStatusMsg("");
    }
  };

  // ... (Keep Step 1 the same) ...
  if (step === 1) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-xl font-bold mb-4">What are you buying?</h2>

        <label className="block text-sm font-medium text-gray-700 mb-1">
          Item Name
        </label>
        <input
          type="text"
          placeholder="e.g. iPhone 14 Pro"
          className="w-full p-3 border rounded-lg mb-4 bg-gray-50 text-gray-900"
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />

        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description / Condition
        </label>
        <textarea
          placeholder="e.g. Used, 85% battery health. Meeting at CBD."
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
    );
  }

  // ... (Update Step 2 to show statusMsg) ...
  if (step === 2) {
    const price = Number(formData.price) || 0;
    const fee = price * 0.025;
    const total = price + fee;

    return (
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <button onClick={handleBack} className="text-gray-400 text-sm mb-4">
          ← Back
        </button>
        <h2 className="text-xl font-bold mb-4">Set the Price</h2>

        <label className="block text-sm font-medium text-gray-700 mb-1">
          Agreed Price (USDT)
        </label>
        <input
          type="number"
          placeholder="0"
          className="w-full p-3 border rounded-lg mb-6 bg-gray-50 text-2xl font-bold text-gray-900"
          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
        />

        <div className="bg-blue-50 p-4 rounded-lg mb-6 text-sm">
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Item Price:</span>
            <span className="font-medium">USDT {price.toLocaleString()}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Secure Fee (2.5%):</span>
            <span className="font-medium">USDT {fee.toLocaleString()}</span>
          </div>
          <div className="border-t border-blue-200 my-2 pt-2 flex justify-between text-blue-900 font-bold text-lg">
            <span>Total to Lock:</span>
            <span>USDT {total.toLocaleString()}</span>
          </div>
        </div>

        <button
          onClick={handleLockFunds}
          disabled={isPending}
          className={`w-full font-bold py-3 rounded-lg transition shadow-lg 
            ${
              isPending
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700 text-white shadow-green-200"
            }`}
        >
          {isPending ? statusMsg || "Processing..." : "🔒 Lock Cash"}
        </button>

        {/* Help text for debugging */}
        {isPending && (
          <p className="text-xs text-center mt-2 text-gray-500">
            Check your browser console (F12) for updates
          </p>
        )}
      </div>
    );
  }

  // ... (Keep Step 3 the same) ...
  if (step === 3) {
    return (
      <div className="bg-white p-8 rounded-xl shadow-sm text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">✅</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Funds Locked!</h2>
        <p className="text-gray-500 mb-6">
          We are holding <strong>{formData.price} USDT</strong> safely on the
          Polygon Blockchain.
        </p>
        <button
          onClick={() => setStep(1)}
          className="w-full border border-gray-300 text-gray-600 font-bold py-3 rounded-lg hover:bg-gray-50"
        >
          Start Another Deal
        </button>
      </div>
    );
  }

  return null;
}

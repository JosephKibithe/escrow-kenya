"use client";

import { useActiveAccount, useActiveWalletChain } from "thirdweb/react";
import { useState } from "react";

function WalletCard({ address }: { address: string }) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-gray-900 text-white p-6 rounded-2xl shadow-xl mb-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-blue-500 rounded-full opacity-20 blur-xl"></div>

      <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">
        Your AHADI Balance
      </p>
      <h2 className="text-3xl font-bold mb-4">0.00 cUSD</h2>
      {/* Note: We will hook up real balance reading in Step 3 */}

      <div className="bg-gray-800 rounded-lg p-3 flex items-center justify-between border border-gray-700">
        <div className="truncate text-xs font-mono text-gray-300 mr-2">
          {address}
        </div>
        <button
          onClick={copyToClipboard}
          className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2 px-3 rounded transition"
        >
          {copied ? "Copied!" : "Copy Address"}
        </button>
      </div>
      <p className="text-xs text-gray-500 mt-3">
        ⚠️ Deposit <strong>USDT (Polygon)</strong> or{" "}
        <strong>cUSD (Celo)</strong> from Binance.
      </p>
    </div>
  );
}
export default function DashboardPage() {
  const account = useActiveAccount();
  const [step, setStep] = useState(1);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    description: "",
  });

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  // STEP 1: Item Details
  if (step === 1) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-xl font-bold mb-4 text-gray-900">
          What are you buying?
        </h2>

        <label className="block text-sm font-medium text-black mb-1">
          Item Name
        </label>
        <input
          type="text"
          placeholder="e.g. iPhone 14 Pro"
          className="w-full p-3 border rounded-lg mb-4 bg-gray-70 text-gray-900"
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />

        <label className="block text-sm font-medium text-black mb-1">
          Description / Condition
        </label>
        <textarea
          placeholder="e.g. Used, 85% battery health. Meeting at CBD."
          className="w-full p-3 border rounded-lg mb-6 bg-gray-50 text-gray-900 h-24"
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

  // STEP 2: Price & Fees
  if (step === 2) {
    const price = Number(formData.price) || 0;
    const fee = price * 0.025; // 2.5% Fee
    const total = price + fee;

    return (
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <button onClick={handleBack} className="text-gray-400 text-sm mb-4">
          ← Back
        </button>
        <h2 className="text-xl font-bold mb-4 text-gray-900">Set the Price</h2>

        <label className="block text-sm font-medium text-gray-700 mb-1">
          Agreed Price (KES)
        </label>
        <input
          type="number"
          placeholder="0"
          className="w-full p-3 border rounded-lg mb-6 bg-gray-50 text-2xl font-bold text-gray-900"
          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
        />

        {/* Fee Breakdown Card */}
        <div className="bg-blue-50 p-4 rounded-lg mb-6 text-sm">
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Item Price:</span>
            <span className="font-medium">KES {price.toLocaleString()}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Secure Fee (2.5%):</span>
            <span className="font-medium">KES {fee.toLocaleString()}</span>
          </div>
          <div className="border-t border-blue-200 my-2 pt-2 flex justify-between text-blue-900 font-bold text-lg">
            <span>Total to Lock:</span>
            <span>KES {total.toLocaleString()}</span>
          </div>
        </div>

        <button
          onClick={() => alert("Logic to trigger M-Pesa coming next!")}
          className="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition shadow-lg shadow-green-200"
        >
          🔒 Lock Cash with M-Pesa
        </button>
      </div>
    );
  }

  return <WalletCard address={account?.address || ""} />;
}

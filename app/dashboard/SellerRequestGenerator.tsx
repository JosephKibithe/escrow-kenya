import { useState } from "react";

export function SellerRequestGenerator({ account }: { account: any }) {
  const [amount, setAmount] = useState("");
  const [item, setItem] = useState("");
  const [days, setDays] = useState("3");
  const [generatedLink, setGeneratedLink] = useState("");

  const generateLink = () => {
    if (!account) return alert("Connect wallet first!");

    // Calculate seconds
    const timeoutSeconds = Number(days) * 24 * 60 * 60;

    // Build URL
    const baseUrl = window.location.origin + "/dashboard";
    const params = new URLSearchParams({
      tab: "buy", // Force buyer view
      seller: account.address,
      price: amount,
      item: item,
      timeout: timeoutSeconds.toString(),
    });

    setGeneratedLink(`${baseUrl}?${params.toString()}`);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-green-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h3 className="text-xl font-bold mb-4 text-green-900">
        Create Payment Link
      </h3>
      <p className="text-sm text-gray-500 mb-6">
        Generate a link to send to your buyer via WhatsApp/SMS.
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Item Name
          </label>
          <input
            type="text"
            placeholder="e.g. Toyota Vitz 2017"
            className="w-full p-3 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-green-500 outline-none"
            onChange={(e) => setItem(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Price (USDT)
          </label>
          <input
            type="number"
            placeholder="5000"
            className="w-full p-3 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-green-500 outline-none"
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Offer Expires In
          </label>
          <select
            className="w-full p-3 border rounded-lg bg-gray-50"
            value={days}
            onChange={(e) => setDays(e.target.value)}
          >
            <option value="1">1 Day (Quick Sale)</option>
            <option value="3">3 Days (Standard)</option>
            <option value="7">7 Days (Shipping)</option>
            <option value="30">30 Days (Long Term)</option>
          </select>
        </div>

        <button
          onClick={generateLink}
          className="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition shadow-lg shadow-green-100"
        >
          🔗 Generate Link
        </button>

        {generatedLink && (
          <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200 break-all">
            <p className="text-xs text-green-800 font-mono mb-2">
              {generatedLink}
            </p>
            <button
              onClick={() => {
                navigator.clipboard.writeText(generatedLink);
                alert("Link Copied!");
              }}
              className="text-xs bg-white border border-green-300 px-3 py-1 rounded text-green-700 font-bold hover:bg-green-50"
            >
              Copy to Clipboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

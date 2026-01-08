import { getContract, prepareContractCall } from "thirdweb";
import { useReadContract, useSendTransaction } from "thirdweb/react";
import { client } from "@/app/client";
import { polygon } from "thirdweb/chains";

// ⚠️ REPLACE WITH YOUR DEPLOYED V4 CONTRACT ADDRESS
const ESCROW_CONTRACT_ADDRESS = "0x9e2bb48da7C201a379C838D9FACfB280819Ca104";

export function AdminStats() {
  const { mutate: sendTransaction } = useSendTransaction();

  const contract = getContract({
    client,
    chain: polygon,
    address: ESCROW_CONTRACT_ADDRESS,
  });

  const { data: stats } = useReadContract({
    contract,
    method:
      "function getContractStats() view returns (uint256, uint256, uint256, uint256)",
    params: [],
  });

  const { data: feeBasisPoints } = useReadContract({
    contract,
    method: "function feeBasisPoints() view returns (uint256)",
    params: [],
  });

  if (!stats) return null;

  const totalDeals = stats[0].toString();
  const tvl = Number(stats[1]) / 1_000_000;
  const currentFee = Number(feeBasisPoints) / 100;

  const handleUpdateFee = () => {
    const newFee = prompt("Enter new fee % (e.g. 1.5):");
    if (!newFee) return;
    const tx = prepareContractCall({
      contract,
      method: "function updateFee(uint256 _newFee)",
      params: [BigInt(Number(newFee) * 100)],
    });
    sendTransaction(tx);
  };

  return (
    <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg mt-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">👑 Admin Panel</h2>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-800 p-3 rounded">
          <p className="text-slate-400 text-xs">Deals</p>
          <p className="text-xl font-bold">{totalDeals}</p>
        </div>
        <div className="bg-slate-800 p-3 rounded">
          <p className="text-slate-400 text-xs">TVL</p>
          <p className="text-xl font-bold text-green-400">${tvl}</p>
        </div>
        <div className="bg-slate-800 p-3 rounded">
          <p className="text-slate-400 text-xs">Fee</p>
          <p className="text-xl font-bold text-blue-400">{currentFee}%</p>
        </div>
      </div>
      <button
        onClick={handleUpdateFee}
        className="border border-slate-600 text-xs py-2 px-3 rounded"
      >
        ⚙️ Change Fee
      </button>
    </div>
  );
}

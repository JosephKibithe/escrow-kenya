import { useReadContract, useWriteContract } from "wagmi";
import { ESCROW_CONTRACT_ADDRESS, ESCROW_ABI } from "@/constants";

export function AdminStats() {
  const { writeContractAsync } = useWriteContract();

  // 1. Fetch Contract Stats
  const { data: stats } = useReadContract({
    address: ESCROW_CONTRACT_ADDRESS,
    abi: ESCROW_ABI,
    functionName: 'getContractStats',
  });

  // 2. Fetch Fee
  const { data: feeBasisPoints } = useReadContract({
    address: ESCROW_CONTRACT_ADDRESS,
    abi: ESCROW_ABI,
    functionName: 'feeBasisPoints',
  });

  // Stats are returned as an array/tuple: [totalDeals, locked, balance, excess]
  // Note: We need to handle 'undefined' while loading
  if (!stats) return null;

  const [totalDeals, locked, balance, excess] = stats as [bigint, bigint, bigint, bigint];

  const formattedDeals = totalDeals.toString();
  const formattedTVL = Number(locked) / 1_000_000;
  const formattedFee = feeBasisPoints ? Number(feeBasisPoints) / 100 : 0;

  const handleUpdateFee = async () => {
    const newFee = prompt("Enter new fee % (e.g. 1.5):");
    if (!newFee) return;
    
    try {
      await writeContractAsync({
        address: ESCROW_CONTRACT_ADDRESS,
        abi: ESCROW_ABI,
        functionName: 'updateFee',
        args: [BigInt(Number(newFee) * 100)]
      });
      alert("Fee update transaction sent!");
    } catch (e) {
      console.error(e);
      alert("Failed to update fee");
    }
  };

  return (
    <div className="liquid-glass-yellow p-6 rounded-xl mt-8 relative overflow-hidden shimmer-overlay">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-yellow-400">👑 Admin Panel</h2>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="liquid-glass p-3 rounded-lg">
            <p className="text-gray-500 text-xs">Deals</p>
            <p className="text-xl font-bold text-white">{formattedDeals}</p>
        </div>
        <div className="liquid-glass p-3 rounded-lg">
            <p className="text-gray-500 text-xs">TVL</p>
            <p className="text-xl font-bold text-yellow-400">${formattedTVL}</p>
        </div>
        <div className="liquid-glass p-3 rounded-lg">
            <p className="text-gray-500 text-xs">Fee</p>
            <p className="text-xl font-bold text-amber-400">{formattedFee}%</p>
        </div>
      </div>
      <button onClick={handleUpdateFee} className="liquid-glass-button text-yellow-400 text-xs py-2 px-3 rounded-lg font-medium">
        ⚙️ Change Fee
      </button>
    </div>
  );
}
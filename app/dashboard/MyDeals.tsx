import { getContract, prepareContractCall, prepareEvent } from "thirdweb";
import {
  useActiveAccount,
  useSendTransaction,
  useContractEvents,
} from "thirdweb/react";
import { client } from "@/app/client";
import { polygon } from "thirdweb/chains";

// ⚠️ REPLACE WITH YOUR DEPLOYED V4 CONTRACT ADDRESS
const ESCROW_CONTRACT_ADDRESS = "0xB85CcC1edc1070a378da6A5Fbc662bdC703Ce296";

type DepositedArgs = {
  dealId: bigint;
  buyer: string;
  seller: string;
  amount: bigint;
  timeoutInSeconds: bigint;
};

function isArgsArray(
  args: readonly unknown[] | Record<string, unknown>
): args is readonly unknown[] {
  return Array.isArray(args);
}

function getDepositedArgs(
  args: readonly unknown[] | Record<string, unknown>
): DepositedArgs | null {
  if (isArgsArray(args)) {
    const [dealId, buyer, seller, amount, timeoutInSeconds] = args;
    if (typeof buyer !== "string" || typeof seller !== "string") return null;
    return {
      dealId: dealId as bigint,
      buyer,
      seller,
      amount: amount as bigint,
      timeoutInSeconds: timeoutInSeconds as bigint,
    };
  }

  const buyer = args.buyer;
  const seller = args.seller;
  const dealId = args.dealId;
  const amount = args.amount;
  const timeoutInSeconds = args.timeoutInSeconds;

  if (typeof buyer !== "string" || typeof seller !== "string") return null;

  return {
    dealId: dealId as bigint,
    buyer,
    seller,
    amount: amount as bigint,
    timeoutInSeconds: timeoutInSeconds as bigint,
  };
}

export function MyDeals() {
  const account = useActiveAccount();
  const { mutate: sendTransaction } = useSendTransaction();

  const contract = getContract({
    client,
    chain: polygon,
    address: ESCROW_CONTRACT_ADDRESS,
  });

  // Listen for "Deposited" events
  const { data: events, isLoading } = useContractEvents({
    contract,
    events: [
      prepareEvent({
        signature:
          "event Deposited(uint256 indexed dealId, address indexed buyer, address indexed seller, uint256 amount, uint256 timeoutInSeconds)",
      }),
    ],
  });

  // Client-side filtering (Show deals where I am Buyer OR Seller)
  const myDeals =
    events
      ?.filter((e) => {
        const args = getDepositedArgs(e.args);
        if (!args) return false;
        return (
          args.buyer === account?.address || args.seller === account?.address
        );
      })
      .reverse() || [];

  const handleRelease = (dealId: bigint) => {
    if (!confirm("Release funds to Seller? This cannot be undone.")) return;
    const tx = prepareContractCall({
      contract,
      method: "function releaseFunds(uint256 _dealId)",
      params: [dealId],
    });
    sendTransaction(tx);
  };

  if (isLoading)
    return (
      <div className="text-center p-4 text-gray-500">
        Loading your promises...
      </div>
    );

  return (
    <div className="mt-8">
      <h3 className="text-lg font-bold mb-4 text-gray-800">
        Your Active Promises
      </h3>

      {myDeals.length === 0 ? (
        <p className="text-gray-500 bg-white p-4 rounded-lg text-center border border-gray-100">
          No active deals found.
        </p>
      ) : (
        <div className="space-y-4">
          {myDeals.map((event, i) => {
            const args = getDepositedArgs(event.args);
            if (!args) return null;

            const amount = Number(args.amount) / 1_000_000; // 6 Decimals
            const dealId = args.dealId;
            const isBuyer = args.buyer === account?.address;

            return (
              <div
                key={i}
                className="bg-white border border-gray-200 p-4 rounded-xl flex justify-between items-center shadow-sm"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-2 py-0.5 rounded font-bold ${
                        isBuyer
                          ? "bg-blue-100 text-blue-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {isBuyer ? "YOU BUY" : "YOU SELL"}
                    </span>
                    <span className="font-bold text-gray-800">
                      Deal #{dealId.toString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Locked:{" "}
                    <span className="text-gray-900 font-bold">
                      {amount} USDT
                    </span>
                  </p>
                </div>

                {isBuyer && (
                  <button
                    onClick={() => handleRelease(dealId)}
                    className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-2 px-3 rounded shadow-sm transition"
                  >
                    ✅ Release
                  </button>
                )}
                {!isBuyer && (
                  <span className="text-xs text-orange-500 font-medium">
                    Waiting for Buyer
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

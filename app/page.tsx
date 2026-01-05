"use client";

import { createThirdwebClient } from "thirdweb";
import { ConnectButton } from "thirdweb/react";
import { inAppWallet } from "thirdweb/wallets"; // <--- Added smartWallet
import { polygon } from "thirdweb/chains"; // <--- Ensure this is polygon
import { useRouter } from "next/navigation";

const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_TEMPLATE_CLIENT_ID!,
});

// 🚀 THE FIX: WRAP IN SMART WALLET FOR GAS SPONSORSHIP
const wallets = [
  inAppWallet({
    auth: {
      options: ["google"],
    },
    smartAccount: {
      chain: polygon,
      sponsorGas: true, // This is the only setting you need!
      // factoryAddress: <--- DELETE THIS LINE
    },
  }),
];

export default function Home() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
          AHADI 🤝
        </h1>
        <p className="text-gray-500 mt-2">Secure Deals. Zero Stress.</p>
      </div>

      <div className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-xl border border-gray-100 text-center">
        <h2 className="text-lg font-semibold text-gray-700 mb-6">
          Sign in to start
        </h2>

        <ConnectButton
          client={client}
          wallets={wallets}
          chain={polygon} // <--- Important: Must be Polygon
          connectButton={{ label: "Continue with Google" }}
          accountAbstraction={{
            chain: polygon, // <--- Force Smart Account on Polygon
            sponsorGas: true, // <--- Double check: Enable Sponsorship
          }}
          onConnect={() => {
            console.log("Connected!");
            router.push("/dashboard");
          }}
        />
      </div>
    </div>
  );
}

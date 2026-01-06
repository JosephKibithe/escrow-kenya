"use client";

import { ConnectButton } from "thirdweb/react";
import { inAppWallet } from "thirdweb/wallets";
import { polygon } from "thirdweb/chains";
import { client } from "@/app/client";
import { useRouter } from "next/navigation";

// 🚀 GASLESS CONFIG
const wallets = [
  inAppWallet({
    auth: {
      options: ["google", "email"],
    },
    smartAccount: {
      chain: polygon,
      sponsorGas: true, // Enables Account Abstraction
    },
  }),
];

export default function Home() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="mb-8 text-center">
        <h1 className="text-5xl font-extrabold text-blue-900 tracking-tight">
          AHADI 🤝
        </h1>
        <p className="text-gray-600 mt-2 text-lg">Secure Deals. Zero Stress.</p>
      </div>

      <div className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-xl border border-gray-100 text-center">
        <h2 className="text-lg font-semibold text-gray-700 mb-6">
          Sign in to start
        </h2>

        <ConnectButton
          client={client}
          wallets={wallets}
          chain={polygon}
          connectButton={{ label: "Continue with Google" }}
          accountAbstraction={{
            chain: polygon,
            sponsorGas: true,
          }}
          onConnect={() => {
            console.log("Connected!");
            router.push("/dashboard");
          }}
        />
      </div>

      <p className="mt-8 text-xs text-gray-400">
        Powered by Polygon & Thirdweb
      </p>
    </div>
  );
}

"use client";

import { createThirdwebClient } from "thirdweb";
import { ConnectButton } from "thirdweb/react";
import { inAppWallet } from "thirdweb/wallets";
import { celo } from "thirdweb/chains";
import { useRouter } from "next/navigation"; // To redirect after login

// 1. Initialize Client
const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_TEMPLATE_CLIENT_ID!,
});

// 2. Configure Google Login
const wallets = [
  inAppWallet({
    auth: {
      options: ["google"], // <--- The change is here
    },
  }),
];

export default function Home() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
          Salama Pay 🇰🇪
        </h1>
        <p className="text-gray-500 mt-2">
          The safest way to buy & sell online.
        </p>
      </div>

      <div className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-xl border border-gray-100 text-center">
        <h2 className="text-lg font-semibold text-gray-700 mb-6">
          Sign in to start
        </h2>

        <ConnectButton
          client={client}
          wallets={wallets}
          chain={celo}
          connectButton={{ label: "Continue with Google" }}
          // Redirect to dashboard immediately after login
          onConnect={() => {
            console.log("Connected!");
            router.push("/dashboard");
          }}
        />
      </div>
    </div>
  );
}

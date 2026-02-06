"use client";

import { useAppKit } from '@reown/appkit/react';
import { useAccount } from 'wagmi';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { open } = useAppKit();
  const { isConnected } = useAccount();
  const router = useRouter();

  useEffect(() => {
    if (isConnected) {
      router.push("/dashboard");
    }
  }, [isConnected, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="mb-8 text-center">
        <h1 className="text-5xl font-extrabold text-blue-900 tracking-tight">AHADI 🤝</h1>
        <p className="text-gray-600 mt-2 text-lg">Secure Deals. Zero Stress.</p>
      </div>

      <div className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-xl border border-gray-100 text-center">
        <h2 className="text-lg font-semibold text-gray-700 mb-6">
          Connect Wallet to Start
        </h2>
        
        <button 
          onClick={() => open()}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition w-full"
        >
          Connect Wallet
        </button>
      </div>
      
      <p className="mt-8 text-xs text-gray-400">Powered by Polygon & Reown</p>
    </div>
  );
}
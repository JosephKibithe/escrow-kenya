"use client";
import Image from 'next/image';
import { useAccount } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';
import { useRouter } from "next/navigation";
import { useEffect, useState } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isConnected, address } = useAccount();
  const { open } = useAppKit();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // Prevent Hydration Mismatch: Only render wallet state on the client
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A0A] pb-20 selection:bg-yellow-500/30 selection:text-yellow-900">
      <nav className="liquid-glass-nav sticky top-0 z-50 transition-all duration-200">
        <div className="max-w-md mx-auto px-4 py-3 flex justify-between items-center">
          
          {/* Navigation - Optimized Touch Target for Mobile */}
          <div 
            className="flex items-center gap-3 cursor-pointer group select-none py-1" 
            onClick={() => router.push("/")}
            role="button"
            aria-label="Back to Home"
            title="Back to Home"
          >
            <div className="relative w-8 h-8 group-hover:scale-110 transition-transform duration-200">
              <Image 
                src="/padlock-logo.webp" 
                alt="AHADI Logo" 
                fill 
                className="object-contain drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]"
              />
            </div>
            <div className="flex flex-col">
              <h1 className="font-extrabold text-xl tracking-tight text-white leading-none group-hover:text-yellow-400 transition-colors">
                AHADI
              </h1>
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest group-hover:text-yellow-500 transition-colors">
                Home
              </span>
            </div>
          </div>
          
          {/* Wallet Action */}
          <div>
             <button 
               onClick={() => open()} 
               className={`
                 text-sm font-medium py-2.5 px-5 rounded-full transition-all duration-200
                 ${mounted && isConnected 
                   ? "liquid-glass-yellow text-yellow-400" 
                   : "bg-gradient-to-r from-yellow-500 to-amber-500 text-black font-bold hover:from-yellow-400 hover:to-amber-400 hover:shadow-md hover:-translate-y-0.5"
                 }
               `}
             >
               {mounted && isConnected 
                 ? <span className="flex items-center gap-2"><span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"/>{address?.slice(0,4)}...{address?.slice(-4)}</span>
                 : "Connect Wallet"
               }
             </button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-md mx-auto p-4">
        {children}
      </main>
    </div>
  );
}
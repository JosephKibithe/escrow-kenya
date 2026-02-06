"use client";
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
    <div className="min-h-screen bg-gray-50 pb-20 selection:bg-blue-100 selection:text-blue-900">
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 transition-all duration-200">
        <div className="max-w-md mx-auto px-4 py-3 flex justify-between items-center">
          
          {/* Navigation - Optimized Touch Target for Mobile */}
          <div 
            className="flex items-center gap-3 cursor-pointer group select-none py-1" 
            onClick={() => router.push("/")}
            role="button"
            aria-label="Back to Home"
            title="Back to Home"
          >
            <span className="text-2xl group-hover:scale-110 transition-transform duration-200 filter drop-shadow-sm">
              🤝
            </span>
            <div className="flex flex-col">
              <h1 className="font-extrabold text-xl tracking-tight text-blue-900 leading-none group-hover:text-blue-700 transition-colors">
                AHADI
              </h1>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest group-hover:text-blue-500 transition-colors">
                Home
              </span>
            </div>
          </div>
          
          {/* Wallet Action */}
          <div>
             <button 
               onClick={() => open()} 
               className={`
                 text-sm font-medium py-2.5 px-5 rounded-full transition-all duration-200 shadow-sm
                 ${mounted && isConnected 
                   ? "bg-blue-50 text-blue-700 border border-blue-100 hover:bg-blue-100" 
                   : "bg-gray-900 text-white hover:bg-gray-800 hover:shadow-md hover:-translate-y-0.5"
                 }
               `}
             >
               {mounted && isConnected 
                 ? <span className="flex items-center gap-2"><span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"/>{address?.slice(0,4)}...{address?.slice(-4)}</span>
                 : "Connect Wallet"
               }
             </button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-md mx-auto p-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
        {children}
      </main>
    </div>
  );
}
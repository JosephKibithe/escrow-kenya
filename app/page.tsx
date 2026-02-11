"use client";

import { useAppKit } from '@reown/appkit/react';
import { useAccount } from 'wagmi';
import { useEffect, useState, lazy, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import LoadingScreen from './components/LoadingScreen';

const PadlockScene = lazy(() => import('./components/PadlockScene'));

export default function LandingPage() {
  const { open } = useAppKit();
  const { isConnected } = useAccount();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleEnterApp = () => {
    if (isConnected) {
      router.push("/dashboard");
    } else {
      open();
    }
  };

  if (!mounted) return null;

  return (
    <>
      {/* Loading Screen */}
      {loading && <LoadingScreen onLoadComplete={() => setLoading(false)} />}

      <div className="min-h-screen bg-[#0A0A0A] text-white selection:bg-yellow-500/30 font-sans">
        
        {/* --- NAVIGATION --- */}
        <nav className="fixed top-0 w-full z-50 liquid-glass-nav">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center">
                <span className="text-black text-sm font-bold">🔒</span>
              </div>
              <span className="text-xl font-bold tracking-tight">AHADI</span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
              <a href="#how-it-works" className="hover:text-yellow-400 transition-colors duration-300">How it Works</a>
              <a href="#features" className="hover:text-yellow-400 transition-colors duration-300">Features</a>
              <a href="#ai-future" className="hover:text-yellow-400 transition-colors duration-300">Ahadi AI</a>
            </div>
            <button 
              onClick={handleEnterApp}
              className="liquid-glass-button text-yellow-400 px-6 py-2.5 rounded-full text-sm font-semibold"
            >
              {isConnected ? "Go to Dashboard →" : "Connect Wallet"}
            </button>
          </div>
        </nav>

        {/* --- HERO SECTION WITH 3D PADLOCK --- */}
        <section className="pt-32 pb-20 px-6 relative overflow-hidden min-h-screen flex flex-col items-center justify-center">
          {/* Background Glows */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-yellow-500/8 blur-[150px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-[300px] h-[300px] bg-yellow-600/5 blur-[100px] rounded-full pointer-events-none" />
          
          {/* 3D Padlock Scene */}
          <div className="relative z-10 w-full max-w-md h-[300px] md:h-[380px] mb-8">
            <Suspense fallback={
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-20 h-20 rounded-full border-2 border-yellow-500/20 border-t-yellow-400 animate-spin" />
              </div>
            }>
              <PadlockScene />
            </Suspense>
          </div>

          <div className="max-w-4xl mx-auto text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full liquid-glass-yellow text-yellow-400 text-xs font-bold uppercase tracking-widest mb-8">
              <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></span>
              Live on Polygon
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight">
              Trust is Good. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-300 to-amber-500 text-glow-yellow">
                Code is Better.
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              The decentralized escrow protocol for the African gig economy. 
              Secure your peer-to-peer transactions with immutable smart contracts. 
              No middlemen. No &quot;sending fee&quot;. Just math.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                onClick={handleEnterApp}
                className="w-full sm:w-auto bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-black font-bold px-8 py-4 rounded-xl transition-all transform hover:scale-105 glow-yellow"
              >
                {isConnected ? "Launch Dashboard" : "Start Securing Deals"}
              </button>
              <a 
                href="#how-it-works"
                className="w-full sm:w-auto liquid-glass text-white font-medium px-8 py-4 rounded-xl"
              >
                Read the Docs
              </a>
            </div>
          </div>
        </section>

        {/* --- HOW IT WORKS --- */}
        <section id="how-it-works" className="py-24 bg-[#09090B] border-y border-white/5">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">The Digital Handshake</h2>
              <p className="text-gray-400">Three steps to eliminate the &quot;Trust Gap&quot;.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="liquid-glass p-8 rounded-3xl relative overflow-hidden shimmer-overlay group">
                <div className="w-12 h-12 bg-yellow-500/10 text-yellow-400 rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">
                  🔗
                </div>
                <h3 className="text-xl font-bold mb-3">1. Create Invoice</h3>
                <p className="text-gray-400 leading-relaxed">
                  Seller generates a payment link with item details, price (USDT), and delivery timeout.
                </p>
              </div>

              {/* Step 2 */}
              <div className="liquid-glass-yellow p-8 rounded-3xl relative overflow-hidden shimmer-overlay group">
                <div className="w-12 h-12 bg-yellow-500/15 text-yellow-400 rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">
                  🔒
                </div>
                <h3 className="text-xl font-bold mb-3">2. Lock Funds</h3>
                <p className="text-gray-400 leading-relaxed">
                  Buyer clicks the link and deposits funds into the Smart Contract Vault. Money is safe.
                </p>
              </div>

              {/* Step 3 */}
              <div className="liquid-glass p-8 rounded-3xl relative overflow-hidden shimmer-overlay group">
                <div className="w-12 h-12 bg-yellow-500/10 text-yellow-400 rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">
                  🤝
                </div>
                <h3 className="text-xl font-bold mb-3">3. Release &amp; Pay</h3>
                <p className="text-gray-400 leading-relaxed">
                  Buyer inspects the item. If satisfied, they release the funds instantly to the Seller.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* --- STATS/TRUST SECTION --- */}
        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-yellow-500/[0.02] to-transparent pointer-events-none" />
          <div className="max-w-5xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { value: '$0', label: 'Platform Fee', icon: '💰' },
                { value: '100%', label: 'On-Chain', icon: '⛓️' },
                { value: '0', label: 'Middlemen', icon: '🚫' },
                { value: '∞', label: 'Trust Level', icon: '🔐' },
              ].map((stat, i) => (
                <div key={i} className="liquid-glass p-6 rounded-2xl text-center group relative overflow-hidden shimmer-overlay">
                  <div className="text-2xl mb-2">{stat.icon}</div>
                  <div className="text-2xl md:text-3xl font-bold text-yellow-400 mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-500">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- FUTURE AI SECTION --- */}
        <section id="ai-future" className="py-24 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-yellow-900/5 to-transparent pointer-events-none" />
          
          <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-block px-3 py-1 rounded liquid-glass-yellow text-yellow-400 text-xs font-bold uppercase tracking-widest mb-6">
                Coming Q4 2026
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Meet <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-500 text-glow-yellow">Amani AI</span>.
              </h2>
              <p className="text-xl text-gray-400 mb-8 leading-relaxed">
                Disputes are messy. Humans are biased. <br/>
                <strong className="text-gray-300">Amani</strong> is our upcoming AI Mediator trained on thousands of successful commerce chats.
              </p>
              <ul className="space-y-4 text-gray-300">
                <li className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full liquid-glass-yellow flex items-center justify-center text-yellow-400 text-xs">✨</span>
                  Automated Evidence Analysis (Images &amp; Chat)
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full liquid-glass-yellow flex items-center justify-center text-yellow-400 text-xs">✨</span>
                  Instant Micro-Arbitration for deals under $100
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full liquid-glass-yellow flex items-center justify-center text-yellow-400 text-xs">✨</span>
                  Swahili &amp; Sheng Natural Language Support
                </li>
              </ul>
            </div>
            <div className="relative">
              {/* Abstract AI Visual */}
              <div className="aspect-square rounded-3xl liquid-glass p-8 relative overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
                <div className="w-32 h-32 bg-yellow-500/20 rounded-full blur-[80px] animate-pulse"></div>
                <div className="relative z-10 text-center">
                  <div className="text-6xl mb-4">🤖</div>
                  <div className="liquid-glass-yellow p-4 rounded-xl max-w-xs text-sm text-gray-300">
                    &quot;I&apos;ve analyzed the delivery photo. The timestamp matches the seller&apos;s claim. Releasing funds...&quot;
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- FOOTER & CONTACT --- */}
        <footer className="py-12 border-t border-white/5 bg-[#09090B]">
          <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center">
                  <span className="text-black text-sm font-bold">🔒</span>
                </div>
                <span className="text-xl font-bold">AHADI</span>
              </div>
              <p className="text-gray-500 max-w-xs">
                Building the trust layer for the African internet economy. Secure, transparent, and immutable.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold mb-4 text-white">Platform</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-yellow-400 transition-colors">Dashboard</a></li>
                <li><a href="#" className="hover:text-yellow-400 transition-colors">Smart Contracts</a></li>
                <li><a href="#" className="hover:text-yellow-400 transition-colors">Security Audit</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-white">Contact</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="mailto:support@ahadi.com" className="hover:text-yellow-400 transition-colors">support@ahadi.com</a></li>
                <li><a href="#" className="hover:text-yellow-400 transition-colors">Twitter / X</a></li>
                <li><a href="#" className="hover:text-yellow-400 transition-colors">Discord Community</a></li>
              </ul>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-white/5 text-center text-xs text-gray-600">
            © 2026 AHADI Protocol. All rights reserved.
          </div>
        </footer>
      </div>
    </>
  );
}
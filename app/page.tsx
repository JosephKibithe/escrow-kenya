"use client";

import { useAppKit } from "@reown/appkit/react";
import { useAccount } from "wagmi";
import { useEffect, useState, lazy, Suspense } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import LoadingScreen from "./components/LoadingScreen";
import TextScramble from "./components/TextScramble";
import DashboardPreview from "./components/DashboardPreview";
import { Sparkles, Bot } from "lucide-react";

const PadlockScene = lazy(() => import("./components/PadlockScene"));

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

      <div className="min-h-screen bg-[#0A0A0A] text-white selection:bg-yellow-500/30 font-sans grid-bg relative overflow-x-hidden">
        {/* Aurex-style Glow Orbs */}
        <div className="glow-orb-tl" />
        <div className="glow-orb-tr" />
        <div className="glow-orb-br" />

        {/* --- NAVIGATION --- */}
        <nav className="fixed top-0 w-full z-50 liquid-glass-nav">
          <div className="w-full px-6 md:px-16 h-24 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10">
                <Image
                  src="/padlock-logo.webp"
                  alt="AHADI Logo"
                  fill
                  className="object-contain drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]"
                />
              </div>
              <span className="text-2xl font-bold tracking-tight text-white font-orbitron">
                AHADI
              </span>
            </div>
            <div className="hidden md:flex items-center gap-10 text-sm font-medium text-gray-400">
              <a
                href="#how-it-works"
                className="hover:text-yellow-400 transition-colors duration-300"
              >
                How it Works
              </a>
              <a
                href="#features"
                className="hover:text-yellow-400 transition-colors duration-300"
              >
                Features
              </a>
              <a
                href="#ai-future"
                className="hover:text-yellow-400 transition-colors duration-300"
              >
                Ahadi AI
              </a>
              <a
                href="/docs"
                className="hover:text-yellow-400 transition-colors duration-300"
              >
                Docs
              </a>
            </div>
            <button
              onClick={handleEnterApp}
              className="liquid-glass-button text-yellow-400 px-8 py-3 rounded-full text-sm font-bold tracking-wide"
            >
              {isConnected ? "Go to Dashboard →" : "Sign In"}
            </button>
          </div>
        </nav>

        {/* --- HERO SECTION --- */}
        <section className="relative min-h-screen flex items-center pt-32 pb-20 px-6 md:px-16 overflow-hidden">
          {/* Background Glows */}
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-yellow-500/5 blur-[120px] rounded-full pointer-events-none translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-yellow-600/5 blur-[100px] rounded-full pointer-events-none -translate-x-1/3 translate-y-1/3" />

          <div className="w-full h-full grid lg:grid-cols-2 gap-16 items-center max-w-[1800px] mx-auto">
            {/* LEFT COLUMN: Text Content */}
            <div className="relative z-10 flex flex-col items-start text-left">
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full liquid-glass-yellow text-yellow-400 text-xs font-bold uppercase tracking-widest mb-10 border border-yellow-500/20">
                <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse shadow-[0_0_10px_#FACC15]"></span>
                Live on Polygon Mainnet
              </div>

              <h1 className="text-6xl lg:text-8xl font-black tracking-tighter mb-8 leading-[0.9] font-orbitron">
                <div className="mb-2">
                  <TextScramble text="Trust is Good." delay={300} speed={50} />
                </div>
                <div className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-200 to-amber-500 text-glow-yellow">
                  <TextScramble
                    text="Code is Better."
                    delay={1200}
                    speed={50}
                  />
                </div>
              </h1>

              <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-2xl leading-relaxed font-light">
                The escrow protocol that doesn't care about your feelings.{" "}
                <br />
                <span className="text-gray-100 font-semibold">
                  Lock funds. Deliver goods. Get paid.
                </span>
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-6 w-full sm:w-auto">
                <button
                  onClick={handleEnterApp}
                  className="w-full sm:w-auto liquid-glass-cta text-yellow-400 font-extrabold text-lg px-10 py-5 rounded-2xl transition-all duration-300"
                >
                  {isConnected ? "Launch Dashboard" : "Start Securing Deals"}
                </button>
                <a
                  href="/docs"
                  className="w-full sm:w-auto liquid-glass text-white font-semibold px-10 py-5 rounded-2xl transition-all duration-300 hover:border-yellow-500/30 flex items-center justify-center gap-2 group"
                >
                  Read the Docs
                  <span className="group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </a>
              </div>
            </div>

            {/* RIGHT COLUMN: 3D Scene + Stats */}
            <div className="relative z-10 w-full h-[600px] flex items-center justify-center lg:justify-end">
              {/* 3D Padlock Container */}
              <div className="absolute inset-0 z-0">
                <Suspense
                  fallback={
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-24 h-24 rounded-full border-4 border-yellow-500/20 border-t-yellow-400 animate-spin" />
                    </div>
                  }
                >
                  <PadlockScene />
                </Suspense>
              </div>

              {/* Floating Stats - Integrated into the scene layout */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col gap-8 z-10 pointer-events-none select-none">
                {[
                  { value: "$0", label: "Platform Fee" },
                  { value: "No Limit", label: "Daily Volume" },
                  { value: "10s", label: "Settlement" },
                ].map((stat, i) => (
                  <div
                    key={i}
                    className="text-right backdrop-blur-sm bg-black/20 p-4 rounded-xl border border-white/5 border-r-0 rounded-r-none translate-x-4"
                  >
                    <div className="text-5xl font-black text-white mb-1 tracking-tighter font-orbitron">
                      {stat.value}
                    </div>
                    <div className="text-xs font-bold text-yellow-500 uppercase tracking-widest">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* --- HOW IT WORKS --- */}
        <section
          id="how-it-works"
          className="py-24 bg-[#09090B] border-y border-white/5"
        >
          <div className="w-full px-6 md:px-16">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 font-orbitron">
                The Digital Handshake
              </h2>
              <p className="text-gray-400">
                Three steps to eliminate the &quot;Trust Gap&quot;.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  num: "01",
                  title: "Create Invoice",
                  desc: "Seller generates a payment link with item details, price in USDT, and a delivery timeout.",
                  accent: false,
                },
                {
                  num: "02",
                  title: "Lock Funds",
                  desc: "Buyer clicks the link and deposits into the Smart Contract Vault. Money is safe.",
                  accent: true,
                },
                {
                  num: "03",
                  title: "Release & Pay",
                  desc: "Buyer inspects the item. Satisfied? Release the funds instantly to the Seller.",
                  accent: false,
                },
              ].map((step) => (
                <div
                  key={step.num}
                  className={`${step.accent ? "liquid-glass-yellow" : "liquid-glass"} p-8 rounded-3xl relative overflow-hidden shimmer-overlay group`}
                >
                  <div className="step-number text-4xl font-bold text-yellow-500/20 mb-4 group-hover:text-yellow-500/40 transition-colors duration-300 font-orbitron">
                    {step.num}
                  </div>
                  <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- DASHBOARD PREVIEW --- */}
        <section id="features">
          <DashboardPreview />
        </section>

        {/* --- FUTURE AI SECTION --- */}
        <section id="ai-future" className="py-24 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-yellow-900/5 to-transparent pointer-events-none" />

          <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-block px-3 py-1 rounded liquid-glass-yellow text-yellow-400 text-xs font-bold uppercase tracking-widest mb-6">
                Coming Q4 2026
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 font-orbitron">
                Meet{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-500 text-glow-yellow">
                  Amani AI
                </span>
                .
              </h2>
              <p className="text-xl text-gray-400 mb-8 leading-relaxed">
                Disputes are messy. Humans are biased. <br />
                <strong className="text-gray-300">Amani</strong> is our upcoming
                AI Mediator trained on thousands of successful commerce chats.
              </p>

              <ul className="space-y-4 text-gray-300">
                <li className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full liquid-glass-yellow flex items-center justify-center text-yellow-400">
                    <Sparkles className="w-4 h-4" />
                  </span>
                  Automated Evidence Analysis (Images &amp; Chat)
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full liquid-glass-yellow flex items-center justify-center text-yellow-400">
                    <Sparkles className="w-4 h-4" />
                  </span>
                  Instant Micro-Arbitration for deals under $100
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full liquid-glass-yellow flex items-center justify-center text-yellow-400">
                    <Sparkles className="w-4 h-4" />
                  </span>
                  Swahili &amp; Sheng Natural Language Support
                </li>
              </ul>
            </div>
            <div className="relative">
              {/* Abstract AI Visual */}
              <div className="aspect-square rounded-3xl liquid-glass p-8 relative overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
                <div className="w-32 h-32 bg-yellow-500/20 rounded-full blur-[80px] animate-pulse"></div>
                <div className="relative z-10 text-center flex flex-col items-center">
                  <Bot className="w-16 h-16 text-yellow-400 mb-4" />
                  <div className="liquid-glass-yellow p-4 rounded-xl max-w-xs text-sm text-gray-300">
                    &quot;I&apos;ve analyzed the delivery photo. The timestamp
                    matches the seller&apos;s claim. Releasing funds...&quot;
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
                <div className="relative w-8 h-8">
                  <Image
                    src="/padlock-logo.webp"
                    alt="AHADI Logo"
                    fill
                    className="object-contain drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]"
                  />
                </div>
                <span className="text-xl font-bold">AHADI</span>
              </div>
              <p className="text-gray-500 max-w-xs">
                Building the trust layer for the African internet economy.
                Secure, transparent, and immutable.
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-white">Platform</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a
                    href="/dashboard"
                    className="hover:text-yellow-400 transition-colors"
                  >
                    Dashboard
                  </a>
                </li>
                <li>
                  <a
                    href="/docs#contract-addresses"
                    className="hover:text-yellow-400 transition-colors"
                  >
                    Smart Contracts
                  </a>
                </li>
                <li>
                  <a
                    href="/docs"
                    className="hover:text-yellow-400 transition-colors"
                  >
                    Documentation
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-white">Contact</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a
                    href="mailto:support@ahadi.com"
                    className="hover:text-yellow-400 transition-colors"
                  >
                    support@ahadi.com
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-yellow-400 transition-colors"
                  >
                    Twitter / X
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-yellow-400 transition-colors"
                  >
                    Discord Community
                  </a>
                </li>
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

"use client";

import { useState, useRef, useEffect } from 'react';

import { Link, BarChart3, Lock } from 'lucide-react';

// Mock data for the cards
const features = [
  {
    id: 'create-link',
    title: 'Create a payment link',
    desc: 'Generate a secure link in seconds. Share via WhatsApp, SMS, or carrier pigeon.',
    icon: <Link className="w-6 h-6 text-yellow-400" />,
    gradient: 'from-blue-600 to-blue-900',
  },
  {
    id: 'active-deals',
    title: 'Track active deals',
    desc: 'Real-time status for every promise. Know exactly where your money sits.',
    icon: <BarChart3 className="w-6 h-6 text-yellow-400" />,
    gradient: 'from-emerald-600 to-teal-900',
  },
  {
    id: 'invoice',
    title: 'Receive & lock funds',
    desc: 'Buyer clicks. Funds lock. No "I\'ll send tomorrow" drama.',
    icon: <Lock className="w-6 h-6 text-yellow-400" />,
    gradient: 'from-purple-600 to-indigo-900',
  },
];

function GlassCard({ feature, active }: { feature: any, active: boolean }) {
  // Render different "UI Modules" based on the feature ID
  const renderContent = () => {
    switch (feature.id) {
      case 'create-link':
        return (
          <div className="flex flex-col h-full p-6">
            <div className="flex justify-between items-center mb-6">
              <span className="text-xs uppercase font-bold tracking-widest text-blue-300">New Escrow Link</span>
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            </div>
            
            <div className="space-y-5 flex-grow">
              <div>
                <div className="text-[10px] text-gray-400 mb-1.5 ml-1 font-bold tracking-wide">ITEM NAME</div>
                <div className="w-full h-10 bg-white/10 rounded-lg flex items-center px-4 border border-white/10 text-sm text-white font-medium shadow-inner">
                  MacBook Pro M3
                </div>
              </div>
              <div>
                <div className="text-[10px] text-gray-400 mb-1.5 ml-1 font-bold tracking-wide">PRICE</div>
                 <div className="flex gap-3">
                   <div className="w-2/3">
                      <div className="w-full h-10 bg-white/10 rounded-lg flex items-center px-4 border border-white/10 text-sm text-white font-medium shadow-inner">
                        1,200.00
                      </div>
                   </div>
                   <div className="w-1/3">
                      <div className="w-full h-10 bg-blue-500/20 rounded-lg flex items-center justify-center border border-blue-500/50 text-xs text-blue-200 font-bold">
                         USDT
                      </div>
                   </div>
                 </div>
              </div>
            </div>

            <div className="mt-auto w-full h-12 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-sm font-bold text-white shadow-lg shadow-blue-500/30 hover:scale-[1.02] transition-transform">
              Generate Link <Link className="w-4 h-4 ml-2" />
            </div>
          </div>
        );

      case 'active-deals':
        return (
          <div className="flex flex-col h-full p-5">
             <div className="flex justify-between items-start mb-6">
                <div>
                   <div className="text-xs font-bold text-white mb-1">iPhone 15 Pro Max</div>
                   <div className="text-[10px] text-gray-400">ID: #8821-X7</div>
                </div>
                <div className="px-2 py-1 rounded bg-emerald-500/20 border border-emerald-500/30 text-[9px] font-bold text-emerald-400 uppercase tracking-wide">
                   Funds Locked
                </div>
             </div>

             <div className="space-y-3 flex-grow">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                   <span className="text-[10px] text-gray-400">Amount</span>
                   <span className="text-sm font-bold text-white font-mono">1,450 USDT</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                   <span className="text-[10px] text-gray-400">Seller</span>
                   <span className="text-[10px] font-mono text-emerald-200 bg-emerald-500/10 px-1 rounded">0x9e...A104</span>
                </div>
                <div className="flex justify-between items-center">
                   <span className="text-[10px] text-gray-400">Timeout</span>
                   <span className="text-[10px] text-yellow-500 font-bold">23h 59m remaining</span>
                </div>
             </div>
          </div>
        );

      case 'invoice':
        return (
           <div className="flex flex-col h-full justify-between p-5 text-center">
              <div className="mx-auto">
                 <div className="inline-block px-3 py-1 rounded-full bg-yellow-500/20 border border-yellow-500/30 text-[9px] font-bold text-yellow-400 uppercase tracking-widest mb-4">
                    Incoming Invoice
                 </div>
                 <div className="text-4xl font-black text-white tracking-tight mb-1 text-glow-yellow">
                    850
                    <span className="text-base font-bold text-yellow-500 ml-1">USDT</span>
                 </div>
                 <div className="text-[10px] text-gray-400">For: Sony A7III Camera Kit</div>
              </div>

              <div className="mt-4 w-full h-10 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-600 flex items-center justify-center gap-2 text-sm font-bold text-black shadow-lg shadow-yellow-500/20">
                 <Lock className="w-4 h-4" /> Lock Funds
              </div>
           </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`w-full h-full relative rounded-2xl overflow-hidden border border-white/20 transition-all duration-500
      backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 shadow-2xl
      ${active ? 'shadow-yellow-500/20' : 'grayscale-[0.5]'}
    `}>
      {/* Noise simulating texture */}
      <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.5'/%3E%3C/svg%3E")` }}
      />
      
      {/* Inner Gradient Glow */}
      <div className={`absolute -top-24 -right-24 w-64 h-64 bg-gradient-to-br ${feature.gradient} opacity-20 blur-3xl rounded-full`} />
      <div className={`absolute -bottom-24 -left-24 w-64 h-64 bg-gradient-to-tr ${feature.gradient} opacity-20 blur-3xl rounded-full`} />

      {/* Content */}
      <div className="relative z-10 w-full h-full select-none">
        {renderContent()}
      </div>
    </div>
  );
}

export default function DashboardPreview() {
  const [activeFeature, setActiveFeature] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calculate tilt (max +/- 10 degrees)
    const xPct = (x / rect.width - 0.5) * 2; // -1 to 1
    const yPct = (y / rect.height - 0.5) * 2; // -1 to 1
    
    setTilt({ x: yPct * -10, y: xPct * 10 });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  return (
    <section id="features" className="py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-yellow-500/[0.015] to-transparent pointer-events-none" />

      <div className="w-full px-6 md:px-16 max-w-[1400px] mx-auto">
        <div className="mb-20">
          <div className="inline-block px-3 py-1 rounded liquid-glass-yellow text-yellow-400 text-xs font-bold uppercase tracking-widest mb-6">
            The Dashboard
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Everything you need.{' '}
            <span className="text-gray-500">Nothing you don&apos;t.</span>
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* LEFT: Stacking Glass Cards */}
          <div 
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="relative h-[500px] w-full flex items-center justify-center lg:justify-start perspective-1000 group"
          >
            {/* Background Orbs for Transparency Effect */}
            <div className="absolute top-1/4 left-1/4 w-40 h-40 bg-blue-500 rounded-full blur-[80px] opacity-40 animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-60 h-60 bg-yellow-500 rounded-full blur-[100px] opacity-30" />

            {features.map((feature, i) => {
              const isActive = i === activeFeature;
              
              let transform = '';
              let zIndex = 0;
              let opacity = 1;

              if (isActive) {
                // Active card gets the tilt effect
                transform = `translateX(0) scale(1) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`;
                zIndex = 20;
              } else if (i < activeFeature) {
                // Cards before active (spent)
                 transform = `translateX(-50px) scale(0.9) rotate(-6deg)`;
                 zIndex = 10 + i;
                 opacity = 0.4;
              } else {
                 // Cards after active (upcoming)
                 transform = `translateX(${(i - activeFeature) * 50}px) scale(${1 - (i - activeFeature) * 0.05}) rotate(${(i - activeFeature) * 6}deg)`;
                 zIndex = 10 - i;
                 opacity = 0.4;
              }

              return (
                <div
                  key={feature.id}
                  className="absolute w-[320px] h-[400px] transition-all duration-700 cubic-bezier(0.25, 0.46, 0.45, 0.94)"
                  style={{
                    transform,
                    zIndex,
                    opacity
                  }}
                >
                  <GlassCard feature={feature} active={isActive} />
                </div>
              );
            })}
          </div>

          {/* RIGHT: Feature List */}
          <div className="space-y-8">
            {features.map((feature, i) => (
              <div 
                key={feature.id}
                onMouseEnter={() => setActiveFeature(i)}
                className={`group cursor-pointer p-6 rounded-2xl transition-all duration-300 border liquid-glass ${
                  activeFeature === i 
                    ? 'border-yellow-500/30 translate-x-4' 
                    : 'border-transparent hover:border-white/10'
                }`}
              >
                <div className="flex items-start gap-5">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-all duration-300 ${
                    activeFeature === i ? 'bg-yellow-500 text-black scale-110 shadow-lg shadow-yellow-500/20' : 'bg-white/5 text-gray-500 group-hover:bg-white/10 group-hover:text-white'
                  }`}>
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className={`text-xl font-bold mb-2 transition-colors ${activeFeature === i ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>
                      {feature.title}
                    </h3>
                    <p className={`text-base leading-relaxed transition-colors ${activeFeature === i ? 'text-gray-300' : 'text-gray-500 group-hover:text-gray-400'}`}>
                      {feature.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}

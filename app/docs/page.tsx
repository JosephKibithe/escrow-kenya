"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  BookOpen,
  Zap,
  Shield,
  Code2,
  Users,
  ChevronRight,
  Copy,
  Check,
  ExternalLink,
  AlertTriangle,
  Info,
  ArrowLeft,
  Menu,
  X,
} from "lucide-react";

/* ─── sidebar structure ────────────────────────────────────── */

const sections = [
  {
    group: "Getting Started",
    icon: <BookOpen className="w-4 h-4" />,
    items: [
      { id: "introduction", label: "Introduction" },
      { id: "how-it-works", label: "How It Works" },
    ],
  },
  {
    group: "Smart Contract",
    icon: <Code2 className="w-4 h-4" />,
    items: [
      { id: "contract-overview", label: "Overview" },
      { id: "functions", label: "Functions Reference" },
      { id: "errors", label: "Error Codes" },
    ],
  },
  {
    group: "User Guides",
    icon: <Users className="w-4 h-4" />,
    items: [
      { id: "for-sellers", label: "For Sellers" },
      { id: "for-buyers", label: "For Buyers" },
      { id: "disputes", label: "Disputes & Resolution" },
    ],
  },
  {
    group: "Technical Reference",
    icon: <Zap className="w-4 h-4" />,
    items: [
      { id: "architecture", label: "Architecture" },
      { id: "contract-addresses", label: "Contract Addresses" },
      { id: "subgraph", label: "Subgraph & Indexing" },
    ],
  },
];

/* ─── code block component ──────────────────────────────────── */

function CodeBlock({ code, lang = "bash" }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative group my-4">
      <div className="flex items-center justify-between px-4 py-2 rounded-t-xl bg-white/5 border border-white/10 border-b-0">
        <span className="text-xs text-yellow-500 font-mono uppercase tracking-widest">
          {lang}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-yellow-400 transition-colors duration-200"
        >
          {copied ? (
            <Check className="w-3.5 h-3.5" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <pre className="rounded-b-xl bg-black/60 border border-white/10 p-4 overflow-x-auto text-sm font-mono text-gray-300 leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}

/* ─── callout component ─────────────────────────────────────── */

function Callout({
  type = "info",
  children,
}: {
  type?: "info" | "warning" | "tip";
  children: React.ReactNode;
}) {
  const styles = {
    info: {
      outer: "border-yellow-500/20 bg-yellow-500/5",
      icon: <Info className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />,
    },
    warning: {
      outer: "border-red-500/20 bg-red-500/5",
      icon: <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />,
    },
    tip: {
      outer: "border-green-500/20 bg-green-500/5",
      icon: <Zap className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />,
    },
  };
  const s = styles[type];
  return (
    <div
      className={`flex gap-3 rounded-xl border p-4 my-4 text-sm text-gray-300 leading-relaxed ${s.outer}`}
    >
      {s.icon}
      <div>{children}</div>
    </div>
  );
}

/* ─── function row ──────────────────────────────────────────── */

function FnRow({
  name,
  sig,
  access,
  desc,
}: {
  name: string;
  sig: string;
  access: string;
  desc: string;
}) {
  return (
    <div className="rounded-xl liquid-glass px-5 py-4 my-3">
      <div className="flex items-start gap-3 flex-wrap">
        <span className="font-mono text-yellow-400 font-bold text-sm">
          {name}
        </span>
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-bold uppercase tracking-widest ${
            access === "admin"
              ? "bg-red-500/15 text-red-400 border border-red-500/20"
              : "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20"
          }`}
        >
          {access}
        </span>
      </div>
      <code className="block text-xs text-gray-500 font-mono mt-1 mb-2">
        {sig}
      </code>
      <p className="text-sm text-gray-400">{desc}</p>
    </div>
  );
}

/* ─── main page ─────────────────────────────────────────────── */

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState("introduction");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // Highlight sidebar item based on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActiveSection(e.target.id);
        });
      },
      { rootMargin: "-20% 0px -75% 0px" },
    );
    document
      .querySelectorAll("[data-doc-section]")
      .forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans grid-bg relative">
      {/* Glow orbs */}
      <div className="glow-orb-tl" />
      <div className="glow-orb-br" />

      {/* ─── TOP NAV ─── */}
      <nav className="fixed top-0 w-full z-50 liquid-glass-nav">
        <div className="w-full px-6 md:px-10 h-16 flex items-center justify-between gap-4">
          {/* Logo / back */}
          <Link
            href="/"
            className="flex items-center gap-2.5 text-gray-400 hover:text-yellow-400 transition-colors duration-200 group shrink-0"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
            <div className="relative w-6 h-6">
              <Image
                src="/padlock-logo.webp"
                alt="AHADI"
                fill
                className="object-contain"
              />
            </div>
            <span className="font-bold text-white font-orbitron text-sm hidden sm:block">
              AHADI
            </span>
            <span className="text-gray-600 hidden sm:block">/</span>
            <span className="hidden sm:block text-sm">Docs</span>
          </Link>

          <div className="flex items-center gap-4">
            <a
              href="https://polygonscan.com/address/0x7445B80f07ffcC031cecd3FC645878Baa8373819"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500 hover:text-yellow-400 transition-colors duration-200"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Contract
            </a>
            <Link
              href="/"
              className="liquid-glass-button text-yellow-400 px-5 py-2 rounded-full text-xs font-bold tracking-wide"
            >
              Launch App →
            </Link>
            {/* Mobile sidebar toggle */}
            <button
              className="lg:hidden text-gray-400 hover:text-yellow-400 transition-colors"
              onClick={() => setSidebarOpen((v) => !v)}
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* ─── LAYOUT ─── */}
      <div className="flex pt-16 min-h-screen max-w-[1400px] mx-auto">
        {/* ─── SIDEBAR ─── */}
        <aside
          className={`
            fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 z-40 overflow-y-auto
            lg:sticky lg:top-16 lg:self-start lg:block
            transition-transform duration-300 lg:translate-x-0
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
            bg-[#0A0A0A] lg:bg-transparent border-r border-white/5 px-4 py-8
          `}
        >
          {sections.map((sec) => (
            <div key={sec.group} className="mb-6">
              <div className="flex items-center gap-2 text-yellow-500 text-xs font-bold uppercase tracking-widest mb-2 px-2">
                {sec.icon}
                {sec.group}
              </div>
              <ul className="space-y-0.5">
                {sec.items.map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => scrollTo(item.id)}
                      className={`w-full text-left text-sm px-3 py-1.5 rounded-lg transition-all duration-200 ${
                        activeSection === item.id
                          ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                          : "text-gray-500 hover:text-gray-200 hover:bg-white/5"
                      }`}
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="mt-8 px-2">
            <div className="rounded-xl liquid-glass-yellow p-4 text-xs text-gray-400 leading-relaxed">
              <p className="text-yellow-400 font-bold mb-1">
                Live on Polygon Mainnet
              </p>
              Contract:{" "}
              <code className="text-gray-300 break-all">0x7445...3819</code>
            </div>
          </div>
        </aside>

        {/* Overlay for mobile sidebar */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ─── CONTENT ─── */}
        <main
          ref={contentRef}
          className="flex-1 min-w-0 px-6 md:px-12 lg:px-16 py-12 pb-32"
        >
          {/* ── INTRODUCTION ── */}
          <section
            id="introduction"
            data-doc-section
            className="mb-20 scroll-mt-24"
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="w-8 h-8 rounded-lg liquid-glass-yellow flex items-center justify-center text-yellow-400">
                <BookOpen className="w-4 h-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-widest text-yellow-500">
                Getting Started
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-6 font-orbitron">
              AHADI{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-500 text-glow-yellow">
                Docs
              </span>
            </h1>
            <p className="text-xl text-gray-400 mb-8 leading-relaxed max-w-2xl">
              <strong className="text-gray-200">AHADI</strong> (Swahili for
              "Promise") is a trustless escrow protocol on the Polygon
              blockchain. It eliminates the need for intermediaries when
              transacting with unknown parties — your funds are held by
              immutable code, not a person.
            </p>

            <div className="grid sm:grid-cols-3 gap-4 mb-8">
              {[
                {
                  icon: <Shield className="w-5 h-5" />,
                  title: "Non-custodial",
                  desc: "Funds held by smart contract, never by AHADI.",
                },
                {
                  icon: <Zap className="w-5 h-5" />,
                  title: "10-second settlement",
                  desc: "Release or refund executes instantly on-chain.",
                },
                {
                  icon: <Code2 className="w-5 h-5" />,
                  title: "Open source",
                  desc: "All contract logic is verifiable on PolygonScan.",
                },
              ].map((f) => (
                <div key={f.title} className="rounded-2xl liquid-glass p-5">
                  <div className="text-yellow-400 mb-3">{f.icon}</div>
                  <div className="font-bold text-sm mb-1">{f.title}</div>
                  <div className="text-xs text-gray-500 leading-relaxed">
                    {f.desc}
                  </div>
                </div>
              ))}
            </div>

            <Callout type="info">
              AHADI is currently deployed on{" "}
              <strong className="text-yellow-400">Polygon Amoy Testnet</strong>.
              Always verify contract addresses in{" "}
              <code>constants/index.ts</code> before mainnet deployment.
            </Callout>
          </section>

          {/* ── HOW IT WORKS ── */}
          <section
            id="how-it-works"
            data-doc-section
            className="mb-20 scroll-mt-24"
          >
            <h2 className="text-2xl font-bold mb-2 font-orbitron flex items-center gap-2">
              <ChevronRight className="w-5 h-5 text-yellow-500" /> How It Works
            </h2>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Every deal goes through the same trustless lifecycle, enforced
              on-chain.
            </p>
            <div className="space-y-4">
              {[
                {
                  step: "01",
                  title: "Seller creates an invoice",
                  body: "The seller generates a payment link via the dashboard. The link encodes the item description, USDT price, and a delivery timeout.",
                },
                {
                  step: "02",
                  title: "Buyer locks funds",
                  body: "The buyer opens the link, connects their wallet, approves the USDT transfer, and calls createDeal(). Funds move from the buyer's wallet into the smart contract vault.",
                },
                {
                  step: "03",
                  title: "Goods are delivered",
                  body: "The seller delivers the goods off-chain (physical or digital). Both parties can view the deal status in their dashboard.",
                },
                {
                  step: "04",
                  title: "Funds are released",
                  body: "Once satisfied, the buyer calls releaseFunds(). The USDT is transferred directly to the seller's wallet instantly, with no platform fee.",
                },
                {
                  step: "05",
                  title: "Dispute or timeout",
                  body: "If delivery fails, the buyer can raise a dispute or wait for the timeout to claim an automatic refund. Disputes are resolved by the AHADI admin with off-chain evidence.",
                },
              ].map((s) => (
                <div
                  key={s.step}
                  className="flex gap-4 rounded-2xl liquid-glass p-5"
                >
                  <div className="text-3xl font-black text-yellow-500/20 font-orbitron shrink-0 w-10">
                    {s.step}
                  </div>
                  <div>
                    <div className="font-bold text-white mb-1">{s.title}</div>
                    <div className="text-sm text-gray-400 leading-relaxed">
                      {s.body}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── CONTRACT OVERVIEW ── */}
          <section
            id="contract-overview"
            data-doc-section
            className="mb-20 scroll-mt-24"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="w-8 h-8 rounded-lg liquid-glass-yellow flex items-center justify-center text-yellow-400">
                <Code2 className="w-4 h-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-widest text-yellow-500">
                Smart Contract
              </span>
            </div>
            <h2 className="text-2xl font-bold mb-2 font-orbitron flex items-center gap-2">
              <ChevronRight className="w-5 h-5 text-yellow-500" /> Contract
              Overview
            </h2>
            <p className="text-gray-400 mb-6 leading-relaxed max-w-2xl">
              The <code className="text-yellow-300">AhadiEscrow.sol</code>{" "}
              contract is written in Solidity 0.8.19 and uses the OpenZeppelin{" "}
              <code className="text-yellow-300">ReentrancyGuard</code> and{" "}
              <code className="text-yellow-300">SafeERC20</code> libraries. It
              supports native ERC-20 USDT deposits with time-locked expiry.
            </p>
            <h3 className="text-sm font-bold uppercase tracking-widest text-yellow-500 mb-2">
              Deal State Machine
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {["Active", "Completed", "Refunded", "Disputed"].map((s) => (
                <div
                  key={s}
                  className="rounded-xl liquid-glass p-3 text-center"
                >
                  <div
                    className={`w-2 h-2 rounded-full mx-auto mb-2 ${
                      s === "Active"
                        ? "bg-yellow-400 animate-pulse"
                        : s === "Completed"
                          ? "bg-green-400"
                          : s === "Refunded"
                            ? "bg-blue-400"
                            : "bg-red-400"
                    }`}
                  />
                  <div className="text-xs font-bold text-gray-300">{s}</div>
                </div>
              ))}
            </div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-yellow-500 mb-2">
              Deal Struct
            </h3>
            <CodeBlock
              lang="solidity"
              code={`struct Deal {
    uint256 id;
    address buyer;
    address seller;
    uint256 amount;       // in USDT (6 decimals)
    bool    isCompleted;
    bool    isDisputed;
    uint256 createdAt;
    uint256 expiryTime;   // unix timestamp
}`}
            />
          </section>

          {/* ── FUNCTIONS ── */}
          <section
            id="functions"
            data-doc-section
            className="mb-20 scroll-mt-24"
          >
            <h2 className="text-2xl font-bold mb-2 font-orbitron flex items-center gap-2">
              <ChevronRight className="w-5 h-5 text-yellow-500" /> Functions
              Reference
            </h2>
            <p className="text-gray-400 mb-6">
              All state-changing functions require a connected wallet. View
              functions can be called without gas.
            </p>

            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">
              User Functions
            </h3>
            <FnRow
              name="createDeal"
              sig="createDeal(address _seller, uint256 _amount, uint256 _timeoutSeconds) → uint256 dealId"
              access="public"
              desc="Locks USDT from the buyer into the contract vault and creates a new deal. Returns the new deal ID. The buyer must approve the escrow contract to spend at least _amount USDT first."
            />
            <FnRow
              name="releaseFunds"
              sig="releaseFunds(uint256 _dealId)"
              access="buyer only"
              desc="Marks the deal as completed and transfers USDT to the seller. Can only be called by the buyer of the specified deal while the deal is still active."
            />
            <FnRow
              name="refundBuyer"
              sig="refundBuyer(uint256 _dealId)"
              access="seller only"
              desc="Allows the seller to voluntarily cancel an active deal and refund the buyer. Useful when goods cannot be delivered."
            />
            <FnRow
              name="refundTimedOutDeal"
              sig="refundTimedOutDeal(uint256 _dealId)"
              access="buyer only"
              desc="Returns USDT to the buyer if the deal's expiryTime has passed and the deal is still active. No admin approval needed."
            />
            <FnRow
              name="raiseDispute"
              sig="raiseDispute(uint256 _dealId)"
              access="buyer or seller"
              desc="Flags a deal as disputed, freezing it until the AHADI admin resolves it. Either party can raise a dispute on an active deal."
            />

            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3 mt-8">
              Admin Functions
            </h3>
            <FnRow
              name="resolveDispute"
              sig="resolveDispute(uint256 _dealId, address _winner)"
              access="admin"
              desc="Transfers the locked USDT to the winning party (_winner must be buyer or seller). Only callable by the contract owner."
            />
            <FnRow
              name="updateFee"
              sig="updateFee(uint256 _newFee)"
              access="admin"
              desc="Updates the platform fee in basis points (e.g. 100 = 1%). Currently set to 0 — the platform charges no fees."
            />

            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3 mt-8">
              View Functions
            </h3>
            <FnRow
              name="getDeal"
              sig="getDeal(uint256 _dealId) → Deal"
              access="view"
              desc="Returns the full Deal struct for a given deal ID. Use this to check the status, parties, amount, and expiry of any deal."
            />
            <FnRow
              name="getContractStats"
              sig="getContractStats() → (totalDeals, locked, balance, excess)"
              access="view"
              desc="Returns aggregate stats: total deals created, total USDT locked, current USDT balance, and any excess (unclaimed)."
            />
          </section>

          {/* ── ERRORS ── */}
          <section id="errors" data-doc-section className="mb-20 scroll-mt-24">
            <h2 className="text-2xl font-bold mb-6 font-orbitron flex items-center gap-2">
              <ChevronRight className="w-5 h-5 text-yellow-500" /> Error Codes
            </h2>
            <p className="text-gray-400 mb-6">
              The contract uses custom errors for gas-efficient reverts. When a
              transaction fails, decode the revert reason to get the exact error
              name.
            </p>
            <div className="rounded-2xl overflow-hidden border border-white/5">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-white/5 text-gray-400 text-xs uppercase tracking-widest">
                    <th className="text-left px-5 py-3">Error</th>
                    <th className="text-left px-5 py-3 hidden sm:table-cell">
                      When it fires
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["InvalidDealID", "Deal ID does not exist"],
                    [
                      "Unauthorized",
                      "Caller is not permitted to perform this action",
                    ],
                    ["DealClosed", "Deal is already completed or refunded"],
                    [
                      "DealDisputed",
                      "Deal is in a disputed state — frozen until resolved",
                    ],
                    [
                      "DealNotDisputed",
                      "resolveDispute called on a non-disputed deal",
                    ],
                    [
                      "DealNotTimedOut",
                      "refundTimedOutDeal called before expiry",
                    ],
                    [
                      "InvalidState",
                      "Function called on a deal in the wrong state",
                    ],
                    ["InvalidAmount", "Amount is zero or below minimum"],
                    ["InvalidAddress", "Address is zero or disallowed"],
                    ["SelfDeal", "Buyer and seller cannot be the same address"],
                    [
                      "TimeoutRange",
                      "Timeout is outside the allowed min–max range",
                    ],
                  ].map(([name, desc], i) => (
                    <tr
                      key={name}
                      className={`border-t border-white/5 ${i % 2 === 0 ? "bg-white/[0.01]" : ""}`}
                    >
                      <td className="px-5 py-3 font-mono text-yellow-400">
                        {name}
                      </td>
                      <td className="px-5 py-3 text-gray-400 hidden sm:table-cell">
                        {desc}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* ── FOR SELLERS ── */}
          <section
            id="for-sellers"
            data-doc-section
            className="mb-20 scroll-mt-24"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="w-8 h-8 rounded-lg liquid-glass-yellow flex items-center justify-center text-yellow-400">
                <Users className="w-4 h-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-widest text-yellow-500">
                User Guides
              </span>
            </div>
            <h2 className="text-2xl font-bold mb-2 font-orbitron flex items-center gap-2">
              <ChevronRight className="w-5 h-5 text-yellow-500" /> For Sellers
            </h2>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Sellers create deals by generating payment links and sharing them
              with buyers. No coding required.
            </p>
            <ol className="space-y-4">
              {[
                [
                  "Connect your wallet",
                  "Click 'Sign In' on the landing page and connect with your preferred wallet (MetaMask, Coinbase Wallet, etc.). Make sure you're on the Polygon Mainnet network.",
                ],
                [
                  "Navigate to the Seller tab",
                  "In the Dashboard, select the Seller tab and click 'Generate Payment Request'.",
                ],
                [
                  "Fill in deal details",
                  "Enter the item name, the price in USDT, and the delivery timeout (in hours). The minimum timeout is 1 hour; maximum is 90 days.",
                ],
                [
                  "Copy and share the link",
                  "AHADI generates a unique URL that encodes all deal parameters. Share this link with your buyer via any channel — Instagram DM, WhatsApp, email, etc.",
                ],
                [
                  "Wait for the buyer to lock funds",
                  "Once the buyer locks USDT, you'll see the deal appear in 'My Deals' with status Active. You'll receive an on-chain event.",
                ],
                [
                  "Deliver and get paid",
                  "Deliver the goods. When the buyer releases funds, the USDT arrives in your wallet instantly.",
                ],
              ].map(([title, body], i) => (
                <li key={i} className="flex gap-4 rounded-2xl liquid-glass p-5">
                  <span className="w-7 h-7 rounded-full liquid-glass-yellow flex items-center justify-center text-yellow-400 font-bold text-xs shrink-0">
                    {i + 1}
                  </span>
                  <div>
                    <div className="font-semibold text-white mb-1">{title}</div>
                    <div className="text-sm text-gray-400 leading-relaxed">
                      {body}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {/* ── FOR BUYERS ── */}
          <section
            id="for-buyers"
            data-doc-section
            className="mb-20 scroll-mt-24"
          >
            <h2 className="text-2xl font-bold mb-2 font-orbitron flex items-center gap-2">
              <ChevronRight className="w-5 h-5 text-yellow-500" /> For Buyers
            </h2>
            <p className="text-gray-400 mb-6 leading-relaxed">
              When you receive a payment link from a seller, here's what happens
              step by step.
            </p>
            <ol className="space-y-4">
              {[
                [
                  "Open the payment link",
                  "The seller's link takes you to the AHADI deal page with all details pre-filled: seller address, item name, price, and timeout.",
                ],
                [
                  "Connect your wallet",
                  "Click 'Sign In'. Your wallet must hold at least the deal amount in USDT (Polygon Mainnet) plus a small amount of MATIC for gas.",
                ],
                [
                  "Approve USDT spending",
                  "AHADI will ask you to sign two transactions: (1) Approve the escrow contract to spend your USDT, (2) Call createDeal() to lock the funds.",
                ],
                [
                  "Receive the goods",
                  "The seller is now incentivised to deliver. Your funds are safe in the contract — they can only go to the seller if you release them, or back to you if you raise a dispute or the timeout expires.",
                ],
                [
                  "Release funds or dispute",
                  "Inspect the goods. Happy? Click 'Release Funds'. Problem? Click 'Raise Dispute' and submit your evidence.",
                ],
              ].map(([title, body], i) => (
                <li key={i} className="flex gap-4 rounded-2xl liquid-glass p-5">
                  <span className="w-7 h-7 rounded-full liquid-glass-yellow flex items-center justify-center text-yellow-400 font-bold text-xs shrink-0">
                    {i + 1}
                  </span>
                  <div>
                    <div className="font-semibold text-white mb-1">{title}</div>
                    <div className="text-sm text-gray-400 leading-relaxed">
                      {body}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
            <Callout type="warning">
              <strong className="text-red-400">
                Never release funds before inspecting the goods.
              </strong>{" "}
              Once released, the transaction is irreversible. AHADI cannot
              reverse a voluntary fund release.
            </Callout>
          </section>

          {/* ── DISPUTES ── */}
          <section
            id="disputes"
            data-doc-section
            className="mb-20 scroll-mt-24"
          >
            <h2 className="text-2xl font-bold mb-2 font-orbitron flex items-center gap-2">
              <ChevronRight className="w-5 h-5 text-yellow-500" /> Disputes &
              Resolution
            </h2>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Either party can raise a dispute while the deal is active. Once
              raised, the deal is frozen — neither party can release or refund
              until an admin resolves it.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              <div className="rounded-2xl liquid-glass p-5">
                <div className="font-bold text-white mb-2">
                  When to raise a dispute
                </div>
                <ul className="text-sm text-gray-400 space-y-1 list-disc list-inside leading-relaxed">
                  <li>Goods not delivered before timeout</li>
                  <li>Item significantly differs from description</li>
                  <li>Counterfeit or damaged goods received</li>
                  <li>Seller refuses to communicate</li>
                </ul>
              </div>
              <div className="rounded-2xl liquid-glass p-5">
                <div className="font-bold text-white mb-2">
                  Resolution evidence
                </div>
                <ul className="text-sm text-gray-400 space-y-1 list-disc list-inside leading-relaxed">
                  <li>Chat screenshots (WhatsApp, Instagram DMs)</li>
                  <li>Photos or video of delivered item</li>
                  <li>Tracking numbers / courier receipts</li>
                  <li>Transaction receipts or invoices</li>
                </ul>
              </div>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              Submit evidence to{" "}
              <a
                href="mailto:support@ahadi.com"
                className="text-yellow-400 hover:underline"
              >
                support@ahadi.com
              </a>{" "}
              with your deal ID. The admin will call{" "}
              <code className="text-yellow-300">
                resolveDispute(dealId, winner)
              </code>{" "}
              on-chain within 48 hours. In Q4 2026, this manual step will be
              replaced by <strong className="text-white">Amani AI</strong> for
              sub-$100 disputes.
            </p>
          </section>

          {/* ── ARCHITECTURE ── */}
          <section
            id="architecture"
            data-doc-section
            className="mb-20 scroll-mt-24"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="w-8 h-8 rounded-lg liquid-glass-yellow flex items-center justify-center text-yellow-400">
                <Zap className="w-4 h-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-widest text-yellow-500">
                Technical Reference
              </span>
            </div>
            <h2 className="text-2xl font-bold mb-2 font-orbitron flex items-center gap-2">
              <ChevronRight className="w-5 h-5 text-yellow-500" /> Architecture
            </h2>
            <p className="text-gray-400 mb-6 leading-relaxed">
              AHADI is a three-layer system: a Solidity smart contract, a React
              frontend, and a Graph Protocol subgraph for indexing.
            </p>
            <div className="space-y-4">
              {[
                {
                  layer: "Frontend",
                  tech: "Next.js 15 (App Router) · React 19 · TailwindCSS v4",
                  desc: "Server-rendered React app with client-side wallet hooks. React Three Fiber powers the 3D padlock. Reown AppKit / Wagmi handle all wallet connections and chain interactions.",
                },
                {
                  layer: "Smart Contract",
                  tech: "Solidity 0.8.19 · OpenZeppelin · Polygon PoS",
                  desc: "Single-file escrow contract with ReentrancyGuard protection. Stores deal state in a mapping(uint256 => Deal). All events are emitted for subgraph indexing.",
                },
                {
                  layer: "Indexer",
                  tech: "The Graph · AssemblyScript · IPFS",
                  desc: "Subgraph listens to DealCreated, FundsReleased, DisputeRaised, and DisputeResolved events and exposes a GraphQL API for the dashboard's deal history queries.",
                },
              ].map((l) => (
                <div key={l.layer} className="rounded-2xl liquid-glass p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="font-bold text-lg font-orbitron text-white">
                      {l.layer}
                    </div>
                    <div className="text-xs text-yellow-500 font-mono">
                      {l.tech}
                    </div>
                  </div>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    {l.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* ── CONTRACT ADDRESSES ── */}
          <section
            id="contract-addresses"
            data-doc-section
            className="mb-20 scroll-mt-24"
          >
            <h2 className="text-2xl font-bold mb-6 font-orbitron flex items-center gap-2">
              <ChevronRight className="w-5 h-5 text-yellow-500" /> Contract
              Addresses
            </h2>
            <div className="rounded-2xl overflow-hidden border border-white/5">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-white/5 text-gray-400 text-xs uppercase tracking-widest">
                    <th className="text-left px-5 py-3">Contract</th>
                    <th className="text-left px-5 py-3">Network</th>
                    <th className="text-left px-5 py-3">Address</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    [
                      "AhadiEscrow.sol",
                      "Polygon (Mainnet)",
                      "0x7445B80f07ffcC031cecd3FC645878Baa8373819",
                    ],
                    [
                      "USDT (Mainnet)",
                      "Polygon (Mainnet)",
                      "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
                    ],
                  ].map(([name, network, addr]) => (
                    <tr key={addr} className="border-t border-white/5">
                      <td className="px-5 py-3 font-medium text-white">
                        {name}
                      </td>
                      <td className="px-5 py-3 text-gray-400">{network}</td>
                      <td className="px-5 py-3 font-mono text-yellow-400 text-xs break-all">
                        <a
                          href={`https://polygonscan.com/address/${addr}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline flex items-center gap-1"
                        >
                          {addr}
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* ── SUBGRAPH ── */}
          <section
            id="subgraph"
            data-doc-section
            className="mb-20 scroll-mt-24"
          >
            <h2 className="text-2xl font-bold mb-6 font-orbitron flex items-center gap-2">
              <ChevronRight className="w-5 h-5 text-yellow-500" /> Subgraph &
              Indexing
            </h2>
            <p className="text-gray-400 mb-6 leading-relaxed">
              The AHADI subgraph indexes all on-chain events from the escrow
              contract. Query it via GraphQL to get deal history, stats, and
              event timelines without scanning the blockchain yourself.
            </p>
            <h3 className="text-sm font-bold uppercase tracking-widest text-yellow-500 mb-2">
              Example Query
            </h3>
            <CodeBlock
              lang="graphql"
              code={`{
  deals(orderBy: createdAt, orderDirection: desc, first: 10) {
    id
    buyer
    seller
    amount
    isCompleted
    isDisputed
    createdAt
    expiryTime
  }
}`}
            />
            <h3 className="text-sm font-bold uppercase tracking-widest text-yellow-500 mb-2 mt-6">
              Indexed Events
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                ["DealCreated", "Emitted when a buyer locks funds"],
                ["FundsReleased", "Emitted when buyer releases to seller"],
                ["BuyerRefunded", "Emitted on refund or timeout claim"],
                ["DisputeRaised", "Emitted when a dispute is filed"],
                ["DisputeResolved", "Emitted when admin resolves dispute"],
              ].map(([event, desc]) => (
                <div
                  key={event}
                  className="flex items-start gap-3 rounded-xl liquid-glass px-4 py-3"
                >
                  <div className="w-2 h-2 rounded-full bg-yellow-400 mt-1.5 shrink-0" />
                  <div>
                    <div className="font-mono text-xs text-yellow-400 font-bold">
                      {event}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">{desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-xl liquid-glass-yellow p-4 text-sm text-gray-400">
              <span className="text-yellow-400 font-bold">
                Subgraph Studio:{" "}
              </span>
              <a
                href="https://thegraph.com/studio/subgraph/ahadi-escrow-v-1"
                target="_blank"
                rel="noopener noreferrer"
                className="text-yellow-400 hover:underline font-mono"
              >
                ahadi-escrow-v-1
              </a>
            </div>
          </section>

          {/* Bottom CTA */}
          <div className="rounded-3xl liquid-glass-yellow p-8 text-center">
            <h3 className="text-xl font-bold font-orbitron mb-2">
              Ready to start?
            </h3>
            <p className="text-gray-400 text-sm mb-6">
              Connect your wallet and create your first escrow deal in minutes.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 liquid-glass-cta text-yellow-400 font-bold px-8 py-3 rounded-2xl"
            >
              Launch AHADI <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}

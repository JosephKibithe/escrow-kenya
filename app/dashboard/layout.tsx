"use client";
import { useActiveAccount } from "thirdweb/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const account = useActiveAccount();
  const router = useRouter();

  // Protect the route: If not logged in, kick them back to login page
  useEffect(() => {
    // Give it a small delay to load, but strict check is good
    if (!account) {
      // router.push("/"); // Uncomment this later when production ready
    }
  }, [account, router]);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm p-4 sticky top-0 z-10 border-b border-gray-100">
        <div className="max-w-md mx-auto flex justify-between items-center">
          {/* UPDATED BRAND NAME */}
          <div className="flex items-center gap-2">
            <span className="text-2xl">🤝</span>
            <h1 className="font-extrabold text-xl tracking-tight text-gray-900">
              AHADI
            </h1>
          </div>
          <div className="text-xs font-mono text-gray-500 bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
            {account
              ? `${account.address.slice(0, 4)}...${account.address.slice(-4)}`
              : "🔴 Offline"}
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <main className="max-w-md mx-auto p-4">{children}</main>
    </div>
  );
}

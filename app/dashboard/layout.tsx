"use client";
import { useActiveAccount } from "thirdweb/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { client } from "@/app/client";
import { ConnectButton } from "thirdweb/react";
import { polygon } from "thirdweb/chains";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const account = useActiveAccount();
  const router = useRouter();

  useEffect(() => {
    // Optional: Redirect if offline (commented out for dev)
    // if (!account) router.push("/");
  }, [account, router]);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <nav className="bg-white shadow-sm p-4 sticky top-0 z-20 border-b border-gray-100">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => router.push("/dashboard")}
          >
            <span className="text-2xl">🤝</span>
            <h1 className="font-extrabold text-xl tracking-tight text-blue-900">
              AHADI
            </h1>
          </div>

          <div className="transform scale-90 origin-right">
            <ConnectButton client={client} chain={polygon} />
          </div>
        </div>
      </nav>

      <main className="max-w-md mx-auto p-4">{children}</main>
    </div>
  );
}

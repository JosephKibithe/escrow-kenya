"use client";
import { useRouter } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 1. Added explicit border and white background for visibility */}
      <nav className="bg-white border-b border-gray-200 shadow-sm p-4 sticky top-0 z-50">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push("/dashboard")}>
            <span className="text-2xl">🤝</span>
            {/* 2. Forced text color to Blue-900 */}
            <h1 className="font-extrabold text-xl tracking-tight text-blue-900">AHADI</h1>
          </div>
          
          {/* 3. REOWN BUTTON: This handles loading/connected states automatically */}
          <div>
             <appkit-button />
          </div>
        </div>
      </nav>

      <main className="max-w-md mx-auto p-4">
        {children}
      </main>
    </div>
  );
}
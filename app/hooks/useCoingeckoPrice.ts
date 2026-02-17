"use client";

import { useQuery } from "@tanstack/react-query";

async function fetchUsdtToKes(): Promise<number> {
  const res = await fetch(
    "https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=kes"
  );
  if (!res.ok) throw new Error("Failed to fetch exchange rate");
  const data = await res.json();
  return data.tether.kes;
}

/**
 * Fetches the current USDT → KES exchange rate from CoinGecko.
 * Refreshes every 60 seconds.
 *
 * @returns { rate, isLoading, isError, toKes }
 *   - rate: the raw number (e.g. 129.5)
 *   - toKes(usdt): helper that converts a USDT amount to a formatted KES string
 */
export function useUsdtKesRate() {
  const { data: rate, isLoading, isError } = useQuery({
    queryKey: ["usdt-kes-price"],
    queryFn: fetchUsdtToKes,
    refetchInterval: 60_000,
    staleTime: 60_000,
    retry: 2,
  });

  /** Convert a USDT amount to a formatted KES string, e.g. "129,500" */
  const toKes = (usdt: number): string | null => {
    if (rate == null || isNaN(usdt)) return null;
    return (usdt * rate).toLocaleString("en-KE", {
      maximumFractionDigits: 0,
    });
  };

  return { rate, isLoading, isError, toKes };
}

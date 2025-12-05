"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { OnchainKitProvider } from "@coinbase/onchainkit";
import { baseSepolia, hardhat } from "wagmi/chains";
import { config, activeChain } from "@/config/wagmi";
import { useState, type ReactNode } from "react";

import "@coinbase/onchainkit/styles.css";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        // Reduce refetch frequency for better local dev performance
        refetchOnWindowFocus: false,
        staleTime: 5000,
      },
    },
  }));

  // Use hardhat chain for local dev, baseSepolia for production
  const isLocalDev = activeChain.id === hardhat.id;

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {isLocalDev ? (
          // Skip OnchainKit for local development (it requires Base networks)
          children
        ) : (
          <OnchainKitProvider
            chain={baseSepolia}
            config={{
              appearance: {
                mode: "dark",
                theme: "cyberpunk",
              },
            }}
          >
            {children}
          </OnchainKitProvider>
        )}
      </QueryClientProvider>
    </WagmiProvider>
  );
}

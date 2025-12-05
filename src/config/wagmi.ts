import { http, createConfig } from "wagmi";
import { baseSepolia, hardhat } from "wagmi/chains";
import { coinbaseWallet, injected } from "wagmi/connectors";

// Check if we're in local development mode
const isLocalDev = process.env.NEXT_PUBLIC_LOCAL_DEV === "true";

// Use Hardhat for local testing, Base Sepolia for production
export const activeChain = isLocalDev ? hardhat : baseSepolia;

export const config = createConfig({
  chains: [baseSepolia, hardhat],
  connectors: [
    // Coinbase Smart Wallet - configured for Base Sepolia
    coinbaseWallet({
      appName: "Stride",
      // Use all wallets, not just smart wallet (more flexible)
      preference: "all",
      // Explicitly set chainId for Coinbase Wallet to Base Sepolia
    }),
    // Fallback for MetaMask and other injected wallets
    injected(),
  ],
  transports: {
    [baseSepolia.id]: http("https://sepolia.base.org"),
    [hardhat.id]: http("http://127.0.0.1:8545"),
  },
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}

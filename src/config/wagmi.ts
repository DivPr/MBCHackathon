import { http, createConfig } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { coinbaseWallet, injected } from "wagmi/connectors";

// Base Sepolia configuration for hackathon deployment
export const config = createConfig({
  chains: [baseSepolia],
  connectors: [
    // Coinbase Smart Wallet - Account Abstraction (ERC-4337)
    coinbaseWallet({
      appName: "Stride",
      preference: "smartWalletOnly", // Forces smart wallet for AA benefits
    }),
    // Fallback for MetaMask and other injected wallets
    injected(),
  ],
  transports: {
    [baseSepolia.id]: http("https://sepolia.base.org"),
  },
});

// Export chain for use elsewhere
export const activeChain = baseSepolia;

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}

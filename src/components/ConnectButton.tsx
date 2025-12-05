"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";
import { useState } from "react";

export function ConnectButton() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const [showDropdown, setShowDropdown] = useState(false);

  if (isConnected && address) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="btn-secondary flex items-center gap-2 py-2 px-4"
        >
          <div className="w-2 h-2 bg-stride-lime rounded-full" />
          <span className="font-mono text-sm">
            {address.slice(0, 6)}...{address.slice(-4)}
          </span>
          <svg
            className={`w-4 h-4 transition-transform ${showDropdown ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showDropdown && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowDropdown(false)}
            />
            <div className="absolute right-0 mt-2 w-48 bg-stride-gray border border-stride-muted/30 rounded-lg shadow-xl z-50">
              <div className="p-3 border-b border-stride-muted/30">
                <p className="text-xs text-stride-muted">Connected to</p>
                <p className="text-sm font-mono truncate">{address}</p>
              </div>
              <button
                onClick={() => {
                  disconnect();
                  setShowDropdown(false);
                }}
                className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-stride-dark/50 rounded-b-lg transition-colors"
              >
                Disconnect
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        disabled={isPending}
        className="btn-primary py-2 px-6"
      >
        {isPending ? "Connecting..." : "Connect Wallet"}
      </button>

      {showDropdown && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDropdown(false)}
          />
          <div className="absolute right-0 mt-2 w-64 bg-stride-gray border border-stride-muted/30 rounded-lg shadow-xl z-50 overflow-hidden">
            <div className="p-3 border-b border-stride-muted/30">
              <p className="text-sm font-medium">Select Wallet</p>
            </div>
            <div className="p-2">
              {connectors.map((connector) => (
                <button
                  key={connector.uid}
                  onClick={() => {
                    connect({ connector });
                    setShowDropdown(false);
                  }}
                  className="w-full text-left px-3 py-3 text-sm hover:bg-stride-dark/50 rounded-lg transition-colors flex items-center gap-3"
                >
                  {connector.name === "Coinbase Wallet" && (
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold">C</span>
                    </div>
                  )}
                  {connector.name === "Injected" && (
                    <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold">M</span>
                    </div>
                  )}
                  {connector.name !== "Coinbase Wallet" &&
                    connector.name !== "Injected" && (
                      <div className="w-8 h-8 bg-stride-muted rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold">W</span>
                      </div>
                    )}
                  <div>
                    <p className="font-medium">
                      {connector.name === "Injected"
                        ? "MetaMask"
                        : connector.name}
                    </p>
                    <p className="text-xs text-stride-muted">
                      {connector.name === "Coinbase Wallet"
                        ? "Smart Wallet"
                        : "Browser Wallet"}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}


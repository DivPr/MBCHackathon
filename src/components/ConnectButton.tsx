"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";
import { useState, useEffect } from "react";

export function ConnectButton() {
  const [mounted, setMounted] = useState(false);
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const [showOptions, setShowOptions] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button className="btn-secondary py-2 px-6 opacity-50" disabled>
        <span className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          Loading
        </span>
      </button>
    );
  }

  if (isConnected && address) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowOptions(!showOptions)}
          className="btn-secondary flex items-center gap-2 py-2 px-4"
        >
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="font-mono text-sm">
            {address.slice(0, 6)}...{address.slice(-4)}
          </span>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {showOptions && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setShowOptions(false)} 
            />
            <div className="absolute right-0 top-full mt-2 w-48 bg-stride-gray border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
              <div className="p-3 border-b border-white/10">
                <p className="text-xs text-stride-muted">Connected</p>
                <p className="font-mono text-sm truncate">{address}</p>
              </div>
              <button
                onClick={() => {
                  disconnect();
                  setShowOptions(false);
                }}
                className="w-full px-3 py-2 text-left text-red-400 hover:bg-red-500/10 transition-colors"
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
        onClick={() => setShowOptions(!showOptions)}
        className="btn-primary py-2.5 px-5"
      >
        Connect Wallet
      </button>
      
      {showOptions && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowOptions(false)} 
          />
          <div className="absolute right-0 top-full mt-2 w-64 bg-stride-gray border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
            <div className="p-3 border-b border-white/10">
              <p className="font-medium">Connect a Wallet</p>
              <p className="text-xs text-stride-muted">Choose your preferred wallet</p>
            </div>
            <div className="p-2">
              {connectors.map((connector) => (
                <button
                  key={connector.uid}
                  onClick={() => {
                    connect({ connector });
                    setShowOptions(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors"
                >
                  {connector.name === "MetaMask" ? (
                    <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-orange-400" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M22.5 12c0-5.799-4.701-10.5-10.5-10.5S1.5 6.201 1.5 12s4.701 10.5 10.5 10.5 10.5-4.701 10.5-10.5z"/>
                      </svg>
                    </div>
                  ) : connector.name.includes("Coinbase") ? (
                    <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
                        <circle cx="12" cy="12" r="10"/>
                      </svg>
                    </div>
                  ) : (
                    <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                  )}
                  <div className="text-left">
                    <p className="font-medium text-sm">{connector.name}</p>
                    <p className="text-xs text-stride-muted">
                      {connector.name === "MetaMask" 
                        ? "Use imported accounts" 
                        : connector.name.includes("Coinbase")
                        ? "Smart Wallet"
                        : "Browser wallet"}
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

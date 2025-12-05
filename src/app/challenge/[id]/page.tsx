"use client";

import { useParams } from "next/navigation";
import { useAccount } from "wagmi";
import { ConnectButton } from "@/components/ConnectButton";
import { ChallengeDetail } from "@/components/ChallengeDetail";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function ChallengePage() {
  const params = useParams();
  const { isConnected } = useAccount();
  const challengeId = params.id as string;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <main className="relative z-10 min-h-screen">
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-md sticky top-0 z-50 bg-stride-dark/80">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-gradient-to-br from-stride-purple to-stride-violet rounded-xl flex items-center justify-center shadow-lg shadow-stride-purple/30">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="font-bold text-xl tracking-tight">Stride</span>
          </Link>
          <ConnectButton />
        </div>
      </header>

      {/* Content */}
      <section className="max-w-3xl mx-auto px-4 py-6 md:py-8">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-stride-muted hover:text-white transition-colors mb-6 group"
        >
          <svg 
            className="w-5 h-5 group-hover:-translate-x-1 transition-transform" 
            fill="none" 
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Groups
        </Link>

        {!mounted ? (
          <div className="card animate-pulse border-white/10">
            <div className="h-8 bg-white/5 rounded w-1/2 mb-6" />
            <div className="h-4 bg-white/5 rounded w-1/3 mb-4" />
            <div className="h-4 bg-white/5 rounded w-2/3" />
          </div>
        ) : isConnected ? (
          <ChallengeDetail challengeId={BigInt(challengeId)} />
        ) : (
          <div className="card text-center py-16 border-white/10">
            <div className="w-20 h-20 bg-gradient-to-br from-stride-purple/20 to-pink-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-stride-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-4">Connect to View</h2>
            <p className="text-stride-muted mb-8 max-w-md mx-auto">
              Connect your wallet to view challenge details and join the competition.
            </p>
            <ConnectButton />
          </div>
        )}
      </section>
    </main>
  );
}

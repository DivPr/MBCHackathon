"use client";

import { useParams } from "next/navigation";
import { useAccount } from "wagmi";
import { ConnectButton } from "@/components/ConnectButton";
import { ChallengeDetail } from "@/components/ChallengeDetail";
import Link from "next/link";

export default function ChallengePage() {
  const params = useParams();
  const { isConnected } = useAccount();
  const challengeId = params.id as string;

  return (
    <main className="relative z-10 min-h-screen">
      {/* Header */}
      <header className="border-b border-stride-muted/20 backdrop-blur-sm sticky top-0 z-50 bg-stride-dark/80">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-stride-lime rounded-lg flex items-center justify-center">
              <span className="text-stride-dark font-bold text-xl">S</span>
            </div>
            <span className="font-bold text-xl tracking-tight">Stride</span>
          </Link>
          <ConnectButton />
        </div>
      </header>

      {/* Content */}
      <section className="max-w-3xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-stride-muted hover:text-white transition-colors mb-8"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Challenges
        </Link>

        {isConnected ? (
          <ChallengeDetail challengeId={BigInt(challengeId)} />
        ) : (
          <div className="card text-center py-16">
            <h2 className="text-2xl font-bold mb-4">Connect Wallet</h2>
            <p className="text-stride-muted mb-8">
              Connect your wallet to view and interact with this challenge.
            </p>
            <ConnectButton />
          </div>
        )}
      </section>
    </main>
  );
}


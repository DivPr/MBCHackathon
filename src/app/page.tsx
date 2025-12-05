"use client";

import { useAccount } from "wagmi";
import { ConnectButton } from "@/components/ConnectButton";
import { ChallengeList } from "@/components/ChallengeList";
import { CreateChallengeModal } from "@/components/CreateChallengeModal";
import { useState } from "react";

export default function Home() {
  const { isConnected } = useAccount();
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <main className="relative z-10 min-h-screen">
      {/* Header */}
      <header className="border-b border-stride-muted/20 backdrop-blur-sm sticky top-0 z-50 bg-stride-dark/80">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-stride-lime rounded-lg flex items-center justify-center">
              <span className="text-stride-dark font-bold text-xl">S</span>
            </div>
            <span className="font-bold text-xl tracking-tight">Stride</span>
          </div>
          <ConnectButton />
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-16 opacity-0 animate-slide-up">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Commit to your
            <br />
            <span className="text-stride-lime">fitness goals</span>
          </h1>
          <p className="text-stride-muted text-lg md:text-xl max-w-2xl mx-auto mb-8">
            Create challenges with friends, stake crypto to stay accountable,
            and earn rewards when you complete your runs.
          </p>
          {isConnected && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary text-lg px-8 py-4 animate-pulse-glow"
            >
              Create Challenge
            </button>
          )}
        </div>

        {/* Stats Bar */}
        {isConnected && (
          <div className="grid grid-cols-3 gap-4 mb-12 opacity-0 animate-slide-up stagger-1">
            <div className="card text-center">
              <div className="text-2xl md:text-3xl font-bold text-stride-lime">
                Base
              </div>
              <div className="text-sm text-stride-muted">Sepolia Testnet</div>
            </div>
            <div className="card text-center">
              <div className="text-2xl md:text-3xl font-bold">ETH</div>
              <div className="text-sm text-stride-muted">Stake Token</div>
            </div>
            <div className="card text-center">
              <div className="text-2xl md:text-3xl font-bold">0%</div>
              <div className="text-sm text-stride-muted">Platform Fee</div>
            </div>
          </div>
        )}

        {/* Main Content */}
        {isConnected ? (
          <div className="opacity-0 animate-slide-up stagger-2">
            <ChallengeList />
          </div>
        ) : (
          <div className="card text-center py-16 opacity-0 animate-slide-up stagger-1">
            <div className="w-20 h-20 bg-stride-lime/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10 text-stride-lime"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-4">Connect to Get Started</h2>
            <p className="text-stride-muted mb-8 max-w-md mx-auto">
              Connect your wallet to create challenges, join friends, and start
              earning rewards for staying fit.
            </p>
            <ConnectButton />
          </div>
        )}
      </section>

      {/* How it Works */}
      <section className="max-w-5xl mx-auto px-4 pb-24">
        <h2 className="text-2xl font-bold mb-8 text-center opacity-0 animate-slide-up stagger-3">
          How it Works
        </h2>
        <div className="grid md:grid-cols-4 gap-6 opacity-0 animate-slide-up stagger-4">
          {[
            {
              step: "01",
              title: "Create",
              desc: "Set a distance goal and stake amount",
            },
            {
              step: "02",
              title: "Invite",
              desc: "Share challenge with friends",
            },
            {
              step: "03",
              title: "Complete",
              desc: "Run and mark your completion",
            },
            {
              step: "04",
              title: "Earn",
              desc: "Winners split the prize pool",
            },
          ].map((item, i) => (
            <div key={i} className="card group hover:border-stride-lime/50 transition-colors">
              <div className="text-stride-lime font-mono text-sm mb-2">
                {item.step}
              </div>
              <h3 className="font-bold text-lg mb-2">{item.title}</h3>
              <p className="text-stride-muted text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-stride-muted/20 py-8">
        <div className="max-w-5xl mx-auto px-4 text-center text-stride-muted text-sm">
          <p>Built on Base for MBC Hackathon 2024</p>
        </div>
      </footer>

      {/* Create Challenge Modal */}
      {showCreateModal && (
        <CreateChallengeModal onClose={() => setShowCreateModal(false)} />
      )}
    </main>
  );
}


"use client";

import { useAccount } from "wagmi";
import { ConnectButton } from "@/components/ConnectButton";
import { ChallengeList } from "@/components/ChallengeList";
import { CreateChallengeModal } from "@/components/CreateChallengeModal";
import { useState, useEffect } from "react";

export default function Home() {
  const { isConnected } = useAccount();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <main className="relative z-10 min-h-screen">
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-md sticky top-0 z-50 bg-stride-dark/80">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-stride-purple to-stride-violet rounded-xl flex items-center justify-center shadow-lg shadow-stride-purple/30">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="font-bold text-xl tracking-tight">Stride</span>
          </div>
          <ConnectButton />
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-4 py-12 md:py-20">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-stride-purple/10 border border-stride-purple/30 rounded-full text-sm text-stride-purple mb-6">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
            Built on Base
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Run Together,
            <br />
            <span className="gradient-text">Win Together</span>
          </h1>
          <p className="text-stride-muted text-lg md:text-xl max-w-2xl mx-auto mb-8">
            Create fitness challenges with friends. Stake ETH to stay accountable.
            Complete your goal and split the prize pool.
          </p>
          
          {mounted && isConnected && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary text-lg px-8 py-4 inline-flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Challenge
            </button>
          )}
        </div>

        {/* Stats Bar */}
        {mounted && isConnected && (
          <div className="grid grid-cols-3 gap-3 md:gap-4 mb-12">
            <div className="card text-center py-4 md:py-6 border-white/10">
              <div className="w-10 h-10 mx-auto mb-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" viewBox="0 0 111 111" fill="none">
                  <path d="M54.921 110.034C85.359 110.034 110.034 85.402 110.034 55.017C110.034 24.6319 85.359 0 54.921 0C26.0432 0 2.35281 22.1714 0 50.3923H72.8467V59.6416H0C2.35281 87.8625 26.0432 110.034 54.921 110.034Z" fill="white"/>
                </svg>
              </div>
              <div className="text-lg md:text-xl font-bold mb-1">Base</div>
              <div className="text-xs md:text-sm text-stride-muted">Sepolia Testnet</div>
            </div>
            <div className="card text-center py-4 md:py-6 border-white/10">
              <div className="w-10 h-10 mx-auto mb-2 bg-gradient-to-br from-stride-purple to-pink-500 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-lg md:text-xl font-bold mb-1">ETH</div>
              <div className="text-xs md:text-sm text-stride-muted">Stake Token</div>
            </div>
            <div className="card text-center py-4 md:py-6 border-white/10">
              <div className="w-10 h-10 mx-auto mb-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-lg md:text-xl font-bold text-green-400 mb-1">0%</div>
              <div className="text-xs md:text-sm text-stride-muted">Platform Fee</div>
            </div>
          </div>
        )}

        {/* Main Content */}
        {mounted ? (
          isConnected ? (
            <ChallengeList />
          ) : (
            <div className="card text-center py-16 border-white/10">
              <div className="w-20 h-20 bg-gradient-to-br from-stride-purple/20 to-pink-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-float">
                <svg className="w-10 h-10 text-stride-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-4">Ready to Get Moving?</h2>
              <p className="text-stride-muted mb-8 max-w-md mx-auto">
                Connect your wallet to create challenges, compete with friends, 
                and earn rewards for staying fit.
              </p>
              <ConnectButton />
            </div>
          )
        ) : (
          <div className="card animate-pulse border-white/10">
            <div className="h-8 bg-white/5 rounded w-1/3 mb-4" />
            <div className="h-4 bg-white/5 rounded w-1/2" />
          </div>
        )}
      </section>

      {/* How it Works */}
      <section className="max-w-5xl mx-auto px-4 pb-20">
        <h2 className="text-2xl font-bold mb-8 text-center">
          How it Works
        </h2>
        <div className="grid md:grid-cols-4 gap-4 md:gap-6">
          {[
            { step: "01", title: "Create", desc: "Set a goal and stake ETH", icon: "M12 4v16m8-8H4", color: "from-stride-purple to-violet-600" },
            { step: "02", title: "Share", desc: "Invite friends via QR code", icon: "M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z", color: "from-blue-500 to-cyan-500" },
            { step: "03", title: "Complete", desc: "Finish your run", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", color: "from-green-500 to-emerald-500" },
            { step: "04", title: "Win", desc: "Split the prize pool", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z", color: "from-yellow-500 to-orange-500" },
          ].map((item, i) => (
            <div 
              key={i} 
              className="card group hover:border-stride-purple/50 transition-all duration-300 hover:-translate-y-1 border-white/10"
            >
              <div className={`w-12 h-12 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center mb-4`}>
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                </svg>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-stride-purple font-mono text-sm">{item.step}</span>
              </div>
              <h3 className="font-bold text-lg mb-2">{item.title}</h3>
              <p className="text-stride-muted text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-4 pb-20">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card border-white/10 hover:border-stride-purple/30 transition-colors">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-stride-purple to-pink-500 rounded-xl flex items-center justify-center shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Share via QR Code</h3>
                <p className="text-stride-muted text-sm">
                  Generate a QR code for any challenge. Friends can scan and join instantly.
                </p>
              </div>
            </div>
          </div>
          <div className="card border-white/10 hover:border-stride-purple/30 transition-colors">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Instant Settlement</h3>
                <p className="text-stride-muted text-sm">
                  When the challenge ends, winners automatically receive their share.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8">
        <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-stride-purple to-stride-violet rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="font-bold">Stride</span>
          </div>
          <p className="text-stride-muted text-sm">
            Built for MBC Hackathon 2024 • Powered by Base
          </p>
        </div>
      </footer>

      {/* Create Challenge Modal */}
      {showCreateModal && (
        <CreateChallengeModal onClose={() => setShowCreateModal(false)} />
      )}
    </main>
  );
}

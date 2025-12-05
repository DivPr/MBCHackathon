"use client";

import { useAccount } from "wagmi";
import Link from "next/link";
import { ConnectButton } from "@/components/ConnectButton";
import { Navbar } from "@/components/Navbar";
import { PoweredByCircle, CircleLogo } from "@/components/USDCStakeButton";
import { useState, useEffect } from "react";

export default function Home() {
  const { isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <main className="relative z-10 min-h-screen">
      <Navbar />

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
            Create fitness challenges with friends. Stake USDC to stay accountable.
            Complete your goal and split the prize pool.
          </p>
          <div className="flex justify-center mb-6">
            <PoweredByCircle />
          </div>
          
          {mounted && (
            <Link
              href="/groups"
              className="btn-primary text-lg px-8 py-4 inline-flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {isConnected ? "Go to Groups" : "Get Started"}
            </Link>
          )}
        </div>

        {/* Stats Bar */}
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
          <div className="card text-center py-4 md:py-6 border-usdc-blue/30 bg-usdc-blue/5">
            <div className="w-10 h-10 mx-auto mb-2 bg-usdc-blue rounded-xl flex items-center justify-center">
              <CircleLogo className="w-6 h-6" />
            </div>
            <div className="text-lg md:text-xl font-bold mb-1 text-usdc-blue">USDC</div>
            <div className="text-xs md:text-sm text-stride-muted">Powered by Circle</div>
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

        {/* Main CTA Card */}
        {mounted && (
          <div className="card text-center py-12 border-white/10 mb-12">
            <div className="w-20 h-20 bg-gradient-to-br from-stride-purple/20 to-pink-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-float">
              <svg className="w-10 h-10 text-stride-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-4">Compete with Friends</h2>
            <p className="text-stride-muted mb-8 max-w-md mx-auto">
              {isConnected 
                ? "Join or create a group to start challenges with your friends. Compete on leaderboards and win together!"
                : "Connect your wallet to create groups, start challenges, and compete with friends on leaderboards."
              }
            </p>
            <div className="flex justify-center gap-4">
              {!isConnected ? (
                <ConnectButton />
              ) : (
                <>
                  <Link href="/groups" className="btn-primary px-6 py-3 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create Group
                  </Link>
                  <Link href="/groups" className="btn-secondary px-6 py-3 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Browse Groups
                  </Link>
                </>
              )}
            </div>
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
            { step: "01", title: "Create Group", desc: "Start a fitness group with friends", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z", color: "from-stride-purple to-violet-600" },
            { step: "02", title: "Challenge", desc: "Create a challenge & stake USDC", icon: "M13 10V3L4 14h7v7l9-11h-7z", color: "from-usdc-blue to-blue-400" },
            { step: "03", title: "Complete", desc: "Finish your fitness goal", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", color: "from-green-500 to-emerald-500" },
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Group Challenges</h3>
                <p className="text-stride-muted text-sm">
                  Create and join challenges within your groups. Compete together and stay accountable.
                </p>
              </div>
            </div>
          </div>
          <div className="card border-white/10 hover:border-stride-purple/30 transition-colors">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Leaderboards</h3>
                <p className="text-stride-muted text-sm">
                  Track your ranking against friends. Compete to be the top performer in your group.
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
          <div className="flex items-center gap-4 text-stride-muted text-sm">
            <span>Built for MBC Hackathon 2025</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              Powered by <span className="text-usdc-blue font-medium">Circle USDC</span>
            </span>
            <span>•</span>
            <span>Built on Base</span>
          </div>
        </div>
      </footer>
    </main>
  );
}

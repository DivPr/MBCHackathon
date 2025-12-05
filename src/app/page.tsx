"use client";

import { useAccount } from "wagmi";
import Link from "next/link";
import { ConnectButton } from "@/components/ConnectButton";
import { Navbar } from "@/components/Navbar";
import { CircleLogo } from "@/components/USDCStakeButton";
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
      <section className="max-w-6xl mx-auto px-4 pt-16 pb-24">
        <div className="text-center mb-16">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full text-sm mb-8">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-white/70">Live on</span>
            <span className="font-semibold text-white">Base Sepolia</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-[1.1] tracking-tight">
            Run Together.
            <br />
            <span className="bg-gradient-to-r from-stride-purple via-pink-500 to-orange-400 bg-clip-text text-transparent">
              Win Together.
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-white/60 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Create fitness challenges with friends. Stake USDC to stay accountable. 
            Complete your goal and split the prize pool.
          </p>

          {/* CTA Buttons */}
          {mounted && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              {isConnected ? (
                <>
                  <Link
                    href="/groups"
                    className="group relative px-8 py-4 bg-gradient-to-r from-stride-purple to-pink-500 rounded-2xl font-semibold text-lg transition-all hover:shadow-lg hover:shadow-stride-purple/25 hover:-translate-y-0.5"
                  >
                    <span className="flex items-center gap-2">
                      Start a Challenge
                      <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </span>
                  </Link>
                  <Link
                    href="/groups"
                    className="px-8 py-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl font-semibold text-lg hover:bg-white/10 transition-all"
                  >
                    Browse Groups
                  </Link>
                </>
              ) : (
                <Link
                  href="/groups"
                  className="group relative px-8 py-4 bg-gradient-to-r from-stride-purple to-pink-500 rounded-2xl font-semibold text-lg transition-all hover:shadow-lg hover:shadow-stride-purple/25 hover:-translate-y-0.5"
                >
                  <span className="flex items-center gap-2">
                    Get Started
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </Link>
              )}
            </div>
          )}

          {/* Trust Badges */}
          <div className="flex items-center justify-center gap-6 flex-wrap">
            <div className="flex items-center gap-2 text-white/40 text-sm">
              <svg className="w-4 h-4" viewBox="0 0 111 111" fill="currentColor">
                <path d="M54.921 110.034C85.359 110.034 110.034 85.402 110.034 55.017C110.034 24.6319 85.359 0 54.921 0C26.0432 0 2.35281 22.1714 0 50.3923H72.8467V59.6416H0C2.35281 87.8625 26.0432 110.034 54.921 110.034Z"/>
              </svg>
              Built on Base
            </div>
            <div className="w-1 h-1 bg-white/20 rounded-full" />
            <div className="flex items-center gap-2 text-usdc-blue text-sm">
              <CircleLogo className="w-4 h-4" />
              Powered by Circle
            </div>
            <div className="w-1 h-1 bg-white/20 rounded-full" />
            <div className="flex items-center gap-2 text-white/40 text-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              0% Platform Fee
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-20">
          {[
            {
              icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              ),
              title: "Group Challenges",
              description: "Create challenges within friend groups. Compete together and track everyone's progress.",
              gradient: "from-stride-purple to-violet-600"
            },
            {
              icon: <CircleLogo className="w-6 h-6" />,
              title: "USDC Staking",
              description: "Stake real money with Circle USDC. Price stability means your $5 stake stays at $5.",
              gradient: "from-usdc-blue to-blue-400"
            },
            {
              icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              ),
              title: "Leaderboards",
              description: "Track your ranking among friends. Build win streaks and climb to the top.",
              gradient: "from-yellow-500 to-orange-500"
            }
          ].map((feature, i) => (
            <div
              key={i}
              className="group relative p-6 bg-white/[0.02] backdrop-blur-sm border border-white/5 rounded-2xl hover:border-white/10 transition-all hover:-translate-y-1"
            >
              <div className={`w-12 h-12 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mb-4 text-white`}>
                {feature.icon}
              </div>
              <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* How it Works */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-white/50">Four simple steps to fitness accountability</p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { step: "01", title: "Create Group", desc: "Start a fitness group", color: "text-stride-purple" },
              { step: "02", title: "Set Challenge", desc: "Create a challenge and set the stake", color: "text-usdc-blue" },
              { step: "03", title: "Complete Goal", desc: "Finish your run and mark completion", color: "text-green-400" },
              { step: "04", title: "Collect Prize", desc: "Winners split the entire prize pool", color: "text-yellow-400" },
            ].map((item, i) => (
              <div key={i} className="relative">
                {i < 3 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-px bg-gradient-to-r from-white/10 to-transparent" />
                )}
                <div className="relative p-5 rounded-2xl bg-white/[0.02] border border-white/5">
                  <span className={`text-4xl font-bold ${item.color} opacity-20`}>{item.step}</span>
                  <h3 className="font-semibold mt-2 mb-1">{item.title}</h3>
                  <p className="text-white/40 text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        {mounted && !isConnected && (
          <div className="text-center p-12 rounded-3xl bg-gradient-to-br from-stride-purple/10 to-pink-500/10 border border-stride-purple/20">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-white/50 mb-8 max-w-lg mx-auto">
              Connect your wallet to create groups, start challenges, and compete with friends.
            </p>
            <ConnectButton />
          </div>
        )}

        {mounted && isConnected && (
          <div className="text-center p-12 rounded-3xl bg-gradient-to-br from-stride-purple/10 to-pink-500/10 border border-stride-purple/20">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">You&apos;re Connected! 🎉</h2>
            <p className="text-white/50 mb-8 max-w-lg mx-auto">
              Create or join a group to start your first challenge.
            </p>
            <Link
              href="/groups"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-stride-purple to-pink-500 rounded-2xl font-semibold text-lg hover:shadow-lg hover:shadow-stride-purple/25 transition-all"
            >
              Go to Groups
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-stride-purple to-pink-500 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="font-semibold">Stride</span>
            </div>
            <div className="flex items-center gap-6 text-white/40 text-sm">
              <span>MBC Hackathon 2025</span>
              <a 
                href="https://developers.circle.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 hover:text-usdc-blue transition-colors"
              >
                <CircleLogo className="w-4 h-4" />
                Circle USDC
              </a>
              <a 
                href="https://base.org" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                Base
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

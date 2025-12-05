"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { formatEther } from "viem";
import { ConnectButton } from "@/components/ConnectButton";
import { Navbar } from "@/components/Navbar";
import { useUserStats, useChallengeCount, useChallenge, useHasJoined, useHasCompleted } from "@/hooks/useChallenge";
import { useUserGroups, useGroup } from "@/hooks/useGroups";

// Mini Challenge Card for profile display
function MiniChallengeCard({ challengeId, userAddress }: { challengeId: bigint; userAddress?: `0x${string}` }) {
  const { data: challenge, isLoading } = useChallenge(challengeId);
  const { data: hasJoined } = useHasJoined(challengeId, userAddress);
  const { data: hasCompleted } = useHasCompleted(challengeId, userAddress);

  if (isLoading || !challenge || !hasJoined) return null;
  
  // Skip cancelled challenges
  if (challenge.cancelled) return null;

  const now = Math.floor(Date.now() / 1000);
  const endTime = Number(challenge.endTime);
  const isEnded = endTime < now;
  const stakeEth = formatEther(challenge.stakeAmount);
  
  // Determine status
  let status: "active" | "completed" | "settled" | "lost" = "active";
  let statusColor = "text-blue-400 bg-blue-500/10 border-blue-500/30";
  let statusText = "Active";
  
  if (challenge.settled) {
    if (hasCompleted) {
      status = "completed";
      statusColor = "text-green-400 bg-green-500/10 border-green-500/30";
      statusText = "Won";
    } else {
      status = "lost";
      statusColor = "text-red-400 bg-red-500/10 border-red-500/30";
      statusText = "Lost";
    }
  } else if (isEnded) {
    statusColor = "text-yellow-400 bg-yellow-500/10 border-yellow-500/30";
    statusText = hasCompleted ? "Finished" : "Ended";
  } else if (hasCompleted) {
    statusColor = "text-green-400 bg-green-500/10 border-green-500/30";
    statusText = "Finished";
  }

  return (
    <Link href={`/challenge/${challengeId}`}>
      <div className="bg-white/5 hover:bg-white/10 rounded-xl p-4 transition-all cursor-pointer group border border-transparent hover:border-stride-purple/30">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 bg-gradient-to-br from-stride-purple/30 to-pink-500/30 rounded-lg flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <svg className="w-5 h-5 text-stride-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="min-w-0">
              <h4 className="font-medium text-sm truncate">{challenge.description || `Challenge #${challengeId}`}</h4>
              <p className="text-xs text-stride-muted">
                {stakeEth} ETH stake
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className={`text-xs font-medium px-2 py-1 rounded-full border ${statusColor}`}>
              {statusText}
            </span>
            <svg className="w-4 h-4 text-stride-muted group-hover:text-stride-purple transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}

// User challenges list component
function UserChallengesList({ userAddress, filter }: { userAddress?: `0x${string}`; filter: "active" | "past" | "all" }) {
  const { data: challengeCount } = useChallengeCount();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simple loading state based on challengeCount being available
    if (challengeCount !== undefined) {
      setIsLoading(false);
    }
  }, [challengeCount]);

  if (isLoading || challengeCount === undefined) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white/5 rounded-xl p-4 animate-pulse">
            <div className="h-4 bg-white/5 rounded w-2/3 mb-2" />
            <div className="h-3 bg-white/5 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  const count = Number(challengeCount);
  if (count === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gradient-to-br from-stride-purple/20 to-pink-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-stride-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <p className="text-stride-muted mb-4">No challenges found</p>
        <Link href="/groups" className="btn-primary px-6 py-2 inline-flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Join a Group to Start
        </Link>
      </div>
    );
  }

  // Generate challenge IDs (newest first)
  const challengeIds = Array.from({ length: count }, (_, i) => BigInt(count - 1 - i));

  return (
    <div className="space-y-3">
      {challengeIds.map((id) => (
        <MiniChallengeCard 
          key={id.toString()} 
          challengeId={id} 
          userAddress={userAddress}
        />
      ))}
    </div>
  );
}

// Mini Group Card for profile display
function MiniGroupCard({ groupId }: { groupId: bigint }) {
  const { data: group, isLoading } = useGroup(groupId);

  if (isLoading || !group) {
    return (
      <div className="bg-white/5 rounded-xl p-4 animate-pulse">
        <div className="h-4 bg-white/5 rounded w-2/3 mb-2" />
        <div className="h-3 bg-white/5 rounded w-1/2" />
      </div>
    );
  }

  const [, name, , , memberCount, challengeCount, , isPrivate, deleted] = group;

  if (deleted) return null;

  return (
    <Link href={`/groups/${groupId}`}>
      <div className="bg-white/5 hover:bg-white/10 rounded-xl p-4 transition-all cursor-pointer group border border-transparent hover:border-stride-purple/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-stride-purple/30 to-pink-500/30 rounded-lg flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <svg className="w-5 h-5 text-stride-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm truncate flex items-center gap-2">
              {name}
              {isPrivate && (
                <svg className="w-3.5 h-3.5 text-yellow-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              )}
            </h4>
            <p className="text-xs text-stride-muted">
              {Number(memberCount)} members • {Number(challengeCount)} challenges
            </p>
          </div>
          <svg className="w-4 h-4 text-stride-muted group-hover:text-stride-purple transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
}

// Achievement Badge Component
function AchievementBadge({ 
  icon, 
  title, 
  description, 
  unlocked, 
  color 
}: { 
  icon: string; 
  title: string; 
  description: string; 
  unlocked: boolean;
  color: string;
}) {
  return (
    <div className={`relative p-4 rounded-xl border transition-all ${
      unlocked 
        ? `bg-gradient-to-br ${color} border-white/20` 
        : "bg-white/5 border-white/10 opacity-50"
    }`}>
      <div className="text-2xl mb-2">{icon}</div>
      <h4 className="font-bold text-sm mb-1">{title}</h4>
      <p className="text-xs text-white/70">{description}</p>
      {unlocked && (
        <div className="absolute top-2 right-2">
          <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>
      )}
      {!unlocked && (
        <div className="absolute top-2 right-2">
          <svg className="w-5 h-5 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
      )}
    </div>
  );
}

// Animated Counter Component
function AnimatedStat({ value, label, color }: { value: number | string; label: string; color: string }) {
  return (
    <div className="card border-white/10 text-center py-6 hover:border-stride-purple/30 transition-all group">
      <div className={`text-3xl md:text-4xl font-bold mb-2 ${color} group-hover:scale-110 transition-transform`}>
        {value}
      </div>
      <p className="text-sm text-stride-muted">{label}</p>
    </div>
  );
}

export default function ProfilePage() {
  const { address, isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "challenges" | "groups" | "achievements">("overview");
  
  const { data: stats, isLoading: loadingStats } = useUserStats(address);
  const { data: userGroups, isLoading: loadingGroups } = useUserGroups(address);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <main className="min-h-screen bg-stride-dark">
        <div className="animate-pulse p-8">
          <div className="h-8 bg-white/5 rounded w-1/3 mb-4" />
          <div className="h-4 bg-white/5 rounded w-1/2" />
        </div>
      </main>
    );
  }

  // Calculate stats
  const challengesJoined = stats ? Number(stats.challengesJoined) : 0;
  const challengesCompleted = stats ? Number(stats.challengesCompleted) : 0;
  const challengesWon = stats ? Number(stats.challengesWon) : 0;
  const challengesCreated = stats ? Number(stats.challengesCreated) : 0;
  
  const winRate = challengesJoined > 0
    ? ((challengesWon / challengesJoined) * 100).toFixed(1)
    : "0";
    
  const completionRate = challengesJoined > 0
    ? ((challengesCompleted / challengesJoined) * 100).toFixed(0)
    : "0";

  const totalStaked = stats ? Number(formatEther(stats.totalStaked)) : 0;
  const totalWon = stats ? Number(formatEther(stats.totalWon)) : 0;
  const totalLost = stats ? Number(formatEther(stats.totalLost)) : 0;
  const netProfit = totalWon - totalLost;

  // Achievements
  const achievements = [
    {
      icon: "🏃",
      title: "First Steps",
      description: "Join your first challenge",
      unlocked: challengesJoined >= 1,
      color: "from-blue-500/20 to-cyan-500/20",
    },
    {
      icon: "🎯",
      title: "Finisher",
      description: "Complete your first challenge",
      unlocked: challengesCompleted >= 1,
      color: "from-green-500/20 to-emerald-500/20",
    },
    {
      icon: "🏆",
      title: "Winner",
      description: "Win your first challenge",
      unlocked: challengesWon >= 1,
      color: "from-yellow-500/20 to-orange-500/20",
    },
    {
      icon: "⭐",
      title: "Creator",
      description: "Create your first challenge",
      unlocked: challengesCreated >= 1,
      color: "from-stride-purple/20 to-pink-500/20",
    },
    {
      icon: "🔥",
      title: "On Fire",
      description: "Complete 5 challenges",
      unlocked: challengesCompleted >= 5,
      color: "from-red-500/20 to-orange-500/20",
    },
    {
      icon: "💎",
      title: "High Roller",
      description: "Stake more than 0.01 ETH total",
      unlocked: totalStaked >= 0.01,
      color: "from-cyan-500/20 to-blue-500/20",
    },
    {
      icon: "👥",
      title: "Social",
      description: "Join 3 groups",
      unlocked: (userGroups?.length || 0) >= 3,
      color: "from-pink-500/20 to-rose-500/20",
    },
    {
      icon: "🌟",
      title: "Champion",
      description: "Win 10 challenges",
      unlocked: challengesWon >= 10,
      color: "from-yellow-400/20 to-amber-500/20",
    },
  ];

  const unlockedAchievements = achievements.filter(a => a.unlocked).length;

  return (
    <main className="min-h-screen bg-stride-dark">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 py-8">
        {!isConnected ? (
          <div className="card text-center py-16 border-white/10">
            <div className="w-20 h-20 bg-gradient-to-br from-stride-purple/20 to-pink-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-float">
              <svg className="w-10 h-10 text-stride-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-4">Connect to View Profile</h2>
            <p className="text-stride-muted mb-8 max-w-md mx-auto">
              Connect your wallet to see your stats, achievements, and challenge history.
            </p>
            <div className="flex justify-center">
              <ConnectButton />
            </div>
          </div>
        ) : loadingStats ? (
          <div className="space-y-6">
            <div className="card animate-pulse border-white/10">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 bg-white/5 rounded-2xl" />
                <div className="flex-1">
                  <div className="h-8 bg-white/5 rounded w-1/3 mb-3" />
                  <div className="h-4 bg-white/5 rounded w-1/2" />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="card animate-pulse border-white/10">
                  <div className="h-12 bg-white/5 rounded mb-2" />
                  <div className="h-4 bg-white/5 rounded w-2/3 mx-auto" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Profile Header */}
            <div className="card border-white/10 mb-6">
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                {/* Avatar */}
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-br from-stride-purple to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-stride-purple/20">
                    <span className="text-3xl font-bold">
                      {address?.slice(2, 4).toUpperCase()}
                    </span>
                  </div>
                  {/* Level Badge */}
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center border-2 border-stride-gray">
                    <span className="text-xs font-bold">{Math.floor(challengesWon / 2) + 1}</span>
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1">
                  <h1 className="text-2xl font-bold mb-1 font-mono flex items-center gap-2">
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                    <button
                      onClick={() => navigator.clipboard.writeText(address || "")}
                      className="p-1 hover:bg-white/5 rounded transition-colors"
                      title="Copy address"
                    >
                      <svg className="w-4 h-4 text-stride-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </h1>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-stride-muted">
                    <span className="flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {userGroups?.length || 0} groups
                    </span>
                    <span className="flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                      {unlockedAchievements}/{achievements.length} achievements
                    </span>
                    <span className="flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      {completionRate}% completion rate
                    </span>
                  </div>
                </div>

                {/* Net P&L */}
                <div className={`text-right px-6 py-4 rounded-xl ${netProfit >= 0 ? "bg-green-500/10" : "bg-red-500/10"}`}>
                  <p className="text-sm text-stride-muted mb-1">Net P&L</p>
                  <p className={`text-2xl font-bold ${netProfit >= 0 ? "text-green-400" : "text-red-400"}`}>
                    {netProfit >= 0 ? "+" : ""}{netProfit.toFixed(4)} ETH
                  </p>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-white/10 pb-4 overflow-x-auto">
              {[
                { id: "overview", label: "Overview", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
                { id: "challenges", label: "My Challenges", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
                { id: "groups", label: "My Groups", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
                { id: "achievements", label: "Achievements", icon: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    activeTab === tab.id
                      ? "bg-stride-purple text-white"
                      : "text-stride-muted hover:bg-white/5"
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                  </svg>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {activeTab === "overview" && (
              <>
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <AnimatedStat value={challengesJoined} label="Challenges Joined" color="text-stride-purple" />
                  <AnimatedStat value={challengesCompleted} label="Completed" color="text-green-400" />
                  <AnimatedStat value={challengesWon} label="Won" color="text-yellow-400" />
                  <AnimatedStat value={`${winRate}%`} label="Win Rate" color="text-blue-400" />
                </div>

                {/* Detailed Stats */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Financial Stats */}
                  <div className="card border-white/10">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      Financial Summary
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-3 border-b border-white/5">
                        <span className="text-stride-muted">Total Staked</span>
                        <span className="font-mono font-medium">
                          {totalStaked.toFixed(4)} ETH
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-white/5">
                        <span className="text-stride-muted">Total Won</span>
                        <span className="font-mono font-medium text-green-400">
                          +{totalWon.toFixed(4)} ETH
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-white/5">
                        <span className="text-stride-muted">Total Lost</span>
                        <span className="font-mono font-medium text-red-400">
                          -{totalLost.toFixed(4)} ETH
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-3 bg-white/5 -mx-6 px-6 rounded-b-xl">
                        <span className="font-medium">Net Profit/Loss</span>
                        <span className={`font-mono font-bold text-lg ${netProfit >= 0 ? "text-green-400" : "text-red-400"}`}>
                          {netProfit >= 0 ? "+" : ""}{netProfit.toFixed(4)} ETH
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Activity Stats */}
                  <div className="card border-white/10">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      Activity Summary
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-3 border-b border-white/5">
                        <span className="text-stride-muted">Challenges Created</span>
                        <span className="font-mono font-medium">{challengesCreated}</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-white/5">
                        <span className="text-stride-muted">Challenges Joined</span>
                        <span className="font-mono font-medium">{challengesJoined}</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-white/5">
                        <span className="text-stride-muted">Challenges Completed</span>
                        <span className="font-mono font-medium text-green-400">{challengesCompleted}</span>
                      </div>
                      <div className="flex justify-between items-center py-3 bg-white/5 -mx-6 px-6 rounded-b-xl">
                        <span className="font-medium">Completion Rate</span>
                        <span className="font-mono font-bold text-lg text-blue-400">{completionRate}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === "challenges" && (
              <div className="card border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-stride-purple to-pink-500 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    My Challenges
                  </h3>
                </div>
                <p className="text-xs text-stride-muted mb-4">
                  Challenges you&apos;ve participated in. Cancelled challenges are not shown and don&apos;t count toward stats.
                </p>
                <UserChallengesList userAddress={address} filter="all" />
              </div>
            )}

            {activeTab === "groups" && (
              <div className="card border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-stride-purple to-pink-500 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    My Groups
                  </h3>
                  <Link href="/groups" className="text-sm text-stride-purple hover:underline">
                    Browse all →
                  </Link>
                </div>

                {loadingGroups ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="bg-white/5 rounded-xl p-4 animate-pulse">
                        <div className="h-4 bg-white/5 rounded w-2/3 mb-2" />
                        <div className="h-3 bg-white/5 rounded w-1/2" />
                      </div>
                    ))}
                  </div>
                ) : userGroups && userGroups.length > 0 ? (
                  <div className="space-y-3">
                    {userGroups.map((groupId) => (
                      <MiniGroupCard key={groupId.toString()} groupId={groupId} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gradient-to-br from-stride-purple/20 to-pink-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-stride-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <p className="text-stride-muted mb-4">You haven&apos;t joined any groups yet</p>
                    <Link href="/groups" className="btn-primary px-6 py-2 inline-flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      Find Groups
                    </Link>
                  </div>
                )}
              </div>
            )}

            {activeTab === "achievements" && (
              <div className="space-y-6">
                {/* Progress Bar */}
                <div className="card border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium">Achievement Progress</span>
                    <span className="text-stride-purple font-bold">{unlockedAchievements}/{achievements.length}</span>
                  </div>
                  <div className="h-3 bg-stride-dark rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-stride-purple to-pink-500 transition-all duration-500"
                      style={{ width: `${(unlockedAchievements / achievements.length) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Achievement Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {achievements.map((achievement, i) => (
                    <AchievementBadge key={i} {...achievement} />
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="mt-8 flex flex-wrap gap-4 justify-center">
              <Link href="/groups" className="btn-primary px-6 py-3 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Browse Groups
              </Link>
              <Link href="/" className="btn-secondary px-6 py-3 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Home
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

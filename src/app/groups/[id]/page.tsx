"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { formatEther } from "viem";
import { Navbar } from "@/components/Navbar";
import { 
  useGroup, 
  useGroupMembers, 
  useLeaderboard, 
  useIsMember, 
  useInviteCode, 
  useJoinGroup,
  useLeaveGroup,
  useDeleteGroup,
  useGroupStats,
  useGroupChallenges,
  useMemberStats
} from "@/hooks/useGroups";
import { ShareModal } from "@/components/ShareModal";
import { ChallengeCard } from "@/components/ChallengeCard";
import { CreateChallengeModal } from "@/components/CreateChallengeModal";

export default function GroupDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const groupId = BigInt(id);
  
  const { address, isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"challenges" | "leaderboard" | "members">("challenges");
  const [showShareModal, setShowShareModal] = useState(false);
  const [showInviteCode, setShowInviteCode] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [showCreateChallengeModal, setShowCreateChallengeModal] = useState(false);

  const { data: group, isLoading, refetch } = useGroup(groupId);
  const { data: members } = useGroupMembers(groupId);
  const { data: leaderboard } = useLeaderboard(groupId);
  const { data: isMember, refetch: refetchMember } = useIsMember(groupId, address);
  
  // Get creator address from group data (index 3 is creator in the tuple)
  const creatorAddress = group ? group[3] as `0x${string}` : undefined;
  const { data: inviteCode } = useInviteCode(groupId, address, creatorAddress);
  
  const { data: groupStats } = useGroupStats(groupId);
  const { data: challengeIds, refetch: refetchChallenges } = useGroupChallenges(groupId);
  const { data: myStats } = useMemberStats(groupId, address);
  
  const { joinGroup, isPending: isJoining, isConfirming: isJoinConfirming, isSuccess: joinSuccess } = useJoinGroup();
  const { leaveGroup, isPending: isLeaving, isConfirming: isLeaveConfirming, isSuccess: leaveSuccess } = useLeaveGroup();
  const { deleteGroup, isPending: isDeleting, isConfirming: isDeleteConfirming, isSuccess: deleteSuccess } = useDeleteGroup();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (joinSuccess || leaveSuccess) {
      refetch();
      refetchMember();
      setShowLeaveConfirm(false);
    }
  }, [joinSuccess, leaveSuccess, refetch, refetchMember]);

  useEffect(() => {
    if (deleteSuccess) {
      window.location.href = "/groups";
    }
  }, [deleteSuccess]);

  if (!mounted || isLoading) {
    return (
      <main className="min-h-screen bg-stride-dark">
        <div className="animate-pulse p-8">
          <div className="h-8 bg-white/5 rounded w-1/3 mb-4" />
          <div className="h-4 bg-white/5 rounded w-1/2" />
        </div>
      </main>
    );
  }

  if (!group) {
    return (
      <main className="min-h-screen bg-stride-dark flex items-center justify-center">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2">Group Not Found</h1>
          <p className="text-white/50 mb-6">This group doesn&apos;t exist or may have been deleted.</p>
          <Link 
            href="/groups" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-stride-purple to-pink-500 rounded-xl font-semibold hover:shadow-lg hover:shadow-stride-purple/25 transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Groups
          </Link>
        </div>
      </main>
    );
  }

  const [, name, description, creator, memberCount, challengeCount, , isPrivate, deleted] = group;
  
  if (deleted) {
    return (
      <main className="min-h-screen bg-stride-dark flex items-center justify-center">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2">Group Deleted</h1>
          <p className="text-white/50 mb-6">This group has been deleted by its creator.</p>
          <Link 
            href="/groups" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-stride-purple to-pink-500 rounded-xl font-semibold hover:shadow-lg hover:shadow-stride-purple/25 transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Groups
          </Link>
        </div>
      </main>
    );
  }

  const isCreator = address?.toLowerCase() === creator.toLowerCase();
  const canDelete = isCreator && Number(memberCount) === 1;

  const handleJoin = () => {
    if (!isPrivate) {
      joinGroup(groupId);
    }
  };

  const handleLeave = () => {
    leaveGroup(groupId);
  };

  const handleDelete = () => {
    deleteGroup(groupId);
  };

  return (
    <main className="min-h-screen bg-stride-dark">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Back Link */}
        <Link 
          href="/groups" 
          className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/70 hover:text-white transition-all mb-6 text-sm group"
        >
          <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Groups
        </Link>
        {/* Group Header */}
        <div className="card border-white/10 mb-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-stride-purple to-pink-500 rounded-2xl flex items-center justify-center shrink-0">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
                  {name}
                  {isPrivate && (
                    <span className="px-2 py-0.5 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs rounded-full">
                      Private
                    </span>
                  )}
                </h1>
                <p className="text-stride-muted">{description || "No description"}</p>
                <div className="flex items-center gap-4 mt-3 text-sm text-stride-muted">
                  <span className="flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    {Number(memberCount)} members
                  </span>
                  <span className="flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    {Number(challengeCount)} challenges
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {isMember ? (
                <>
                  <button
                    onClick={() => setShowShareModal(true)}
                    className="btn-secondary py-2 px-4 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    Share
                  </button>
                  {isCreator && isPrivate && (
                    <button
                      onClick={() => setShowInviteCode(!showInviteCode)}
                      className="btn-secondary py-2 px-4 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                      </svg>
                      Invite
                    </button>
                  )}
                  {!isCreator && (
                    <button
                      onClick={() => setShowLeaveConfirm(true)}
                      className="btn-secondary py-2 px-4 flex items-center gap-2 text-red-400 border-red-400/30 hover:bg-red-500/10"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Leave
                    </button>
                  )}
                  {canDelete && (
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="btn-secondary py-2 px-4 flex items-center gap-2 text-red-400 border-red-400/30 hover:bg-red-500/10"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </button>
                  )}
                </>
              ) : isConnected && !isPrivate ? (
                <button
                  onClick={handleJoin}
                  disabled={isJoining || isJoinConfirming}
                  className="btn-primary py-2 px-6"
                >
                  {isJoining || isJoinConfirming ? "Joining..." : "Join Group"}
                </button>
              ) : null}
            </div>
          </div>

          {/* Group Stats */}
          {groupStats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/10">
              <div className="text-center">
                <p className="text-2xl font-bold text-stride-purple">{Number(groupStats.totalChallenges)}</p>
                <p className="text-xs text-stride-muted">Total Challenges</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-400">{Number(groupStats.activeChallenges)}</p>
                <p className="text-xs text-stride-muted">Active</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-400">
                  {Number(formatEther(groupStats.totalStaked || BigInt(0))).toFixed(2)}
                </p>
                <p className="text-xs text-stride-muted">ETH Staked</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-400">
                  {Number(formatEther(groupStats.totalDistributed || BigInt(0))).toFixed(2)}
                </p>
                <p className="text-xs text-stride-muted">ETH Distributed</p>
              </div>
            </div>
          )}

          {/* Invite Code Display */}
          {showInviteCode && inviteCode && (
            <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
              <p className="text-sm text-yellow-400 mb-2 font-medium">Invite Code (share with friends):</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs font-mono bg-black/30 p-2 rounded break-all">
                  {inviteCode}
                </code>
                <button
                  onClick={() => navigator.clipboard.writeText(inviteCode)}
                  className="p-2 hover:bg-white/5 rounded-lg transition-colors shrink-0"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* My Stats in This Group */}
        {isMember && myStats && (
          <div className="card border-stride-purple/30 bg-stride-purple/5 mb-6">
            <h3 className="font-bold mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-stride-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Your Stats in This Group
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-lg font-bold">{Number(myStats.challengesJoined)}</p>
                <p className="text-xs text-stride-muted">Joined</p>
              </div>
              <div>
                <p className="text-lg font-bold text-green-400">{Number(myStats.challengesCompleted)}</p>
                <p className="text-xs text-stride-muted">Completed</p>
              </div>
              <div>
                <p className="text-lg font-bold text-yellow-400">{Number(myStats.winStreak)}</p>
                <p className="text-xs text-stride-muted">Win Streak</p>
              </div>
              <div>
                <p className="text-lg font-bold text-blue-400">
                  {Number(formatEther(myStats.totalWon || BigInt(0))).toFixed(4)}
                </p>
                <p className="text-xs text-stride-muted">ETH Won</p>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-white/10 pb-4 overflow-x-auto">
          {[
            { id: "challenges", label: "Challenges", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
            { id: "leaderboard", label: "Leaderboard", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
            { id: "members", label: "Members", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
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
        {activeTab === "challenges" && (
          <div className="space-y-4">
            {/* Create Challenge Button */}
            {isMember && (
              <div className="flex justify-end">
                <button
                  onClick={() => setShowCreateChallengeModal(true)}
                  className="btn-primary py-2.5 px-5 flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create Challenge
                </button>
              </div>
            )}
            
            {challengeIds && challengeIds.length > 0 ? (
              challengeIds.map((challengeId) => (
                <div key={challengeId.toString()} className="animate-slide-up">
                  <ChallengeCard challengeId={challengeId} />
                </div>
              ))
            ) : (
              <div className="card border-white/10 text-center py-12">
                <svg className="w-12 h-12 text-stride-muted mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <p className="text-stride-muted mb-2">No challenges yet</p>
                <p className="text-sm text-stride-muted">Be the first to create a challenge for this group!</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "leaderboard" && (
          <div className="card border-white/10">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Leaderboard
            </h3>
            
            {leaderboard && leaderboard[0].length > 0 ? (
              <div className="space-y-3">
                {leaderboard[0].map((memberAddr, index) => {
                  const completions = Number(leaderboard[1][index]);
                  const won = Number(leaderboard[2][index]);
                  const isCurrentUser = address?.toLowerCase() === memberAddr.toLowerCase();
                  
                  return (
                    <div
                      key={memberAddr}
                      className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                        isCurrentUser ? "bg-stride-purple/10 border border-stride-purple/30" : "bg-white/5"
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                        index === 0 ? "bg-yellow-500 text-black" :
                        index === 1 ? "bg-gray-400 text-black" :
                        index === 2 ? "bg-orange-600 text-white" :
                        "bg-white/10 text-white"
                      }`}>
                        {index + 1}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="font-mono text-sm truncate">
                          {memberAddr.slice(0, 6)}...{memberAddr.slice(-4)}
                          {isCurrentUser && <span className="text-stride-purple ml-2">(you)</span>}
                        </p>
                        <p className="text-xs text-stride-muted">
                          {completions} completed
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-bold text-green-400">
                          {won > 0 ? `+${(won / 1e18).toFixed(4)} ETH` : "-"}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-stride-muted">
                <p>No activity yet. Complete challenges to appear!</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "members" && (
          <div className="card border-white/10">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Members ({members?.length || 0})
            </h3>
            
            {members && members.length > 0 ? (
              <div className="grid gap-3">
                {members.map((memberAddr, index) => {
                  const isCurrentUser = address?.toLowerCase() === memberAddr.toLowerCase();
                  const isGroupCreator = memberAddr.toLowerCase() === creator.toLowerCase();
                  
                  return (
                    <div
                      key={memberAddr}
                      className={`flex items-center gap-4 p-4 rounded-xl ${
                        isCurrentUser ? "bg-stride-purple/10 border border-stride-purple/30" : "bg-white/5"
                      }`}
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-stride-purple/30 to-pink-500/30 rounded-full flex items-center justify-center">
                        <span className="font-bold">{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-mono text-sm flex items-center gap-2 flex-wrap">
                          {memberAddr.slice(0, 6)}...{memberAddr.slice(-4)}
                          {isCurrentUser && <span className="text-stride-purple">(you)</span>}
                          {isGroupCreator && (
                            <span className="px-2 py-0.5 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs rounded-full">
                              Creator
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-stride-muted">
                <p>No members yet.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <ShareModal
          title={`Join "${name}" on Stride`}
          url={typeof window !== "undefined" ? window.location.href : ""}
          onClose={() => setShowShareModal(false)}
        />
      )}

      {/* Leave Confirmation Modal */}
      {showLeaveConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowLeaveConfirm(false)} />
          <div className="relative w-full max-w-sm bg-stride-gray border border-white/10 rounded-2xl shadow-2xl p-6">
            <h3 className="text-xl font-bold mb-2">Leave Group?</h3>
            <p className="text-stride-muted mb-6">
              Are you sure you want to leave &quot;{name}&quot;? You can rejoin later if the group is public.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLeaveConfirm(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleLeave}
                disabled={isLeaving || isLeaveConfirming}
                className="flex-1 py-2.5 px-5 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-all"
              >
                {isLeaving || isLeaveConfirming ? "Leaving..." : "Leave"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(false)} />
          <div className="relative w-full max-w-sm bg-stride-gray border border-white/10 rounded-2xl shadow-2xl p-6">
            <h3 className="text-xl font-bold mb-2 text-red-400">Delete Group?</h3>
            <p className="text-stride-muted mb-6">
              This action cannot be undone. The group &quot;{name}&quot; will be permanently deleted.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting || isDeleteConfirming}
                className="flex-1 py-2.5 px-5 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-all"
              >
                {isDeleting || isDeleteConfirming ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Challenge Modal */}
      {showCreateChallengeModal && (
        <CreateChallengeModal
          onClose={() => setShowCreateChallengeModal(false)}
          groupId={groupId}
          groupName={name}
          onSuccess={() => {
            refetchChallenges();
            refetch();
          }}
        />
      )}
    </main>
  );
}

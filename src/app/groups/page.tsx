"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@/components/ConnectButton";
import { Navbar } from "@/components/Navbar";
import { useGroupCount, useUserGroups } from "@/hooks/useGroups";
import { GroupCard } from "@/components/GroupCard";
import { CreateGroupModal } from "@/components/CreateGroupModal";
import { JoinGroupModal } from "@/components/JoinGroupModal";

export default function GroupsPage() {
  const { address, isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  
  const { data: groupCount, isLoading: loadingCount, refetch: refetchGroupCount } = useGroupCount();
  const { data: userGroupIds, refetch: refetchUserGroups } = useUserGroups(address);

  const handleGroupCreated = () => {
    refetchGroupCount();
    refetchUserGroups();
  };

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

  return (
    <main className="min-h-screen bg-stride-dark">
      <Navbar />

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              <span className="gradient-text">Friend Groups</span>
            </h1>
            <p className="text-stride-muted">
              Create or join groups to compete with friends and track your progress together.
            </p>
          </div>
          
          {isConnected && (
            <div className="flex gap-3">
              <button
                onClick={() => setShowJoinModal(true)}
                className="btn-secondary py-2.5 px-5 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Join Group
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary py-2.5 px-5 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Group
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        {!isConnected ? (
          <div className="card text-center py-16 border-white/10">
            <div className="w-20 h-20 bg-gradient-to-br from-stride-purple/20 to-pink-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-float">
              <svg className="w-10 h-10 text-stride-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-4">Connect to View Groups</h2>
            <p className="text-stride-muted mb-8 max-w-md mx-auto">
              Connect your wallet to create groups, join friend circles, and compete on leaderboards.
            </p>
            <div className="flex justify-center">
              <ConnectButton />
            </div>
          </div>
        ) : loadingCount ? (
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card animate-pulse border-white/10">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-white/5 rounded-xl" />
                  <div className="flex-1">
                    <div className="h-5 bg-white/5 rounded w-1/3 mb-2" />
                    <div className="h-4 bg-white/5 rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* My Groups */}
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-stride-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                My Groups
              </h2>
              
              {userGroupIds && userGroupIds.length > 0 ? (
                <div className="grid gap-4">
                  {userGroupIds.map((groupId) => (
                    <GroupCard key={groupId.toString()} groupId={groupId} />
                  ))}
                </div>
              ) : (
                <div className="card text-center py-12 border-dashed border-2 border-white/10 bg-transparent">
                  <div className="w-16 h-16 bg-gradient-to-br from-stride-purple/20 to-pink-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-stride-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium mb-2">No Groups Yet</h3>
                  <p className="text-stride-muted max-w-sm mx-auto mb-4">
                    Create a group to compete with friends or join an existing one with an invite code.
                  </p>
                  <div className="flex justify-center gap-3">
                    <button
                      onClick={() => setShowJoinModal(true)}
                      className="btn-secondary py-2 px-4 text-sm"
                    >
                      Join Group
                    </button>
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="btn-primary py-2 px-4 text-sm"
                    >
                      Create Group
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Public Groups - only shows non-private groups */}
            {Number(groupCount || 0) > 0 && (
              <div>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Discover Groups
                </h2>
                <div className="grid gap-4">
                  {Array.from({ length: Number(groupCount) }, (_, i) => BigInt(i)).map((groupId) => (
                    <GroupCard key={groupId.toString()} groupId={groupId} showJoinButton />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </section>

      {/* Modals */}
      {showCreateModal && (
        <CreateGroupModal 
          onClose={() => setShowCreateModal(false)} 
          onSuccess={handleGroupCreated}
        />
      )}
      {showJoinModal && (
        <JoinGroupModal onClose={() => setShowJoinModal(false)} />
      )}
    </main>
  );
}

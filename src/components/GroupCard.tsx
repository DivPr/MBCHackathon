"use client";

import { useGroup, useIsMember, useJoinGroup } from "@/hooks/useGroups";
import { useAccount } from "wagmi";
import Link from "next/link";

interface GroupCardProps {
  groupId: bigint;
  showJoinButton?: boolean;
}

export function GroupCard({ groupId, showJoinButton }: GroupCardProps) {
  const { address } = useAccount();
  const { data: group, isLoading } = useGroup(groupId);
  const { data: isMember } = useIsMember(groupId, address);
  const { joinGroup, isPending, isConfirming } = useJoinGroup();

  if (isLoading || !group) {
    return (
      <div className="card animate-pulse border-white/10">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 bg-white/5 rounded-xl" />
          <div className="flex-1">
            <div className="h-5 bg-white/5 rounded w-1/3 mb-2" />
            <div className="h-4 bg-white/5 rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  const [id, name, description, creator, memberCount, challengeCount, createdAt, isPrivate] = group;

  // Don't show private groups in the public list
  if (showJoinButton && isPrivate) {
    return null;
  }

  const handleJoin = () => {
    if (!isPrivate) {
      joinGroup(groupId);
    }
  };

  const isProcessing = isPending || isConfirming;

  return (
    <Link href={`/groups/${groupId}`}>
      <div className="card border-white/10 hover:border-stride-purple/50 transition-all cursor-pointer group">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="w-14 h-14 bg-gradient-to-br from-stride-purple/20 to-pink-500/20 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <svg className="w-7 h-7 text-stride-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
                  {name}
                  {isPrivate && (
                    <span className="px-2 py-0.5 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs rounded-full">
                      Private
                    </span>
                  )}
                  {isMember && (
                    <span className="px-2 py-0.5 bg-green-500/10 border border-green-500/30 text-green-400 text-xs rounded-full">
                      Joined
                    </span>
                  )}
                </h3>
                <p className="text-stride-muted text-sm line-clamp-1">
                  {description || "No description"}
                </p>
              </div>

              {showJoinButton && !isMember && !isPrivate && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleJoin();
                  }}
                  disabled={isProcessing}
                  className="btn-primary py-1.5 px-4 text-sm shrink-0"
                >
                  {isProcessing ? "Joining..." : "Join"}
                </button>
              )}
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1.5 text-sm text-stride-muted">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                {Number(memberCount)} members
              </div>
              <div className="flex items-center gap-1.5 text-sm text-stride-muted">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                {Number(challengeCount)} challenges
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}


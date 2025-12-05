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
  const { data: group, isLoading, error } = useGroup(groupId);
  const { data: isMember } = useIsMember(groupId, address);
  const { joinGroup, isPending, isConfirming } = useJoinGroup();

  // Show loading skeleton only while loading (not on error)
  if (isLoading) {
    return (
      <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 animate-pulse">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-white/5 rounded-xl" />
          <div className="flex-1">
            <div className="h-5 bg-white/5 rounded w-1/3 mb-3" />
            <div className="h-4 bg-white/5 rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  // Handle error or missing data
  if (error || !group) {
    return null; // Don't render anything if there's an error or no data
  }

  const [, name, description, , memberCount, challengeCount, , isPrivate, deleted] = group;

  // Don't show deleted groups
  if (deleted) {
    return null;
  }

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
      <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.03] transition-all cursor-pointer group">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="w-12 h-12 bg-gradient-to-br from-stride-purple to-pink-500 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h3 className="font-semibold text-base mb-0.5 flex items-center gap-2 flex-wrap">
                  <span className="truncate">{name}</span>
                  {isPrivate && (
                    <span className="px-2 py-0.5 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs rounded-full shrink-0">
                      Private
                    </span>
                  )}
                  {isMember && (
                    <span className="px-2 py-0.5 bg-green-500/10 border border-green-500/20 text-green-400 text-xs rounded-full shrink-0">
                      Joined
                    </span>
                  )}
                </h3>
                <p className="text-white/40 text-sm truncate">
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
                  className="px-4 py-1.5 bg-stride-purple hover:bg-stride-purple/90 rounded-lg text-sm font-medium shrink-0 transition-colors disabled:opacity-50"
                >
                  {isProcessing ? "..." : "Join"}
                </button>
              )}
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1.5 text-sm text-white/40">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                {Number(memberCount)} members
              </div>
              <div className="flex items-center gap-1.5 text-sm text-white/40">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                {Number(challengeCount)} challenges
              </div>
              {/* Arrow indicator */}
              <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="w-4 h-4 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

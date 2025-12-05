"use client";

import { useState, useEffect } from "react";
import { useJoinGroupWithCode } from "@/hooks/useGroups";

interface JoinGroupModalProps {
  onClose: () => void;
}

export function JoinGroupModal({ onClose }: JoinGroupModalProps) {
  const [inviteCode, setInviteCode] = useState("");
  
  const { joinGroupWithCode, isPending, isConfirming, isSuccess, error } = useJoinGroupWithCode();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;
    
    // Ensure it's a valid bytes32 hex
    let code = inviteCode.trim();
    if (!code.startsWith("0x")) {
      code = "0x" + code;
    }
    
    joinGroupWithCode(code as `0x${string}`);
  };

  useEffect(() => {
    if (isSuccess) {
      setTimeout(() => onClose(), 1500);
    }
  }, [isSuccess, onClose]);

  const isProcessing = isPending || isConfirming;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-stride-gray border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold">Join Group</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        {isSuccess ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Joined Successfully!</h3>
            <p className="text-stride-muted">You&apos;re now part of the group.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Info */}
            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm text-blue-100">
                    Enter the invite code shared by the group admin to join a private group.
                  </p>
                </div>
              </div>
            </div>

            {/* Invite Code */}
            <div>
              <label className="label">Invite Code</label>
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                placeholder="0x..."
                className="input font-mono text-sm"
                required
              />
              <p className="text-xs text-stride-muted mt-2">
                The invite code is a 66-character hex string starting with 0x
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-sm text-red-400">
                {error.message.includes("User rejected")
                  ? "Transaction rejected"
                  : error.message.includes("Invalid invite")
                  ? "Invalid invite code. Please check and try again."
                  : error.message.includes("Already a member")
                  ? "You're already a member of this group."
                  : "Failed to join group. Please try again."}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isProcessing || !inviteCode.trim()}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {isConfirming ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Confirming...
                </>
              ) : isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Joining...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  Join Group
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}


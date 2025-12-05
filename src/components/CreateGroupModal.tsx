"use client";

import { useState, useEffect } from "react";
import { useCreateGroup } from "@/hooks/useGroups";

interface CreateGroupModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateGroupModal({ onClose, onSuccess }: CreateGroupModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);

  const { createGroup, isPending, isConfirming, isSuccess, error } = useCreateGroup();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    createGroup(name.trim(), description.trim(), isPrivate);
  };

  useEffect(() => {
    if (isSuccess) {
      onSuccess?.();
      setTimeout(() => onClose(), 1500);
    }
  }, [isSuccess, onClose, onSuccess]);

  const isProcessing = isPending || isConfirming;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-stride-gray border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-stride-purple to-pink-500 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold">Create Group</h2>
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
            <h3 className="text-xl font-bold mb-2">Group Created!</h3>
            <p className="text-stride-muted">Your group is ready. Invite friends to join!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Name */}
            <div>
              <label className="label">Group Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Morning Runners"
                className="input"
                maxLength={50}
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="label">Description (optional)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What's your group about?"
                className="input min-h-[80px] resize-none"
                maxLength={200}
              />
            </div>

            {/* Privacy */}
            <div>
              <label className="label">Privacy</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setIsPrivate(false)}
                  className={`p-3 rounded-xl border text-sm font-medium transition-all flex items-center gap-2 ${
                    !isPrivate
                      ? "bg-stride-purple text-white border-stride-purple"
                      : "bg-stride-dark border-white/10 hover:border-stride-purple/50"
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Public
                </button>
                <button
                  type="button"
                  onClick={() => setIsPrivate(true)}
                  className={`p-3 rounded-xl border text-sm font-medium transition-all flex items-center gap-2 ${
                    isPrivate
                      ? "bg-stride-purple text-white border-stride-purple"
                      : "bg-stride-dark border-white/10 hover:border-stride-purple/50"
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Private
                </button>
              </div>
              <p className="text-xs text-stride-muted mt-2">
                {isPrivate
                  ? "Only people with the invite code can join"
                  : "Anyone can find and join this group"}
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-sm text-red-400">
                {error.message.includes("User rejected")
                  ? "Transaction rejected"
                  : "Failed to create group. Please try again."}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isProcessing || !name.trim()}
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
                  Creating...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create Group
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}


"use client";

import { useState, useEffect } from "react";
import { useCreateChallenge } from "@/hooks/useChallenge";

interface CreateChallengeModalProps {
  onClose: () => void;
  groupId: bigint;
  groupName: string;
}

const DURATION_OPTIONS = [
  { label: "1 Hour", value: 3600, icon: "⚡" },
  { label: "24 Hours", value: 86400, icon: "☀️" },
  { label: "3 Days", value: 259200, icon: "📅" },
  { label: "7 Days", value: 604800, icon: "🗓️" },
];

const STAKE_OPTIONS = ["0.0001", "0.0005", "0.001", "0.005"];

export function CreateChallengeModal({ onClose, groupId, groupName }: CreateChallengeModalProps) {
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState(86400);
  const [stakeAmount, setStakeAmount] = useState("0.0001");
  const [customStake, setCustomStake] = useState("");

  const { createChallenge, isPending, isConfirming, isSuccess, error } =
    useCreateChallenge();

  useEffect(() => {
    if (isSuccess) {
      setTimeout(() => {
        onClose();
        window.location.reload();
      }, 2000);
    }
  }, [isSuccess, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const stake = customStake || stakeAmount;
    // Always pass the groupId + 1 (since 0 means no group in the contract)
    createChallenge(stake, duration, description, Number(groupId) + 1);
  };

  const isProcessing = isPending || isConfirming;
  const finalStake = customStake || stakeAmount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-stride-gray border border-white/10 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-stride-purple to-pink-500 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold">Create Challenge</h2>
              <p className="text-xs text-stride-muted">in {groupName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Success State */}
        {isSuccess ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-bounce">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-bold mb-2">Challenge Created!</h3>
            <p className="text-stride-muted">Redirecting...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Description */}
            <div>
              <label className="label">Challenge Description</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., 5K morning run, 10K weekend challenge"
                className="input"
                required
              />
            </div>

            {/* Duration */}
            <div>
              <label className="label">Duration</label>
              <div className="grid grid-cols-2 gap-2">
                {DURATION_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setDuration(option.value)}
                    className={`p-3 rounded-xl border text-sm font-medium transition-all flex items-center gap-2 ${
                      duration === option.value
                        ? "bg-stride-purple text-white border-stride-purple"
                        : "bg-stride-dark border-white/10 hover:border-stride-purple/50"
                    }`}
                  >
                    <span>{option.icon}</span>
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Stake Amount */}
            <div>
              <label className="label">Stake Amount (ETH)</label>
              <div className="grid grid-cols-4 gap-2 mb-3">
                {STAKE_OPTIONS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      setStakeAmount(option);
                      setCustomStake("");
                    }}
                    className={`p-3 rounded-xl border text-sm font-medium transition-all ${
                      stakeAmount === option && !customStake
                        ? "bg-stride-purple text-white border-stride-purple"
                        : "bg-stride-dark border-white/10 hover:border-stride-purple/50"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
              <div className="relative">
                <input
                  type="number"
                  step="0.0001"
                  min="0.0001"
                  value={customStake}
                  onChange={(e) => setCustomStake(e.target.value)}
                  placeholder="Or enter custom amount"
                  className="input pr-14"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-stride-muted font-medium">
                  ETH
                </span>
              </div>
            </div>

            {/* Summary */}
            <div className="p-4 bg-stride-dark border border-white/10 rounded-xl">
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-stride-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Summary
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-stride-muted">Group</span>
                  <span className="font-medium">{groupName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stride-muted">Your stake</span>
                  <span className="font-medium text-stride-purple">{finalStake} ETH</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stride-muted">Duration</span>
                  <span className="font-medium">
                    {DURATION_OPTIONS.find((o) => o.value === duration)?.label}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stride-muted">Network</span>
                  <span className="font-medium text-blue-400">Base Sepolia</span>
                </div>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3">
                <svg className="w-5 h-5 text-red-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div className="text-sm text-red-400">
                  {error.message.includes("User rejected") ? (
                    "Transaction rejected by user"
                  ) : error.message.includes("insufficient") ? (
                    "Insufficient ETH balance. Get testnet ETH from a faucet."
                  ) : error.message.includes("chain") || error.message.includes("network") ? (
                    "Please switch to Base Sepolia network."
                  ) : (
                    "Transaction failed. Make sure you&apos;re on Base Sepolia with enough ETH."
                  )}
                </div>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isProcessing || !description}
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Create & Stake {finalStake} ETH
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

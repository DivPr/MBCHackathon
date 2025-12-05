"use client";

import { useState, useEffect } from "react";
import { useCreateChallenge } from "@/hooks/useChallenge";

interface CreateChallengeModalProps {
  onClose: () => void;
}

const DURATION_OPTIONS = [
  { label: "1 Hour", value: 3600 },
  { label: "24 Hours", value: 86400 },
  { label: "3 Days", value: 259200 },
  { label: "7 Days", value: 604800 },
];

const STAKE_OPTIONS = ["0.0001", "0.0005", "0.001", "0.005"];

export function CreateChallengeModal({ onClose }: CreateChallengeModalProps) {
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
    createChallenge(stake, duration, description);
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
      <div className="relative bg-stride-gray border border-stride-muted/30 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-stride-muted/30">
          <h2 className="text-xl font-bold">Create Challenge</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-stride-dark rounded-lg transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Success State */}
        {isSuccess ? (
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-stride-lime rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-stride-dark"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
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
                placeholder="e.g., 5K run, 10K morning jog"
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
                    className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                      duration === option.value
                        ? "bg-stride-lime text-stride-dark border-stride-lime"
                        : "bg-stride-dark border-stride-muted/50 hover:border-stride-lime"
                    }`}
                  >
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
                    className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                      stakeAmount === option && !customStake
                        ? "bg-stride-lime text-stride-dark border-stride-lime"
                        : "bg-stride-dark border-stride-muted/50 hover:border-stride-lime"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
              <div className="relative">
                <input
                  type="number"
                  step="0.001"
                  min="0.0001"
                  value={customStake}
                  onChange={(e) => setCustomStake(e.target.value)}
                  placeholder="Or enter custom amount"
                  className="input pr-12"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-stride-muted">
                  ETH
                </span>
              </div>
            </div>

            {/* Summary */}
            <div className="p-4 bg-stride-dark rounded-lg">
              <h4 className="text-sm font-medium mb-3">Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-stride-muted">Your stake:</span>
                  <span className="font-medium">{finalStake} ETH</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stride-muted">Duration:</span>
                  <span className="font-medium">
                    {DURATION_OPTIONS.find((o) => o.value === duration)?.label}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stride-muted">Network:</span>
                  <span className="font-medium">Base Sepolia</span>
                </div>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-sm text-red-400">
                  {error.message.includes("User rejected")
                    ? "Transaction rejected"
                    : error.message}
                </p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isProcessing || !description}
              className="btn-primary w-full"
            >
              {isConfirming
                ? "Confirming..."
                : isPending
                ? "Creating..."
                : `Create & Stake ${finalStake} ETH`}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}


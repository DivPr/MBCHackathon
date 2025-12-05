"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useCreateChallenge, useChallengeCount } from "@/hooks/useChallenge";
import { useCreateUSDCChallenge, useUSDCChallengeCount, useUSDCBalance, useUSDCAllowance, useApproveUSDC, useUSDCFaucet, formatUSDCBalance } from "@/hooks/useUSDC";
import { useAddChallengeToGroup } from "@/hooks/useGroups";
import { parseEther } from "viem";
import { parseUSDC, isUSDCContractDeployed } from "@/config/usdcContract";
import { CircleLogo } from "./USDCStakeButton";

interface CreateChallengeModalProps {
  onClose: () => void;
  groupId: bigint;
  groupName: string;
  onSuccess?: () => void;
  // Rematch pre-fill props
  initialDescription?: string;
  initialStakeAmount?: string;
  initialCurrency?: "ETH" | "USDC";
  initialDuration?: number;
}

const DURATION_OPTIONS = [
  { label: "1 Hour", value: 3600, icon: "⚡" },
  { label: "24 Hours", value: 86400, icon: "☀️" },
  { label: "3 Days", value: 259200, icon: "📅" },
  { label: "7 Days", value: 604800, icon: "🗓️" },
  { label: "Custom", value: -1, icon: "⏱️" },
];

const ETH_STAKE_OPTIONS = ["0.0001", "0.0005", "0.001", "0.005"];
const USDC_STAKE_OPTIONS = ["1", "5", "10", "25"];

type Currency = "ETH" | "USDC";

export function CreateChallengeModal({ 
  onClose, 
  groupId, 
  groupName, 
  onSuccess,
  initialDescription = "",
  initialStakeAmount,
  initialCurrency = "ETH",
  initialDuration = 86400,
}: CreateChallengeModalProps) {
  const { address } = useAccount();
  const [description, setDescription] = useState(initialDescription);
  const [duration, setDuration] = useState(
    DURATION_OPTIONS.some(o => o.value === initialDuration) ? initialDuration : -1
  );
  const [customDuration, setCustomDuration] = useState(() => {
    if (!DURATION_OPTIONS.some(o => o.value === initialDuration) && initialDuration > 0) {
      // Convert to hours if custom duration
      const hours = Math.floor(initialDuration / 3600);
      return { value: hours.toString(), unit: "hours" };
    }
    return { value: "", unit: "hours" };
  });
  const [currency, setCurrency] = useState<Currency>(initialCurrency);
  const [ethStakeAmount, setEthStakeAmount] = useState(
    initialCurrency === "ETH" && initialStakeAmount ? initialStakeAmount : "0.0001"
  );
  const [usdcStakeAmount, setUsdcStakeAmount] = useState(
    initialCurrency === "USDC" && initialStakeAmount ? initialStakeAmount : "5"
  );
  const [customStake, setCustomStake] = useState("");
  const [step, setStep] = useState<"create" | "approve" | "register" | "done">("create");
  const isRematch = !!initialDescription;

  // ETH Challenge hooks
  const { data: ethChallengeCount } = useChallengeCount();
  const { createChallenge: createEthChallenge, isPending: ethPending, isConfirming: ethConfirming, isSuccess: ethSuccess, error: ethError } = useCreateChallenge();
  
  // USDC Challenge hooks
  const { data: usdcChallengeCount } = useUSDCChallengeCount();
  const { createChallenge: createUsdcChallenge, isPending: usdcPending, isConfirming: usdcConfirming, isSuccess: usdcSuccess, error: usdcError } = useCreateUSDCChallenge();
  
  // USDC Balance and Approval
  const { data: usdcBalance, refetch: refetchBalance } = useUSDCBalance(address);
  const { data: usdcAllowance, refetch: refetchAllowance } = useUSDCAllowance(address);
  const { approveMax, isPending: approvePending, isConfirming: approveConfirming, isSuccess: approveSuccess } = useApproveUSDC();
  const { claimFaucet, isPending: faucetPending, isConfirming: faucetConfirming, isSuccess: faucetSuccess } = useUSDCFaucet();
  
  // Group registration
  const { 
    addChallengeToGroup, 
    isPending: isRegisterPending, 
    isConfirming: isRegisterConfirming, 
    isSuccess: isRegisterSuccess,
    error: registerError 
  } = useAddChallengeToGroup();

  const isPending = currency === "ETH" ? ethPending : usdcPending;
  const isConfirming = currency === "ETH" ? ethConfirming : usdcConfirming;
  const isSuccess = currency === "ETH" ? ethSuccess : usdcSuccess;
  const error = currency === "ETH" ? ethError : usdcError;
  const challengeCount = currency === "ETH" ? ethChallengeCount : usdcChallengeCount;

  const stakeAmount = customStake || (currency === "ETH" ? ethStakeAmount : usdcStakeAmount);
  const stakeOptions = currency === "ETH" ? ETH_STAKE_OPTIONS : USDC_STAKE_OPTIONS;

  // USDC validation
  const parsedUsdcAmount = parseUSDC(stakeAmount);
  const hasEnoughUSDC = usdcBalance !== undefined && usdcBalance >= parsedUsdcAmount;
  const hasApproval = usdcAllowance !== undefined && usdcAllowance >= parsedUsdcAmount;

  // Refetch after faucet success
  useEffect(() => {
    if (faucetSuccess) {
      refetchBalance();
    }
  }, [faucetSuccess, refetchBalance]);

  // Refetch after approval success
  useEffect(() => {
    if (approveSuccess) {
      refetchAllowance();
      refetchBalance();
      setStep("create");
    }
  }, [approveSuccess, refetchAllowance, refetchBalance]);

  // After challenge is created, register it with the group
  useEffect(() => {
    if (isSuccess && step === "create" && challengeCount !== undefined) {
      const newId = challengeCount;
      setStep("register");
      
      const stakeWei = currency === "ETH" ? parseEther(stakeAmount) : parsedUsdcAmount;
      addChallengeToGroup(groupId, newId, stakeWei);
    }
  }, [isSuccess, step, challengeCount, groupId, stakeAmount, addChallengeToGroup, currency, parsedUsdcAmount]);

  // After registration is complete
  useEffect(() => {
    if (isRegisterSuccess && step === "register") {
      setStep("done");
      onSuccess?.();
      setTimeout(() => {
        onClose();
      }, 2000);
    }
  }, [isRegisterSuccess, step, onClose, onSuccess]);

  // Calculate final duration in seconds
  const getFinalDuration = () => {
    if (duration === -1 && customDuration.value) {
      const val = parseFloat(customDuration.value);
      switch (customDuration.unit) {
        case "minutes": return Math.floor(val * 60);
        case "hours": return Math.floor(val * 3600);
        case "days": return Math.floor(val * 86400);
        default: return Math.floor(val * 3600);
      }
    }
    return duration;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalDuration = getFinalDuration();
    if (finalDuration <= 0) return;

    // For USDC, check if approval is needed first
    if (currency === "USDC" && !hasApproval) {
      setStep("approve");
      return;
    }

    if (currency === "ETH") {
      createEthChallenge(stakeAmount, finalDuration, description, Number(groupId) + 1);
    } else {
      createUsdcChallenge(stakeAmount, finalDuration, description, Number(groupId) + 1);
    }
  };

  const handleApprove = () => {
    approveMax();
  };

  const isProcessing = isPending || isConfirming || isRegisterPending || isRegisterConfirming || approvePending || approveConfirming;
  const currentError = error || registerError;

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
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isRematch 
                ? "bg-gradient-to-br from-yellow-400 to-orange-500" 
                : "bg-gradient-to-br from-stride-purple to-pink-500"
            }`}>
              {isRematch ? (
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                {isRematch ? "Rematch Challenge" : "Create Challenge"}
                {isRematch && (
                  <span className="text-xs px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded-full">
                    🔥 Rematch
                  </span>
                )}
              </h2>
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
        {step === "done" ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-bounce">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-bold mb-2">Challenge Created!</h3>
            <p className="text-stride-muted">Redirecting...</p>
          </div>
        ) : step === "register" ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-stride-purple to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <div className="w-8 h-8 border-3 border-white/30 border-t-white rounded-full animate-spin" />
            </div>
            <h3 className="text-lg font-bold mb-2">Registering with Group...</h3>
            <p className="text-stride-muted text-sm">Please confirm the second transaction</p>
          </div>
        ) : step === "approve" ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-usdc-blue rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CircleLogo className="w-10 h-10" />
            </div>
            <h3 className="text-lg font-bold mb-2">Approve USDC</h3>
            <p className="text-stride-muted text-sm">
              Approve the contract to spend your USDC for staking challenges.
            </p>
            <button
              onClick={handleApprove}
              disabled={approvePending || approveConfirming}
              className="btn-primary w-full bg-usdc-blue hover:bg-usdc-blue/90 flex items-center justify-center gap-2"
            >
              {approvePending || approveConfirming ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Approving...
                </>
              ) : (
                <>
                  <CircleLogo className="w-5 h-5" />
                  Approve USDC
                </>
              )}
            </button>
            <button
              onClick={() => setStep("create")}
              className="text-sm text-stride-muted hover:text-white transition-colors"
            >
              ← Back to form
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Currency Selector */}
            <div>
              <label className="label">Stake Currency</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setCurrency("ETH");
                    setCustomStake("");
                  }}
                  className={`p-4 rounded-xl border transition-all flex items-center gap-3 ${
                    currency === "ETH"
                      ? "bg-stride-purple text-white border-stride-purple"
                      : "bg-stride-dark border-white/10 hover:border-stride-purple/50"
                  }`}
                >
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-lg">
                    Ξ
                  </div>
                  <div className="text-left">
                    <div className="font-medium">ETH</div>
                    <div className="text-xs opacity-70">Ethereum</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCurrency("USDC");
                    setCustomStake("");
                  }}
                  disabled={!isUSDCContractDeployed}
                  className={`p-4 rounded-xl border transition-all flex items-center gap-3 ${
                    currency === "USDC"
                      ? "bg-usdc-blue text-white border-usdc-blue"
                      : "bg-stride-dark border-white/10 hover:border-usdc-blue/50"
                  } ${!isUSDCContractDeployed ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <CircleLogo className="w-8 h-8" />
                  <div className="text-left">
                    <div className="font-medium">USDC</div>
                    <div className="text-xs opacity-70">Circle</div>
                  </div>
                </button>
              </div>
            </div>

            {/* USDC Balance & Faucet */}
            {currency === "USDC" && (
              <div className="p-4 bg-usdc-blue/10 border border-usdc-blue/30 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-stride-muted">Your USDC Balance</span>
                  <span className="font-medium text-usdc-blue">{formatUSDCBalance(usdcBalance)} USDC</span>
                </div>
                {(!hasEnoughUSDC || usdcBalance === BigInt(0)) && (
                  <button
                    type="button"
                    onClick={() => claimFaucet()}
                    disabled={faucetPending || faucetConfirming}
                    className="btn-secondary w-full flex items-center justify-center gap-2 text-sm"
                  >
                    {faucetPending || faucetConfirming ? (
                      <>
                        <div className="w-4 h-4 border-2 border-usdc-blue/30 border-t-usdc-blue rounded-full animate-spin" />
                        Claiming...
                      </>
                    ) : (
                      <>
                        <CircleLogo className="w-4 h-4" />
                        Get Test USDC (Faucet)
                      </>
                    )}
                  </button>
                )}
              </div>
            )}

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
              <div className="grid grid-cols-3 gap-2 mb-3">
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
              {/* Custom duration input */}
              {duration === -1 && (
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={customDuration.value}
                    onChange={(e) => setCustomDuration({ ...customDuration, value: e.target.value })}
                    placeholder="Enter duration"
                    className="input flex-1"
                  />
                  <select
                    value={customDuration.unit}
                    onChange={(e) => setCustomDuration({ ...customDuration, unit: e.target.value })}
                    className="input w-28"
                  >
                    <option value="minutes">Minutes</option>
                    <option value="hours">Hours</option>
                    <option value="days">Days</option>
                  </select>
                </div>
              )}
            </div>

            {/* Stake Amount */}
            <div>
              <label className="label">Stake Amount ({currency})</label>
              <div className="grid grid-cols-4 gap-2 mb-3">
                {stakeOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      if (currency === "ETH") {
                        setEthStakeAmount(option);
                      } else {
                        setUsdcStakeAmount(option);
                      }
                      setCustomStake("");
                    }}
                    className={`p-3 rounded-xl border text-sm font-medium transition-all ${
                      (currency === "ETH" ? ethStakeAmount : usdcStakeAmount) === option && !customStake
                        ? currency === "USDC" ? "bg-usdc-blue text-white border-usdc-blue" : "bg-stride-purple text-white border-stride-purple"
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
                  step={currency === "ETH" ? "0.0001" : "0.01"}
                  min={currency === "ETH" ? "0.0001" : "0.01"}
                  value={customStake}
                  onChange={(e) => setCustomStake(e.target.value)}
                  placeholder="Or enter custom amount"
                  className="input pr-16"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-stride-muted font-medium">
                  {currency}
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
                  <span className={`font-medium ${currency === "USDC" ? "text-usdc-blue" : "text-stride-purple"}`}>
                    {stakeAmount} {currency}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stride-muted">Duration</span>
                  <span className="font-medium">
                    {duration === -1 
                      ? `${customDuration.value} ${customDuration.unit}`
                      : DURATION_OPTIONS.find((o) => o.value === duration)?.label}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stride-muted">Network</span>
                  <span className="font-medium text-blue-400">Base</span>
                </div>
              </div>
            </div>

            {/* Circle USDC Badge */}
            {currency === "USDC" && (
              <div className="flex justify-center">
                <a
                  href="https://developers.circle.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-usdc-blue/10 border border-usdc-blue/30 rounded-full text-xs text-usdc-blue hover:bg-usdc-blue/20 transition-colors"
                >
                  <CircleLogo className="w-4 h-4" />
                  Powered by Circle USDC
                </a>
              </div>
            )}

            {/* Info about 2 transactions */}
            <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl">
              <p className="text-xs text-blue-400">
                <strong>Note:</strong> Creating a challenge requires {currency === "USDC" && !hasApproval ? "3" : "2"} transactions
                {currency === "USDC" && !hasApproval && " (1 approval + "}
                - one to create the challenge, and one to register it with the group
                {currency === "USDC" && !hasApproval && ")"}
                .
              </p>
            </div>

            {/* Error */}
            {currentError && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3">
                <svg className="w-5 h-5 text-red-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div className="text-sm text-red-400">
                  {currentError.message.includes("User rejected") ? (
                    "Transaction rejected by user"
                  ) : currentError.message.includes("insufficient") ? (
                    `Insufficient ${currency} balance.`
                  ) : currentError.message.includes("chain") || currentError.message.includes("network") ? (
                    "Please switch to the correct network."
                  ) : (
                    "Transaction failed. Please try again."
                  )}
                </div>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={
                isProcessing || 
                !description || 
                (duration === -1 && !customDuration.value) ||
                (currency === "USDC" && !hasEnoughUSDC)
              }
              className={`w-full flex items-center justify-center gap-2 ${
                currency === "USDC" 
                  ? "btn-primary bg-usdc-blue hover:bg-usdc-blue/90" 
                  : "btn-primary"
              }`}
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
              ) : currency === "USDC" && !hasApproval ? (
                <>
                  <CircleLogo className="w-5 h-5" />
                  Approve & Create Challenge
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Create & Stake {stakeAmount} {currency}
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}


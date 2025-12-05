"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import {
  useUSDCBalance,
  useUSDCAllowance,
  useApproveUSDC,
  formatUSDCBalance,
} from "@/hooks/useUSDC";
import { parseUSDC, STRIDE_USDC_CHALLENGE_ADDRESS } from "@/config/usdcContract";

interface USDCStakeButtonProps {
  amount: string;
  onStake: () => void;
  isStaking: boolean;
  label?: string;
}

/**
 * USDC Stake Button with approval flow
 * Powered by Circle USDC
 */
export function USDCStakeButton({
  amount,
  onStake,
  isStaking,
  label = "Stake",
}: USDCStakeButtonProps) {
  const { address } = useAccount();
  const { data: balance, refetch: refetchBalance } = useUSDCBalance(address);
  const { data: allowance, refetch: refetchAllowance } = useUSDCAllowance(address);
  const {
    approve,
    approveMax,
    isPending: isApproving,
    isConfirming: isApproveConfirming,
    isSuccess: approveSuccess,
  } = useApproveUSDC();

  const [step, setStep] = useState<"check" | "approve" | "stake">("check");
  
  const parsedAmount = parseUSDC(amount);
  const hasEnoughBalance = balance !== undefined && balance >= parsedAmount;
  const hasEnoughAllowance = allowance !== undefined && allowance >= parsedAmount;
  const isContractDeployed = STRIDE_USDC_CHALLENGE_ADDRESS !== "0x0000000000000000000000000000000000000000";

  // Determine current step
  useEffect(() => {
    if (!hasEnoughBalance) {
      setStep("check");
    } else if (!hasEnoughAllowance) {
      setStep("approve");
    } else {
      setStep("stake");
    }
  }, [hasEnoughBalance, hasEnoughAllowance]);

  // Refetch after approval success
  useEffect(() => {
    if (approveSuccess) {
      refetchAllowance();
      refetchBalance();
    }
  }, [approveSuccess, refetchAllowance, refetchBalance]);

  const handleApprove = () => {
    approve(amount);
  };

  const handleApproveMax = () => {
    approveMax();
  };

  if (!isContractDeployed) {
    return (
      <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
        <p className="text-sm text-yellow-400 text-center">
          USDC Challenge contract not deployed yet. Deploy it first!
        </p>
      </div>
    );
  }

  // Insufficient balance
  if (!hasEnoughBalance) {
    return (
      <div className="space-y-3">
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="text-sm font-medium text-red-400">Insufficient USDC Balance</span>
          </div>
          <p className="text-xs text-red-300">
            You need {amount} USDC but only have {formatUSDCBalance(balance)} USDC.
          </p>
        </div>
        <a
          href="https://faucet.circle.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary w-full flex items-center justify-center gap-2"
        >
          <CircleLogo className="w-4 h-4" />
          Get USDC from Circle Faucet
        </a>
      </div>
    );
  }

  // Need approval
  if (step === "approve" || (!hasEnoughAllowance && !isStaking)) {
    return (
      <div className="space-y-3">
        <div className="p-4 bg-usdc-blue/10 border border-usdc-blue/30 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <CircleLogo className="w-5 h-5" />
            <span className="text-sm font-medium text-usdc-blue">USDC Approval Required</span>
          </div>
          <p className="text-xs text-stride-muted">
            Approve the contract to spend your USDC for staking.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleApprove}
            disabled={isApproving || isApproveConfirming}
            className="btn-secondary flex items-center justify-center gap-2"
          >
            {isApproving || isApproveConfirming ? (
              <>
                <div className="w-4 h-4 border-2 border-usdc-blue/30 border-t-usdc-blue rounded-full animate-spin" />
                Approving...
              </>
            ) : (
              <>
                Approve {amount}
              </>
            )}
          </button>
          <button
            onClick={handleApproveMax}
            disabled={isApproving || isApproveConfirming}
            className="btn-primary bg-usdc-blue hover:bg-usdc-blue/90 flex items-center justify-center gap-2"
          >
            {isApproving || isApproveConfirming ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Approving...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Approve Max
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // Ready to stake
  return (
    <button
      onClick={onStake}
      disabled={isStaking}
      className="btn-primary w-full bg-usdc-blue hover:bg-usdc-blue/90 flex items-center justify-center gap-2"
    >
      {isStaking ? (
        <>
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <CircleLogo className="w-5 h-5" />
          {label} {amount} USDC
        </>
      )}
    </button>
  );
}

/**
 * Circle USDC Logo
 */
export function CircleLogo({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="16" fill="#2775CA" />
      <path
        d="M16 6C10.477 6 6 10.477 6 16s4.477 10 10 10 10-4.477 10-10S21.523 6 16 6zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"
        fill="white"
      />
      <path
        d="M18.5 14.5c0-1.381-1.119-2.5-2.5-2.5s-2.5 1.119-2.5 2.5c0 1.381 1.119 2.5 2.5 2.5h2.5v2h-2.5c-2.485 0-4.5-2.015-4.5-4.5S13.515 10 16 10s4.5 2.015 4.5 4.5v1h-2v-1z"
        fill="white"
      />
      <path
        d="M13.5 17.5c0 1.381 1.119 2.5 2.5 2.5s2.5-1.119 2.5-2.5c0-1.381-1.119-2.5-2.5-2.5h-2.5v-2h2.5c2.485 0 4.5 2.015 4.5 4.5S18.485 22 16 22s-4.5-2.015-4.5-4.5v-1h2v1z"
        fill="white"
      />
    </svg>
  );
}

/**
 * USDC Balance Display
 */
export function USDCBalanceDisplay() {
  const { address } = useAccount();
  const { data: balance } = useUSDCBalance(address);

  if (!address) return null;

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-usdc-blue/10 border border-usdc-blue/30 rounded-lg">
      <CircleLogo className="w-4 h-4" />
      <span className="text-sm font-medium text-usdc-blue">
        {formatUSDCBalance(balance)} USDC
      </span>
    </div>
  );
}

/**
 * Powered by Circle Badge
 */
export function PoweredByCircle() {
  return (
    <a
      href="https://developers.circle.com/"
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 px-3 py-1.5 bg-usdc-blue/10 border border-usdc-blue/30 rounded-full text-xs text-usdc-blue hover:bg-usdc-blue/20 transition-colors"
    >
      <CircleLogo className="w-4 h-4" />
      Powered by Circle USDC
    </a>
  );
}


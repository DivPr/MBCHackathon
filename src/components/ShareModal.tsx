"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

// Avoid SSR chunk resolution issues by loading QR code client-side only
const QRCodeSVG = dynamic(
  () => import("qrcode.react").then((mod) => mod.QRCodeSVG),
  { ssr: false }
);

// Support both challenge sharing and generic sharing
interface ChallengeShareProps {
  challengeId: bigint;
  description: string;
  stakeAmount: string;
  onClose: () => void;
}

interface GenericShareProps {
  title: string;
  url: string;
  subtitle?: string;
  onClose: () => void;
}

type ShareModalProps = ChallengeShareProps | GenericShareProps;

// Type guard to check if it's a challenge share
function isChallengeShare(props: ShareModalProps): props is ChallengeShareProps {
  return 'challengeId' in props;
}

export function ShareModal(props: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const { onClose } = props;

  // Derive values based on the share type
  const isChallenge = isChallengeShare(props);
  
  const shareUrl = isChallenge
    ? (typeof window !== "undefined" 
        ? `${window.location.origin}/challenge/${props.challengeId}`
        : `/challenge/${props.challengeId}`)
    : props.url;

  const title = isChallenge ? props.description : props.title;
  const subtitle = isChallenge ? `${props.stakeAmount} ETH stake` : (props as GenericShareProps).subtitle;
  const headerTitle = isChallenge ? "Share Challenge" : "Share";
  const shareText = isChallenge 
    ? `Join my fitness challenge! Stake ${props.stakeAmount} ETH and let's get moving 🏃`
    : `Check out "${title}" on Stride!`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Stride: ${title}`,
          text: shareText,
          url: shareUrl,
        });
      } catch {
        // User cancelled or share failed
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-stride-gray border border-white/10 rounded-2xl w-full max-w-sm overflow-hidden animate-slide-up shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-stride-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            <h2 className="text-lg font-bold">{headerTitle}</h2>
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

        {/* QR Code */}
        <div className="p-6 flex flex-col items-center">
          <div className="bg-white p-4 rounded-2xl mb-4 shadow-lg">
            <QRCodeSVG
              value={shareUrl}
              size={180}
              level="H"
              includeMargin={false}
              bgColor="#ffffff"
              fgColor="#09090B"
            />
          </div>
          
          <p className="text-sm text-stride-muted text-center mb-2">
            {isChallenge ? "Scan to join challenge" : "Scan to open"}
          </p>
          <p className="font-bold text-center mb-1">{title}</p>
          {subtitle && (
            <p className="text-stride-purple font-mono text-sm flex items-center gap-1">
              {isChallenge && (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              {subtitle}
            </p>
          )}
        </div>

        {/* URL Copy */}
        <div className="px-6 pb-4">
          <div className="flex items-center gap-2 p-3 bg-stride-dark border border-white/10 rounded-xl">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="flex-1 bg-transparent text-sm font-mono text-stride-muted truncate outline-none"
            />
            <button
              onClick={handleCopy}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                copied 
                  ? "bg-green-500/20 text-green-400" 
                  : "bg-white/5 hover:bg-white/10"
              }`}
            >
              {copied ? (
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Copied
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Share Button */}
        <div className="p-6 pt-2 space-y-3">
          <button onClick={handleShare} className="btn-primary w-full flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Share with Friends
          </button>
          
          <p className="text-xs text-stride-muted text-center">
            {isChallenge ? "Anyone with this link can join and stake" : "Share this link with friends"}
          </p>
        </div>
      </div>
    </div>
  );
}

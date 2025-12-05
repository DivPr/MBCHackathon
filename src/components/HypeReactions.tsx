"use client";

import { useState, useEffect, useCallback } from "react";
import confetti from "canvas-confetti";

interface HypeReactionsProps {
  challengeId: bigint;
  isWinner?: boolean;
  winAmount?: string;
  currency?: "ETH" | "USDC";
  onClose?: () => void;
}

// Reaction emojis
const REACTIONS = [
  { emoji: "🔥", label: "Fire" },
  { emoji: "👟", label: "Running" },
  { emoji: "💀", label: "Dead" },
  { emoji: "💸", label: "Money" },
  { emoji: "🏆", label: "Trophy" },
  { emoji: "💪", label: "Strong" },
];

// Storage key for reactions
const getReactionsKey = (challengeId: bigint) => `stride_reactions_${challengeId.toString()}`;

// Get saved reactions
export function getReactions(challengeId: bigint): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    const saved = localStorage.getItem(getReactionsKey(challengeId));
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

// Save reaction
function saveReaction(challengeId: bigint, emoji: string) {
  if (typeof window === "undefined") return;
  const reactions = getReactions(challengeId);
  reactions[emoji] = (reactions[emoji] || 0) + 1;
  localStorage.setItem(getReactionsKey(challengeId), JSON.stringify(reactions));
}

// Confetti burst effect
export function fireConfetti() {
  const duration = 3000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

  function randomInRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  const interval = setInterval(function() {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);
    
    // Confetti from both sides
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      colors: ["#a855f7", "#ec4899", "#8b5cf6", "#d946ef", "#f472b6"],
    });
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      colors: ["#a855f7", "#ec4899", "#8b5cf6", "#d946ef", "#f472b6"],
    });
  }, 250);
}

// Victory celebration component
export function VictoryCelebration({ 
  winAmount, 
  currency = "ETH",
  onClose 
}: { 
  winAmount: string; 
  currency?: "ETH" | "USDC";
  onClose: () => void;
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    setTimeout(() => setIsVisible(true), 100);
    
    // Fire confetti
    fireConfetti();
    
    // Additional fireworks after a bit
    const timeout = setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#ffd700", "#ffb700", "#ff9500"],
      });
    }, 1500);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-500"
        style={{ opacity: isVisible ? 1 : 0 }}
        onClick={onClose}
      />
      
      <div 
        className={`relative bg-gradient-to-br from-stride-gray to-stride-dark border border-stride-purple/30 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl shadow-stride-purple/20 transition-all duration-500 ${
          isVisible ? "scale-100 opacity-100" : "scale-90 opacity-0"
        }`}
      >
        {/* Animated trophy */}
        <div className="relative w-24 h-24 mx-auto mb-6">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl animate-pulse" />
          <div className="absolute inset-0 flex items-center justify-center text-5xl animate-bounce">
            🏆
          </div>
          {/* Sparkles */}
          <div className="absolute -top-2 -right-2 text-2xl animate-ping">✨</div>
          <div className="absolute -bottom-2 -left-2 text-2xl animate-ping" style={{ animationDelay: "0.3s" }}>✨</div>
        </div>

        <h2 className="text-3xl font-black mb-2 bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 bg-clip-text text-transparent animate-pulse">
          YOU CRUSHED IT!
        </h2>
        
        <p className="text-stride-muted mb-6">
          Challenge completed. You&apos;re a champion! 🏃💨
        </p>

        {/* Winnings display */}
        <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-2xl p-6 mb-6">
          <p className="text-sm text-green-400 mb-2">You earned</p>
          <p className="text-4xl font-black text-green-400">
            {winAmount} <span className="text-2xl">{currency}</span>
          </p>
        </div>

        {/* Base branding */}
        <div className="flex items-center justify-center gap-2 mb-6 text-sm text-stride-muted">
          <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
            B
          </div>
          Completed on Base
        </div>

        <button
          onClick={onClose}
          className="btn-primary w-full text-lg py-4"
        >
          🎉 Celebrate!
        </button>
      </div>
    </div>
  );
}

// Emoji reaction bar component
export function ReactionBar({ challengeId }: { challengeId: bigint }) {
  const [reactions, setReactions] = useState<Record<string, number>>({});
  const [animatingEmoji, setAnimatingEmoji] = useState<string | null>(null);

  useEffect(() => {
    setReactions(getReactions(challengeId));
  }, [challengeId]);

  const handleReaction = useCallback((emoji: string) => {
    // Save reaction
    saveReaction(challengeId, emoji);
    setReactions(getReactions(challengeId));
    
    // Animate
    setAnimatingEmoji(emoji);
    setTimeout(() => setAnimatingEmoji(null), 300);

    // Small confetti burst for fun
    confetti({
      particleCount: 10,
      spread: 50,
      origin: { y: 0.8 },
      colors: ["#a855f7", "#ec4899"],
      scalar: 0.8,
    });
  }, [challengeId]);

  return (
    <div className="bg-stride-dark border border-white/10 rounded-2xl p-4">
      <p className="text-sm text-stride-muted mb-3 flex items-center gap-2">
        <span>🎉</span> Send some hype!
      </p>
      <div className="flex flex-wrap gap-2">
        {REACTIONS.map(({ emoji, label }) => (
          <button
            key={emoji}
            onClick={() => handleReaction(emoji)}
            className={`relative flex items-center gap-1.5 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-stride-purple/50 rounded-full transition-all ${
              animatingEmoji === emoji ? "scale-125" : ""
            }`}
            title={label}
          >
            <span className={`text-xl ${animatingEmoji === emoji ? "animate-bounce" : ""}`}>
              {emoji}
            </span>
            {reactions[emoji] && reactions[emoji] > 0 && (
              <span className="text-sm font-medium text-stride-muted">
                {reactions[emoji]}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// Floating emoji animation component
export function FloatingEmoji({ emoji, onComplete }: { emoji: string; onComplete: () => void }) {
  useEffect(() => {
    const timeout = setTimeout(onComplete, 2000);
    return () => clearTimeout(timeout);
  }, [onComplete]);

  return (
    <div 
      className="fixed text-4xl animate-bounce pointer-events-none z-50"
      style={{
        left: `${Math.random() * 80 + 10}%`,
        bottom: "20%",
        animation: "floatUp 2s ease-out forwards",
      }}
    >
      {emoji}
      <style jsx>{`
        @keyframes floatUp {
          0% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateY(-200px) scale(1.5);
          }
        }
      `}</style>
    </div>
  );
}

// Main Hype Reactions wrapper
export function HypeReactions({ 
  challengeId, 
  isWinner = false, 
  winAmount = "0",
  currency = "ETH",
  onClose 
}: HypeReactionsProps) {
  const [showVictory, setShowVictory] = useState(isWinner);

  if (showVictory) {
    return (
      <VictoryCelebration 
        winAmount={winAmount} 
        currency={currency}
        onClose={() => {
          setShowVictory(false);
          onClose?.();
        }} 
      />
    );
  }

  return <ReactionBar challengeId={challengeId} />;
}


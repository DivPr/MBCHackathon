"use client";

import { useRef, useEffect, useState } from "react";

interface ShareCardProps {
  challengeId: bigint;
  description: string;
  stakeAmount: string;
  currency?: "ETH" | "USDC";
  participantCount: number;
  completerCount: number;
  winAmount?: string;
  isWinner?: boolean;
  participants?: `0x${string}`[];
  onClose: () => void;
}

export function ShareCard({
  challengeId,
  description,
  stakeAmount,
  currency = "ETH",
  participantCount,
  completerCount,
  winAmount,
  isWinner,
  participants = [],
  onClose,
}: ShareCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    generateCard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const generateCard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = 1200;
    const height = 630;
    canvas.width = width;
    canvas.height = height;

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "#0f0f14");
    gradient.addColorStop(0.5, "#1a1a24");
    gradient.addColorStop(1, "#0f0f14");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Decorative circles
    ctx.globalAlpha = 0.1;
    ctx.beginPath();
    ctx.arc(width * 0.1, height * 0.2, 200, 0, Math.PI * 2);
    ctx.fillStyle = "#a855f7";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(width * 0.9, height * 0.8, 250, 0, Math.PI * 2);
    ctx.fillStyle = "#ec4899";
    ctx.fill();
    ctx.globalAlpha = 1;

    // Border
    ctx.strokeStyle = "rgba(168, 85, 247, 0.3)";
    ctx.lineWidth = 4;
    ctx.strokeRect(20, 20, width - 40, height - 40);

    // Inner glow border
    ctx.strokeStyle = "rgba(168, 85, 247, 0.1)";
    ctx.lineWidth = 20;
    ctx.strokeRect(30, 30, width - 60, height - 60);

    // Logo/Branding top left
    ctx.fillStyle = "#a855f7";
    ctx.font = "bold 42px system-ui, -apple-system, sans-serif";
    ctx.fillText("⚡ STRIDE", 60, 85);

    // Challenge ID badge
    ctx.fillStyle = "rgba(168, 85, 247, 0.2)";
    roundRect(ctx, width - 200, 50, 140, 40, 20);
    ctx.fill();
    ctx.fillStyle = "#a855f7";
    ctx.font = "bold 18px system-ui, -apple-system, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`#${challengeId.toString()}`, width - 130, 77);
    ctx.textAlign = "left";

    // Main title
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 52px system-ui, -apple-system, sans-serif";
    const titleLines = wrapText(ctx, description, width - 120);
    let y = 180;
    titleLines.forEach((line) => {
      ctx.fillText(line, 60, y);
      y += 62;
    });

    // Stats section
    const statsY = Math.max(y + 40, 320);
    
    // Stats boxes
    const boxWidth = 180;
    const boxHeight = 90;
    const boxGap = 30;
    const startX = 60;

    // Stake box
    drawStatBox(ctx, startX, statsY, boxWidth, boxHeight, "STAKE", `${stakeAmount} ${currency}`, currency === "USDC" ? "#2775ca" : "#a855f7");
    
    // Runners box
    drawStatBox(ctx, startX + boxWidth + boxGap, statsY, boxWidth, boxHeight, "RUNNERS", participantCount.toString(), "#ec4899");
    
    // Finished box
    drawStatBox(ctx, startX + (boxWidth + boxGap) * 2, statsY, boxWidth, boxHeight, "FINISHED", `${completerCount}/${participantCount}`, "#10b981");
    
    // Winner amount (if applicable)
    if (isWinner && winAmount) {
      drawStatBox(ctx, startX + (boxWidth + boxGap) * 3, statsY, boxWidth, boxHeight, "WON", `${winAmount} ${currency}`, "#fbbf24");
    }

    // Participant avatars
    const avatarY = statsY + boxHeight + 50;
    const avatarSize = 50;
    const maxAvatars = Math.min(participants.length, 6);
    
    if (participants.length > 0) {
      ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
      ctx.font = "16px system-ui, -apple-system, sans-serif";
      ctx.fillText("Participants", 60, avatarY);

      for (let i = 0; i < maxAvatars; i++) {
        const x = 60 + i * (avatarSize + 10);
        const avatarY2 = avatarY + 20;
        
        // Avatar circle with gradient
        const avatarGradient = ctx.createLinearGradient(x, avatarY2, x + avatarSize, avatarY2 + avatarSize);
        avatarGradient.addColorStop(0, "#a855f7");
        avatarGradient.addColorStop(1, "#ec4899");
        ctx.fillStyle = avatarGradient;
        ctx.beginPath();
        ctx.arc(x + avatarSize / 2, avatarY2 + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
        ctx.fill();

        // Address initials
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 18px system-ui, -apple-system, sans-serif";
        ctx.textAlign = "center";
        const addr = participants[i];
        ctx.fillText(addr.slice(2, 4).toUpperCase(), x + avatarSize / 2, avatarY2 + avatarSize / 2 + 6);
        ctx.textAlign = "left";
      }

      if (participants.length > maxAvatars) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        ctx.font = "16px system-ui, -apple-system, sans-serif";
        ctx.fillText(`+${participants.length - maxAvatars} more`, 60 + maxAvatars * (avatarSize + 10) + 10, avatarY + 20 + avatarSize / 2 + 6);
      }
    }

    // "Completed on Base" footer
    const footerY = height - 70;
    
    // Base logo circle
    ctx.fillStyle = "#0052FF";
    ctx.beginPath();
    ctx.arc(60 + 20, footerY, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 20px system-ui, -apple-system, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("B", 60 + 20, footerY + 7);
    ctx.textAlign = "left";

    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    ctx.font = "18px system-ui, -apple-system, sans-serif";
    ctx.fillText("Completed on Base", 110, footerY + 6);

    // Winner badge (if applicable)
    if (isWinner) {
      ctx.fillStyle = "rgba(251, 191, 36, 0.2)";
      roundRect(ctx, width - 200, footerY - 20, 140, 40, 20);
      ctx.fill();
      ctx.fillStyle = "#fbbf24";
      ctx.font = "bold 18px system-ui, -apple-system, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("🏆 WINNER", width - 130, footerY + 7);
      ctx.textAlign = "left";
    }

    // Generate image URL
    setImageUrl(canvas.toDataURL("image/png"));
  };

  const shareToTwitter = () => {
    const text = isWinner 
      ? `🏆 Just won ${winAmount} ${currency} on @StrideOnBase! ${description}\n\nChallenge your friends on Base!`
      : `⚡ Just completed a challenge on @StrideOnBase!\n\n${description}\n\n🏃‍♂️ ${participantCount} runners | 💰 ${stakeAmount} ${currency} stake`;
    
    const url = `https://stride-app.vercel.app/challenge/${challengeId}`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, "_blank");
  };

  const shareToFarcaster = () => {
    const text = isWinner 
      ? `🏆 Just won ${winAmount} ${currency} on Stride! ${description}`
      : `⚡ Completed: ${description} | ${participantCount} runners | ${stakeAmount} ${currency} stake`;
    
    const url = `https://stride-app.vercel.app/challenge/${challengeId}`;
    const farcasterUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(text)}&embeds[]=${encodeURIComponent(url)}`;
    window.open(farcasterUrl, "_blank");
  };

  const copyLink = async () => {
    const url = `https://stride-app.vercel.app/challenge/${challengeId}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadImage = () => {
    if (!imageUrl) return;
    const link = document.createElement("a");
    link.download = `stride-challenge-${challengeId}.png`;
    link.href = imageUrl;
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-stride-gray border border-white/10 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-stride-purple to-pink-500 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold">Share Your Achievement</h2>
              <p className="text-xs text-stride-muted">Let the world know!</p>
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

        {/* Canvas (hidden) */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Preview */}
        <div className="p-6">
          {imageUrl && (
            <div className="rounded-xl overflow-hidden border border-white/10 mb-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageUrl} alt="Share card" className="w-full" />
            </div>
          )}

          {/* Share buttons */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <button
              onClick={shareToTwitter}
              className="flex items-center justify-center gap-2 p-4 bg-black hover:bg-gray-900 border border-white/10 rounded-xl transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              Post to X
            </button>
            <button
              onClick={shareToFarcaster}
              className="flex items-center justify-center gap-2 p-4 bg-purple-600 hover:bg-purple-700 rounded-xl transition-colors"
            >
              <span className="text-xl">🟣</span>
              Farcaster
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={copyLink}
              className="flex items-center justify-center gap-2 p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors"
            >
              {copied ? (
                <>
                  <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy Link
                </>
              )}
            </button>
            <button
              onClick={downloadImage}
              className="flex items-center justify-center gap-2 p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to draw rounded rectangles
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

// Helper function to draw stat boxes
function drawStatBox(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  label: string,
  value: string,
  color: string
) {
  // Background
  ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
  roundRect(ctx, x, y, width, height, 12);
  ctx.fill();

  // Border
  ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
  ctx.lineWidth = 1;
  roundRect(ctx, x, y, width, height, 12);
  ctx.stroke();

  // Colored accent bar
  ctx.fillStyle = color;
  ctx.fillRect(x, y, 4, height);

  // Label
  ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
  ctx.font = "12px system-ui, -apple-system, sans-serif";
  ctx.fillText(label, x + 16, y + 28);

  // Value
  ctx.fillStyle = color;
  ctx.font = "bold 24px system-ui, -apple-system, sans-serif";
  ctx.fillText(value, x + 16, y + 60);
}

// Helper function to wrap text
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const testLine = currentLine + (currentLine ? " " : "") + word;
    const metrics = ctx.measureText(testLine);
    
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  
  if (currentLine) {
    lines.push(currentLine);
  }

  return lines.slice(0, 2); // Max 2 lines
}


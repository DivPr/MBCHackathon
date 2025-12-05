"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";

interface GpsSample {
  lat: number;
  lon: number;
  t: number;
}

interface WalkData {
  distance: number;
  duration: number;
  samples: GpsSample[];
  suspicious: boolean;
}

interface WalkProofProps {
  challengeId: bigint;
  onSubmit?: (walkData: WalkData) => void;
  onClose: () => void;
}

// Storage key for walk proofs
const getStorageKey = (challengeId: bigint) => `stride_walk_proof_${challengeId.toString()}`;

// Get saved walk proof for a challenge
export function getWalkProof(challengeId: bigint): WalkData | null {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem(getStorageKey(challengeId));
  return data ? JSON.parse(data) : null;
}

// Save walk proof for a challenge
export function saveWalkProof(challengeId: bigint, walkData: WalkData) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(getStorageKey(challengeId), JSON.stringify(walkData));
}

// Format time from milliseconds
function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  }
  return `${minutes}m ${seconds}s`;
}

// Mini map component using canvas
function WalkMap({ samples, className = "" }: { samples: GpsSample[]; className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || samples.length < 2) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Get bounds
    const lats = samples.map(s => s.lat);
    const lons = samples.map(s => s.lon);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLon = Math.min(...lons);
    const maxLon = Math.max(...lons);

    // Add padding
    const padding = 30;
    const width = canvas.width - padding * 2;
    const height = canvas.height - padding * 2;

    // Scale function
    const latRange = maxLat - minLat || 0.001;
    const lonRange = maxLon - minLon || 0.001;
    const scale = Math.min(width / lonRange, height / latRange);

    const toX = (lon: number) => padding + (lon - minLon) * scale;
    const toY = (lat: number) => canvas.height - padding - (lat - minLat) * scale;

    // Clear canvas
    ctx.fillStyle = '#18181B';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const x = padding + (width / 4) * i;
      const y = padding + (height / 4) * i;
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, canvas.height - padding);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(canvas.width - padding, y);
      ctx.stroke();
    }

    // Draw path with gradient
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#A855F7');
    gradient.addColorStop(1, '#EC4899');
    
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    samples.forEach((sample, i) => {
      const x = toX(sample.lon);
      const y = toY(sample.lat);
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    // Draw start point (green)
    const startX = toX(samples[0].lon);
    const startY = toY(samples[0].lat);
    ctx.fillStyle = '#22C55E';
    ctx.beginPath();
    ctx.arc(startX, startY, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'white';
    ctx.font = 'bold 10px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('S', startX, startY);

    // Draw end point (red)
    const endX = toX(samples[samples.length - 1].lon);
    const endY = toY(samples[samples.length - 1].lat);
    ctx.fillStyle = '#EF4444';
    ctx.beginPath();
    ctx.arc(endX, endY, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'white';
    ctx.fillText('E', endX, endY);

  }, [samples]);

  if (samples.length < 2) {
    return (
      <div className={`bg-stride-dark rounded-xl flex items-center justify-center ${className}`}>
        <p className="text-stride-muted text-sm">Not enough GPS data for map</p>
      </div>
    );
  }

  return (
    <canvas 
      ref={canvasRef} 
      width={300} 
      height={200} 
      className={`rounded-xl ${className}`}
    />
  );
}

// Component to start a new walk for proof
export function WalkProofCapture({ challengeId, onSubmit, onClose }: WalkProofProps) {
  const [existingProof, setExistingProof] = useState<WalkData | null>(null);

  useEffect(() => {
    const saved = getWalkProof(challengeId);
    if (saved) {
      setExistingProof(saved);
    }
  }, [challengeId]);

  const handleUseExisting = () => {
    if (existingProof) {
      onSubmit?.(existingProof);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90">
      <div className="relative w-full max-w-md bg-stride-gray border border-white/10 rounded-2xl p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-stride-purple rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <span className="font-bold text-lg">Walk Proof</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {existingProof ? (
          // Show existing walk data
          <>
            <div className="text-center mb-4">
              <h3 className="text-lg font-bold mb-2">You have a recorded walk!</h3>
              <p className="text-stride-muted text-sm">
                Use this walk as your proof or record a new one.
              </p>
            </div>

            {/* Walk Map */}
            <div className="mb-4">
              <WalkMap samples={existingProof.samples} className="w-full h-48" />
            </div>

            {/* Walk Stats */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-stride-dark rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-stride-purple">
                  {existingProof.distance.toFixed(2)}
                </div>
                <div className="text-xs text-stride-muted">km</div>
              </div>
              <div className="bg-stride-dark rounded-xl p-3 text-center">
                <div className="text-2xl font-bold">
                  {formatTime(existingProof.duration)}
                </div>
                <div className="text-xs text-stride-muted">time</div>
              </div>
              <div className="bg-stride-dark rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-green-400">
                  {existingProof.samples.length}
                </div>
                <div className="text-xs text-stride-muted">samples</div>
              </div>
            </div>

            {/* Suspicious warning */}
            {existingProof.suspicious && (
              <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-3 mb-4 text-center">
                <span className="text-orange-400 text-sm">
                  ⚠️ Walk flagged for review
                </span>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={handleUseExisting}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Use This Walk as Proof
              </button>
              <Link
                href={`/walk?challengeId=${challengeId.toString()}`}
                className="btn-secondary w-full flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Record New Walk
              </Link>
            </div>
          </>
        ) : (
          // No existing walk - prompt to record
          <>
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-stride-purple/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-stride-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2">Track Your Walk</h3>
              <p className="text-stride-muted text-sm">
                Record your walk using GPS to prove you completed the challenge. Your route, distance, and time will be shown to others.
              </p>
            </div>

            <div className="space-y-3">
              <Link
                href={`/walk?challengeId=${challengeId.toString()}`}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Start Walk Tracker
              </Link>
              <button
                onClick={onClose}
                className="btn-secondary w-full"
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Display component for showing saved walk proofs
export function WalkProofDisplay({ 
  challengeId, 
  walkData,
  className = "",
}: { 
  challengeId: bigint;
  walkData?: WalkData | null;
  className?: string;
}) {
  const [savedWalk, setSavedWalk] = useState<WalkData | null>(null);

  useEffect(() => {
    if (walkData) {
      setSavedWalk(walkData);
    } else {
      setSavedWalk(getWalkProof(challengeId));
    }
  }, [challengeId, walkData]);

  if (!savedWalk) return null;

  return (
    <div className={`bg-stride-dark border border-white/10 rounded-xl overflow-hidden ${className}`}>
      {/* Map */}
      <WalkMap samples={savedWalk.samples} className="w-full h-32" />
      
      {/* Stats Bar */}
      <div className="p-3 bg-gradient-to-r from-stride-purple/10 to-pink-500/10 border-t border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-lg font-bold text-stride-purple">
                {savedWalk.distance.toFixed(2)} km
              </span>
            </div>
            <div className="text-stride-muted">•</div>
            <div>
              <span className="text-lg font-bold">
                {formatTime(savedWalk.duration)}
              </span>
            </div>
          </div>
          {savedWalk.suspicious ? (
            <span className="text-xs text-orange-400 bg-orange-500/20 px-2 py-1 rounded-full">
              ⚠️ Review
            </span>
          ) : (
            <span className="text-xs text-green-400 bg-green-500/20 px-2 py-1 rounded-full">
              ✓ Verified
            </span>
          )}
        </div>
      </div>
    </div>
  );
}


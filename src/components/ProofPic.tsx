"use client";

import { useState, useRef, useCallback, useEffect } from "react";

interface ProofPicProps {
  challengeId: bigint;
  onCapture?: (imageUrl: string) => void;
  onClose: () => void;
}

// Storage key for proof pics
const getStorageKey = (challengeId: bigint) => `stride_proof_${challengeId.toString()}`;

// Get saved proof pic for a challenge
export function getProofPic(challengeId: bigint): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(getStorageKey(challengeId));
}

// Save proof pic for a challenge
export function saveProofPic(challengeId: bigint, imageUrl: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(getStorageKey(challengeId), imageUrl);
}

export function ProofPicCamera({ challengeId, onCapture, onClose }: ProofPicProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [isLoading, setIsLoading] = useState(true);

  const startCamera = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Stop existing stream if any
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setIsLoading(false);
        };
      }
    } catch (err) {
      console.error("Camera error:", err);
      setError("Could not access camera. Please grant camera permissions.");
      setIsLoading(false);
    }
  }, [facingMode, stream]);

  useEffect(() => {
    startCamera();
    
    return () => {
      // Cleanup: stop stream when component unmounts
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facingMode]);

  const switchCamera = () => {
    setFacingMode(prev => prev === "user" ? "environment" : "user");
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    // Set canvas size to video dimensions
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas (flip if front camera)
    if (facingMode === "user") {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0);
    
    // Reset transform
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    // Add overlay with timestamp and branding
    const padding = 20;
    const barHeight = 60;
    
    // Semi-transparent bar at bottom
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(0, canvas.height - barHeight, canvas.width, barHeight);
    
    // Add text
    ctx.fillStyle = "#fff";
    ctx.font = "bold 18px system-ui, -apple-system, sans-serif";
    ctx.textBaseline = "middle";
    
    // Left: Stride branding
    ctx.fillStyle = "#a855f7";
    ctx.fillText("⚡ STRIDE", padding, canvas.height - barHeight/2);
    
    // Right: Timestamp
    ctx.fillStyle = "#fff";
    ctx.font = "14px system-ui, -apple-system, sans-serif";
    const timestamp = new Date().toLocaleString();
    const timeWidth = ctx.measureText(timestamp).width;
    ctx.fillText(timestamp, canvas.width - timeWidth - padding, canvas.height - barHeight/2);

    // Convert to data URL
    const imageUrl = canvas.toDataURL("image/jpeg", 0.9);
    setCapturedImage(imageUrl);
    
    // Stop camera when photo is taken
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    startCamera();
  };

  const savePhoto = () => {
    if (!capturedImage) return;
    
    // Save to localStorage
    saveProofPic(challengeId, capturedImage);
    
    // Callback
    onCapture?.(capturedImage);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black">
      {/* Hidden canvas for photo capture */}
      <canvas ref={canvasRef} className="hidden" />

      <div className="relative w-full max-w-lg">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-stride-purple rounded-full flex items-center justify-center">
              <span className="text-sm">📸</span>
            </div>
            <span className="text-white font-bold">Proof Pic</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          >
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Camera View / Captured Image */}
        <div className="relative aspect-[3/4] bg-stride-dark rounded-2xl overflow-hidden">
          {error ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className="text-red-400 mb-4">{error}</p>
              <button
                onClick={startCamera}
                className="btn-primary px-6"
              >
                Try Again
              </button>
            </div>
          ) : capturedImage ? (
            // Show captured image
            // eslint-disable-next-line @next/next/no-img-element
            <img 
              src={capturedImage} 
              alt="Captured proof" 
              className="w-full h-full object-cover"
            />
          ) : (
            // Show camera feed
            <>
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-stride-dark">
                  <div className="w-12 h-12 border-4 border-stride-purple/30 border-t-stride-purple rounded-full animate-spin" />
                </div>
              )}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${facingMode === "user" ? "scale-x-[-1]" : ""}`}
                style={{ display: isLoading ? "none" : "block" }}
              />
            </>
          )}
        </div>

        {/* Controls */}
        <div className="mt-4 flex items-center justify-center gap-4">
          {capturedImage ? (
            // Photo taken - show retake/save options
            <>
              <button
                onClick={retakePhoto}
                className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Retake
              </button>
              <button
                onClick={savePhoto}
                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-stride-purple to-pink-500 hover:opacity-90 rounded-xl font-bold transition-opacity"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Use This Photo
              </button>
            </>
          ) : !error && (
            // Camera active - show capture button
            <>
              <button
                onClick={switchCamera}
                className="p-4 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                title="Switch Camera"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              
              <button
                onClick={capturePhoto}
                disabled={isLoading}
                className="relative w-20 h-20 rounded-full bg-white flex items-center justify-center transition-transform hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                <div className="w-16 h-16 rounded-full border-4 border-stride-dark" />
              </button>
              
              <div className="w-14" /> {/* Spacer for alignment */}
            </>
          )}
        </div>

        {/* Instructions */}
        {!capturedImage && !error && (
          <p className="mt-4 text-center text-sm text-stride-muted">
            Take a selfie during your run! 🏃‍♂️
          </p>
        )}
      </div>
    </div>
  );
}

// Display component for showing saved proof pics
export function ProofPicDisplay({ 
  challengeId, 
  imageUrl,
  className = "",
  onRemove
}: { 
  challengeId: bigint;
  imageUrl?: string | null;
  className?: string;
  onRemove?: () => void;
}) {
  const [savedImage, setSavedImage] = useState<string | null>(null);

  useEffect(() => {
    if (imageUrl) {
      setSavedImage(imageUrl);
    } else {
      setSavedImage(getProofPic(challengeId));
    }
  }, [challengeId, imageUrl]);

  if (!savedImage) return null;

  return (
    <div className={`relative group ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img 
        src={savedImage} 
        alt="Proof pic" 
        className="w-full h-full object-cover rounded-xl"
      />
      {onRemove && (
        <button
          onClick={onRemove}
          className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-red-500/80 rounded-full opacity-0 group-hover:opacity-100 transition-all"
        >
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      )}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 rounded-b-xl">
        <div className="flex items-center gap-2">
          <span className="text-stride-purple font-bold text-sm">📸 Proof Pic</span>
        </div>
      </div>
    </div>
  );
}


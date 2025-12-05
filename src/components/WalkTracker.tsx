"use client";

import { useState, useRef, useCallback, useEffect } from "react";

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

// Haversine formula to calculate distance between two GPS points in km
function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function WalkTracker() {
  const [isWalking, setIsWalking] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [distance, setDistance] = useState(0);
  const [samples, setSamples] = useState<GpsSample[]>([]);
  const [suspicious, setSuspicious] = useState(false);
  const [status, setStatus] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [lastWalk, setLastWalk] = useState<WalkData | null>(null);

  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const gpsIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastPositionRef = useRef<{ lat: number; lon: number } | null>(null);

  // Update elapsed time every second
  useEffect(() => {
    if (isWalking) {
      timerRef.current = setInterval(() => {
        setElapsedTime(Date.now() - startTimeRef.current);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isWalking]);

  const collectGpsSample = useCallback(() => {
    if (!navigator.geolocation) {
      setStatus("GPS not available");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;

        // Anti-cheat: Ignore points with accuracy > 50m
        if (accuracy > 50) {
          setStatus(`Waiting for better GPS signal (${Math.round(accuracy)}m)`);
          return;
        }

        const newSample: GpsSample = {
          lat: latitude,
          lon: longitude,
          t: Date.now(),
        };

        // Calculate distance from last point
        if (lastPositionRef.current) {
          const jump = haversineDistance(
            lastPositionRef.current.lat,
            lastPositionRef.current.lon,
            latitude,
            longitude
          );

          // Anti-cheat: Flag if jump > 200m (0.2km)
          if (jump > 0.2) {
            setSuspicious(true);
            setStatus("Suspicious jump detected");
          }

          setDistance((prev) => prev + jump);
        }

        lastPositionRef.current = { lat: latitude, lon: longitude };
        setSamples((prev) => [...prev, newSample]);
        setStatus(`GPS: ±${Math.round(accuracy)}m`);
      },
      (error) => {
        setStatus(`GPS error: ${error.message}`);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  const startWalk = useCallback(() => {
    // Reset state
    setDistance(0);
    setSamples([]);
    setSuspicious(false);
    setLastWalk(null);
    lastPositionRef.current = null;

    // Save start timestamp
    startTimeRef.current = Date.now();
    setElapsedTime(0);
    setIsWalking(true);
    setStatus("Starting GPS...");

    // Collect first sample immediately
    collectGpsSample();

    // Then collect every 5 seconds
    gpsIntervalRef.current = setInterval(collectGpsSample, 5000);
  }, [collectGpsSample]);

  const endWalk = useCallback(async () => {
    // Stop GPS sampling
    if (gpsIntervalRef.current) {
      clearInterval(gpsIntervalRef.current);
      gpsIntervalRef.current = null;
    }

    setIsWalking(false);
    const duration = Date.now() - startTimeRef.current;

    const walkData: WalkData = {
      distance,
      duration,
      samples,
      suspicious,
    };

    setLastWalk(walkData);
    setStatus("Submitting walk...");
    setSubmitting(true);

    try {
      const response = await fetch("/api/walk/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(walkData),
      });

      const result = await response.json();

      if (response.ok) {
        setStatus(result.message || "Walk submitted!");
      } else {
        setStatus(result.error || "Failed to submit walk");
      }
    } catch (error) {
      setStatus("Network error - walk saved locally");
      console.error("Submit error:", error);
    } finally {
      setSubmitting(false);
    }
  }, [distance, samples, suspicious]);

  return (
    <div className="card max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">Walk Tracker</h2>

      {/* Stats Display */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-stride-dark rounded-xl p-4 text-center">
          <div className="text-stride-muted text-sm mb-1">Time</div>
          <div className="text-3xl font-mono font-bold">
            {formatTime(elapsedTime)}
          </div>
        </div>
        <div className="bg-stride-dark rounded-xl p-4 text-center">
          <div className="text-stride-muted text-sm mb-1">Distance</div>
          <div className="text-3xl font-mono font-bold">
            {distance.toFixed(2)}
            <span className="text-lg text-stride-muted ml-1">km</span>
          </div>
        </div>
      </div>

      {/* Status */}
      {status && (
        <div
          className={`text-sm text-center mb-4 ${suspicious ? "text-orange-400" : "text-stride-muted"}`}
        >
          {status}
        </div>
      )}

      {/* Suspicious Warning */}
      {suspicious && (
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-3 mb-4 text-center">
          <span className="text-orange-400 text-sm">
            ⚠️ Walk flagged as suspicious
          </span>
        </div>
      )}

      {/* Buttons */}
      <div className="space-y-3">
        {!isWalking ? (
          <button
            onClick={startWalk}
            disabled={submitting}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Start Walk
          </button>
        ) : (
          <button
            onClick={endWalk}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
              />
            </svg>
            End Walk
          </button>
        )}
      </div>

      {/* GPS Sample Count */}
      {isWalking && (
        <div className="text-center text-stride-muted text-sm mt-4">
          {samples.length} GPS samples collected
        </div>
      )}

      {/* Last Walk Summary */}
      {lastWalk && !isWalking && (
        <div className="mt-6 pt-6 border-t border-white/10">
          <h3 className="text-sm font-semibold text-stride-muted mb-3">
            Last Walk
          </h3>
          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-stride-muted">Distance:</span>
              <span>{lastWalk.distance.toFixed(2)} km</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stride-muted">Duration:</span>
              <span>{formatTime(lastWalk.duration)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stride-muted">Samples:</span>
              <span>{lastWalk.samples.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stride-muted">Status:</span>
              <span className={lastWalk.suspicious ? "text-orange-400" : "text-green-400"}>
                {lastWalk.suspicious ? "Suspicious" : "Valid"}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


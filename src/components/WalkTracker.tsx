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

interface WalkRecord {
  id: string;
  distance: number;
  duration: number;
  suspicious: boolean;
  submittedAt: number;
}

interface WalkTrackerProps {
  challengeId?: string;
  onWalkComplete?: (walk: WalkData) => void;
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

export function WalkTracker({ challengeId, onWalkComplete }: WalkTrackerProps) {
  const [isWalking, setIsWalking] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [distance, setDistance] = useState(0);
  const [samples, setSamples] = useState<GpsSample[]>([]);
  const [suspicious, setSuspicious] = useState(false);
  const [status, setStatus] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  
  // Track all walks for this challenge
  const [walkHistory, setWalkHistory] = useState<WalkRecord[]>([]);
  const [totalDistance, setTotalDistance] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);

  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const gpsIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastPositionRef = useRef<{ lat: number; lon: number; t: number } | null>(null);

  // Load walk history on mount
  useEffect(() => {
    if (challengeId) {
      loadWalkHistory();
    }
  }, [challengeId, loadWalkHistory]);

  const loadWalkHistory = useCallback(async () => {
    if (!challengeId) return;
    
    try {
      const response = await fetch(`/api/walk/history?challengeId=${challengeId}`);
      if (response.ok) {
        const data = await response.json();
        setWalkHistory(data.walks || []);
        setTotalDistance(data.totalDistance || 0);
        setTotalDuration(data.totalDuration || 0);
      }
    } catch (error) {
      console.error("Failed to load walk history:", error);
    }
  }, [challengeId]);

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
        const now = Date.now();

        // Check if this is IP-based fallback (accuracy > 1000m is definitely not GPS)
        if (accuracy > 1000) {
          setStatus("Enable device GPS - using IP location (inaccurate)");
          return;
        }

        // Anti-cheat: Ignore points with accuracy > 100m (relaxed for mobile)
        if (accuracy > 100) {
          setStatus(`Acquiring GPS... (±${Math.round(accuracy)}m)`);
          return;
        }

        const newSample: GpsSample = {
          lat: latitude,
          lon: longitude,
          t: now,
        };

        // Calculate distance from last point
        if (lastPositionRef.current && lastPositionRef.current.t) {
          const jump = haversineDistance(
            lastPositionRef.current.lat,
            lastPositionRef.current.lon,
            latitude,
            longitude
          );

          const jumpMeters = jump * 1000; // Convert to meters
          const timeDelta = (now - lastPositionRef.current.t) / 1000; // seconds
          
          // Calculate speed in km/h
          const speedKmh = timeDelta > 0 ? (jump / timeDelta) * 3600 : 0;

          // DRIFT FILTERS:
          // 1. Minimum movement threshold (ignore GPS noise)
          const minMovementMeters = Math.max(8, accuracy * 0.5); // At least 8m or half accuracy
          
          // 2. Speed filter: walking is typically 3-6 km/h, ignore < 1.5 km/h (drift)
          const isLikelyStationary = speedKmh < 1.5;
          
          // 3. Max speed: > 20 km/h is not walking (probably in vehicle or GPS jump)
          const isTooFast = speedKmh > 20;

          // Anti-cheat: Flag if jump > 200m between samples
          if (jump > 0.2) {
            setSuspicious(true);
            setStatus("Suspicious jump detected");
          }

          // Only count distance if it passes all filters
          if (jumpMeters >= minMovementMeters && !isLikelyStationary && !isTooFast) {
            setDistance((prev) => prev + jump);
            setStatus(`GPS: ±${Math.round(accuracy)}m | ${speedKmh.toFixed(1)} km/h`);
          } else {
            setStatus(`GPS: ±${Math.round(accuracy)}m (stationary)`);
          }
        } else {
          setStatus(`GPS locked: ±${Math.round(accuracy)}m`);
        }

        lastPositionRef.current = { lat: latitude, lon: longitude, t: now };
        setSamples((prev) => [...prev, newSample]);
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setStatus("Location permission denied - enable in browser settings");
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          setStatus("GPS unavailable - try outdoors or enable location services");
        } else {
          setStatus(`GPS error: ${error.message}`);
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }, []);

  const startWalk = useCallback(() => {
    // Reset current walk state
    setDistance(0);
    setSamples([]);
    setSuspicious(false);
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

    // Callback for parent component
    onWalkComplete?.(walkData);

    setStatus("Submitting walk...");
    setSubmitting(true);

    try {
      const response = await fetch("/api/walk/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...walkData,
          challengeId,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setStatus(result.message || "Walk submitted!");
        
        // Update totals
        setTotalDistance((prev) => prev + distance);
        setTotalDuration((prev) => prev + duration);
        
        // Add to history
        if (result.walkId) {
          setWalkHistory((prev) => [
            {
              id: result.walkId,
              distance,
              duration,
              suspicious,
              submittedAt: Date.now(),
            },
            ...prev,
          ]);
        }
      } else {
        setStatus(result.error || "Failed to submit walk");
      }
    } catch (error) {
      setStatus("Network error - walk saved locally");
      console.error("Submit error:", error);
    } finally {
      setSubmitting(false);
    }
  }, [distance, samples, suspicious, challengeId, onWalkComplete]);

  return (
    <div className="space-y-4">
      {/* Main Tracker Card */}
      <div className="card">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {isWalking ? "Walking..." : "Track Your Walk"}
        </h2>

        {/* Current Walk Stats */}
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

        {/* GPS Help */}
        {isWalking && samples.length === 0 && (
          <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl text-sm">
            <div className="font-medium text-blue-400 mb-1">📍 GPS Tips:</div>
            <ul className="text-stride-muted space-y-1 text-xs">
              <li>• Enable Location Services on your device</li>
              <li>• Allow location access in your browser</li>
              <li>• Go outdoors for better signal</li>
              <li>• On mobile: enable High Accuracy mode</li>
            </ul>
          </div>
        )}
      </div>

      {/* Cumulative Progress Card */}
      {(walkHistory.length > 0 || totalDistance > 0) && (
        <div className="card">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-stride-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            {challengeId ? "Challenge Progress" : "Total Progress"}
          </h3>
          
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-stride-dark rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-stride-purple">
                {totalDistance.toFixed(2)}
              </div>
              <div className="text-xs text-stride-muted">km total</div>
            </div>
            <div className="bg-stride-dark rounded-lg p-3 text-center">
              <div className="text-2xl font-bold">
                {formatTime(totalDuration)}
              </div>
              <div className="text-xs text-stride-muted">total time</div>
            </div>
            <div className="bg-stride-dark rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-green-400">
                {walkHistory.length}
              </div>
              <div className="text-xs text-stride-muted">walks</div>
            </div>
          </div>

          {/* Walk History */}
          {walkHistory.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm text-stride-muted mb-2">Recent walks</div>
              <div className="max-h-48 overflow-y-auto space-y-2">
                {walkHistory.slice(0, 5).map((walk, index) => (
                  <div
                    key={walk.id || index}
                    className="flex items-center justify-between bg-stride-dark/50 rounded-lg px-3 py-2 text-sm"
                  >
                    <div className="flex items-center gap-3">
                      <span className={walk.suspicious ? "text-orange-400" : "text-green-400"}>
                        {walk.suspicious ? "⚠️" : "✓"}
                      </span>
                      <span>{walk.distance.toFixed(2)} km</span>
                    </div>
                    <div className="text-stride-muted">
                      {formatTime(walk.duration)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

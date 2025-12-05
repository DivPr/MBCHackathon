"use client";

import { useState, useEffect, useCallback } from "react";

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string | null;
  totalCompleted: number;
}

const STREAK_KEY = "stride_streaks";
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

// Get streak data from localStorage
function getStreakData(): StreakData {
  if (typeof window === "undefined") {
    return { currentStreak: 0, longestStreak: 0, lastCompletedDate: null, totalCompleted: 0 };
  }
  
  try {
    const saved = localStorage.getItem(STREAK_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error("Error reading streak data:", e);
  }
  
  return { currentStreak: 0, longestStreak: 0, lastCompletedDate: null, totalCompleted: 0 };
}

// Save streak data to localStorage
function saveStreakData(data: StreakData) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STREAK_KEY, JSON.stringify(data));
}

// Check if two dates are consecutive calendar days (yesterday -> today)
function isYesterday(dateStr: string): boolean {
  const date = new Date(dateStr);
  const today = new Date();
  date.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  const diff = today.getTime() - date.getTime();
  return diff === ONE_DAY_MS;
}

function isSameDay(dateStr: string): boolean {
  const date = new Date(dateStr);
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

export function useStreaks() {
  const [streakData, setStreakData] = useState<StreakData>({
    currentStreak: 0,
    longestStreak: 0,
    lastCompletedDate: null,
    totalCompleted: 0,
  });
  const [mounted, setMounted] = useState(false);

  // Load streak data on mount
  useEffect(() => {
    setMounted(true);
    const data = getStreakData();
    
    // If last completion is older than yesterday, streak resets
    if (data.lastCompletedDate && !isSameDay(data.lastCompletedDate) && !isYesterday(data.lastCompletedDate)) {
      data.currentStreak = 0;
      saveStreakData(data);
    }

    setStreakData(data);
  }, []);

  // Record a completed challenge
  const recordCompletion = useCallback(() => {
    const data = getStreakData();
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD at local TZ
    
    // Don't count if already completed today
    if (data.lastCompletedDate && isSameDay(data.lastCompletedDate)) {
      return data;
    }
    
    // Daily streak: must be yesterday to keep streak, otherwise reset to 1
    if (data.lastCompletedDate && isYesterday(data.lastCompletedDate)) {
      data.currentStreak += 1;
    } else {
      data.currentStreak = 1;
    }
    
    // Update longest streak
    if (data.currentStreak > data.longestStreak) {
      data.longestStreak = data.currentStreak;
    }
    
    // Update last completed date and total
    data.lastCompletedDate = today;
    data.totalCompleted += 1;
    
    // Save and update state
    saveStreakData(data);
    setStreakData(data);
    
    return data;
  }, []);

  // Reset streaks (for testing)
  const resetStreaks = useCallback(() => {
    const data: StreakData = {
      currentStreak: 0,
      longestStreak: 0,
      lastCompletedDate: null,
      totalCompleted: 0,
    };
    saveStreakData(data);
    setStreakData(data);
  }, []);

  return {
    ...streakData,
    recordCompletion,
    resetStreaks,
    mounted,
    // Computed values
    isOnFire: streakData.currentStreak >= 3,
    streakEmoji: getStreakEmoji(streakData.currentStreak),
    streakMessage: getStreakMessage(streakData.currentStreak),
  };
}

// Get appropriate emoji for streak level
function getStreakEmoji(streak: number): string {
  if (streak >= 30) return "🌟";
  if (streak >= 14) return "💎";
  if (streak >= 7) return "🔥";
  if (streak >= 3) return "⚡";
  if (streak >= 1) return "🔥";
  return "💤";
}

// Get motivational message for streak level
function getStreakMessage(streak: number): string {
  if (streak >= 30) return "LEGENDARY! 30+ day streak!";
  if (streak >= 14) return "Unstoppable! 2 week streak!";
  if (streak >= 7) return "On fire! 1 week streak!";
  if (streak >= 3) return "Building momentum!";
  if (streak >= 1) return "Keep it going!";
  return "Start your streak today!";
}

// Streak display component
export function StreakBadge({ 
  className = "",
  showDetails = false 
}: { 
  className?: string;
  showDetails?: boolean;
}) {
  const { currentStreak, longestStreak, totalCompleted, streakEmoji, streakMessage, isOnFire, mounted } = useStreaks();

  if (!mounted) {
    return (
      <div className={`animate-pulse bg-white/5 rounded-full px-4 py-2 ${className}`}>
        <div className="h-4 w-16 bg-white/10 rounded" />
      </div>
    );
  }

  if (showDetails) {
    return (
      <div className={`bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-2xl p-4 ${className}`}>
        <div className="flex items-center gap-3 mb-3">
          <div className={`text-3xl ${isOnFire ? "animate-bounce" : ""}`}>{streakEmoji}</div>
          <div>
            <div className="text-2xl font-black text-orange-400">{currentStreak}</div>
            <div className="text-xs text-stride-muted">day streak</div>
          </div>
        </div>
        <p className="text-sm text-orange-400 font-medium mb-3">{streakMessage}</p>
        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="bg-white/5 rounded-xl p-2">
            <div className="text-lg font-bold">{longestStreak}</div>
            <div className="text-xs text-stride-muted">Best Streak</div>
          </div>
          <div className="bg-white/5 rounded-xl p-2">
            <div className="text-lg font-bold">{totalCompleted}</div>
            <div className="text-xs text-stride-muted">Total</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2 bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-full px-4 py-2 ${className}`}>
      <span className={`text-lg ${isOnFire ? "animate-pulse" : ""}`}>{streakEmoji}</span>
      <span className="font-bold text-orange-400">{currentStreak}</span>
      <span className="text-xs text-stride-muted">streak</span>
    </div>
  );
}


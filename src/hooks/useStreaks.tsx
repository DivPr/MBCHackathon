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

// Check if two dates are consecutive days
function areConsecutiveDays(date1: string, date2: string): boolean {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  
  // Reset times to midnight for comparison
  d1.setHours(0, 0, 0, 0);
  d2.setHours(0, 0, 0, 0);
  
  const diff = Math.abs(d1.getTime() - d2.getTime());
  return diff <= ONE_DAY_MS;
}

// Check if a date is today
function isToday(dateStr: string): boolean {
  const date = new Date(dateStr);
  const today = new Date();
  
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

// Check if streak is still valid (completed within last 24-48 hours)
function isStreakValid(lastDate: string | null): boolean {
  if (!lastDate) return true; // New streak
  
  const last = new Date(lastDate);
  const now = new Date();
  
  // Reset times to midnight
  last.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  
  const diff = now.getTime() - last.getTime();
  
  // Valid if completed today or yesterday
  return diff <= ONE_DAY_MS * 2;
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
    
    // Check if streak is still valid
    if (!isStreakValid(data.lastCompletedDate)) {
      // Streak broken, reset current streak
      data.currentStreak = 0;
      saveStreakData(data);
    }
    
    setStreakData(data);
  }, []);

  // Record a completed challenge
  const recordCompletion = useCallback(() => {
    const data = getStreakData();
    const today = new Date().toISOString().split("T")[0];
    
    // Don't count if already completed today
    if (data.lastCompletedDate && isToday(data.lastCompletedDate)) {
      return data;
    }
    
    // Check if this continues the streak
    if (data.lastCompletedDate && areConsecutiveDays(data.lastCompletedDate, today)) {
      data.currentStreak += 1;
    } else if (!data.lastCompletedDate || isStreakValid(data.lastCompletedDate)) {
      // First completion or continuing streak
      data.currentStreak += 1;
    } else {
      // Streak broken, start new streak
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


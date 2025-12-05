"use client";

import { Navbar } from "@/components/Navbar";
import { WalkTracker } from "@/components/WalkTracker";

export default function WalkPage() {
  return (
    <main className="relative z-10 min-h-screen">
      <Navbar />
      
      <section className="max-w-5xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Track Your Walk</h1>
          <p className="text-stride-muted">
            Start walking to track your distance and time using GPS
          </p>
        </div>

        <WalkTracker />

        {/* Instructions */}
        <div className="mt-8 max-w-md mx-auto">
          <div className="card">
            <h3 className="font-semibold mb-3">How it works</h3>
            <ul className="text-sm text-stride-muted space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-stride-purple">1.</span>
                Press &quot;Start Walk&quot; to begin tracking
              </li>
              <li className="flex items-start gap-2">
                <span className="text-stride-purple">2.</span>
                GPS samples are collected every 5 seconds
              </li>
              <li className="flex items-start gap-2">
                <span className="text-stride-purple">3.</span>
                Distance is calculated automatically
              </li>
              <li className="flex items-start gap-2">
                <span className="text-stride-purple">4.</span>
                Press &quot;End Walk&quot; to save your session
              </li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}


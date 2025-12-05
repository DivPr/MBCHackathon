"use client";

import Link from "next/link";
import { Navbar } from "@/components/Navbar";

function WalkContent() {
  return (
    <>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Proof Pics Only</h1>
        <p className="text-stride-muted">
          GPS walking tracker has been removed. Capture a proof photo from the challenge page to complete your run.
        </p>
      </div>

      <div className="max-w-md mx-auto">
        <div className="card text-center">
          <p className="text-stride-muted mb-4">
            Go to your challenge and tap &quot;Take Proof Pic &amp; Complete&quot; to submit verification.
          </p>
          <Link
            href="/groups"
            className="btn-primary w-full inline-flex justify-center"
          >
            View Challenges
          </Link>
        </div>
      </div>
    </>
  );
}

export default function WalkPage() {
  return (
    <main className="relative z-10 min-h-screen">
      <Navbar />
      
      <section className="max-w-5xl mx-auto px-4 py-12">
        <WalkContent />
      </section>
    </main>
  );
}

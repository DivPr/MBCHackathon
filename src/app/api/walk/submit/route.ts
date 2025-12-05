import { NextRequest, NextResponse } from "next/server";

interface GpsSample {
  lat: number;
  lon: number;
  t: number;
}

interface WalkSubmission {
  distance: number;
  duration: number;
  samples: GpsSample[];
  suspicious: boolean;
  challengeId?: string;
}

interface StoredWalk extends WalkSubmission {
  id: string;
  submittedAt: number;
}

// In-memory storage for walks (replace with database in production)
// Keyed by challengeId (or "global" for walks without a challenge)
const walksByChallenge: Map<string, StoredWalk[]> = new Map();

export async function POST(request: NextRequest) {
  try {
    const body: WalkSubmission = await request.json();
    const { distance, duration, samples, suspicious, challengeId } = body;

    // Sanity checks
    const errors: string[] = [];

    // Check distance < 100km
    if (distance >= 100) {
      errors.push("Distance exceeds maximum allowed (100km)");
    }

    // Check duration > 1 minute (60000ms)
    if (duration < 60000) {
      errors.push("Walk duration too short (minimum 1 minute)");
    }

    // Check we have samples
    if (!samples || samples.length === 0) {
      errors.push("No GPS samples provided");
    }

    // Check distance is non-negative
    if (distance < 0) {
      errors.push("Invalid distance value");
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { error: "Validation failed", details: errors },
        { status: 400 }
      );
    }

    // Generate a simple ID
    const walkId = `walk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Store the walk
    const walkRecord: StoredWalk = {
      id: walkId,
      distance,
      duration,
      samples,
      suspicious,
      challengeId,
      submittedAt: Date.now(),
    };

    // Store by challenge or globally
    const key = challengeId || "global";
    if (!walksByChallenge.has(key)) {
      walksByChallenge.set(key, []);
    }
    walksByChallenge.get(key)!.push(walkRecord);

    // Log for debugging
    console.log(`Walk submitted: ${walkId}`, {
      challengeId: challengeId || "none",
      distance: distance.toFixed(2) + " km",
      duration: Math.round(duration / 1000) + "s",
      samples: samples.length,
      suspicious,
    });

    // Calculate totals for this challenge
    const challengeWalks = walksByChallenge.get(key) || [];
    const totalDistance = challengeWalks.reduce((sum, w) => sum + w.distance, 0);
    const totalDuration = challengeWalks.reduce((sum, w) => sum + w.duration, 0);

    return NextResponse.json({
      success: true,
      message: suspicious
        ? "Walk recorded (flagged for review)"
        : "Walk recorded successfully!",
      walkId,
      summary: {
        distance: distance.toFixed(2) + " km",
        duration: Math.round(duration / 1000) + " seconds",
        samples: samples.length,
        suspicious,
      },
      challengeProgress: {
        totalWalks: challengeWalks.length,
        totalDistance: totalDistance.toFixed(2) + " km",
        totalDuration: Math.round(totalDuration / 1000) + " seconds",
      },
    });
  } catch (error) {
    console.error("Walk submit error:", error);
    return NextResponse.json(
      { error: "Failed to process walk submission" },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve walks (for debugging)
export async function GET() {
  const allWalks: { challengeId: string; walks: StoredWalk[] }[] = [];
  
  walksByChallenge.forEach((walks, challengeId) => {
    allWalks.push({
      challengeId,
      walks: walks.slice(-10), // Last 10 per challenge
    });
  });

  return NextResponse.json({
    challenges: allWalks.length,
    data: allWalks,
  });
}

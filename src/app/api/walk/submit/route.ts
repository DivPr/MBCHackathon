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
}

// In-memory storage for walks (replace with database in production)
const walks: Array<WalkSubmission & { id: string; submittedAt: number }> = [];

export async function POST(request: NextRequest) {
  try {
    const body: WalkSubmission = await request.json();
    const { distance, duration, samples, suspicious } = body;

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
    const walkRecord = {
      id: walkId,
      distance,
      duration,
      samples,
      suspicious,
      submittedAt: Date.now(),
    };

    walks.push(walkRecord);

    // Log for debugging
    console.log(`Walk submitted: ${walkId}`, {
      distance: distance.toFixed(2) + " km",
      duration: Math.round(duration / 1000) + "s",
      samples: samples.length,
      suspicious,
    });

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
  return NextResponse.json({
    count: walks.length,
    walks: walks.slice(-10), // Return last 10 walks
  });
}


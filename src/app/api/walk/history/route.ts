import { NextRequest, NextResponse } from "next/server";

interface StoredWalk {
  id: string;
  distance: number;
  duration: number;
  suspicious: boolean;
  submittedAt: number;
}

// This would normally come from a database
// For now, we'll use a simple in-memory store that's shared with submit
// In production, replace with actual database queries

// Note: In a real app, this data would be persisted in a database
// This is a simplified version for the hackathon

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const challengeId = searchParams.get("challengeId");

    if (!challengeId) {
      return NextResponse.json(
        { error: "challengeId is required" },
        { status: 400 }
      );
    }

    // In production, fetch from database
    // For now, return empty data (the submit route stores in memory but 
    // we can't access it directly here in serverless)
    // The WalkTracker component tracks locally after submission

    return NextResponse.json({
      challengeId,
      walks: [] as StoredWalk[],
      totalDistance: 0,
      totalDuration: 0,
      walkCount: 0,
    });
  } catch (error) {
    console.error("Walk history error:", error);
    return NextResponse.json(
      { error: "Failed to fetch walk history" },
      { status: 500 }
    );
  }
}


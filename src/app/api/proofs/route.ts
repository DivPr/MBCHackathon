import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

type ProofEntry = {
  challengeId: string;
  participant: string;
  imageData: string; // base64 data URL for hackathon scope
  posePrompt?: string;
  proofCid: string;
  createdAt: number;
};

// In-memory store (dev/demo only). This resets on server restart.
const proofStore: Record<string, ProofEntry[]> = {};

export async function POST(req: Request) {
  const body = await req.json();
  const { challengeId, participant, imageData, posePrompt } = body || {};

  if (!challengeId || !participant || !imageData) {
    return NextResponse.json({ error: "challengeId, participant, and imageData are required" }, { status: 400 });
  }

  const proofCid = randomUUID();
  const entry: ProofEntry = {
    challengeId: String(challengeId),
    participant: String(participant),
    imageData: String(imageData),
    posePrompt: posePrompt ? String(posePrompt) : undefined,
    proofCid,
    createdAt: Date.now(),
  };

  if (!proofStore[entry.challengeId]) {
    proofStore[entry.challengeId] = [];
  }

  // Most recent first
  proofStore[entry.challengeId].unshift(entry);

  return NextResponse.json({ proofCid });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const challengeId = searchParams.get("challengeId");

  if (challengeId) {
    return NextResponse.json({ proofs: proofStore[challengeId] || [] });
  }

  // Flatten all proofs if no challenge specified
  const allProofs = Object.values(proofStore).flat();
  return NextResponse.json({ proofs: allProofs });
}

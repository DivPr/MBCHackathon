import { NextResponse } from "next/server";

const removalMessage = {
  error: "GPS walk tracking has been removed. Submit a proof photo from the challenge page instead.",
};

export async function POST() {
  return NextResponse.json(removalMessage, { status: 410 });
}

export async function GET() {
  return NextResponse.json(removalMessage, { status: 410 });
}

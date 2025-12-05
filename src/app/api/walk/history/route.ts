import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      error: "GPS walk tracking has been removed. Proof photos now verify runs.",
    },
    { status: 410 }
  );
}


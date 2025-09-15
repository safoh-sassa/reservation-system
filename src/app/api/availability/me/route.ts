import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const painterId = searchParams.get("painterId");

    if (!painterId) {
      return NextResponse.json(
        { error: "Missing painterId parameter" },
        { status: 400 }
      );
    }

    const availabilities = await prisma.availability.findMany({
      where: {
        painterId: painterId,
      },
      orderBy: {
        startTime: "asc",
      },
    });

    return NextResponse.json(
      availabilities.map((availability) => ({
        id: availability.id,
        startTime: availability.startTime.toISOString(),
        endTime: availability.endTime.toISOString(),
      }))
    );
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

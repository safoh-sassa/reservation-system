import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
  try {
    const { startTime, endTime, painterId } = await request.json();

    if (!startTime || !endTime || !painterId) {
      return NextResponse.json(
        { error: "Missing required fields: startTime, endTime, painterId" },
        { status: 400 }
      );
    }

    // Handle datetime-local format consistently
    const startTimeUTC = startTime.includes("Z") ? startTime : startTime + "Z";
    const endTimeUTC = endTime.includes("Z") ? endTime : endTime + "Z";

    const availability = await prisma.availability.create({
      data: {
        id: uuidv4(),
        painterId,
        startTime: new Date(startTimeUTC),
        endTime: new Date(endTimeUTC),
      },
    });

    return NextResponse.json({
      id: availability.id,
      painterId: availability.painterId,
      startTime: availability.startTime.toISOString(),
      endTime: availability.endTime.toISOString(),
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const availabilities = await prisma.availability.findMany({
      include: {
        painter: true,
      },
      orderBy: {
        startTime: "asc",
      },
    });

    return NextResponse.json(
      availabilities.map((availability) => ({
        id: availability.id,
        painterId: availability.painterId,
        painterName: availability.painter.name,
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

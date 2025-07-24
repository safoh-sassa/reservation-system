import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get("customerId");
    const painterId = searchParams.get("painterId");

    if (!customerId && !painterId) {
      return NextResponse.json(
        { error: "Missing customerId or painterId parameter" },
        { status: 400 }
      );
    }

    const whereClause = customerId
      ? { customerId: customerId }
      : { painterId: painterId! };

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: {
        painter: true,
        customer: true,
      },
      orderBy: {
        startTime: "asc",
      },
    });

    return NextResponse.json(
      bookings.map((booking) => ({
        id: booking.id,
        painter: {
          id: booking.painter.id,
          name: booking.painter.name,
        },
        customer: {
          id: booking.customer.id,
          name: booking.customer.name,
          email: booking.customer.email,
          phone: booking.customer.phone,
        },
        startTime: booking.startTime.toISOString(),
        endTime: booking.endTime.toISOString(),
        status: booking.status,
      }))
    );
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

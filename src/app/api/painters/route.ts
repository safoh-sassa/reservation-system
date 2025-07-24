import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone } = await request.json();

    if (!name || !email) {
      return NextResponse.json(
        { error: "Missing required fields: name and email" },
        { status: 400 }
      );
    }

    // Check if painter already exists by email
    const existingPainter = await prisma.painter.findFirst({
      where: { email },
    });

    if (existingPainter) {
      return NextResponse.json({
        id: existingPainter.id,
        name: existingPainter.name,
        email: existingPainter.email,
        phone: existingPainter.phone,
        message: "Painter logged in successfully",
      });
    }

    // Create new painter
    const painter = await prisma.painter.create({
      data: {
        id: uuidv4(),
        name,
        email,
        phone: phone || null,
      },
    });

    return NextResponse.json({
      id: painter.id,
      name: painter.name,
      email: painter.email,
      phone: painter.phone,
      message: "Painter registered successfully",
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
    const painters = await prisma.painter.findMany({
      orderBy: { name: "asc" },
    });

    return NextResponse.json(painters);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

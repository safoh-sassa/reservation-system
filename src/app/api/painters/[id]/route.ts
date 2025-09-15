import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const painter = await prisma.painter.findUnique({
      where: { id },
    });

    if (!painter) {
      return NextResponse.json({ error: "Painter not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: painter.id,
      name: painter.name,
      email: painter.email,
      phone: painter.phone,
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

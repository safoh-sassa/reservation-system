import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { registerOrLogin } from "@/utils/auth";

export async function POST(request: NextRequest) {
  const userData = await request.json();
  const result = await registerOrLogin(userData, "customer");
  return result.response;
}

export async function GET() {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: { name: "asc" },
    });

    return NextResponse.json(customers);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

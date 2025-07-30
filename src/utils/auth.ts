import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";

interface RegisterOrLoginData {
  name: string;
  email: string;
  phone?: string;
}

interface RegisterOrLoginResult {
  success: boolean;
  response: NextResponse;
}

// Helper function to handle database operations for a specific entity type
async function handleEntityOperations(
  entityType: "customer" | "painter",
  email: string,
  userData: { name: string; email: string; phone: string }
) {
  const entityData = {
    id: uuidv4(),
    name: userData.name,
    email: userData.email,
    phone: userData.phone || "",
  };

  if (entityType === "customer") {
    // Check if customer already exists
    const existingEntity = await prisma.customer.findUnique({
      where: { email },
    });

    if (existingEntity) {
      return { isExisting: true, entity: existingEntity };
    }

    // Create new customer
    const newEntity = await prisma.customer.create({ data: entityData });
    return { isExisting: false, entity: newEntity };
  } else {
    // Check if painter already exists
    const existingEntity = await prisma.painter.findUnique({
      where: { email },
    });

    if (existingEntity) {
      return { isExisting: true, entity: existingEntity };
    }

    // Create new painter
    const newEntity = await prisma.painter.create({ data: entityData });
    return { isExisting: false, entity: newEntity };
  }
}

export async function registerOrLogin(
  userData: RegisterOrLoginData,
  entityType: "customer" | "painter"
): Promise<RegisterOrLoginResult> {
  try {
    const { name, email, phone } = userData;

    if (!name || !email) {
      return {
        success: false,
        response: NextResponse.json(
          { error: "Missing required fields: name, email" },
          { status: 400 }
        ),
      };
    }

    const capitalizedEntityType =
      entityType.charAt(0).toUpperCase() + entityType.slice(1);
    const { isExisting, entity } = await handleEntityOperations(
      entityType,
      email,
      { name, email, phone: phone || "" }
    );

    const message = isExisting
      ? `${capitalizedEntityType} logged in successfully`
      : `${capitalizedEntityType} registered successfully`;

    return {
      success: true,
      response: NextResponse.json({
        id: entity.id,
        name: entity.name,
        email: entity.email,
        phone: entity.phone,
        message,
      }),
    };
  } catch {
    return {
      success: false,
      response: NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      ),
    };
  }
}

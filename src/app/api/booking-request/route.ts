import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";

interface AvailablePainter {
  painterId: string;
  startTime: Date;
  endTime: Date;
  painter: {
    id: string;
    name: string;
  };
}

interface TimeSlot {
  startTime: Date;
  endTime: Date;
}

interface Booking {
  startTime: Date;
  endTime: Date;
}

interface Suggestion {
  painterId: string;
  painterName: string;
  startTime: Date;
  endTime: Date;
  timeDifference: number;
}

// Cache for slot generation to avoid repeated calculations
const slotCache = new Map<string, TimeSlot[]>();

async function findAvailablePainters(
  startTime: Date,
  endTime: Date
): Promise<AvailablePainter[]> {
  const availabilities = await prisma.availability.findMany({
    where: {
      AND: [{ startTime: { lte: startTime } }, { endTime: { gte: endTime } }],
    },
    include: {
      painter: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    take: 10,
    orderBy: {
      startTime: "asc",
    },
  });

  if (availabilities.length === 0) {
    return [];
  }

  // Get conflicting bookings in a separate optimized query
  const painterIds = availabilities.map((a) => a.painterId);
  const conflictingBookings = await prisma.booking.findMany({
    where: {
      painterId: { in: painterIds },
      AND: [{ startTime: { lt: endTime } }, { endTime: { gt: startTime } }],
    },
    select: {
      painterId: true,
    },
  });

  // Find painters with conflicts
  const paintersWithConflicts = new Set(
    conflictingBookings.map((b) => b.painterId)
  );

  // Filter out painters with conflicts
  return availabilities
    .filter(
      (availability) => !paintersWithConflicts.has(availability.painterId)
    )
    .map((availability) => ({
      painterId: availability.painterId,
      startTime: availability.startTime,
      endTime: availability.endTime,
      painter: {
        id: availability.painter.id,
        name: availability.painter.name,
      },
    }));
}

// Optimized slot generation with caching and better algorithm
function generateHourlySlots(
  availStart: Date,
  availEnd: Date,
  duration: number
): TimeSlot[] {
  // Create cache key
  const cacheKey = `${availStart.getTime()}-${availEnd.getTime()}-${duration}`;

  if (slotCache.has(cacheKey)) {
    return slotCache.get(cacheKey)!;
  }

  const slots: TimeSlot[] = [];
  const startTime = availStart.getTime();
  const endTime = availEnd.getTime();
  const slotInterval = 30 * 60 * 1000; // 30 minutes

  // Align to 30-minute boundaries
  const startMinutes = availStart.getMinutes();
  const alignmentOffset =
    startMinutes <= 30 ? (30 - startMinutes) % 30 : 60 - startMinutes;

  const alignedStart = startTime + alignmentOffset * 60 * 1000;
  const effectiveStart = Math.max(alignedStart, startTime);

  // Pre-calculate number of slots to avoid array resizing
  const maxSlots =
    Math.floor((endTime - effectiveStart - duration) / slotInterval) + 1;

  if (maxSlots <= 0) {
    slotCache.set(cacheKey, []);
    return [];
  }

  // Generate slots using single loop with pre-allocated array size hint
  for (let i = 0; i < maxSlots; i++) {
    const currentTime = effectiveStart + i * slotInterval;
    if (currentTime + duration <= endTime) {
      slots.push({
        startTime: new Date(currentTime),
        endTime: new Date(currentTime + duration),
      });
    }
  }

  // Cache result for future use
  if (slotCache.size > 1000) {
    // Prevent memory leaks
    slotCache.clear();
  }
  slotCache.set(cacheKey, slots);

  return slots;
}

// Highly optimized conflict checking using sliding window
function findAvailableTimeSlots(
  availStart: Date,
  availEnd: Date,
  existingBookings: Booking[],
  duration: number
): TimeSlot[] {
  const possibleSlots = generateHourlySlots(availStart, availEnd, duration);

  if (existingBookings.length === 0) {
    return possibleSlots;
  }

  // Sort bookings once and avoid mutation of original array
  const sortedBookings =
    existingBookings.length > 1
      ? [...existingBookings].sort(
          (a, b) => a.startTime.getTime() - b.startTime.getTime()
        )
      : existingBookings;

  const availableSlots: TimeSlot[] = [];
  let bookingIndex = 0;

  for (const slot of possibleSlots) {
    const slotStart = slot.startTime.getTime();
    const slotEnd = slot.endTime.getTime();

    while (
      bookingIndex < sortedBookings.length &&
      sortedBookings[bookingIndex].endTime.getTime() <= slotStart
    ) {
      bookingIndex++;
    }

    // Check for conflicts starting from current booking index
    let hasConflict = false;
    for (let i = bookingIndex; i < sortedBookings.length; i++) {
      const booking = sortedBookings[i];
      const bookingStart = booking.startTime.getTime();
      const bookingEnd = booking.endTime.getTime();

      // Early termination: if booking starts after slot ends, no more conflicts possible
      if (bookingStart >= slotEnd) break;

      // Check for overlap using timestamps for better performance
      if (slotStart < bookingEnd && slotEnd > bookingStart) {
        hasConflict = true;
        break;
      }
    }

    if (!hasConflict) {
      availableSlots.push(slot);
    }
  }

  return availableSlots;
}

// find Closest Available Slots
async function findClosestAvailableSlots(
  requestedStart: Date,
  requestedEnd: Date,
  duration: number
): Promise<Suggestion[]> {
  // Get all availabilities with sufficient duration
  const availabilities = await prisma.availability.findMany({
    where: {
      endTime: {
        gte: new Date(requestedStart.getTime() + duration),
      },
    },
    include: {
      painter: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      startTime: "asc",
    },
  });

  if (availabilities.length === 0) {
    return [];
  }

  // Get all bookings for these painters
  const painterIds = availabilities.map((a) => a.painterId);
  const allBookings = await prisma.booking.findMany({
    where: {
      painterId: { in: painterIds },
    },
    select: {
      painterId: true,
      startTime: true,
      endTime: true,
    },
    orderBy: {
      startTime: "asc",
    },
  });

  // Group bookings by painter
  const bookingsByPainter = new Map<string, Booking[]>();
  for (const booking of allBookings) {
    if (!bookingsByPainter.has(booking.painterId)) {
      bookingsByPainter.set(booking.painterId, []);
    }
    bookingsByPainter.get(booking.painterId)!.push({
      startTime: booking.startTime,
      endTime: booking.endTime,
    });
  }

  const suggestions: Suggestion[] = [];
  const requestedStartTime = requestedStart.getTime();

  // Process each availability
  for (const availability of availabilities) {
    const availStart = availability.startTime;
    const availEnd = availability.endTime;
    const availDuration = availEnd.getTime() - availStart.getTime();

    // Skip if availability is too short
    if (availDuration < duration) continue;

    const painterBookings = bookingsByPainter.get(availability.painterId) || [];

    // Filter bookings that overlap with this availability
    const relevantBookings = painterBookings.filter(
      (booking) => booking.startTime < availEnd && booking.endTime > availStart
    );

    // Find available slots
    const availableSlots = findAvailableTimeSlots(
      availStart,
      availEnd,
      relevantBookings,
      duration
    );

    // Add slots to suggestions
    for (const slot of availableSlots) {
      suggestions.push({
        painterId: availability.painterId,
        painterName: availability.painter.name,
        startTime: slot.startTime,
        endTime: slot.endTime,
        timeDifference: Math.abs(slot.startTime.getTime() - requestedStartTime),
      });

      // Early termination if there are enough suggestions
      if (suggestions.length >= 20) break;
    }

    if (suggestions.length >= 20) break;
  }

  // Sort by time difference and return top 5
  return suggestions
    .sort((a, b) => a.timeDifference - b.timeDifference)
    .slice(0, 5);
}

// Optimized date parsing with validation
function parseAndValidateDateTime(dateStr: string): Date {
  // Handle timezone normalization
  const normalizedStr = dateStr.includes("Z") ? dateStr : `${dateStr}Z`;
  const date = new Date(normalizedStr);

  if (isNaN(date.getTime())) {
    throw new Error("Invalid date format");
  }

  return date;
}

export async function POST(request: NextRequest) {
  try {
    const { startTime, endTime, customerId } = await request.json();

    // Early validation
    if (!startTime || !endTime || !customerId) {
      return NextResponse.json(
        { error: "Missing required fields: startTime, endTime, customerId" },
        { status: 400 }
      );
    }

    // Optimized date parsing
    let requestedStart: Date, requestedEnd: Date;
    try {
      requestedStart = parseAndValidateDateTime(startTime);
      requestedEnd = parseAndValidateDateTime(endTime);
    } catch {
      return NextResponse.json(
        { error: "Invalid date format" },
        { status: 400 }
      );
    }

    const duration = requestedEnd.getTime() - requestedStart.getTime();

    if (duration <= 0) {
      return NextResponse.json(
        { error: "End time must be after start time" },
        { status: 400 }
      );
    }

    // Find available painters
    const availablePainters = await findAvailablePainters(
      requestedStart,
      requestedEnd
    );

    if (availablePainters.length === 0) {
      // Find alternatives
      const suggestions = await findClosestAvailableSlots(
        requestedStart,
        requestedEnd,
        duration
      );

      const errorMessage =
        suggestions.length === 0
          ? "No painters are available at this time. There are currently no available time slots in the system."
          : "No painters are available for the requested time slot. Please choose from the available alternatives below.";

      return NextResponse.json(
        {
          error: errorMessage,
          suggestions: suggestions,
        },
        { status: 409 }
      );
    }

    // Create booking with the first available painter
    const selectedAvailability = availablePainters[0];
    const bookingId = uuidv4();

    const booking = await prisma.booking.create({
      data: {
        id: bookingId,
        painterId: selectedAvailability.painterId,
        customerId,
        startTime: requestedStart,
        endTime: requestedEnd,
        status: "confirmed",
      },
      select: {
        id: true,
        startTime: true,
        endTime: true,
        status: true,
        painter: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      bookingId: booking.id,
      painter: {
        id: booking.painter.id,
        name: booking.painter.name,
      },
      startTime: booking.startTime.toISOString(),
      endTime: booking.endTime.toISOString(),
      status: booking.status,
    });
  } catch (error) {
    console.error("Booking error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

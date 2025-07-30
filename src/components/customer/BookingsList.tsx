"use client";
import React from "react";
import { Typography, Card, CardContent, Chip, Stack, Box } from "@mui/material";
import { formatDateTimeRange } from "@/utils/dateTimeUtils";

interface Booking {
  id: string;
  startTime: string;
  endTime: string;
  status: string;
  painter?: {
    id: string;
    name: string;
  };
}

interface BookingsListProps {
  bookings: Booking[];
  getStatusColor: (
    status: string
  ) => "success" | "warning" | "error" | "default";
}

export default function BookingsList({
  bookings,
  getStatusColor,
}: BookingsListProps) {
  return (
    <>
      <Typography variant="h6" gutterBottom>
        My Bookings
      </Typography>
      {bookings.length === 0 ? (
        <Typography color="text.secondary">
          No bookings yet. Create your first booking request!
        </Typography>
      ) : (
        <Stack spacing={2}>
          {bookings.map((booking) => (
            <Card key={booking.id} variant="outlined">
              <CardContent>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="flex-start"
                >
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1">
                      {formatDateTimeRange(booking.startTime, booking.endTime)}
                    </Typography>
                    {booking.painter && (
                      <Typography variant="body2">
                        Painter: {booking.painter.name}
                      </Typography>
                    )}
                  </Box>
                  <Chip
                    label={booking.status.toUpperCase()}
                    color={getStatusColor(booking.status)}
                    size="small"
                  />
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </>
  );
}

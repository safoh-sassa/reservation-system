"use client";
import React from "react";
import {
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Chip,
  Box,
} from "@mui/material";
import { formatDateTimeRange } from "@/utils/dateTimeUtils";

interface Booking {
  id: string;
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  startTime: string;
  endTime: string;
  status: string;
}

interface AssignedBookingsListProps {
  bookings: Booking[];
  getStatusColor: (
    status: string
  ) => "success" | "warning" | "info" | "error" | "default";
}

export default function AssignedBookingsList({
  bookings,
  getStatusColor,
}: AssignedBookingsListProps) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Assigned Bookings
        </Typography>
        {bookings.length === 0 ? (
          <Typography color="text.secondary">
            No bookings assigned yet
          </Typography>
        ) : (
          <List>
            {bookings.map((booking) => (
              <ListItem key={booking.id} divider>
                <ListItemText
                  primary={
                    <Box>
                      <Typography variant="body1" fontWeight="medium">
                        {booking.customer.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {booking.customer.email}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {booking.customer.phone}
                      </Typography>
                      <Typography variant="body2">
                        {formatDateTimeRange(
                          booking.startTime,
                          booking.endTime
                        )}
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        <Chip
                          label={booking.status}
                          size="small"
                          color={getStatusColor(booking.status)}
                        />
                      </Box>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
}

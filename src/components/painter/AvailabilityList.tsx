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

interface Availability {
  id: string;
  startTime: string;
  endTime: string;
}

interface AvailabilityListProps {
  availabilities: Availability[];
}

export default function AvailabilityList({
  availabilities,
}: AvailabilityListProps) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Your Availability
        </Typography>
        {availabilities.length === 0 ? (
          <Typography color="text.secondary">
            No availability set yet
          </Typography>
        ) : (
          <List>
            {availabilities.map((availability) => (
              <ListItem key={availability.id} divider>
                <ListItemText
                  primary={
                    <Box>
                      <Typography variant="body1">
                        {formatDateTimeRange(
                          availability.startTime,
                          availability.endTime
                        )}
                      </Typography>
                      <Chip label="Available" size="small" color="success" />
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

"use client";
import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Card,
  CardContent,
  Button,
  Stack,
  Box,
} from "@mui/material";

interface Suggestion {
  painterId: string;
  painterName: string;
  startTime: string;
  endTime: string;
}

interface SuggestionsDialogProps {
  open: boolean;
  onClose: () => void;
  suggestions: Suggestion[];
  loading: boolean;
  onSuggestionSelect: (suggestion: Suggestion) => void;
}

export default function SuggestionsDialog({
  open,
  onClose,
  suggestions,
  loading,
  onSuggestionSelect,
}: SuggestionsDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {suggestions.length > 0
          ? "Closest Available Time Slots"
          : "No Available Time Slots"}
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Your requested time is not available.
        </Typography>
        <Stack spacing={2}>
          {suggestions.length > 0 ? (
            <>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Here are the closest available slots:
              </Typography>
              {suggestions.map((suggestion, index) => (
                <Card key={index} variant="outlined">
                  <CardContent>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Box>
                        <Typography variant="h6">
                          {new Date(suggestion.startTime).toLocaleDateString()}
                        </Typography>
                        <Typography variant="body1">
                          {new Date(suggestion.startTime).toLocaleTimeString(
                            [],
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                              timeZone: "UTC",
                            }
                          )}{" "}
                          -{" "}
                          {new Date(suggestion.endTime).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                            timeZone: "UTC",
                          })}
                        </Typography>

                        <Typography variant="body2" color="text.secondary">
                          Painter: {suggestion.painterName}
                        </Typography>
                      </Box>
                      <Button
                        variant="contained"
                        onClick={() => onSuggestionSelect(suggestion)}
                        disabled={loading}
                      >
                        {loading ? "Booking..." : "Select This Slot"}
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </>
          ) : (
            <Card variant="outlined" sx={{ textAlign: "center", p: 3 }}>
              <CardContent>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No Available Time Slots
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  Unfortunately, there are no available painters at this time.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Please try selecting a different date or contact us directly
                  to schedule your painting service.
                </Typography>
              </CardContent>
            </Card>
          )}
        </Stack>
        <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
          <Button variant="outlined" onClick={onClose} fullWidth>
            Cancel
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

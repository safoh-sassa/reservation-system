"use client";
import React from "react";
import { Typography, TextField, Button, Stack } from "@mui/material";

interface BookingForm {
  startTime: string;
  endTime: string;
}

interface BookingRequestFormProps {
  bookingForm: BookingForm;
  setBookingForm: (form: BookingForm) => void;
  loading: boolean;
  onCancel: () => void;
  onSubmit: () => void;
}

export default function BookingRequestForm({
  bookingForm,
  setBookingForm,
  loading,
  onCancel,
  onSubmit,
}: BookingRequestFormProps) {
  return (
    <>
      <Typography variant="h6" gutterBottom>
        Request Booking
      </Typography>
      <Stack spacing={2} sx={{ mt: 2 }}>
        <TextField
          label="Start Time"
          type="datetime-local"
          value={bookingForm.startTime}
          onChange={(e) =>
            setBookingForm({
              ...bookingForm,
              startTime: e.target.value,
            })
          }
          disabled={loading}
          InputLabelProps={{ shrink: true }}
          inputProps={{
            step: 300,
            style: { fontSize: "16px" },
          }}
          sx={{
            maxWidth: 260,
            '& input[type="datetime-local"]': {
              colorScheme: "light",
            },
          }}
        />
        <TextField
          label="End Time"
          type="datetime-local"
          value={bookingForm.endTime}
          onChange={(e) =>
            setBookingForm({ ...bookingForm, endTime: e.target.value })
          }
          disabled={loading}
          InputLabelProps={{ shrink: true }}
          inputProps={{
            step: 300,
            style: { fontSize: "16px" },
          }}
          sx={{
            maxWidth: 260,
            '& input[type="datetime-local"]': {
              colorScheme: "light",
            },
          }}
        />
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            onClick={onCancel}
            fullWidth
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={onSubmit}
            disabled={loading || !bookingForm.startTime || !bookingForm.endTime}
            fullWidth
          >
            {loading ? "Submitting..." : "Submit Request"}
          </Button>
        </Stack>
      </Stack>
    </>
  );
}

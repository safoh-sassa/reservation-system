"use client";
import React from "react";
import {
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Stack,
} from "@mui/material";

interface AvailabilityForm {
  startTime: string;
  endTime: string;
}

interface AddAvailabilityFormProps {
  availabilityForm: AvailabilityForm;
  setAvailabilityForm: (form: AvailabilityForm) => void;
  loading: boolean;
  onSubmit: () => void;
}

export default function AddAvailabilityForm({
  availabilityForm,
  setAvailabilityForm,
  loading,
  onSubmit,
}: AddAvailabilityFormProps) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Add Availability
        </Typography>
        <Stack spacing={2}>
          <TextField
            fullWidth
            label="Start Time"
            type="datetime-local"
            value={availabilityForm.startTime}
            onChange={(e) =>
              setAvailabilityForm({
                ...availabilityForm,
                startTime: e.target.value,
              })
            }
            InputLabelProps={{ shrink: true }}
            inputProps={{
              step: 300, // 5 min intervals
            }}
            sx={{
              '& input[type="datetime-local"]::-webkit-calendar-picker-indicator':
                {
                  cursor: "pointer",
                },
            }}
          />
          <TextField
            fullWidth
            label="End Time"
            type="datetime-local"
            value={availabilityForm.endTime}
            onChange={(e) =>
              setAvailabilityForm({
                ...availabilityForm,
                endTime: e.target.value,
              })
            }
            InputLabelProps={{ shrink: true }}
            inputProps={{
              step: 300, // 5 min intervals
            }}
            sx={{
              '& input[type="datetime-local"]::-webkit-calendar-picker-indicator':
                {
                  cursor: "pointer",
                },
            }}
          />
          <Button
            fullWidth
            variant="contained"
            onClick={onSubmit}
            disabled={
              loading ||
              !availabilityForm.startTime ||
              !availabilityForm.endTime
            }
          >
            {loading ? "Adding..." : "Add Availability"}
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}

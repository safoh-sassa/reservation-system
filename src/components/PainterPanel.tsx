"use client";
import React, { useState, useEffect } from "react";
import { Box, Button, Typography, Alert, Stack } from "@mui/material";
import LoginForm from "./forms/LoginForm";
import RegisterForm from "./forms/RegisterForm";
import AddAvailabilityForm from "./painter/AddAvailabilityForm";
import AvailabilityList from "./painter/AvailabilityList";
import AssignedBookingsList from "./painter/AssignedBookingsList";

interface Painter {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

interface Availability {
  id: string;
  startTime: string;
  endTime: string;
}

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

export default function PainterPanel() {
  const [painter, setPainter] = useState<Painter | null>(null);
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [availabilityForm, setAvailabilityForm] = useState({
    startTime: "",
    endTime: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showRegister, setShowRegister] = useState(false);

  // Auto-hide message after 3 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleRegister = async (formData: {
    name: string;
    email: string;
    phone: string;
  }) => {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/painters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setPainter(data);
        setMessage(data.message);
        await loadAvailabilities(data.id);
        await loadBookings(data.id);
      } else {
        setMessage(data.error);
      }
    } catch {
      setMessage("Registration failed");
    }

    setLoading(false);
  };

  const handleLogin = async (id: string) => {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`/api/painters/${id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (response.ok) {
        setPainter(data);
        setMessage("Painter logged in successfully");
        await loadAvailabilities(data.id);
        await loadBookings(data.id);
      } else {
        setMessage(data.error);
      }
    } catch {
      setMessage("Login failed");
    }

    setLoading(false);
  };

  const loadAvailabilities = async (painterId: string) => {
    try {
      const response = await fetch(
        `/api/availability/me?painterId=${painterId}`
      );
      const data = await response.json();

      if (response.ok) {
        setAvailabilities(data);
      } else {
        setMessage("Failed to load availabilities");
      }
    } catch {
      setMessage("Failed to load availabilities");
    }
  };

  const loadBookings = async (painterId: string) => {
    try {
      const response = await fetch(`/api/bookings?painterId=${painterId}`);
      const data = await response.json();

      if (response.ok) {
        setBookings(data);
      } else {
        setMessage("Failed to load bookings");
      }
    } catch {
      setMessage("Failed to load bookings");
    }
  };

  const handleAddAvailability = async () => {
    if (!painter) return;

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...availabilityForm,
          painterId: painter.id,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Availability added successfully!");
        setAvailabilityForm({ startTime: "", endTime: "" });
        await loadAvailabilities(painter.id);
      } else {
        setMessage(data.error);
      }
    } catch {
      setMessage("Failed to add availability");
    }

    setLoading(false);
  };

  const handleLogout = () => {
    setPainter(null);
    setAvailabilities([]);
    setBookings([]);
    setMessage("");
    setAvailabilityForm({ startTime: "", endTime: "" });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return "success";
      case "pending":
        return "warning";
      case "completed":
        return "info";
      case "cancelled":
        return "error";
      default:
        return "default";
    }
  };

  if (painter) {
    return (
      <Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Box>
            <Typography variant="h6">Welcome, {painter.name}!</Typography>
            <Typography variant="body2" color="text.secondary">
              ID: {painter.id}
            </Typography>
          </Box>
          <Button variant="outlined" onClick={handleLogout}>
            Logout
          </Button>
        </Box>

        {message && (
          <Alert
            severity={message.includes("successfully") ? "success" : "info"}
            sx={{ mb: 2 }}
          >
            {message}
          </Alert>
        )}

        <Stack direction={{ xs: "column", lg: "row" }} spacing={3}>
          <Box sx={{ flex: 1 }}>
            <AddAvailabilityForm
              availabilityForm={availabilityForm}
              setAvailabilityForm={setAvailabilityForm}
              loading={loading}
              onSubmit={handleAddAvailability}
            />
          </Box>

          <Box sx={{ flex: 1 }}>
            <AvailabilityList availabilities={availabilities} />
          </Box>

          <Box sx={{ flex: 1 }}>
            <AssignedBookingsList
              bookings={bookings}
              getStatusColor={getStatusColor}
            />
          </Box>
        </Stack>
      </Box>
    );
  }

  return (
    <Stack spacing={3}>
      {message && (
        <Alert
          severity={message.includes("successfully") ? "success" : "error"}
          sx={{ mb: 3 }}
        >
          {message}
        </Alert>
      )}
      <Box sx={{ maxWidth: 400, mx: "auto" }}>
        {!showRegister ? (
          <>
            <LoginForm
              title="Login as Painter"
              onSubmit={handleLogin}
              loading={loading}
              idLabel="Painter ID"
              helperText="Enter your painter ID to login"
            />
            <Button
              variant="text"
              sx={{ mt: 2, width: "100%" }}
              onClick={() => setShowRegister(true)}
              disabled={loading}
            >
              Create Account
            </Button>
          </>
        ) : (
          <>
            <RegisterForm
              title="New Painter Registration"
              onSubmit={handleRegister}
              loading={loading}
              phoneRequired={false}
            />
            <Button
              variant="text"
              sx={{ mt: 2, width: "100%" }}
              onClick={() => setShowRegister(false)}
              disabled={loading}
            >
              Go to Login
            </Button>
          </>
        )}
      </Box>
    </Stack>
  );
}

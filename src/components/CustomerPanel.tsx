"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  Alert,
  Stack,
} from "@mui/material";
import LoginForm from "./forms/LoginForm";
import RegisterForm from "./forms/RegisterForm";
import BookingsList from "./customer/BookingsList";
import BookingRequestForm from "./customer/BookingRequestForm";
import { useBookings } from "@/hooks/useBookings";
import { useAuth } from "@/hooks/useAuth";
import SuggestionsDialog from "./customer/SuggestionsDialog";

interface Suggestion {
  painterId: string;
  painterName: string;
  startTime: string;
  endTime: string;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export default function CustomerPanel() {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const { bookings, loadBookings, setBookings } = useBookings();
  const { loading: authLoading, registerOrLogin, loginById } = useAuth();
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [bookingForm, setBookingForm] = useState({
    startTime: "",
    endTime: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

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
    setMessage("");

    const result = await registerOrLogin(formData, "/api/customers");

    if (result.success && result.data) {
      setCustomer(result.data);
      setMessage(result.data.message);
      const bookingResult = await loadBookings({ customerId: result.data.id });
      if (!bookingResult.success) {
        setMessage("Registration successful, but failed to load bookings");
      }
    } else {
      setMessage(result.error || "Registration failed");
    }
  };

  const handleLogin = async (id: string) => {
    setMessage("");

    const result = await loginById(id, "/api/customers");

    if (result.success && result.data) {
      setCustomer(result.data);
      setMessage(result.data.message);
      const bookingResult = await loadBookings({ customerId: result.data.id });
      if (!bookingResult.success) {
        setMessage("Login successful, but failed to load bookings");
      }
    } else {
      setMessage(result.error || "Login failed");
    }
  };

  const handleBookingRequest = async () => {
    if (!customer) return;

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/booking-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: customer.id,
          startTime: bookingForm.startTime,
          endTime: bookingForm.endTime,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage(data.message);
        setBookingForm({ startTime: "", endTime: "" });
        setShowBookingForm(false);
        const bookingResult = await loadBookings({ customerId: customer.id });
        if (!bookingResult.success) {
          setMessage("Failed to refresh bookings");
        }
      } else if (response.status === 409) {
        // Handle suggestions - no painters available for requested time
        if (data.suggestions && data.suggestions.length > 0) {
          setSuggestions(data.suggestions);
          // Add 3-second delay before showing suggestions
          setTimeout(() => {
            setShowSuggestions(true);
          }, 4000);
        }
        setMessage(data.error);
        // Keep the booking form open
      } else {
        setMessage(data.error);
      }
    } catch {
      setMessage("Failed to submit booking request");
    }

    setLoading(false);
  };

  const handleSuggestionSelect = async (suggestion: Suggestion) => {
    if (!customer) return;

    setLoading(true);
    try {
      const response = await fetch("/api/booking-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: customer.id,
          painterId: suggestion.painterId,
          startTime: suggestion.startTime,
          endTime: suggestion.endTime,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Booking confirmed with suggested time slot!");
        setBookingForm({ startTime: "", endTime: "" });
        setShowBookingForm(false);
        setShowSuggestions(false);
        setSuggestions([]);
        const bookingResult = await loadBookings({ customerId: customer.id });
        if (!bookingResult.success) {
          setMessage("Failed to refresh bookings");
        }
      } else {
        setMessage(`Error: ${data.error || "Unknown error"}`);
      }
    } catch {
      setMessage("Error confirming booking");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setCustomer(null);
    setBookings([]);
    setMessage("");
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return "success";
      case "pending":
        return "warning";
      case "cancelled":
        return "error";
      default:
        return "default";
    }
  };

  if (!customer) {
    return (
      <Stack spacing={3}>
        {message && (
          <Alert
            severity={message.includes("successful") ? "success" : "error"}
          >
            {message}
          </Alert>
        )}

        <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
          <Box sx={{ flex: 1 }}>
            <RegisterForm
              title="New Customer Registration"
              onSubmit={handleRegister}
              loading={authLoading}
              phoneRequired={false}
            />
          </Box>

          <Box sx={{ flex: 1 }}>
            <LoginForm
              title="Login as Customer"
              onSubmit={handleLogin}
              loading={authLoading}
              idLabel="Customer ID"
              helperText="Enter your customer ID to login"
            />
          </Box>
        </Stack>
      </Stack>
    );
  }

  return (
    <Stack spacing={3}>
      {message && (
        <Alert severity={message.includes("successful") ? "success" : "error"}>
          {message}
        </Alert>
      )}

      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h6">Welcome, {customer.name}!</Typography>
          <Typography variant="body2" color="text.secondary">
            ID: {customer.id}
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            onClick={() => setShowBookingForm(!showBookingForm)}
            disabled={loading}
          >
            {showBookingForm ? "Back to Bookings" : "Request Booking"}
          </Button>
          <Button variant="outlined" onClick={handleLogout}>
            Logout
          </Button>
        </Stack>
      </Stack>

      <Card>
        <CardContent>
          {showBookingForm ? (
            <BookingRequestForm
              bookingForm={bookingForm}
              setBookingForm={setBookingForm}
              loading={loading}
              onCancel={() => setShowBookingForm(false)}
              onSubmit={handleBookingRequest}
            />
          ) : (
            <BookingsList bookings={bookings} getStatusColor={getStatusColor} />
          )}
        </CardContent>
      </Card>

      <SuggestionsDialog
        open={showSuggestions}
        onClose={() => setShowSuggestions(false)}
        suggestions={suggestions}
        loading={loading}
        onSuggestionSelect={handleSuggestionSelect}
      />
    </Stack>
  );
}

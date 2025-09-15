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

export default function CustomerPanel() {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [bookingForm, setBookingForm] = useState({
    startTime: "",
    endTime: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showRegister, setShowRegister] = useState(false);

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
      const response = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setCustomer(data);
        setMessage(data.message);
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
      const response = await fetch(`/api/customers/${id}`);
      const data = await response.json();

      if (response.ok) {
        setCustomer(data);
        setMessage("Login successful!");
        await loadBookings(data.id);
      } else {
        setMessage(data.error);
      }
    } catch {
      setMessage("Login failed");
    }

    setLoading(false);
  };

  const loadBookings = async (customerId: string) => {
    try {
      const response = await fetch(`/api/bookings?customerId=${customerId}`);
      const data = await response.json();

      if (response.ok) {
        setBookings(data);
      } else {
        // Failed to load bookings
      }
    } catch {
      // Failed to load bookings
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
        await loadBookings(customer.id);
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
        await loadBookings(customer.id);
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
          <Alert severity={message.includes("successful") ? "success" : "error"}>
            {message}
          </Alert>
        )}
        <Box sx={{ maxWidth: 400, mx: "auto" }}>
          {!showRegister ? (
            <>
              <LoginForm
                title="Login as Customer"
                onSubmit={handleLogin}
                loading={loading}
                idLabel="Customer ID"
                helperText="Enter your customer ID to login"
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
                title="New Customer Registration"
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

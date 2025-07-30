import { useState } from "react";

interface Booking {
  id: string;
  painter: {
    id: string;
    name: string;
  };
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

export const useBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);

  const loadBookings = async (params: {
    customerId?: string;
    painterId?: string;
  }) => {
    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      });
      const data = await response.json();

      if (response.ok) {
        setBookings(data);
        return { success: true, data };
      } else {
        return { success: false, error: "Failed to load bookings" };
      }
    } catch {
      return { success: false, error: "Failed to load bookings" };
    }
  };

  return {
    bookings,
    loadBookings,
    setBookings,
  };
};

"use client";
import React from "react";
import { Container, Typography, Box } from "@mui/material";
import PaintingScheduler from "@/components/PaintingScheduler";

export default function Home() {
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center">
          Painting Service Scheduler
        </Typography>
        <PaintingScheduler />
      </Box>
    </Container>
  );
}

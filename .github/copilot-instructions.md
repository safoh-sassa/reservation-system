<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Painting Service Scheduler

This is a Next.js TypeScript project for a painting service scheduling system with the following characteristics:

## Tech Stack
- Next.js 15 with App Router
- TypeScript
- Prisma ORM with MySQL database
- Material-UI (MUI) for components
- UUID for unique identifiers

## Project Structure
- API routes handle backend functionality
- Components are client-side with 'use client' directive
- Database models: Painter, Customer, Availability, Booking
- Two main user types: Customers and Painters

## Key Features
- Customer registration/login and booking requests
- Painter registration/login and availability management
- Automatic painter assignment based on availability
- Alternative time slot suggestions when requested time is unavailable
- Real-time booking status and history

## Database Schema
The MySQL database has tables for painters, customers, availabilities, and bookings with proper relationships and indexes.

## Styling Guidelines
- Use MUI components with consistent styling
- Use Stack and Box for layouts instead of Grid to avoid version conflicts
- Implement responsive design with sx props
- Use proper TypeScript interfaces for all data structures

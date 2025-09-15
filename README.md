# Painting Service Scheduler
<a href="https://painting-scheduler.vercel.app" target="_blank">Live</a>

A simplified scheduling system that allows customers to request painting services for specific time slot. The system automatically assigns available painters based on their availability and provides alternative time slots when requested times are unavailable.

## Features

### For Customers

- **Register/Login**: Use Customer ID for login
- **Request Bookings**: Select start and end times for painting services
- **View Bookings**: See all confirmed bookings with painter details
- **Alternative Suggestions**: Get closest available time slots when requested time is unavailable

### For Painters

- **Register/Login**: Use Painter ID for login
- **Manage Availability**: Add available time slots
- **View Schedule**: See all his availability slots
- **View Bookings** See all his assigned bookings
- **Automatic Assignment**: System assigns a painter to customers based on availability

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 with TypeScript
- **UI Components**: Material-UI (MUI)
- **Backend**: Next.js API Routes
- **Database**: MySQL with Prisma ORM
- **Authentication**: ID-based login system

## ⚙️ Setup

clone
npm install

configure DATABASE_URL and DATABASE_URL_ROOT in .env file

npm run createDB
npx prisma generate
npx prisma migrate dev
npm run build
npm run dev
Go to http://localhost:3000 or the port shown in terminal

<a href="https://painting-scheduler.vercel.app" target="_blank">Live</a>

## API Endpoints

### Customers

- `POST /api/customers` - Register/Login customer
- `GET /api/customers/[id]` - Get customer by ID
- `GET /api/bookings?customerId=[id]` - Get customer bookings

### Painters

- `POST /api/painters` - Register/Login painter
- `GET /api/painters/[id]` - Get painter by ID
- `POST /api/availability` - Add painter availability
- `GET /api/availability/me?painterId=[id]` - Get painter's availability

### Bookings

- `POST /api/booking-request` - Request a booking (auto-assigns painter)

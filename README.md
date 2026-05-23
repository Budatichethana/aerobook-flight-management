# AeroBook

AeroBook is a flight booking and rescheduling web app built with Next.js, Supabase, and Zustand. It supports flight search, seat selection, authenticated booking, cancellation, rescheduling, and realtime seat updates for the active flight.

## Overview

The app is designed to demonstrate a production-style booking flow for airline inventory. Users can browse flights, inspect seat availability, book a seat, cancel a booking, and reschedule to another flight on the same route when seats are available.

All write operations are routed through Supabase RPC functions so the booking lifecycle stays atomic and server-controlled. The UI is built with Tailwind CSS and optimized for a clean, premium experience.

## Tech Stack

- Next.js 14 App Router
- React 18
- TypeScript
- Tailwind CSS
- Supabase Auth, PostgreSQL, Row Level Security, and RPC functions
- Zustand for client state
- lucide-react for icons
- next-pwa for service worker support

## Features Implemented

- Flight search and flight listing pages
- Authenticated login and logout with Supabase Auth
- Seat selection with class-aware cabin layout
- Booking flow with passenger form
- Booking confirmation page
- My Bookings page with cancel and reschedule actions
- Reschedule flow that only allows same-route alternative flights
- Realtime seat updates for the currently selected flight
- Premium UI polish across the booking experience
- Seed data with alternate flights for every route so rescheduling always has an option

## Database Schema

The schema lives in `supabase/migrations/001_create_tables.sql` and includes:

- `flights`
	- Core flight inventory: `flight_no`, `origin`, `destination`, `departs_at`, `arrives_at`, `aircraft_type`, `status`, `base_price`
- `seats`
	- Seat inventory per flight with `seat_number`, `class`, `is_available`, and `extra_fee`
- `bookings`
	- User bookings with `user_id`, `flight_id`, `seat_id`, `status`, `booked_at`, `total_price`, and `pnr_code`
- `passengers`
	- Passenger details linked to bookings
- `reschedules`
	- Reschedule audit trail with old/new flight ids and `fee_charged`

Indexes and constraints are defined in the same migration to support search, availability checks, and booking lookups.

## Supabase RLS

Row Level Security is enabled in `supabase/migrations/002_rls_policies.sql`.

- `flights` and `seats` are publicly readable so the search and seat map pages can work without exposing write access.
- `bookings`, `passengers`, and `reschedules` are readable only by the owning user or the service role.
- Direct table writes are restricted to the service role.
- User-facing create/update/cancel/reschedule behavior is handled through SECURITY DEFINER RPC functions rather than direct client table mutations.

This keeps the client simple while still enforcing ownership and write boundaries in the database.

## RPC Functions

The booking lifecycle is handled in `supabase/migrations/003_rpc_functions.sql`.

- `reserve_seat`
	- Verifies auth and ownership
	- Locks and validates the requested seat
	- Creates the booking and passenger row
	- Marks the seat unavailable
	- Returns the booking details used by the confirmation flow
- `cancel_booking`
	- Verifies the booking belongs to the authenticated user
	- Blocks cancellation within 2 hours of departure
	- Marks the booking cancelled
	- Frees the seat
- `reschedule_booking`
	- Requires a confirmed booking
	- Enforces same origin and destination
	- Requires a different flight and an available seat
	- Frees the old seat, reserves the new seat, updates the booking, and inserts a reschedule audit row
	- Charges only the positive fare difference between the new flight and the old flight

## Zustand Store Structure

Client state lives in `store/useStore.ts`.

### `useStore` for flight and booking flow state

- `flights`
- `searchQuery`
- `selectedFlight`
- `selectedSeat`
- `bookingStep`
- `passengerForm`
- setters for each field plus `reset()`

The store uses Zustand `persist` middleware so the booking flow can survive refreshes. The `partialize` function intentionally excludes `passport_no` from persisted local storage so sensitive passenger data is not written to the browser store.

### `useUserStore` for auth/session and cached bookings

- `session`
- `bookings` as cached bookings for the My Bookings experience
- setters for session and bookings plus `reset()`

`useUserStore` also uses `persist`, but only stores minimal session data such as `userEmail` and `accessToken` rather than the full Supabase session object. Cached bookings remain available, but passport numbers are stripped before persistence.

## Realtime Seat Updates

`SeatMap` subscribes to Supabase Realtime on `public.seats` for the current flight id.

- It listens for `UPDATE` events only.
- The subscription is filtered by `flight_id = selected/current flight id`.
- When seat availability changes, the component updates its local seat list immediately without a page refresh.
- The realtime channel is cleaned up on unmount.

This keeps the cabin view accurate when a seat is reserved, cancelled, or rescheduled.

## Local Setup

```bash
git clone <your-repo-url>
cd flight-management-app
npm install
npm run dev
```

Open the app at `http://localhost:3000`.

## Environment Variables

Create a `.env.local` file with:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are used by the browser client.
- `SUPABASE_SERVICE_ROLE_KEY` is server-only and must never be exposed in the browser.

## Supabase Migration Order

Run migrations in this order:

1. `supabase/migrations/001_create_tables.sql`
2. `supabase/migrations/002_rls_policies.sql`
3. `supabase/migrations/003_rpc_functions.sql`
4. `supabase/migrations/004_seed_data.sql`

## Test User Credentials

Use the demo account configured in your Supabase Auth project.

- Email: `budatichethana@gmail.com`
- Password: use the password configured for that Supabase Auth user in your project

The password is intentionally not stored in this repository.

## Screenshots

Add screenshots here after running the app locally. Suggested captures:

- Home page
- Flight search results
- Seat selection and booking form
- Booking confirmation page
- My Bookings page with cancel/reschedule actions
- Reschedule flow with realtime seat updates

Example layout:

- `screenshots/home.png`
- `screenshots/search.png`
- `screenshots/booking.png`
- `screenshots/bookings.png`
- `screenshots/reschedule.png`

## Deployment

Recommended deployment flow:

1. Deploy the Next.js app to Vercel.
2. Create and link a Supabase project.
3. Apply the migrations in the order listed above.
4. Set the environment variables in Vercel.
5. Confirm Supabase Auth, RLS, RPC functions, and realtime are enabled in the production project.

The app is designed to run as a standard Next.js production build with Supabase-backed auth and data access.

## Known Limitations / Future Improvements

- Add screenshot assets to the repository for a more polished submission.
- Add an admin dashboard for flight and seat management.
- Add seat-hold timers for checkout flows.
- Add booking email notifications and itinerary exports.
- Add pagination or server-side caching for larger booking histories.
- Add richer offline support for the My Bookings experience.
- Add automated end-to-end tests for booking, cancellation, and rescheduling.

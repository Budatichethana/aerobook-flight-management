-- 001_create_tables.sql
-- Exact schema for Flight Management Web App

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DROP TABLE IF EXISTS reschedules CASCADE;
DROP TABLE IF EXISTS passengers CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS seats CASCADE;
DROP TABLE IF EXISTS flights CASCADE;

CREATE TABLE flights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  flight_no text NOT NULL UNIQUE,
  origin text NOT NULL,
  destination text NOT NULL,
  departs_at timestamptz NOT NULL,
  arrives_at timestamptz NOT NULL,
  aircraft_type text NOT NULL,
  status text NOT NULL DEFAULT 'scheduled',
  base_price numeric(10,2) NOT NULL DEFAULT 0,

  CONSTRAINT flights_status_check 
  CHECK (status IN ('scheduled', 'delayed', 'cancelled', 'completed'))
);

CREATE TABLE seats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  flight_id uuid NOT NULL REFERENCES flights(id) ON DELETE CASCADE,
  seat_number text NOT NULL,
  class text NOT NULL DEFAULT 'economy',
  is_available boolean NOT NULL DEFAULT true,
  extra_fee numeric(10,2) NOT NULL DEFAULT 0,

  CONSTRAINT seats_unique_per_flight UNIQUE (flight_id, seat_number),
  CONSTRAINT seats_class_check 
  CHECK (class IN ('economy', 'business', 'first'))
);

CREATE TABLE bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  flight_id uuid NOT NULL REFERENCES flights(id) ON DELETE CASCADE,
  seat_id uuid NOT NULL REFERENCES seats(id) ON DELETE RESTRICT,
  status text NOT NULL DEFAULT 'confirmed',
  booked_at timestamptz NOT NULL DEFAULT now(),
  total_price numeric(10,2) NOT NULL DEFAULT 0,
  pnr_code text NOT NULL UNIQUE,

  CONSTRAINT bookings_status_check 
  CHECK (status IN ('confirmed', 'rescheduled', 'cancelled'))
);

CREATE TABLE passengers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  passport_no text NOT NULL,
  nationality text NOT NULL,
  dob date NOT NULL
);

CREATE TABLE reschedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  old_flight_id uuid NOT NULL REFERENCES flights(id) ON DELETE CASCADE,
  new_flight_id uuid NOT NULL REFERENCES flights(id) ON DELETE CASCADE,
  requested_at timestamptz NOT NULL DEFAULT now(),
  fee_charged numeric(10,2) NOT NULL DEFAULT 0
);

CREATE INDEX idx_flights_search 
ON flights(origin, destination, departs_at);

CREATE INDEX idx_seats_flight_id 
ON seats(flight_id);

CREATE INDEX idx_seats_flight_availability 
ON seats(flight_id, is_available);

CREATE INDEX idx_bookings_user_id 
ON bookings(user_id);

CREATE INDEX idx_passengers_booking_id 
ON passengers(booking_id);

CREATE INDEX idx_reschedules_booking_id 
ON reschedules(booking_id);
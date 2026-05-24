-- AeroBook one-shot Supabase bootstrap
-- Paste this into the Supabase SQL editor to create the core tables and demo data.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DROP FUNCTION IF EXISTS public.reserve_seat(
  uuid,
  uuid,
  text,
  text,
  text,
  text,
  date
);

DROP FUNCTION IF EXISTS public.cancel_booking(uuid);

DROP FUNCTION IF EXISTS public.reschedule_booking(
  uuid,
  uuid,
  text
);

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
  CONSTRAINT flights_status_check CHECK (status IN ('scheduled', 'delayed', 'cancelled', 'completed'))
);

CREATE TABLE seats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  flight_id uuid NOT NULL REFERENCES flights(id) ON DELETE CASCADE,
  seat_number text NOT NULL,
  class text NOT NULL DEFAULT 'economy',
  is_available boolean NOT NULL DEFAULT true,
  extra_fee numeric(10,2) NOT NULL DEFAULT 0,
  CONSTRAINT seats_unique_per_flight UNIQUE (flight_id, seat_number),
  CONSTRAINT seats_class_check CHECK (class IN ('economy', 'business', 'first'))
);

CREATE TABLE bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  flight_id uuid NOT NULL REFERENCES flights(id) ON DELETE CASCADE,
  seat_id uuid NOT NULL REFERENCES seats(id) ON DELETE RESTRICT,
  status text NOT NULL DEFAULT 'confirmed',
  booked_at timestamptz NOT NULL DEFAULT now(),
  total_price numeric(10,2) NOT NULL DEFAULT 0,
  pnr_code text NOT NULL UNIQUE,
  CONSTRAINT bookings_status_check CHECK (status IN ('confirmed', 'rescheduled', 'cancelled'))
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

CREATE INDEX idx_flights_search ON flights(origin, destination, departs_at);
CREATE INDEX idx_seats_flight_id ON seats(flight_id);
CREATE INDEX idx_seats_flight_availability ON seats(flight_id, is_available);
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_passengers_booking_id ON passengers(booking_id);
CREATE INDEX idx_reschedules_booking_id ON reschedules(booking_id);

ALTER TABLE flights ENABLE ROW LEVEL SECURITY;
ALTER TABLE seats ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE passengers ENABLE ROW LEVEL SECURITY;
ALTER TABLE reschedules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_flights" ON flights;
DROP POLICY IF EXISTS "service_manage_flights" ON flights;
DROP POLICY IF EXISTS "public_select_seats" ON seats;
DROP POLICY IF EXISTS "service_manage_seats" ON seats;

CREATE POLICY "public_select_flights"
ON flights
FOR SELECT
USING (true);

CREATE POLICY "service_manage_flights"
ON flights
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "public_select_seats"
ON seats
FOR SELECT
USING (true);

CREATE POLICY "service_manage_seats"
ON seats
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

INSERT INTO flights (id, flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price)
VALUES
  (gen_random_uuid(), 'FL100', 'JFK', 'LAX', now() + interval '2 days', now() + interval '2 days' + interval '6 hours', 'Boeing 737', 'scheduled', 350.00),
  (gen_random_uuid(), 'FL101', 'LAX', 'JFK', now() + interval '3 days', now() + interval '3 days' + interval '6 hours', 'Boeing 737', 'scheduled', 340.00),
  (gen_random_uuid(), 'FL200', 'JFK', 'LHR', now() + interval '4 days', now() + interval '4 days' + interval '7 hours', 'Boeing 787', 'scheduled', 560.00),
  (gen_random_uuid(), 'FL201', 'LHR', 'JFK', now() + interval '5 days', now() + interval '5 days' + interval '7 hours', 'Boeing 787', 'scheduled', 550.00),
  (gen_random_uuid(), 'FL300', 'LAX', 'SFO', now() + interval '1 day', now() + interval '1 day' + interval '1 hour', 'Airbus A320', 'scheduled', 120.00),
  (gen_random_uuid(), 'FL301', 'SFO', 'LAX', now() + interval '2 days', now() + interval '2 days' + interval '1 hour', 'Airbus A320', 'scheduled', 115.00),
  (gen_random_uuid(), 'FL400', 'SFO', 'SEA', now() + interval '6 days', now() + interval '6 days' + interval '2 hours', 'Embraer 195', 'scheduled', 150.00),
  (gen_random_uuid(), 'FL401', 'SEA', 'SFO', now() + interval '7 days', now() + interval '7 days' + interval '2 hours', 'Embraer 195', 'scheduled', 145.00),
  (gen_random_uuid(), 'FL102', 'JFK', 'LAX', now() + interval '2 days' + interval '12 hours', now() + interval '2 days' + interval '18 hours', 'Boeing 737', 'scheduled', 350.00),
  (gen_random_uuid(), 'FL103', 'LAX', 'JFK', now() + interval '3 days' + interval '12 hours', now() + interval '3 days' + interval '18 hours', 'Boeing 737', 'scheduled', 340.00),
  (gen_random_uuid(), 'FL202', 'JFK', 'LHR', now() + interval '4 days' + interval '12 hours', now() + interval '4 days' + interval '19 hours', 'Boeing 787', 'scheduled', 560.00),
  (gen_random_uuid(), 'FL203', 'LHR', 'JFK', now() + interval '5 days' + interval '12 hours', now() + interval '5 days' + interval '19 hours', 'Boeing 787', 'scheduled', 550.00),
  (gen_random_uuid(), 'FL302', 'LAX', 'SFO', now() + interval '1 day' + interval '6 hours', now() + interval '1 day' + interval '7 hours', 'Airbus A320', 'scheduled', 120.00),
  (gen_random_uuid(), 'FL303', 'SFO', 'LAX', now() + interval '2 days' + interval '6 hours', now() + interval '2 days' + interval '7 hours', 'Airbus A320', 'scheduled', 115.00),
  (gen_random_uuid(), 'FL402', 'SFO', 'SEA', now() + interval '6 days' + interval '12 hours', now() + interval '6 days' + interval '14 hours', 'Embraer 195', 'scheduled', 150.00),
  (gen_random_uuid(), 'FL403', 'SEA', 'SFO', now() + interval '7 days' + interval '12 hours', now() + interval '7 days' + interval '14 hours', 'Embraer 195', 'scheduled', 145.00)
ON CONFLICT (flight_no) DO NOTHING;

DO $$
DECLARE
  flight_record record;
BEGIN
  FOR flight_record IN SELECT id FROM flights LOOP
    INSERT INTO seats (flight_id, seat_number, class, extra_fee)
    SELECT
      flight_record.id,
      format('%s%s', seat_rows.row_number, seat_letters.seat_letter),
      CASE
        WHEN seat_rows.row_number = 1 THEN 'business'
        WHEN seat_rows.row_number = 2 THEN 'business'
        ELSE 'economy'
      END,
      CASE
        WHEN seat_rows.row_number = 1 THEN 75.00
        WHEN seat_rows.row_number = 2 THEN 75.00
        ELSE 0.00
      END
    FROM generate_series(1, 5) AS seat_rows(row_number)
    CROSS JOIN unnest(ARRAY['A', 'B', 'C', 'D', 'E', 'F']) AS seat_letters(seat_letter)
    ON CONFLICT (flight_id, seat_number) DO NOTHING;
  END LOOP;
END $$;

CREATE OR REPLACE FUNCTION public.reserve_seat(
  p_user_id uuid,
  p_flight_id uuid,
  p_seat_number text,
  p_full_name text,
  p_passport_no text,
  p_nationality text,
  p_dob date
)
RETURNS TABLE(
  booking_id uuid,
  booked_user_id uuid,
  booked_flight_id uuid,
  booked_seat_id uuid,
  booking_status text,
  booking_booked_at timestamptz,
  booking_total_price numeric,
  booking_pnr_code text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_seat_id uuid;
  v_flight_price numeric(10,2);
  v_extra_fee numeric(10,2);
  v_available boolean;
  v_booking_id uuid;
  v_pnr_code text;
  v_total_price numeric(10,2);
  v_booked_at timestamptz;
BEGIN
  IF auth.uid() IS NULL AND auth.role() <> 'service_role' THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  v_user_id := COALESCE(p_user_id, auth.uid());

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'user_id is required';
  END IF;

  IF auth.role() <> 'service_role' AND v_user_id <> auth.uid() THEN
    RAISE EXCEPTION 'Not authorized to create this booking';
  END IF;

  SELECT
    s.id,
    s.is_available,
    s.extra_fee
  INTO
    v_seat_id,
    v_available,
    v_extra_fee
  FROM public.seats AS s
  WHERE s.flight_id = p_flight_id
    AND s.seat_number = p_seat_number
  FOR UPDATE;

  IF v_seat_id IS NULL THEN
    RAISE EXCEPTION 'Seat % not found for flight %', p_seat_number, p_flight_id;
  END IF;

  IF v_available = false THEN
    RAISE EXCEPTION 'Seat % on flight % is not available', p_seat_number, p_flight_id;
  END IF;

  SELECT f.base_price
  INTO v_flight_price
  FROM public.flights AS f
  WHERE f.id = p_flight_id;

  IF v_flight_price IS NULL THEN
    RAISE EXCEPTION 'Flight not found';
  END IF;

  v_total_price := COALESCE(v_flight_price, 0) + COALESCE(v_extra_fee, 0);
  v_booking_id := gen_random_uuid();
  v_pnr_code := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
  v_booked_at := now();

  INSERT INTO public.bookings (
    id,
    user_id,
    flight_id,
    seat_id,
    status,
    booked_at,
    total_price,
    pnr_code
  )
  VALUES (
    v_booking_id,
    v_user_id,
    p_flight_id,
    v_seat_id,
    'confirmed',
    v_booked_at,
    v_total_price,
    v_pnr_code
  );

  INSERT INTO public.passengers (
    booking_id,
    full_name,
    passport_no,
    nationality,
    dob
  )
  VALUES (
    v_booking_id,
    p_full_name,
    p_passport_no,
    p_nationality,
    p_dob
  );

  UPDATE public.seats AS s
  SET is_available = false
  WHERE s.id = v_seat_id;

  RETURN QUERY
  SELECT
    v_booking_id,
    v_user_id,
    p_flight_id,
    v_seat_id,
    'confirmed'::text,
    v_booked_at,
    v_total_price,
    v_pnr_code;
END;
$$;

CREATE OR REPLACE FUNCTION public.cancel_booking(
  p_booking_id uuid
)
RETURNS TABLE(
  cancelled_booking_id uuid,
  cancelled_status text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_seat_id uuid;
  v_status text;
  v_departs_at timestamptz;
BEGIN
  SELECT
    b.user_id,
    b.seat_id,
    b.status,
    f.departs_at
  INTO
    v_user_id,
    v_seat_id,
    v_status,
    v_departs_at
  FROM public.bookings AS b
  JOIN public.flights AS f
    ON f.id = b.flight_id
  WHERE b.id = p_booking_id
  FOR UPDATE;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Booking not found';
  END IF;

  IF auth.uid() IS DISTINCT FROM v_user_id AND auth.role() <> 'service_role' THEN
    RAISE EXCEPTION 'Not authorized to cancel this booking';
  END IF;

  IF v_status = 'cancelled' THEN
    RAISE EXCEPTION 'Booking is already cancelled';
  END IF;

  IF v_departs_at <= now() + interval '2 hours' THEN
    RAISE EXCEPTION 'Cancellation is not allowed within 2 hours of departure';
  END IF;

  UPDATE public.bookings AS b
  SET status = 'cancelled'
  WHERE b.id = p_booking_id;

  UPDATE public.seats AS s
  SET is_available = true
  WHERE s.id = v_seat_id;

  RETURN QUERY
  SELECT
    p_booking_id,
    'cancelled'::text;
END;
$$;

CREATE OR REPLACE FUNCTION public.reschedule_booking(
  p_booking_id uuid,
  p_new_flight_id uuid,
  p_new_seat_number text
)
RETURNS TABLE(
  booking_id uuid,
  booking_status text,
  fee_charged numeric,
  total_price numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_old_flight_id uuid;
  v_old_seat_id uuid;
  v_old_status text;
  v_old_origin text;
  v_old_destination text;
  v_old_total_price numeric(10,2);
  v_new_origin text;
  v_new_destination text;
  v_new_flight_price numeric(10,2);
  v_old_flight_price numeric(10,2);
  v_new_seat_id uuid;
  v_new_seat_available boolean;
  v_new_seat_flight_id uuid;
  v_new_seat_extra_fee numeric(10,2);
  v_fee_charged numeric(10,2);
  v_updated_total_price numeric(10,2);
  v_reschedule_id uuid;
BEGIN
  IF auth.uid() IS NULL AND auth.role() <> 'service_role' THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT
    b.user_id,
    b.flight_id,
    b.seat_id,
    b.status,
    old_flight.origin,
    old_flight.destination,
    old_flight.base_price,
    new_flight.origin,
    new_flight.destination,
    new_flight.base_price,
    new_seat.id,
    new_seat.flight_id,
    new_seat.is_available,
    new_seat.extra_fee,
    b.total_price
  INTO
    v_user_id,
    v_old_flight_id,
    v_old_seat_id,
    v_old_status,
    v_old_origin,
    v_old_destination,
    v_old_flight_price,
    v_new_origin,
    v_new_destination,
    v_new_flight_price,
    v_new_seat_id,
    v_new_seat_flight_id,
    v_new_seat_available,
    v_new_seat_extra_fee,
    v_old_total_price
  FROM public.bookings AS b
  JOIN public.flights AS old_flight
    ON old_flight.id = b.flight_id
  JOIN public.flights AS new_flight
    ON new_flight.id = p_new_flight_id
  JOIN public.seats AS new_seat
    ON new_seat.flight_id = new_flight.id
   AND new_seat.seat_number = p_new_seat_number
  WHERE b.id = p_booking_id
  FOR UPDATE OF b, new_seat;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Booking not found';
  END IF;

  IF auth.uid() IS DISTINCT FROM v_user_id AND auth.role() <> 'service_role' THEN
    RAISE EXCEPTION 'Not authorized to reschedule this booking';
  END IF;

  IF v_old_status <> 'confirmed' THEN
    RAISE EXCEPTION 'Only confirmed bookings can be rescheduled';
  END IF;

  IF v_old_flight_id = p_new_flight_id THEN
    RAISE EXCEPTION 'Please select a different flight';
  END IF;

  IF v_old_origin IS DISTINCT FROM v_new_origin OR v_old_destination IS DISTINCT FROM v_new_destination THEN
    RAISE EXCEPTION 'New flight must use the same origin and destination';
  END IF;

  IF v_new_seat_id IS NULL THEN
    RAISE EXCEPTION 'Seat % not found for flight %', p_new_seat_number, p_new_flight_id;
  END IF;

  IF v_new_seat_flight_id IS DISTINCT FROM p_new_flight_id THEN
    RAISE EXCEPTION 'Seat % does not belong to flight %', p_new_seat_number, p_new_flight_id;
  END IF;

  IF v_new_seat_available = false THEN
    RAISE EXCEPTION 'Seat % on flight % is not available', p_new_seat_number, p_new_flight_id;
  END IF;

  v_fee_charged := GREATEST(COALESCE(v_new_flight_price, 0) - COALESCE(v_old_flight_price, 0), 0);
  v_updated_total_price := COALESCE(v_old_total_price, 0) + v_fee_charged;

  UPDATE public.seats AS old_seat
  SET is_available = true
  WHERE old_seat.id = v_old_seat_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Current seat could not be released';
  END IF;

  UPDATE public.seats AS new_seat_update
  SET is_available = false
  WHERE new_seat_update.id = v_new_seat_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Selected seat could not be reserved';
  END IF;

  UPDATE public.bookings AS b
  SET
    flight_id = p_new_flight_id,
    seat_id = v_new_seat_id,
    status = 'rescheduled',
    total_price = v_updated_total_price
  WHERE b.id = p_booking_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking update failed';
  END IF;

  INSERT INTO public.reschedules (
    booking_id,
    old_flight_id,
    new_flight_id,
    fee_charged
  )
  VALUES (
    p_booking_id,
    v_old_flight_id,
    p_new_flight_id,
    v_fee_charged
  )
  RETURNING id INTO v_reschedule_id;

  IF v_reschedule_id IS NULL THEN
    RAISE EXCEPTION 'Reschedule record was not created';
  END IF;

  RETURN QUERY
  SELECT
    p_booking_id,
    'rescheduled'::text,
    v_fee_charged,
    v_updated_total_price;
END;
$$;

GRANT EXECUTE ON FUNCTION public.reserve_seat(
  uuid,
  uuid,
  text,
  text,
  text,
  text,
  date
) TO authenticated, service_role;

GRANT EXECUTE ON FUNCTION public.cancel_booking(uuid) TO authenticated, service_role;

GRANT EXECUTE ON FUNCTION public.reschedule_booking(
  uuid,
  uuid,
  text
) TO authenticated, service_role;

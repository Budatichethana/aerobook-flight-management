-- 003_rpc_functions.sql
-- Functions: reserve_seat and cancel_booking

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
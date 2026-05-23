-- 002_rls_policies.sql
-- Enable Row Level Security and add policies for exact assignment schema.

ALTER TABLE flights ENABLE ROW LEVEL SECURITY;
ALTER TABLE seats ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE passengers ENABLE ROW LEVEL SECURITY;
ALTER TABLE reschedules ENABLE ROW LEVEL SECURITY;

-- Drop old policies if they already exist
DROP POLICY IF EXISTS "public_select_flights" ON flights;
DROP POLICY IF EXISTS "service_manage_flights" ON flights;

DROP POLICY IF EXISTS "public_select_seats" ON seats;
DROP POLICY IF EXISTS "service_manage_seats" ON seats;

DROP POLICY IF EXISTS "booking_owner_or_service_select" ON bookings;
DROP POLICY IF EXISTS "booking_owner_or_service_insert" ON bookings;
DROP POLICY IF EXISTS "booking_owner_or_service_update" ON bookings;
DROP POLICY IF EXISTS "booking_owner_or_service_delete" ON bookings;

DROP POLICY IF EXISTS "passenger_owner_or_service_select" ON passengers;
DROP POLICY IF EXISTS "passenger_owner_or_service_insert" ON passengers;
DROP POLICY IF EXISTS "passenger_owner_or_service_update" ON passengers;
DROP POLICY IF EXISTS "passenger_owner_or_service_delete" ON passengers;

DROP POLICY IF EXISTS "reschedule_owner_or_service_select" ON reschedules;
DROP POLICY IF EXISTS "reschedule_owner_or_service_insert" ON reschedules;
DROP POLICY IF EXISTS "reschedule_owner_or_service_update" ON reschedules;
DROP POLICY IF EXISTS "reschedule_owner_or_service_delete" ON reschedules;

-- Flights: anyone can read flights for search
CREATE POLICY "public_select_flights"
ON flights
FOR SELECT
USING (true);

-- Only service role can insert/update/delete flights
CREATE POLICY "service_manage_flights"
ON flights
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Seats: anyone can read seats for seat map
CREATE POLICY "public_select_seats"
ON seats
FOR SELECT
USING (true);

-- Only service role can modify seats directly
-- Normal users should reserve/cancel seats only through RPC functions
CREATE POLICY "service_manage_seats"
ON seats
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Bookings: user can see only their own bookings
CREATE POLICY "booking_owner_or_service_select"
ON bookings
FOR SELECT
USING (
  user_id = auth.uid()
  OR auth.role() = 'service_role'
);

-- User can insert only their own booking
CREATE POLICY "booking_owner_or_service_insert"
ON bookings
FOR INSERT
WITH CHECK (
  user_id = auth.uid()
  OR auth.role() = 'service_role'
);

-- User can update only their own booking
CREATE POLICY "booking_owner_or_service_update"
ON bookings
FOR UPDATE
USING (
  user_id = auth.uid()
  OR auth.role() = 'service_role'
)
WITH CHECK (
  user_id = auth.uid()
  OR auth.role() = 'service_role'
);

-- User can delete only their own booking if needed
CREATE POLICY "booking_owner_or_service_delete"
ON bookings
FOR DELETE
USING (
  user_id = auth.uid()
  OR auth.role() = 'service_role'
);

-- Passengers: visible only if passenger belongs to user's booking
CREATE POLICY "passenger_owner_or_service_select"
ON passengers
FOR SELECT
USING (
  auth.role() = 'service_role'
  OR EXISTS (
    SELECT 1
    FROM bookings b
    WHERE b.id = passengers.booking_id
      AND b.user_id = auth.uid()
  )
);

CREATE POLICY "passenger_owner_or_service_insert"
ON passengers
FOR INSERT
WITH CHECK (
  auth.role() = 'service_role'
  OR EXISTS (
    SELECT 1
    FROM bookings b
    WHERE b.id = passengers.booking_id
      AND b.user_id = auth.uid()
  )
);

CREATE POLICY "passenger_owner_or_service_update"
ON passengers
FOR UPDATE
USING (
  auth.role() = 'service_role'
  OR EXISTS (
    SELECT 1
    FROM bookings b
    WHERE b.id = passengers.booking_id
      AND b.user_id = auth.uid()
  )
)
WITH CHECK (
  auth.role() = 'service_role'
  OR EXISTS (
    SELECT 1
    FROM bookings b
    WHERE b.id = passengers.booking_id
      AND b.user_id = auth.uid()
  )
);

CREATE POLICY "passenger_owner_or_service_delete"
ON passengers
FOR DELETE
USING (
  auth.role() = 'service_role'
  OR EXISTS (
    SELECT 1
    FROM bookings b
    WHERE b.id = passengers.booking_id
      AND b.user_id = auth.uid()
  )
);

-- Reschedules: visible only if linked booking belongs to user
CREATE POLICY "reschedule_owner_or_service_select"
ON reschedules
FOR SELECT
USING (
  auth.role() = 'service_role'
  OR EXISTS (
    SELECT 1
    FROM bookings b
    WHERE b.id = reschedules.booking_id
      AND b.user_id = auth.uid()
  )
);

CREATE POLICY "reschedule_owner_or_service_insert"
ON reschedules
FOR INSERT
WITH CHECK (
  auth.role() = 'service_role'
  OR EXISTS (
    SELECT 1
    FROM bookings b
    WHERE b.id = reschedules.booking_id
      AND b.user_id = auth.uid()
  )
);

CREATE POLICY "reschedule_owner_or_service_update"
ON reschedules
FOR UPDATE
USING (
  auth.role() = 'service_role'
  OR EXISTS (
    SELECT 1
    FROM bookings b
    WHERE b.id = reschedules.booking_id
      AND b.user_id = auth.uid()
  )
)
WITH CHECK (
  auth.role() = 'service_role'
  OR EXISTS (
    SELECT 1
    FROM bookings b
    WHERE b.id = reschedules.booking_id
      AND b.user_id = auth.uid()
  )
);

CREATE POLICY "reschedule_owner_or_service_delete"
ON reschedules
FOR DELETE
USING (
  auth.role() = 'service_role'
  OR EXISTS (
    SELECT 1
    FROM bookings b
    WHERE b.id = reschedules.booking_id
      AND b.user_id = auth.uid()
  )
);
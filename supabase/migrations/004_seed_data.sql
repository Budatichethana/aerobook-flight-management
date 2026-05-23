-- 004_seed_data.sql
-- Seed 8 flights and full seat maps.

INSERT INTO flights (id, flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price)
VALUES
  (gen_random_uuid(), 'FL100', 'JFK', 'LAX', now() + interval '2 days', now() + interval '2 days' + interval '6 hours', 'Boeing 737', 'scheduled', 350.00),
  (gen_random_uuid(), 'FL101', 'LAX', 'JFK', now() + interval '3 days', now() + interval '3 days' + interval '6 hours', 'Boeing 737', 'scheduled', 340.00),
  (gen_random_uuid(), 'FL200', 'JFK', 'LHR', now() + interval '4 days', now() + interval '4 days' + interval '7 hours', 'Boeing 787', 'scheduled', 560.00),
  (gen_random_uuid(), 'FL201', 'LHR', 'JFK', now() + interval '5 days', now() + interval '5 days' + interval '7 hours', 'Boeing 787', 'scheduled', 550.00),
  (gen_random_uuid(), 'FL300', 'LAX', 'SFO', now() + interval '1 day', now() + interval '1 day' + interval '1 hour', 'Airbus A320', 'scheduled', 120.00),
  (gen_random_uuid(), 'FL301', 'SFO', 'LAX', now() + interval '2 days', now() + interval '2 days' + interval '1 hour', 'Airbus A320', 'scheduled', 115.00),
  (gen_random_uuid(), 'FL400', 'SFO', 'SEA', now() + interval '6 days', now() + interval '6 days' + interval '2 hours', 'Embraer 195', 'scheduled', 150.00),
  (gen_random_uuid(), 'FL401', 'SEA', 'SFO', now() + interval '7 days', now() + interval '7 days' + interval '2 hours', 'Embraer 195', 'scheduled', 145.00)
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
      CASE WHEN seat_rows.row_number = 1 THEN 'business' ELSE 'economy' END,
      CASE WHEN seat_rows.row_number = 1 THEN 75.00 ELSE 0.00 END
    FROM generate_series(1, 5) AS seat_rows(row_number)
    CROSS JOIN unnest(ARRAY['A', 'B', 'C', 'D', 'E', 'F']) AS seat_letters(seat_letter)
    ON CONFLICT (flight_id, seat_number) DO NOTHING;
  END LOOP;
END $$;

-- Add alternate flights so reschedule always has an option to move to
INSERT INTO flights (id, flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price)
VALUES
  (gen_random_uuid(), 'FL102', 'JFK', 'LAX', now() + interval '2 days' + interval '12 hours', now() + interval '2 days' + interval '18 hours', 'Boeing 737', 'scheduled', 350.00),
  (gen_random_uuid(), 'FL103', 'LAX', 'JFK', now() + interval '3 days' + interval '12 hours', now() + interval '3 days' + interval '18 hours', 'Boeing 737', 'scheduled', 340.00),
  (gen_random_uuid(), 'FL202', 'JFK', 'LHR', now() + interval '4 days' + interval '12 hours', now() + interval '4 days' + interval '19 hours', 'Boeing 787', 'scheduled', 560.00),
  (gen_random_uuid(), 'FL203', 'LHR', 'JFK', now() + interval '5 days' + interval '12 hours', now() + interval '5 days' + interval '19 hours', 'Boeing 787', 'scheduled', 550.00),
  (gen_random_uuid(), 'FL302', 'LAX', 'SFO', now() + interval '1 day' + interval '6 hours', now() + interval '1 day' + interval '7 hours', 'Airbus A320', 'scheduled', 120.00),
  (gen_random_uuid(), 'FL303', 'SFO', 'LAX', now() + interval '2 days' + interval '6 hours', now() + interval '2 days' + interval '7 hours', 'Airbus A320', 'scheduled', 115.00),
  (gen_random_uuid(), 'FL402', 'SFO', 'SEA', now() + interval '6 days' + interval '12 hours', now() + interval '6 days' + interval '14 hours', 'Embraer 195', 'scheduled', 150.00),
  (gen_random_uuid(), 'FL403', 'SEA', 'SFO', now() + interval '7 days' + interval '12 hours', now() + interval '7 days' + interval '14 hours', 'Embraer 195', 'scheduled', 145.00)
ON CONFLICT (flight_no) DO NOTHING;

-- Generate full seat maps for the new alternate flights:
-- Rows 1-2: first (extra_fee 120)
-- Rows 3-5: business (extra_fee 60)
-- Rows 6-20: economy (extra_fee 0)
INSERT INTO seats (flight_id, seat_number, class, extra_fee)
SELECT
  f.id,
  format('%s%s', seat_rows.row_number, seat_letters.seat_letter) AS seat_number,
  CASE
    WHEN seat_rows.row_number BETWEEN 1 AND 2 THEN 'first'
    WHEN seat_rows.row_number BETWEEN 3 AND 5 THEN 'business'
    ELSE 'economy'
  END AS class,
  CASE
    WHEN seat_rows.row_number BETWEEN 1 AND 2 THEN 120.00
    WHEN seat_rows.row_number BETWEEN 3 AND 5 THEN 60.00
    ELSE 0.00
  END AS extra_fee
FROM flights f
JOIN (VALUES ('FL102'),('FL103'),('FL202'),('FL203'),('FL302'),('FL303'),('FL402'),('FL403')) AS v(flight_no) ON f.flight_no = v.flight_no
CROSS JOIN generate_series(1,20) AS seat_rows(row_number)
CROSS JOIN unnest(ARRAY['A','B','C','D','E','F']) AS seat_letters(seat_letter)
ON CONFLICT (flight_id, seat_number) DO NOTHING;

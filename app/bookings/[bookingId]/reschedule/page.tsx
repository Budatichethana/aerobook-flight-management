import { notFound, redirect } from 'next/navigation'
import RescheduleBookingFlow from '../../../../components/RescheduleBookingFlow'
import { createSupabaseServerClient, supabaseAdmin } from '../../../../lib/supabase/server'
import type { Flight } from '../../../../store/useStore'

type BookingRow = {
  id: string
  pnr_code: string
  status: string
  booked_at: string
  total_price: number | string
  flights:
    | Array<{
        id: string
        flight_no: string | null
        origin: string | null
        destination: string | null
        departs_at: string | null
        arrives_at: string | null
        aircraft_type: string | null
        status: string | null
        base_price: number | string | null
      }>
    | {
        id: string
        flight_no: string | null
        origin: string | null
        destination: string | null
        departs_at: string | null
        arrives_at: string | null
        aircraft_type: string | null
        status: string | null
        base_price: number | string | null
      }
    | null
  seats:
    | Array<{
        seat_number: string | null
        class: string | null
        extra_fee: number | string | null
      }>
    | {
        seat_number: string | null
        class: string | null
        extra_fee: number | string | null
      }
    | null
  passengers:
    | Array<{
        full_name: string | null
        nationality: string | null
      }>
    | {
        full_name: string | null
        nationality: string | null
      }
    | null
}

type SeatRow = {
  flight_id: string
  seat_number: string
  class: string
  is_available: boolean
  extra_fee: number | string | null
}

export default async function RescheduleBookingPage({ params }: { params: { bookingId: string } }) {
  const supabase = createSupabaseServerClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(`/bookings/${params.bookingId}/reschedule`)}`)
  }

  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .select('id, pnr_code, status, booked_at, total_price, flights(id, flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price), seats(seat_number, class, extra_fee), passengers(full_name, nationality)')
    .eq('id', params.bookingId)
    .eq('user_id', user.id)
    .single()

  if (bookingError || !booking) {
    notFound()
  }

  const typedBooking = booking as unknown as BookingRow
  const currentFlight = Array.isArray(typedBooking.flights) ? typedBooking.flights[0] : typedBooking.flights

  if (!currentFlight || typedBooking.status !== 'confirmed') {
    notFound()
  }

  const currentSeat = Array.isArray(typedBooking.seats) ? typedBooking.seats[0] : typedBooking.seats

  const passenger = Array.isArray(typedBooking.passengers)
    ? typedBooking.passengers[0]
    : typedBooking.passengers

  const { data: flightsData, error: flightsError } = await supabaseAdmin
    .from('flights')
    .select('id, flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price')
    .eq('origin', currentFlight.origin ?? '')
    .eq('destination', currentFlight.destination ?? '')
    .neq('id', currentFlight.id)
    .eq('status', 'scheduled')
    .order('departs_at', { ascending: true })

  if (flightsError) {
    throw new Error(flightsError.message)
  }

  const alternativeFlights = (flightsData ?? [])
    .map((flight) => ({
      id: flight.id,
      flight_no: flight.flight_no ?? '',
      origin: flight.origin ?? '',
      destination: flight.destination ?? '',
      departs_at: flight.departs_at ?? '',
      arrives_at: flight.arrives_at ?? '',
      aircraft_type: flight.aircraft_type ?? '',
      status: flight.status ?? '',
      base_price: typeof flight.base_price === 'number' ? flight.base_price : Number(flight.base_price ?? 0)
    })) satisfies Flight[]

  const flightIds = alternativeFlights.map((flight) => flight.id)

  const { data: seatsData, error: seatsError } = flightIds.length
    ? await supabaseAdmin
        .from('seats')
        .select('flight_id, seat_number, class, is_available, extra_fee')
        .in('flight_id', flightIds)
        .eq('is_available', true)
        .order('class', { ascending: true })
        .order('seat_number', { ascending: true })
    : { data: [], error: null }

  if (seatsError) {
    throw new Error(seatsError.message)
  }

  const seatsByFlightId = (seatsData ?? []).reduce<Record<string, SeatRow[]>>((accumulator, seat) => {
    if (!accumulator[seat.flight_id]) {
      accumulator[seat.flight_id] = []
    }

    accumulator[seat.flight_id].push(seat as SeatRow)
    return accumulator
  }, {})

  const availableFlights = alternativeFlights.filter((flight) => (seatsByFlightId[flight.id]?.length ?? 0) > 0)

  return (
    <RescheduleBookingFlow
      booking={{
        id: typedBooking.id,
        pnr_code: typedBooking.pnr_code,
        status: typedBooking.status,
        booked_at: typedBooking.booked_at,
        total_price: typedBooking.total_price,
        flight_no: currentFlight.flight_no ?? '',
        origin: currentFlight.origin ?? '',
        destination: currentFlight.destination ?? '',
        departs_at: currentFlight.departs_at ?? '',
        arrives_at: currentFlight.arrives_at ?? '',
        aircraft_type: currentFlight.aircraft_type ?? '',
        seat_number: currentSeat?.seat_number ?? '-',
        passenger_name: passenger?.full_name ?? '-'
      }}
      flights={availableFlights}
      seatsByFlight={seatsByFlightId}
    />
  )
}
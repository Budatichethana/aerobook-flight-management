import { notFound, redirect } from 'next/navigation'
import BookingFlow from '../../../components/BookingFlow'
import { createSupabaseServerClient, supabaseAdmin } from '../../../lib/supabase/server'
import type { Flight } from '../../../store/useStore'

type FlightRow = {
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

type SeatRow = {
  seat_number: string
  class: string
  is_available: boolean
  extra_fee: number | string | null
}

export default async function BookingPage({ params }: { params: { flightId: string } }) {
  const supabase = createSupabaseServerClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(`/booking/${params.flightId}`)}`)
  }

  const { data: flight, error: flightError } = await supabaseAdmin
    .from('flights')
    .select('id, flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price')
    .eq('id', params.flightId)
    .single()

  if (flightError || !flight) {
    notFound()
  }

  const { data: seats, error: seatsError } = await supabaseAdmin
    .from('seats')
    .select('seat_number, class, is_available, extra_fee')
    .eq('flight_id', params.flightId)
    .order('class', { ascending: true })
    .order('seat_number', { ascending: true })

  if (seatsError) {
    throw new Error(seatsError.message)
  }

  const normalizedFlight: Flight = {
    id: flight.id,
    flight_no: flight.flight_no ?? '',
    origin: flight.origin ?? '',
    destination: flight.destination ?? '',
    departs_at: flight.departs_at ?? '',
    arrives_at: flight.arrives_at ?? '',
    aircraft_type: flight.aircraft_type ?? '',
    status: flight.status ?? '',
    base_price: typeof flight.base_price === 'number' ? flight.base_price : Number(flight.base_price ?? 0)
  }

  return (
    <BookingFlow
      flight={normalizedFlight}
      seats={(seats ?? []) as SeatRow[]}
    />
  )
}
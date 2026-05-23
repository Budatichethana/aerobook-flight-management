import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { BadgeCheck, CalendarDays, Plane, FileText, Ticket, UserCircle2 } from 'lucide-react'
import { createSupabaseServerClient } from '../../../lib/supabase/server'
import { formatDateTime } from '../../../lib/formatDateTime'
import TicketQr from '../../../components/TicketQr'

type BookingRow = {
  id: string
  user_id: string
  status: string
  booked_at: string
  total_price: number | string
  pnr_code: string
  flight_id: string
  seat_id: string
  flights:
    | Array<{
        flight_no: string | null
        origin: string | null
        destination: string | null
        departs_at: string | null
        arrives_at: string | null
        aircraft_type: string | null
      }>
    | {
        flight_no: string | null
        origin: string | null
        destination: string | null
        departs_at: string | null
        arrives_at: string | null
        aircraft_type: string | null
      }
    | null
  seats:
    | Array<{
        seat_number: string | null
        class: string | null
      }>
    | {
        seat_number: string | null
        class: string | null
      }
    | null
}

type PassengerRow = {
  full_name: string
  passport_no: string
  nationality: string
  dob: string
}

export default async function ConfirmationPage({ params }: { params: { bookingId: string } }) {
  const supabase = createSupabaseServerClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(`/confirmation/${params.bookingId}`)}`)
  }

  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .select('id, user_id, status, booked_at, total_price, pnr_code, flight_id, seat_id, flights(flight_no, origin, destination, departs_at, arrives_at, aircraft_type), seats(seat_number, class)')
    .eq('id', params.bookingId)
    .single()

  if (bookingError || !booking) {
    notFound()
  }

  const { data: passenger } = await supabase
    .from('passengers')
    .select('full_name, passport_no, nationality, dob')
    .eq('booking_id', params.bookingId)
    .single()

  const bookingRow = booking as unknown as BookingRow
  const flight = Array.isArray(bookingRow.flights) ? bookingRow.flights[0] : bookingRow.flights
  const seat = Array.isArray(bookingRow.seats) ? bookingRow.seats[0] : bookingRow.seats
  const isCancelled = bookingRow.status === 'cancelled'
  const isRescheduled = bookingRow.status === 'rescheduled'

  const badgeClasses = isCancelled
    ? 'bg-rose-50 text-rose-700 ring-1 ring-rose-100'
    : isRescheduled
      ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-100'
      : 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100'

  const heading = isCancelled ? 'Booking cancelled' : isRescheduled ? 'Booking rescheduled' : 'Booking confirmed'
  const subheading = isCancelled
    ? 'This ticket is cancelled and no longer valid for boarding.'
    : isRescheduled
      ? 'Your itinerary was updated. Latest flight and seat details are below.'
      : 'Your seat reservation is complete.'

  return (
    <section className="card overflow-hidden">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <p className={[
            'inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold',
            badgeClasses
          ].join(' ')}>
            <BadgeCheck className="h-4 w-4" /> {bookingRow.status}
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">{heading}</h1>
          <p className="mt-3 text-slate-600">{subheading}</p>
        </div>
        <div className="rounded-3xl bg-brand-50 px-5 py-4 ring-1 ring-brand-100">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-700">PNR</p>
          <p className="mt-2 text-3xl font-extrabold tracking-[0.18em] text-slate-900">{bookingRow.pnr_code}</p>
        </div>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[1.75rem] border border-slate-200 bg-slate-950 p-5 text-white shadow-soft-lg">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-slate-300">Ticket summary</p>
              <h2 className="mt-2 text-2xl font-semibold">Flight confirmation</h2>
            </div>
            <div className="rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-white/90">{bookingRow.status}</div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300"><Plane className="h-4 w-4" /> Booking ID</div>
              <p className="mt-2 break-all text-sm font-medium text-white">{bookingRow.id}</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300"><Ticket className="h-4 w-4" /> Total price</div>
              <p className="mt-2 text-xl font-semibold text-white">{typeof bookingRow.total_price === 'number' ? `$${bookingRow.total_price.toFixed(2)}` : bookingRow.total_price}</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300"><CalendarDays className="h-4 w-4" /> Status</div>
              <p className="mt-2 text-sm font-medium text-white capitalize">{bookingRow.status}</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300"><FileText className="h-4 w-4" /> PNR code</div>
              <p className="mt-2 text-sm font-medium text-white">{bookingRow.pnr_code}</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300"><Plane className="h-4 w-4" /> Latest flight</div>
              <p className="mt-2 text-sm font-medium text-white">{flight?.flight_no ?? '-'} | {flight?.origin ?? '-'} → {flight?.destination ?? '-'}</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300"><Ticket className="h-4 w-4" /> Latest seat</div>
              <p className="mt-2 text-sm font-medium text-white">{seat?.seat_number ?? '-'} ({seat?.class ?? '-'})</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <TicketQr bookingId={bookingRow.id} size={132} />

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-600">Latest itinerary</p>
            <div className="mt-4 space-y-2 text-sm text-slate-600">
              <p>Flight: {flight?.flight_no ?? '-'}</p>
              <p>Route: {flight?.origin ?? '-'} → {flight?.destination ?? '-'}</p>
              <p>Departure: {flight?.departs_at ? formatDateTime(flight.departs_at) : '-'}</p>
              <p>Arrival: {flight?.arrives_at ? formatDateTime(flight.arrives_at) : '-'}</p>
              <p>Seat: {seat?.seat_number ?? '-'} ({seat?.class ?? '-'})</p>
            </div>
            {isCancelled ? (
              <p className="mt-4 inline-flex rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-rose-700 ring-1 ring-rose-100">
                Cancelled ticket
              </p>
            ) : null}
            {isRescheduled ? (
              <p className="mt-4 inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-amber-700 ring-1 ring-amber-100">
                Rescheduled details shown
              </p>
            ) : null}
          </div>

          {passenger ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-600">Passenger</p>
              <div className="mt-4 space-y-2 text-sm text-slate-600">
                <p className="flex items-center gap-2 font-medium text-slate-900"><UserCircle2 className="h-4 w-4 text-brand-600" /> {passenger.full_name}</p>
                <p>Passport: {passenger.passport_no}</p>
                <p>Nationality: {passenger.nationality}</p>
                <p>DOB: {passenger.dob}</p>
              </div>
            </div>
          ) : null}

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-600">Next steps</p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <Link href="/bookings" className="inline-flex items-center justify-center rounded-full bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:brightness-110">
                My Bookings
              </Link>
              <Link href="/search" className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-brand-300 hover:text-brand-700">
                Search Again
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
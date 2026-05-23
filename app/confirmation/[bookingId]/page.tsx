import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { BadgeCheck, CalendarDays, Plane, FileText, Ticket, UserCircle2 } from 'lucide-react'
import { createSupabaseServerClient } from '../../../lib/supabase/server'

type BookingRow = {
  id: string
  user_id: string
  status: string
  booked_at: string
  total_price: number | string
  pnr_code: string
  flight_id: string
  seat_id: string
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
    .select('id, user_id, status, booked_at, total_price, pnr_code, flight_id, seat_id')
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

  return (
    <section className="card overflow-hidden">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <p className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700 ring-1 ring-emerald-100">
            <BadgeCheck className="h-4 w-4" /> Confirmation
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">Booking confirmed</h1>
          <p className="mt-3 text-slate-600">Your seat reservation is complete.</p>
        </div>
        <div className="rounded-3xl bg-brand-50 px-5 py-4 ring-1 ring-brand-100">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-700">PNR</p>
          <p className="mt-2 text-3xl font-extrabold tracking-[0.18em] text-slate-900">{booking.pnr_code}</p>
        </div>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[1.75rem] border border-slate-200 bg-slate-950 p-5 text-white shadow-soft-lg">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-slate-300">Ticket summary</p>
              <h2 className="mt-2 text-2xl font-semibold">Flight confirmation</h2>
            </div>
            <div className="rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-white/90">{booking.status}</div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300"><Plane className="h-4 w-4" /> Booking ID</div>
              <p className="mt-2 break-all text-sm font-medium text-white">{booking.id}</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300"><Ticket className="h-4 w-4" /> Total price</div>
              <p className="mt-2 text-xl font-semibold text-white">{typeof booking.total_price === 'number' ? `$${booking.total_price.toFixed(2)}` : booking.total_price}</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300"><CalendarDays className="h-4 w-4" /> Status</div>
              <p className="mt-2 text-sm font-medium text-white capitalize">{booking.status}</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300"><FileText className="h-4 w-4" /> PNR code</div>
              <p className="mt-2 text-sm font-medium text-white">{booking.pnr_code}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
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
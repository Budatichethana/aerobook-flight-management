import { supabaseAdmin } from '../../lib/supabase/server'
import FlightCard from '../../components/FlightCard'
import { Plane, SearchX } from 'lucide-react'

type SearchParams = {
  origin?: string | string[]
  destination?: string | string[]
  date?: string | string[]
  passengers?: string | string[]
}

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

function readParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0] ?? ''
  }

  return value ?? ''
}

export default async function FlightsPage({ searchParams }: { searchParams?: SearchParams }) {
  const origin = readParam(searchParams?.origin).trim()
  const destination = readParam(searchParams?.destination).trim()
  const date = readParam(searchParams?.date).trim()
  const passengers = readParam(searchParams?.passengers).trim()

  let query = supabaseAdmin
    .from('flights')
    .select('id, flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price')
    .order('departs_at', { ascending: true })

  if (origin) {
    query = query.ilike('origin', `%${origin}%`)
  }

  if (destination) {
    query = query.ilike('destination', `%${destination}%`)
  }

  if (date) {
    query = query.gte('departs_at', `${date}T00:00:00`).lt('departs_at', `${date}T23:59:59.999`)
  }

  const { data, error } = await query

  const flights = (data ?? []) as FlightRow[]

  return (
    <section className="space-y-6 lg:space-y-8">
      <div className="card flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <p className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-sm font-semibold text-brand-700 ring-1 ring-brand-100">Flights</p>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">Available flights</h1>
          <p className="max-w-3xl text-slate-600">
          {origin || destination || date
            ? `Showing flights for ${origin || 'any origin'} to ${destination || 'any destination'}${date ? ` on ${date}` : ''}${passengers ? ` for ${passengers} passenger${passengers === '1' ? '' : 's'}` : ''}.`
            : 'Showing the latest available flights.'}
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600 ring-1 ring-slate-100">
          <Plane className="h-4 w-4 text-brand-600" />
          Real-time flight inventory
        </div>
      </div>

      {error ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-700 shadow-sm">
          Could not load flights: {error.message}
        </div>
      ) : flights.length === 0 ? (
        <div className="card flex flex-col items-center justify-center gap-3 py-12 text-center text-slate-600">
          <div className="rounded-full bg-slate-100 p-3 text-slate-500">
            <SearchX className="h-5 w-5" />
          </div>
          <p className="text-lg font-semibold text-slate-900">No flights matched your search.</p>
          <p className="max-w-md text-sm text-slate-500">Try a broader origin, destination, or date to see more results.</p>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {flights.map((flight) => (
            <FlightCard key={flight.id} flight={{
              id: flight.id,
              flight_no: flight.flight_no ?? '',
              origin: flight.origin ?? '',
              destination: flight.destination ?? '',
              departs_at: flight.departs_at ?? '',
              arrives_at: flight.arrives_at ?? '',
              aircraft_type: flight.aircraft_type ?? '',
              status: flight.status ?? '',
              base_price: typeof flight.base_price === 'number' ? flight.base_price : Number(flight.base_price ?? 0)
            }} />
          ))}
        </div>
      )}
    </section>
  )
}
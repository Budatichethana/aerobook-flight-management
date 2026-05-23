import Link from 'next/link'
import { ArrowRightLeft, CalendarDays, Search, Users, Plane } from 'lucide-react'

export default function SearchPage() {
  return (
    <section className="space-y-6 lg:space-y-8">
      <div className="max-w-4xl space-y-4">
        <p className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-sm font-semibold text-brand-700 ring-1 ring-brand-100">Search flights</p>
        <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">Find the right flight</h1>
        <p className="max-w-2xl text-slate-600">
          Enter your trip details to see available flights and continue to booking when ready.
        </p>
      </div>

      <form action="/flights" method="get" className="card grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-4 flex items-center justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-100">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
            <Plane className="h-4 w-4 text-brand-600" />
            Premium flight search
          </div>
          <div className="hidden items-center gap-2 text-sm text-slate-500 md:flex">
            <ArrowRightLeft className="h-4 w-4 text-brand-500" />
            Route-focused results
          </div>
        </div>

        <label className="space-y-2 text-sm font-medium text-slate-700">
          <span className="flex items-center gap-2"><Plane className="h-4 w-4 text-brand-600" /> Origin</span>
          <input
            name="origin"
            type="text"
            placeholder="London"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100"
          />
        </label>

        <label className="space-y-2 text-sm font-medium text-slate-700">
          <span className="flex items-center gap-2"><Plane className="h-4 w-4 rotate-180 text-brand-600" /> Destination</span>
          <input
            name="destination"
            type="text"
            placeholder="Dubai"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100"
          />
        </label>

        <label className="space-y-2 text-sm font-medium text-slate-700">
          <span className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-brand-600" /> Date</span>
          <input
            name="date"
            type="date"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100"
          />
        </label>

        <label className="space-y-2 text-sm font-medium text-slate-700">
          <span className="flex items-center gap-2"><Users className="h-4 w-4 text-brand-600" /> Passengers</span>
          <input
            name="passengers"
            type="number"
            min="1"
            defaultValue={1}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100"
          />
        </label>

        <div className="lg:col-span-4 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">Search results will open on the flights page with your filters applied.</p>
          <div className="flex gap-3">
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:brightness-110"
            >
              <Search className="mr-2 h-4 w-4" /> Search Flights
            </button>
            <Link
              href="/flights"
              className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-brand-300 hover:text-brand-700"
            >
              View all flights
            </Link>
          </div>
        </div>
      </form>
    </section>
  )
}
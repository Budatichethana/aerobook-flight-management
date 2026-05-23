import React from 'react'
import Link from 'next/link'
import { Plane, Map, Clock } from 'lucide-react'

export default function Home() {
  return (
    <main className="w-full">
      <section className="w-full bg-gradient-to-br from-brand-50 via-white to-white">
        <div className="max-w-7xl mx-auto px-4 py-12 md:py-16 lg:flex lg:items-center lg:justify-between">
          <div className="lg:w-7/12">
            <p className="inline-flex items-center gap-3 rounded-full bg-white/60 px-3 py-1 text-sm font-semibold text-brand-600 shadow-sm">Premium · Flights</p>
            <h1 className="mt-5 text-4xl sm:text-5xl font-extrabold text-slate-900 leading-tight">Seamless flight booking — designed for modern travelers</h1>
            <p className="mt-3 text-lg text-slate-600 max-w-xl">Discover routes, select seats, and manage bookings with confidence. Fast reservations, clear pricing, and effortless rescheduling — all in one place.</p>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/search" className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-sm">
                <Plane className="w-4 h-4" /> Search Flights
              </Link>
              <Link href="/flights" className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-sm">
                <Map className="w-4 h-4 text-slate-600" /> Browse Flights
              </Link>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-brand-100 p-2">
                    <Plane className="w-5 h-5 text-brand-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Active Flights</p>
                    <p className="mt-1 text-xl font-semibold text-slate-900">8+</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-brand-100 p-2">
                    <Map className="w-5 h-5 text-brand-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Routes</p>
                    <p className="mt-1 text-xl font-semibold text-slate-900">4</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-brand-100 p-2">
                    <Clock className="w-5 h-5 text-brand-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Live Seat</p>
                    <p className="mt-1 text-xl font-semibold text-slate-900">Availability</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right-side mock ticket visual */}
          <div className="mt-4 lg:mt-0 lg:w-5/12 flex justify-end">
            <div className="relative">
              {/* subtle radial blur behind boarding pass */}
              <div className="absolute -right-6 -top-6 w-56 h-56 rounded-full bg-gradient-to-br from-brand-200 to-transparent opacity-40 filter blur-3xl pointer-events-none -z-10" />
              <div className="rounded-3xl bg-white p-6 shadow-soft-lg border border-slate-100 relative z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Boarding Pass</p>
                    <h3 className="mt-2 text-lg font-semibold text-slate-900">FM123 • {new Date().toLocaleDateString('en-CA')}</h3>
                  </div>
                  <div className="rounded-md bg-brand-50 px-3 py-2 text-sm font-medium text-brand-700">Economy</div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500">From</p>
                    <p className="mt-1 font-semibold text-slate-900">SFO</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">To</p>
                    <p className="mt-1 font-semibold text-slate-900">LAX</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Gate</p>
                    <p className="mt-1 font-semibold text-slate-900">A12</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Seat</p>
                    <p className="mt-1 font-semibold text-slate-900">12A</p>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between">
                  <div className="text-sm text-slate-600">PNR: <span className="font-medium text-slate-900">FM-9Z7Q</span></div>
                  <div className="w-16 h-16 bg-slate-100 rounded-md flex items-center justify-center">QR</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Decorative aviation-themed section */}
      <section className="mt-4">
        <div className="max-w-7xl mx-auto px-4 py-4 grid grid-cols-1 lg:grid-cols-3 gap-4 items-center">
          <div className="lg:col-span-2">
            <div className="rounded-2xl bg-white/40 backdrop-blur-sm p-5 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <p className="text-sm text-slate-600">Popular route</p>
                  <h4 className="mt-2 text-xl font-semibold text-slate-900">SFO → LAX</h4>
                  <p className="mt-2 text-sm text-slate-600">Quick hops between major hubs with competitive fares and live seat maps.</p>
                </div>
                <div className="hidden sm:flex items-center justify-center">
                  <div className="relative w-40 h-16">
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M10 30 C 60 0, 140 0, 190 30" stroke="#c7e6ff" strokeWidth="2" strokeLinecap="round" strokeDasharray="6 6" />
                    </svg>
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                      <Plane className="w-6 h-6 text-brand-600 rotate-90" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100">
              <p className="text-sm text-slate-500">Why choose us</p>
              <ul className="mt-4 space-y-3 text-sm text-slate-600">
                <li className="flex items-start gap-3"><span className="text-brand-600">•</span> Reliable routes and live inventory</li>
                <li className="flex items-start gap-3"><span className="text-brand-600">•</span> Fast reservations and secure booking</li>
                <li className="flex items-start gap-3"><span className="text-brand-600">•</span> Easy reschedule & cancellation</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

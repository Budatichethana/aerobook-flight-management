"use client"

import React from 'react'
import { getSupabaseBrowserClient } from '../lib/supabase/client'

type FlightRow = {
  flight_no: string | null
  origin: string | null
  destination: string | null
  departs_at: string | null
  arrives_at: string | null
  aircraft_type: string | null
  status: string | null
  base_price: number | string | null
}

export default function DebugSupabaseClient() {
  const supabase = getSupabaseBrowserClient()
  const [rows, setRows] = React.useState<FlightRow[]>([])
  const [loading, setLoading] = React.useState(true)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)

  React.useEffect(() => {
    let isMounted = true

    const loadFlights = async (): Promise<void> => {
      setLoading(true)
      setErrorMessage(null)

      const { data, error } = await supabase
        .from('flights')
        .select('flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price')
        .limit(5)

      if (!isMounted) {
        return
      }

      if (error) {
        setRows([])
        setErrorMessage(error.message)
      } else {
        setRows((data ?? []) as FlightRow[])
      }

      setLoading(false)
    }

    void loadFlights()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-700">Supabase Debug</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Flights table check</h1>
        <p className="mt-2 text-sm text-slate-600">
          This page uses the browser Supabase client with the anon key only.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        {loading ? (
          <p className="text-sm text-slate-600">Loading flights...</p>
        ) : errorMessage ? (
          <div>
            <p className="text-sm font-semibold text-rose-700">Query failed</p>
            <p className="mt-2 whitespace-pre-wrap text-sm text-rose-600">{errorMessage}</p>
          </div>
        ) : rows.length === 0 ? (
          <p className="text-sm text-slate-600">No rows returned from flights.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead>
                <tr className="text-slate-500">
                  <th className="px-3 py-2 font-medium">Flight No</th>
                  <th className="px-3 py-2 font-medium">Origin</th>
                  <th className="px-3 py-2 font-medium">Destination</th>
                  <th className="px-3 py-2 font-medium">Departs At</th>
                  <th className="px-3 py-2 font-medium">Arrives At</th>
                  <th className="px-3 py-2 font-medium">Aircraft Type</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 font-medium">Base Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((row, index) => (
                  <tr key={`${row.flight_no ?? 'row'}-${index}`} className="text-slate-700">
                    <td className="px-3 py-2">{row.flight_no ?? '-'}</td>
                    <td className="px-3 py-2">{row.origin ?? '-'}</td>
                    <td className="px-3 py-2">{row.destination ?? '-'}</td>
                    <td className="px-3 py-2">{row.departs_at ?? '-'}</td>
                    <td className="px-3 py-2">{row.arrives_at ?? '-'}</td>
                    <td className="px-3 py-2">{row.aircraft_type ?? '-'}</td>
                    <td className="px-3 py-2">{row.status ?? '-'}</td>
                    <td className="px-3 py-2">{row.base_price ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

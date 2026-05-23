"use client"

import React from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '../store/useStore'

type Props = {
  bookingId: string
}

export default function CancelBookingButton({ bookingId }: Props) {
  const router = useRouter()
  const [loading, setLoading] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)

  const handleCancel = async () => {
    const confirmed = window.confirm('Cancel this booking? This cannot be undone.')

    if (!confirmed) {
      return
    }

    setLoading(true)
    setErrorMessage(null)

    try {
      const response = await fetch(new URL('/api/bookings/cancel', window.location.origin), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'same-origin',
        body: JSON.stringify({ bookingId })
      })

      const raw = await response.text()
      let payload: { error?: string } = {}

      if (raw) {
        try {
          payload = JSON.parse(raw) as { error?: string }
        } catch {
          payload = { error: raw }
        }
      }

      if (!response.ok) {
        throw new Error(payload.error ?? 'Unable to cancel booking')
      }

      router.refresh()
      // Clear local booking/seat selection state after successful cancellation
      try {
        useStore.getState().reset()
      } catch (e) {
        // ignore
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to cancel booking')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-4 space-y-2">
      <button
        type="button"
        onClick={() => {
          void handleCancel()
        }}
        disabled={loading}
        className="inline-flex items-center justify-center rounded-full border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-700 shadow-sm transition hover:-translate-y-0.5 hover:border-rose-300 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? 'Cancelling...' : 'Cancel Booking'}
      </button>

      {errorMessage ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {errorMessage}
        </div>
      ) : null}
    </div>
  )
}
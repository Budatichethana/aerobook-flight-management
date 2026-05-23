import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '../../../../lib/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = createSupabaseServerClient()
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let body: { bookingId?: string; newFlightId?: string; newSeatNumber?: string }

    try {
      body = (await request.json()) as { bookingId?: string; newFlightId?: string; newSeatNumber?: string }
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const bookingId = body.bookingId?.trim()
    const newFlightId = body.newFlightId?.trim()
    const newSeatNumber = body.newSeatNumber?.trim()

    if (!bookingId || !newFlightId || !newSeatNumber) {
      return NextResponse.json({ error: 'Missing bookingId, newFlightId, or newSeatNumber' }, { status: 400 })
    }

    const { data, error } = await supabase.rpc('reschedule_booking', {
      p_booking_id: bookingId,
      p_new_flight_id: newFlightId,
      p_new_seat_number: newSeatNumber
    })

    if (error) {
      return NextResponse.json({ error: error.message || 'Unable to reschedule booking' }, { status: 500 })
    }

    const result = Array.isArray(data) ? data[0] : data

    if (!result?.booking_id) {
      return NextResponse.json({ error: 'Reschedule failed' }, { status: 500 })
    }

    return NextResponse.json({
      bookingId: result.booking_id,
      status: result.booking_status,
      feeCharged: result.fee_charged,
      totalPrice: result.total_price
    })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to reschedule booking' }, { status: 500 })
  }
}
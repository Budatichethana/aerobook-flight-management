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

    let body: { bookingId?: string }

    try {
      body = (await request.json()) as { bookingId?: string }
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const bookingId = body.bookingId?.trim()

    if (!bookingId) {
      return NextResponse.json({ error: 'Missing bookingId' }, { status: 400 })
    }

    const { data, error } = await supabase.rpc('cancel_booking', {
      p_booking_id: bookingId
    })

    if (error) {
      const message = error.message || 'Unable to cancel booking'
      const status = message.includes('not allowed within 2 hours') || message.includes('already cancelled') ? 400 : 500
      return NextResponse.json({ error: message }, { status })
    }

    const result = Array.isArray(data) ? data[0] : data

    if (!result?.cancelled_booking_id) {
      return NextResponse.json({ error: 'Cancellation failed' }, { status: 500 })
    }

    return NextResponse.json({
      bookingId: result.cancelled_booking_id,
      status: result.cancelled_status
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to cancel booking' },
      { status: 500 }
    )
  }
}
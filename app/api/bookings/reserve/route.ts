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

    const body = await request.json() as {
      flightId?: string
      seatNumber?: string
      full_name?: string
      passport_no?: string
      nationality?: string
      dob?: string
    }

    const flightId = body.flightId?.trim()
    const seatNumber = body.seatNumber?.trim()
    const fullName = body.full_name?.trim()
    const passportNo = body.passport_no?.trim()
    const nationality = body.nationality?.trim()
    const dob = body.dob?.trim()

    if (!flightId || !seatNumber || !fullName || !passportNo || !nationality || !dob) {
      return NextResponse.json({ error: 'Missing required booking fields' }, { status: 400 })
    }

    const { data, error } = await supabase.rpc('reserve_seat', {
      p_user_id: user.id,
      p_flight_id: flightId,
      p_seat_number: seatNumber,
      p_full_name: fullName,
      p_passport_no: passportNo,
      p_nationality: nationality,
      p_dob: dob
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const booking = Array.isArray(data) ? data[0] : data

    if (!booking?.booking_id) {
      return NextResponse.json({ error: 'Booking was not created' }, { status: 500 })
    }

    return NextResponse.json({
      bookingId: booking.booking_id,
      totalPrice: booking.total_price,
      pnrCode: booking.pnr_code
    })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to reserve seat' }, { status: 500 })
  }
}
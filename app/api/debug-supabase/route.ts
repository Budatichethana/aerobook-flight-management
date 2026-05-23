import { NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../lib/supabase/server'

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('flights')
      .select('flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price')
      .limit(5)

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: String(err?.message ?? err) }, { status: 500 })
  }
}

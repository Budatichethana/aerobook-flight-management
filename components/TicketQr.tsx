"use client"

import React from 'react'
import { QRCodeSVG } from 'qrcode.react'

type Props = {
  bookingId: string
  size?: number
  label?: string
  compact?: boolean
  targetPath?: '/ticket' | '/confirmation'
}

export default function TicketQr({ bookingId, size = 120, label = 'Ticket QR', compact = false, targetPath = '/ticket' }: Props) {
  const [origin, setOrigin] = React.useState('')

  React.useEffect(() => {
    setOrigin(window.location.origin)
  }, [])

  const ticketUrl = origin ? `${origin}${targetPath}/${bookingId}` : `${targetPath}/${bookingId}`

  return (
    <div className={compact ? 'flex w-fit flex-col items-center rounded-2xl border border-slate-200 bg-white px-2.5 py-2 shadow-sm' : 'rounded-3xl border border-slate-200 bg-white p-4 shadow-sm'}>
      <div className={compact ? 'rounded-xl bg-white p-1.5 ring-1 ring-slate-100' : 'rounded-xl bg-white p-2 ring-1 ring-slate-100'}>
        <QRCodeSVG value={ticketUrl} size={size} level="M" includeMargin={false} bgColor="transparent" fgColor="#0f172a" />
      </div>
      <div className={compact ? 'mt-2 text-center text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500' : 'mt-3 text-xs text-slate-500'}>
        <p className="font-semibold uppercase tracking-[0.16em] text-brand-600">{label}</p>
        {!compact ? <p className="mt-1 break-all">Scan for live ticket status</p> : null}
      </div>
    </div>
  )
}

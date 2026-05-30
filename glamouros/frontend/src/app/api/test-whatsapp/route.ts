import { NextResponse } from 'next/server'
import { sendWhatsApp } from '@/lib/whatsapp'

export async function GET() {
  // Initiating the test WhatsApp dispatch to the specified number
  const result = await sendWhatsApp(
    '8919664007',
    '✅ GlamourOS WhatsApp integration working!'
  )

  return NextResponse.json({
    success: result.success,
    message: result.success ? 'Twilio dispatch successful!' : 'Twilio dispatch failed.',
    sid: result.sid || null,
    error: result.error || null
  })
}

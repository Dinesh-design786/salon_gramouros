import { Request, Response } from 'express'
import Booking, { IBooking } from '../models/Booking'
import { emitLiveEvent } from '../sockets/liveSocket'

// ====================================================
// UTILITY: Generate a clean Invoice ID
// ====================================================
const generateInvoiceId = (): string => {
  const timestamp = Date.now().toString(36).toUpperCase()
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `GLAM-${timestamp}-${rand}`
}

// ====================================================
// UTILITY: Send WhatsApp via CallMeBot (FREE, no account needed)
// Activation: https://www.callmebot.com/blog/free-api-whatsapp-messages/
// ====================================================
const sendViaCallMeBot = async (phone: string, message: string): Promise<{ success: boolean; error?: string }> => {
  const apiKey = process.env.CALLMEBOT_APIKEY
  const configuredPhone = process.env.CALLMEBOT_PHONE

  if (!apiKey || apiKey === 'YOUR_CALLMEBOT_API_KEY') {
    return { success: false, error: 'CallMeBot API key not configured in .env' }
  }

  // CallMeBot sends to the phone number registered during activation
  // The "to" number must match the one used during activation
  const targetPhone = (configuredPhone || phone).replace(/\s+/g, '').replace(/[^+\d]/g, '')
  const encodedMsg = encodeURIComponent(message)
  const url = `https://api.callmebot.com/whatsapp.php?phone=${targetPhone}&text=${encodedMsg}&apikey=${apiKey}`

  try {
    console.log(`📱 Sending WhatsApp via CallMeBot to ${targetPhone}...`)
    const res = await fetch(url)
    const text = await res.text()
    console.log(`📱 CallMeBot response: ${text}`)

    if (res.ok && !text.toLowerCase().includes('error')) {
      console.log(`✅ WhatsApp sent via CallMeBot to ${targetPhone}`)
      return { success: true }
    }
    return { success: false, error: `CallMeBot: ${text}` }
  } catch (err: any) {
    return { success: false, error: `CallMeBot fetch error: ${err.message}` }
  }
}

// ====================================================
// UTILITY: Send WhatsApp via Twilio Sandbox (fallback)
// ====================================================
const sendViaTwilio = async (phone: string, message: string): Promise<{ success: boolean; sid?: string; error?: string }> => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const fromNumber = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886'

  if (!accountSid || !authToken) {
    return { success: false, error: 'Twilio credentials not configured in .env' }
  }

  const toFormatted = phone.startsWith('+') ? `whatsapp:${phone}` : `whatsapp:+91${phone.replace(/\D/g, '')}`

  try {
    console.log(`📱 Sending WhatsApp via Twilio to ${toFormatted}...`)
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({ From: fromNumber, To: toFormatted, Body: message }).toString()
    })
    const data = await res.json() as any
    if (res.ok && data.sid) {
      console.log(`✅ WhatsApp sent via Twilio. SID: ${data.sid}`)
      return { success: true, sid: data.sid }
    }
    console.error(`❌ Twilio error:`, data.message || data)
    return { success: false, error: data.message || 'Twilio API error' }
  } catch (err: any) {
    return { success: false, error: `Twilio fetch error: ${err.message}` }
  }
}

// ====================================================
// UTILITY: Master WhatsApp dispatcher (CallMeBot → Twilio → log)
// ====================================================
const sendWhatsAppMessage = async (phone: string, message: string): Promise<{ success: boolean; sid?: string; error?: string }> => {
  // 1. Try CallMeBot first (free, no credit card)
  const cbResult = await sendViaCallMeBot(phone, message)
  if (cbResult.success) return { success: true }

  console.warn(`⚠️  CallMeBot failed: ${cbResult.error}`)

  // 2. Fallback to Twilio
  const twResult = await sendViaTwilio(phone, message)
  if (twResult.success) return { success: true, sid: twResult.sid }

  console.warn(`⚠️  Twilio failed: ${twResult.error}`)
  console.warn(`📋 WhatsApp not sent. Configure CALLMEBOT_PHONE + CALLMEBOT_APIKEY in backend/.env`)

  return { success: false, error: `Both providers failed. CallMeBot: ${cbResult.error} | Twilio: ${twResult.error}` }
}


// ====================================================
// POST /api/v1/bookings/create
// ====================================================
export const createBooking = async (req: Request, res: Response) => {
  const {
    customerName,
    phone,
    email,
    serviceName,
    branchName,
    bookingDate,
    bookingTime,
    offlinePayment
  } = req.body

  // --- Basic validation
  if (!customerName || !phone || !email || !serviceName || !branchName || !bookingDate || !bookingTime) {
    return res.status(400).json({
      success: false,
      error: 'All fields are required: customerName, phone, email, serviceName, branchName, bookingDate, bookingTime.'
    })
  }

  try {
    // --- Double booking conflict prevention
    const conflict = await Booking.findOne({
      branchName,
      bookingDate,
      bookingTime,
      bookingStatus: { $ne: 'cancelled' }
    })

    if (conflict) {
      return res.status(409).json({
        success: false,
        conflict: true,
        error: `⚠️ Time slot ${bookingTime} on ${bookingDate} at ${branchName} is already booked. Please select a different time.`
      })
    }

    // --- Generate invoice
    const invoiceId = generateInvoiceId()

    // --- Persist booking to MongoDB
    const booking = new Booking({
      invoiceId,
      customerName: customerName.trim(),
      phone: phone.trim(),
      email: email.trim().toLowerCase(),
      serviceName,
      branchName,
      bookingDate,
      bookingTime,
      offlinePayment: Boolean(offlinePayment),
      paymentStatus: offlinePayment ? 'pending' : 'pending',
      bookingStatus: 'confirmed',
      whatsappStatus: 'pending'
    })

    await booking.save()

    // --- Build Invoice object
    const invoice = {
      invoiceId,
      customerName: booking.customerName,
      phone: booking.phone,
      serviceName: booking.serviceName,
      branchName: booking.branchName,
      bookingDate: booking.bookingDate,
      bookingTime: booking.bookingTime,
      offlinePayment: booking.offlinePayment,
      paymentStatus: booking.paymentStatus,
      bookingStatus: booking.bookingStatus,
      createdAt: booking.createdAt
    }

    // --- Real-time Socket.IO push to Admin dashboard
    emitLiveEvent('new_booking', {
      type: 'NEW_BOOKING',
      booking: booking.toJSON(),
      invoice,
      timestamp: new Date().toISOString()
    })

    // --- Send WhatsApp confirmation
    const paymentNote = offlinePayment
      ? '💵 Payment Mode: Offline (Pay at Salon Counter)'
      : '📱 Payment Mode: Online (To be confirmed)'

    const whatsappMsg = `🌟 *GlamourOS Booking Confirmed!*

Hello *${customerName}*! Your luxury salon appointment is confirmed. 🎉

━━━━━━━━━━━━━━━━━━━━━
📋 *BOOKING INVOICE*
━━━━━━━━━━━━━━━━━━━━━
🆔 Invoice ID: \`${invoiceId}\`
👤 Client: ${customerName}
📞 Phone: ${phone}
💆 Service: ${serviceName}
🏢 Branch: ${branchName}
📅 Date: ${bookingDate}
⏰ Time: ${bookingTime}
${paymentNote}
━━━━━━━━━━━━━━━━━━━━━

Thank you for choosing *GlamourOS Luxe Salon*! 
Our team looks forward to serving you. ✨

For queries: Call/WhatsApp us anytime.`

    const waResult = await sendWhatsAppMessage(phone, whatsappMsg)

    // --- Update WhatsApp status in DB
    await Booking.findByIdAndUpdate(booking._id, {
      whatsappStatus: waResult.success ? 'sent' : 'failed'
    })

    return res.status(201).json({
      success: true,
      message: 'Booking confirmed and WhatsApp notification sent!',
      invoice,
      whatsapp: {
        sent: waResult.success,
        sid: waResult.sid,
        error: waResult.error
      }
    })

  } catch (err: any) {
    console.error('Booking creation error:', err)
    return res.status(500).json({ success: false, error: err.message })
  }
}

// ====================================================
// GET /api/v1/bookings
// ====================================================
export const getBookings = async (req: Request, res: Response) => {
  try {
    const { date, branch, status } = req.query

    const filter: any = {}
    if (date) filter.bookingDate = date
    if (branch) filter.branchName = { $regex: branch, $options: 'i' }
    if (status) filter.bookingStatus = status

    const bookings = await Booking.find(filter)
      .sort({ createdAt: -1 })
      .limit(100)

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings: bookings.map(b => b.toJSON())
    })
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

// ====================================================
// PATCH /api/v1/bookings/:id/status
// ====================================================
export const updateBookingStatus = async (req: Request, res: Response) => {
  const { id } = req.params
  const { bookingStatus, paymentStatus } = req.body

  try {
    const update: any = {}
    if (bookingStatus) update.bookingStatus = bookingStatus
    if (paymentStatus) update.paymentStatus = paymentStatus

    const updated = await Booking.findByIdAndUpdate(id, update, { new: true })
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Booking not found.' })
    }

    // Push status update to admin dashboard in real-time
    emitLiveEvent('booking_status_update', {
      type: 'STATUS_UPDATE',
      bookingId: id,
      bookingStatus: updated.bookingStatus,
      paymentStatus: updated.paymentStatus,
      timestamp: new Date().toISOString()
    })

    return res.status(200).json({
      success: true,
      message: 'Booking status updated.',
      booking: updated.toJSON()
    })
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

import { Router, Request, Response } from 'express'
import * as mockStore from '../config/mockStore'
import { isMock, pool } from '../config/db'

const router = Router()

// WhatsApp AI Booking Agent parsing API
router.post('/whatsapp/message', async (req: Request, res: Response) => {
  const { message, customerPhone } = req.body

  if (!message) {
    return res.status(400).json({ success: false, error: 'message text is required.' })
  }

  try {
    const text = message.toLowerCase()
    
    // Default extracted entities
    let detectedServiceId = 's1000000-0000-0000-0000-000000000001' // Signature Haircut default
    let detectedServiceName = 'Signature Haircut'
    let detectedBranchId = 'b1000000-0000-0000-0000-000000000001' // Banjara Hills default
    let detectedBranchName = 'GlamourOS Banjara Hills'
    let detectedTime = '17:00:00'
    let detectedDate = '2026-05-26' // Default tomorrow
    let detectedLanguage = 'English'
    let originalPrice = 500

    // 1. Language parser detection
    if (text.includes('kavali') || text.includes('kaledu')) {
      detectedLanguage = 'Hinglish / Telugu-mix'
    } else if (text.includes('kal') || text.includes('chahiye') || text.includes('karna hai')) {
      detectedLanguage = 'Hindi'
    }

    // 2. Service detection rules
    if (text.includes('haircut') || text.includes('bal katne')) {
      detectedServiceId = 's1000000-0000-0000-0000-000000000001'
      detectedServiceName = 'Signature Haircut'
      originalPrice = 500
    } else if (text.includes('color') || text.includes('balayage') || text.includes('rangna')) {
      detectedServiceId = 's1000000-0000-0000-0000-000000000003'
      detectedServiceName = 'Balayage Hair Color'
      originalPrice = 1500
    } else if (text.includes('bridal') || text.includes('shadi') || text.includes('package')) {
      detectedServiceId = 's1000000-0000-0000-0000-000000000005'
      detectedServiceName = 'Royal Bridal Package'
      originalPrice = 8000
    } else if (text.includes('facial') || text.includes('massage') || text.includes('peel')) {
      detectedServiceId = 's1000000-0000-0000-0000-000000000006'
      detectedServiceName = 'Detox Facial & Massage'
      originalPrice = 800
    } else if (text.includes('keratin') || text.includes('treatment')) {
      detectedServiceId = 's1000000-0000-0000-0000-000000000004'
      detectedServiceName = 'Premium Keratin Treatment'
      originalPrice = 3500
    } else if (text.includes('beard') || text.includes('trim') || text.includes('dadhi')) {
      detectedServiceId = 's1000000-0000-0000-0000-000000000002'
      detectedServiceName = 'Classic Beard Trim'
      originalPrice = 300
    }

    // 3. Branch detection rules
    if (text.includes('jubilee') || text.includes('road 36')) {
      detectedBranchId = 'b1000000-0000-0000-0000-000000000002'
      detectedBranchName = 'GlamourOS Jubilee Hills'
    } else if (text.includes('madhapur') || text.includes('hitech')) {
      detectedBranchId = 'b1000000-0000-0000-0000-000000000003'
      detectedBranchName = 'GlamourOS Madhapur'
    }

    // 4. Time detection rules
    if (text.includes('evening') || text.includes('shaam') || text.includes('night')) {
      detectedTime = '18:00'
    } else if (text.includes('afternoon') || text.includes('dopahar')) {
      detectedTime = '15:00'
    } else if (text.includes('morning') || text.includes('subah')) {
      detectedTime = '10:00'
    }

    // Dynamic conflict solver check (if 3:30 or 6:00 is busy, shift by 45 mins)
    let suggestOffset = false
    let finalTime = detectedTime

    // Check collision under best active stylist
    let targetStylistId = 'st100000-0000-0000-0000-000000000001' // Rohan default
    let targetStylistName = 'Rohan Sharma'

    if (isMock) {
      const activeBranchStaff = mockStore.staff.filter(s => s.branch_id === detectedBranchId && s.is_active)
      if (activeBranchStaff.length > 0) {
        // Find best stylist based on ratings
        const best = activeBranchStaff.reduce((prev, curr) => (prev.rating > curr.rating) ? prev : curr)
        targetStylistId = best.id
        targetStylistName = best.name
      }
      
      const isCollision = mockStore.appointments.some(
        a => a.branch_id === detectedBranchId &&
             a.stylist_id === targetStylistId &&
             a.date === detectedDate &&
             a.time === detectedTime &&
             a.status !== 'Cancelled'
      )
      if (isCollision) {
        suggestOffset = true
        finalTime = '18:45' // Shift by +45 mins to clear collision!
      }
    }

    // Create the simulated booking
    const newBookingId = 'ap_wa_' + Math.random().toString(36).substring(2, 9)
    const newBooking = {
      id: newBookingId,
      customer_id: 'c1000000-0000-0000-0000-000000000001', // Bind to Ananya Reddy VVIP
      branch_id: detectedBranchId,
      stylist_id: targetStylistId,
      date: detectedDate,
      time: finalTime,
      duration: 60,
      base_price: originalPrice,
      applied_price: originalPrice,
      status: 'Confirmed' as const,
      source: 'WhatsApp' as const,
      notes: `WhatsApp automated appointment. Parsed NLP Language: ${detectedLanguage}.`
    }

    if (isMock) {
      mockStore.appointments.push(newBooking)
    } else {
      await pool!.query(
        'INSERT INTO appointments(id, customer_id, branch_id, stylist_id, date, time, duration, base_price, applied_price, status, source, notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)',
        [newBooking.id, newBooking.customer_id, newBooking.branch_id, newBooking.stylist_id, newBooking.date, newBooking.time, newBooking.duration, newBooking.base_price, newBooking.applied_price, newBooking.status, newBooking.source, newBooking.notes]
      )
    }

    // Compose conversational staff response
    let responseText = ''
    if (detectedLanguage === 'Hinglish / Telugu-mix') {
      responseText = `Namaste! Absolutely! tomorrow evening space available undi at GlamourOS ${detectedBranchName.replace('GlamourOS ', '')}. I have scheduled your "${detectedServiceName}" with our top specialist *${targetStylistName}* at *${finalTime}*. Can you confirm if this slot is fine for you?`
    } else if (detectedLanguage === 'Hindi') {
      responseText = `Namaste! Ji bilkul, kal shaam ko humare GlamourOS ${detectedBranchName.replace('GlamourOS ', '')} outlet par slot khali hai. Maine aapka "${detectedServiceName}" booking senior specialist *${targetStylistName}* ke sath shaam *${finalTime}* ko confirm kar diya hai. Kya aapko ye time suit karega?`
    } else {
      responseText = `Hello! We'd love to host you. I have successfully scheduled your "${detectedServiceName}" at GlamourOS ${detectedBranchName.replace('GlamourOS ', '')} with our senior stylist *${targetStylistName}* for tomorrow at *${finalTime}* (conflict-resolved slot). We look forward to seeing you!`
    }

    if (suggestOffset) {
      responseText = `⚠️ *Slot Conflict Resolved!* \n\n` + responseText + ` \n\n_(AI Note: Shifted reservation slightly by 45 minutes to bypass stylist double-booking)._`
    }

    return res.status(200).json({
      success: true,
      nlpAnalysis: {
        languageDetected: detectedLanguage,
        serviceParsed: detectedServiceName,
        branchParsed: detectedBranchName,
        stylistAssigned: targetStylistName,
        dateExtracted: detectedDate,
        initialTimePreferred: detectedTime,
        conflictAdjustedTime: finalTime,
        isConflictOverridden: suggestOffset
      },
      responseMessage: responseText,
      appointment: newBooking
    })

  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message })
  }
})

export default router

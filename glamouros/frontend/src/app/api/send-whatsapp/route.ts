import { NextResponse } from 'next/server'
import { sendWhatsApp } from '@/lib/whatsapp'

const BRANCH_DETAILS: Record<string, { address: string; mapLink: string }> = {
  'GlamourOS Banjara Hills': {
    address: 'Road No. 12, Banjara Hills, Hyderabad, Telangana 500034',
    mapLink: 'https://maps.google.com/?q=Road+No.+12,+Banjara+Hills,+Hyderabad'
  },
  'GlamourOS Jubilee Hills': {
    address: 'Road No. 36, Jubilee Hills, Hyderabad, Telangana 500033',
    mapLink: 'https://maps.google.com/?q=Road+No.+36,+Jubilee+Hills,+Hyderabad'
  },
  'GlamourOS Madhapur': {
    address: 'Hitech City Road, Madhapur, Hyderabad, Telangana 500081',
    mapLink: 'https://maps.google.com/?q=Hitech+City+Road,+Madhapur,+Hyderabad'
  }
}

function getBranchDetails(name: string) {
  const normalized = name.toLowerCase()
  if (normalized.includes('banjara')) {
    return BRANCH_DETAILS['GlamourOS Banjara Hills']
  }
  if (normalized.includes('jubilee')) {
    return BRANCH_DETAILS['GlamourOS Jubilee Hills']
  }
  if (normalized.includes('madhapur')) {
    return BRANCH_DETAILS['GlamourOS Madhapur']
  }
  // Default fallback if not matched
  return {
    address: name,
    mapLink: `https://maps.google.com/?q=${encodeURIComponent(name)}`
  }
}

export async function POST(request: Request) {
  try {
    const { phone, serviceName, branchName, bookingDate, bookingTime, bookingId } = await request.json()

    if (!phone || !serviceName || !branchName || !bookingDate || !bookingTime) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required parameters: phone, serviceName, branchName, bookingDate, bookingTime.' 
      }, { status: 400 })
    }

    const idToUse = bookingId || `GLAM-78601`
    const branchInfo = getBranchDetails(branchName)

    // Generate public dynamic check-in QR Code pass (accessible globally)
    const qrMediaUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(idToUse)}`

    // Generate invoice shortlink
    const invoiceUrl = `http://localhost:3000/invoice/${idToUse}`

    const message = `
✅ *GlamourOS Appointment Confirmed*

💆 *Service:* ${serviceName}
🏢 *Branch:* ${branchName}
📍 *Address:* ${branchInfo.address}
📅 *Date:* ${bookingDate}
⏰ *Time:* ${bookingTime}
🔑 *Booking ID:* ${idToUse}

---
📱 *QR check-in pass is attached below!*
📄 *Download printable PDF invoice:* ${invoiceUrl}
---

Thank you for choosing *GlamourOS*. ✨
`

    const result = await sendWhatsApp(phone, message, qrMediaUrl)
    
    return NextResponse.json({ 
      success: result.success, 
      sid: result.sid || null, 
      error: result.error || null 
    })
  } catch (err: any) {
    return NextResponse.json({ 
      success: false, 
      error: err.message || 'Internal Server Error' 
    }, { status: 500 })
  }
}

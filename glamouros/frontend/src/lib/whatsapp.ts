const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886'

export async function sendWhatsApp(phone: string, message: string, mediaUrl?: string): Promise<{ success: boolean; sid?: string; error?: string }> {
  if (!accountSid || !authToken) {
    console.error('❌ Twilio credentials are not configured in .env.local')
    return { success: false, error: 'Twilio credentials not configured in environment.' }
  }

  // Format recipient's phone: ensure it has standard whatsapp:+91 format for India if not pre-formatted
  const sanitizedPhone = phone.replace(/\s+/g, '').replace(/[^+\d]/g, '')
  const toFormatted = sanitizedPhone.startsWith('+') 
    ? `whatsapp:${sanitizedPhone}` 
    : `whatsapp:+91${sanitizedPhone}`

  try {
    console.log(`📱 Initiating Twilio WhatsApp dispatch (pure fetch) to ${toFormatted} with media: ${mediaUrl}...`)
    
    const credentials = `${accountSid}:${authToken}`
    const base64Credentials = Buffer.from(credentials).toString('base64')

    const postParams: Record<string, string> = {
      From: fromNumber,
      To: toFormatted,
      Body: message
    }

    if (mediaUrl) {
      postParams.MediaUrl = mediaUrl
    }

    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${base64Credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams(postParams).toString()
    })

    const data = await response.json() as any

    if (response.ok && data.sid) {
      console.log('✅ Twilio WhatsApp message sent successfully. SID:', data.sid)
      return { success: true, sid: data.sid }
    } else {
      console.error('❌ Twilio REST API returned error:', data.message || data)
      return { success: false, error: data.message || 'Twilio send failure' }
    }
  } catch (error: any) {
    console.error('❌ Twilio WhatsApp dispatch error:', error)
    return { success: false, error: error.message || 'Twilio fetch request failure' }
  }
}

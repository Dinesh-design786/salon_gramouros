const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886'

export async function sendWhatsApp(phone: string, message: string, mediaUrl?: string): Promise<{ success: boolean; sid?: string; error?: string }> {
  if (!accountSid || !authToken) {
    console.error('❌ Twilio credentials are not configured in .env.local')
    return { success: false, error: 'Twilio credentials not configured in environment.' }
  }

  // 1. Remove all spaces, dashes, parentheses, and non-numeric characters except +
  let sanitizedPhone = phone.replace(/[\s\-\(\)]/g, '')
  
  // 2. If it has a leading zero, remove it (e.g. 09876543210 -> 9876543210)
  if (sanitizedPhone.startsWith('0')) {
    sanitizedPhone = sanitizedPhone.substring(1)
  }

  let finalNumber = sanitizedPhone
  if (!sanitizedPhone.startsWith('+')) {
    // If it already has the 91 prefix but no plus symbol (e.g. 919876543210)
    if (sanitizedPhone.startsWith('91') && sanitizedPhone.length === 12) {
      finalNumber = `+${sanitizedPhone}`
    } else {
      finalNumber = `+91${sanitizedPhone}`
    }
  }

  const toFormatted = `whatsapp:${finalNumber}`

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

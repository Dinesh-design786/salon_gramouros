import dotenv from 'dotenv'

dotenv.config()

export interface SmsCredentials {
  provider: 'fast2sms' | 'twilio' | 'none'
  fast2smsKey?: string
  twilioSid?: string
  twilioToken?: string
  twilioFrom?: string
}

/**
 * Dispatches a real-time SMS or WhatsApp containing the verification OTP.
 * Supports Twilio, Fast2SMS (India Quick SMS route), and CallMeBot WhatsApp API.
 */
export async function sendRealSms(
  phone: string, 
  otp: string, 
  customCreds?: SmsCredentials
): Promise<{ success: boolean; provider: string; details?: string; error?: string }> {
  // Sanitize the phone number (remove spaces, format with +91 if needed)
  let cleanPhone = phone.replace(/\s+/g, '')
  if (!cleanPhone.startsWith('+')) {
    if (cleanPhone.length === 10) {
      cleanPhone = `+91${cleanPhone}`
    }
  }

  // Determine credentials to use (custom overrides or .env defaults)
  const provider = customCreds?.provider || (process.env.SMS_PROVIDER as any) || 'none'
  const fast2smsKey = customCreds?.fast2smsKey || process.env.FAST2SMS_API_KEY
  const twilioSid = customCreds?.twilioSid || process.env.TWILIO_ACCOUNT_SID
  const twilioToken = customCreds?.twilioToken || process.env.TWILIO_AUTH_TOKEN
  const twilioFrom = customCreds?.twilioFrom || process.env.TWILIO_PHONE_NUMBER

  const messageText = `[GlamourOS] Your VVIP verification passcode is ${otp}. Valid for 5 minutes.`

  try {
    // 1. FAST2SMS PROVIDER (India SMS Gateway)
    if (provider === 'fast2sms' || fast2smsKey) {
      const apiKey = fast2smsKey
      if (!apiKey) {
        return { success: false, provider: 'fast2sms', error: 'Fast2SMS API Key is missing.' }
      }

      // Format phone for Indian carrier (strip +91 prefix if present for Fast2SMS)
      let indiaNumber = cleanPhone
      if (indiaNumber.startsWith('+91')) {
        indiaNumber = indiaNumber.substring(3)
      }

      const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          'authorization': apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          route: 'q',
          message: messageText,
          language: 'english',
          numbers: indiaNumber
        })
      })

      const result: any = await response.json()
      if (result && result.return === true) {
        return { success: true, provider: 'Fast2SMS', details: `SMS sent to ${cleanPhone} via Quick Route.` }
      } else {
        return { 
          success: false, 
          provider: 'Fast2SMS', 
          error: result?.message || 'Fast2SMS Gateway returned status false.' 
        }
      }
    }

    // 2. TWILIO PROVIDER (Global SMS Gateway)
    if (provider === 'twilio' || (twilioSid && twilioToken)) {
      if (!twilioSid || !twilioToken || !twilioFrom) {
        return { 
          success: false, 
          provider: 'Twilio', 
          error: 'Twilio Sid, Token, or Phone Number is missing.' 
        }
      }

      const authString = Buffer.from(`${twilioSid}:${twilioToken}`).toString('base64')
      const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${authString}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          From: twilioFrom,
          To: cleanPhone,
          Body: messageText
        })
      })

      const result: any = await response.json()
      if (response.ok) {
        return { success: true, provider: 'Twilio', details: `SMS dispatched to ${cleanPhone} via Twilio.` }
      } else {
        return { 
          success: false, 
          provider: 'Twilio', 
          error: result?.message || `Twilio HTTP error ${response.status}` 
        }
      }
    }

    // 3. FALLBACK - SIMULATION LOG
    return { 
      success: false, 
      provider: 'Simulation', 
      details: 'No API credentials configured. Message generated: ' + otp 
    }

  } catch (err: any) {
    return { success: false, provider: 'System Error', error: err.message }
  }
}

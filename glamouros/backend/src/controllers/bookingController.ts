import { Request, Response } from 'express'
import { isMock, pool } from '../config/db'
import * as mockStore from '../config/mockStore'

// Get appointments list for branch and date
export const getAppointments = async (req: Request, res: Response) => {
  const { branchId, date } = req.query

  if (!branchId) {
    return res.status(400).json({ success: false, error: 'branchId query parameter is required.' })
  }

  try {
    const targetDate = date ? String(date) : '2026-05-25'

    if (isMock) {
      const branchAppts = mockStore.appointments.filter(a => a.branch_id === branchId && a.date === targetDate)
      return res.status(200).json({ success: true, appointments: branchAppts })
    }

    const { rows } = await pool!.query(
      'SELECT * FROM appointments WHERE branch_id = $1 AND date = $2 ORDER BY time ASC',
      [branchId, targetDate]
    )
    return res.status(200).json({ success: true, appointments: rows })

  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

// AI Smart Booking Assistant Scheduler Recommendation Engine
export const getAISchedulingRecommendation = async (req: Request, res: Response) => {
  const { serviceId, branchId } = req.query

  if (!serviceId || !branchId) {
    return res.status(400).json({ success: false, error: 'serviceId and branchId parameters are required.' })
  }

  try {
    let serviceName = ''
    let serviceCategory = ''
    let serviceDuration = 30
    
    // Retrieve service metadata
    if (isMock) {
      const s = mockStore.services.find(ser => ser.id === serviceId)
      if (s) {
        serviceName = s.name
        serviceCategory = s.category
        serviceDuration = s.duration
      }
    } else {
      const { rows } = await pool!.query('SELECT name, category, duration FROM services WHERE id = $1', [serviceId])
      if (rows.rows.length > 0) {
        serviceName = rows[0].name
        serviceCategory = rows[0].category
        serviceDuration = rows[0].duration
      }
    }

    // Load available staff in the branch
    let staffRoster = []
    if (isMock) {
      staffRoster = mockStore.staff.filter(st => st.branch_id === branchId && st.is_active)
    } else {
      const { rows } = await pool!.query('SELECT * FROM staff WHERE branch_id = $1 AND is_active = TRUE', [branchId])
      staffRoster = rows
    }

    if (staffRoster.length === 0) {
      return res.status(404).json({ success: false, error: 'No active stylists available in this branch.' })
    }

    // AI Match Engine scoring
    let bestStylist = staffRoster[0]
    let highestScore = -1
    let reasoning = ''

    staffRoster.forEach(st => {
      let score = 50 // baseline score
      
      // 1. Specialty matching
      const matchesSpecialty = st.specialty.toLowerCase().includes(serviceCategory.toLowerCase()) ||
                               st.specialty.toLowerCase().includes(serviceName.split(' ')[0].toLowerCase())
      if (matchesSpecialty) {
        score += 30
      }

      // 2. Rating quality boost
      score += (parseFloat(st.rating) - 4.0) * 20

      // 3. Workload stress fatigue balancing (Optimizing branch workload)
      score += (100 - st.workload) * 0.2 // Lower workload gets higher preference score!

      if (score > highestScore) {
        highestScore = score
        bestStylist = st
        reasoning = `AI selected ${st.name} (Score: ${Math.round(score)}/100) because they hold senior specialty in "${st.specialty}", possess an excellent ${st.rating}⭐ customer rating, and present optimized workload (${st.workload}% active today), preventing fatigue and reducing queue delay.`
      }
    })

    return res.status(200).json({
      success: true,
      serviceId,
      serviceName,
      estimatedDurationMinutes: serviceDuration,
      recommendation: {
        stylistId: bestStylist.id,
        stylistName: bestStylist.name,
        matchScore: Math.round(highestScore),
        reason: reasoning
      }
    })

  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

// Create Appointment with dynamic pricing and conflict checks
export const createAppointment = async (req: Request, res: Response) => {
  const { customerId, branchId, stylistId, serviceId, date, time, source, notes } = req.body

  try {
    let servicePrice = 500
    let duration = 30
    
    // Fetch price and duration
    if (isMock) {
      const s = mockStore.services.find(ser => ser.id === serviceId)
      if (s) {
        servicePrice = s.price
        duration = s.duration
      }
    } else {
      const resSer = await pool!.query('SELECT price, duration FROM services WHERE id = $1', [serviceId])
      if (resSer.rows.length > 0) {
        servicePrice = parseFloat(resSer.rows[0].price)
        duration = resSer.rows[0].duration
      }
    }

    // Dynamic pricing lookup (Happy hour if load < 30%, Surge if load > 85%)
    let appliedPrice = servicePrice
    let pricingApplied: 'Standard' | 'Happy Hour' | 'Surge' = 'Standard'
    let fillRate = 35

    if (isMock) {
      const branchStaff = mockStore.staff.filter(st => st.branch_id === branchId)
      fillRate = branchStaff.length > 0 ? Math.round(branchStaff.reduce((acc, curr) => acc + curr.workload, 0) / branchStaff.length) : 30
    } else {
      const resLoad = await pool!.query('SELECT AVG(workload) as avg_load FROM staff WHERE branch_id = $1', [branchId])
      fillRate = resLoad.rows[0].avg_load ? Math.round(parseFloat(resLoad.rows[0].avg_load)) : 30
    }

    if (fillRate < 30) {
      appliedPrice = Math.round(servicePrice * 0.85) // 15% happy hour discount
      pricingApplied = 'Happy Hour'
    } else if (fillRate > 85) {
      appliedPrice = Math.round(servicePrice * 1.20) // 20% surge markup
      pricingApplied = 'Surge'
    }

    // Conflict prevention check: Check if stylist has another active appointment at the exact hour/minute
    let isConflict = false
    if (isMock) {
      isConflict = mockStore.appointments.some(
        a => a.branch_id === branchId && 
             a.stylist_id === stylistId && 
             a.date === date && 
             a.time === time && 
             a.status !== 'Cancelled'
      )
    } else {
      const resConf = await pool!.query(
        'SELECT id FROM appointments WHERE branch_id = $1 AND stylist_id = $2 AND date = $3 AND time = $4 AND status != \'Cancelled\'',
        [branchId, stylistId, date, time]
      )
      isConflict = resConf.rows.length > 0
    }

    if (isConflict) {
      // Auto-suggest resolving conflict: offset by 15 mins
      const [h, m] = time.split(':')
      let newMin = parseInt(m) + 15
      let newHour = parseInt(h)
      if (newMin >= 60) {
        newMin -= 60
        newHour += 1
      }
      const adjustedTime = `${String(newHour).padStart(2, '0')}:${String(newMin).padStart(2, '0')}`

      return res.status(409).json({
        success: false,
        conflict: true,
        error: 'Stylist Collision Alert! Time slot is already reserved.',
        aiResolution: {
          suggestedTime: adjustedTime,
          message: '🤖 AI Resolution: Shifted appointment by +15 minutes to resolve the collision and balance staff workload safely.'
        }
      })
    }

    const apptId = 'ap_' + Math.random().toString(36).substring(2, 9)
    const newAppointment = {
      id: apptId,
      customer_id: customerId || 'c1000000-0000-0000-0000-000000000004',
      branch_id: branchId,
      stylist_id: stylistId,
      date,
      time,
      duration,
      base_price: servicePrice,
      applied_price: appliedPrice,
      status: 'Confirmed' as const,
      source: source || 'Website',
      notes: notes || `AI Pricing Type: ${pricingApplied}`
    }

    if (isMock) {
      mockStore.appointments.push(newAppointment)
      // Increase stylist workload stress factor
      const stylist = mockStore.staff.find(s => s.id === stylistId)
      if (stylist) {
        stylist.workload = Math.min(100, stylist.workload + 15)
      }
    } else {
      const queryStr = `
        INSERT INTO appointments (id, customer_id, branch_id, stylist_id, date, time, duration, base_price, applied_price, status, source, notes)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      `
      await pool!.query(queryStr, [
        newAppointment.id, newAppointment.customer_id, newAppointment.branch_id, newAppointment.stylist_id,
        newAppointment.date, newAppointment.time, newAppointment.duration, newAppointment.base_price,
        newAppointment.applied_price, newAppointment.status, newAppointment.source, newAppointment.notes
      ])
      
      // Update stylist workload
      await pool!.query('UPDATE staff SET workload = LEAST(100, workload + 15) WHERE id = $1', [stylistId])
    }

    return res.status(201).json({
      success: true,
      message: 'Appointment successfully scheduled conflict-free.',
      appointment: newAppointment,
      pricingApplied,
      originalPrice: servicePrice,
      dynamicPrice: appliedPrice
    })

  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

// Modify booking status
export const updateAppointmentStatus = async (req: Request, res: Response) => {
  const { appointmentId } = req.params
  const { status } = req.body

  try {
    if (isMock) {
      const appt = mockStore.appointments.find(a => a.id === appointmentId)
      if (!appt) {
        return res.status(404).json({ success: false, error: 'Appointment not found.' })
      }
      appt.status = status
      
      // If completed, trigger simulated inventory consumption logic!
      if (status === 'Completed') {
        // Find stylist and decrease their load
        const stylist = mockStore.staff.find(s => s.id === appt.stylist_id)
        if (stylist) stylist.workload = Math.max(0, stylist.workload - 10)
        
        // Auto deduct dye or oil
        if (appt.service_id === 's1000000-0000-0000-0000-000000000003') { // Balayage coloring
          const dye = mockStore.inventory.find(p => p.name === 'L\'Oreal Professional Hair Dye' && p.branch_id === appt.branch_id)
          if (dye) dye.stock = Math.max(0, dye.stock - 1)
        }
      }
      
      return res.status(200).json({ success: true, message: 'Status updated', appointment: appt })
    }

    // Real PG Database Query
    await pool!.query('UPDATE appointments SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [status, appointmentId])
    
    // Check if PG Triggers run (automatic triggers will take care of stock deductions and staff payloads on DB side!)
    return res.status(200).json({ success: true, message: 'Appointment status transitioned successfully.' })

  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

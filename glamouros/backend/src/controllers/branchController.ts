import { Request, Response } from 'express'
import { isMock, pool } from '../config/db'
import * as mockStore from '../config/mockStore'

// Get all branches & dynamic load capacity metrics
export const getBranches = async (req: Request, res: Response) => {
  try {
    if (isMock) {
      // Calculate dynamic branch fill rate based on active staff workloads in mock memory
      const calculatedBranches = mockStore.branches.map(b => {
        const branchStaff = mockStore.staff.filter(s => s.branch_id === b.id)
        const avgWorkload = branchStaff.length > 0 
          ? branchStaff.reduce((acc, curr) => acc + curr.workload, 0) / branchStaff.length 
          : 30
        
        return {
          ...b,
          fill_rate: Math.round(avgWorkload)
        }
      })
      return res.status(200).json({ success: true, branches: calculatedBranches })
    }

    // Real PG Database Query
    const queryStr = `
      SELECT b.*, COALESCE(AVG(s.workload), 25.00) as fill_rate 
      FROM branches b
      LEFT JOIN staff s ON s.branch_id = b.id
      GROUP BY b.id
    `
    const { rows } = await pool!.query(queryStr)
    return res.status(200).json({ success: true, branches: rows })

  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

// Get Dynamic Pricing Rules & AI Promotional cross-branch suggestions
export const getDynamicPricingAdvisory = async (req: Request, res: Response) => {
  const { branchId } = req.query

  if (!branchId) {
    return res.status(400).json({ success: false, error: 'branchId query parameter is required.' })
  }

  try {
    let fillRate = 35 // default standard load
    let branchName = ''

    if (isMock) {
      const b = mockStore.branches.find(br => br.id === branchId)
      if (b) {
        branchName = b.name
        const branchStaff = mockStore.staff.filter(s => s.branch_id === branchId)
        fillRate = branchStaff.length > 0 
          ? Math.round(branchStaff.reduce((acc, curr) => acc + curr.workload, 0) / branchStaff.length) 
          : 30
      }
    } else {
      const { rows } = await pool!.query('SELECT name FROM branches WHERE id = $1', [branchId])
      if (rows.length > 0) branchName = rows[0].name
      
      const resLoad = await pool!.query('SELECT AVG(workload) as avg_load FROM staff WHERE branch_id = $1', [branchId])
      fillRate = resLoad.rows[0].avg_load ? Math.round(parseFloat(resLoad.rows[0].avg_load)) : 30
    }

    // Dynamic Pricing Engine Matrix
    let pricingMode: 'Standard' | 'Happy Hour' | 'Surge' = 'Standard'
    let priceMultiplier = 1.00
    let message = 'Standard baseline pricing. Occupancy healthy.'
    let recommendation = 'No cross-branch balancing required.'

    if (fillRate < 30) {
      pricingMode = 'Happy Hour'
      priceMultiplier = 0.85 // 15% discount
      message = `Happy Hour Active! Branch load is extremely low at ${fillRate}%.`
      recommendation = `Run AI retention promo "HAPPY15" at ${branchName} to fill immediate open therapist blocks.`
    } else if (fillRate > 85) {
      pricingMode = 'Surge'
      priceMultiplier = 1.20 // 20% surge rate
      message = `Surge Rates Triggered! Jubilant demand. Branch load is highly congested at ${fillRate}%.`
      
      // Suggest least busy branch to redirect walk-in bookings
      let alternateBranch = 'GlamourOS Jubilee Hills'
      if (branchName.includes('Jubilee')) {
        alternateBranch = 'GlamourOS Banjara Hills'
      } else if (branchName.includes('Madhapur')) {
        alternateBranch = 'GlamourOS Banjara Hills'
      }

      recommendation = `Congestion detected. AI advises redirecting walk-in/call leads to alternate lower-load branch: "${alternateBranch}" with a complimentary ₹100 rideshare voucher.`
    }

    return res.status(200).json({
      success: true,
      branchId,
      branchName,
      fillRate,
      pricingMode,
      priceMultiplier,
      advisory: {
        message,
        recommendation
      }
    })

  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

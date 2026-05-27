import { Request, Response } from 'express'
import { isMock, pool } from '../config/db'
import * as mockStore from '../config/mockStore'

// Get stylists with live metrics and performance data
export const getStaffByBranch = async (req: Request, res: Response) => {
  const { branchId } = req.query

  if (!branchId) {
    return res.status(400).json({ success: false, error: 'branchId query parameter is required.' })
  }

  try {
    if (isMock) {
      const branchStaff = mockStore.staff.filter(s => s.branch_id === branchId)
      return res.status(200).json({ success: true, staff: branchStaff })
    }

    const { rows } = await pool!.query('SELECT * FROM staff WHERE branch_id = $1 AND is_active = TRUE', [branchId])
    return res.status(200).json({ success: true, staff: rows })

  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

// Get stylist automated commission report
export const getStylistCommissions = async (req: Request, res: Response) => {
  const { staffId } = req.params

  try {
    if (isMock) {
      const records = mockStore.commissionLedger.filter(c => c.staff_id === staffId)
      const stylist = mockStore.staff.find(s => s.id === staffId)
      
      const totalDue = records.reduce((acc, curr) => acc + curr.total_commission, 0)
      const serviceCom = records.reduce((acc, curr) => acc + curr.service_commission, 0)
      const retailCom = records.reduce((acc, curr) => acc + curr.retail_commission, 0)
      const performanceBonus = records.reduce((acc, curr) => acc + curr.performance_bonus, 0)

      return res.status(200).json({
        success: true,
        staffId,
        staffName: stylist?.name || 'Stylist',
        experienceLevel: stylist?.experience_level || 'Senior',
        summary: {
          totalCommissionDue: totalDue,
          serviceCommission: serviceCom,
          retailCommission: retailCom,
          performanceBonus
        },
        records
      })
    }

    // Real DB query
    const resStylist = await pool!.query('SELECT name, experience_level FROM staff WHERE id = $1', [staffId])
    if (resStylist.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Stylist not found.' })
    }

    const queryStr = 'SELECT * FROM commission_ledger WHERE staff_id = $1 ORDER BY created_at DESC'
    const { rows } = await pool!.query(queryStr, [staffId])

    const totalDue = rows.reduce((acc, curr) => acc + parseFloat(curr.total_commission), 0)
    const serviceCom = rows.reduce((acc, curr) => acc + parseFloat(curr.service_commission), 0)
    const retailCom = rows.reduce((acc, curr) => acc + parseFloat(curr.retail_commission), 0)
    const performanceBonus = rows.reduce((acc, curr) => acc + parseFloat(curr.performance_bonus), 0)

    return res.status(200).json({
      success: true,
      staffId,
      staffName: resStylist.rows[0].name,
      experienceLevel: resStylist.rows[0].experience_level,
      summary: {
        totalCommissionDue: totalDue,
        serviceCommission: serviceCom,
        retailCommission: retailCom,
        performanceBonus
      },
      records: rows
    })

  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

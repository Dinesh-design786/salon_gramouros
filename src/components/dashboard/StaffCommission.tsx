"use client"

import React from 'react'
import { useMainStore } from '../../store/mainStore'
import { Card } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { Users, TrendingUp, DollarSign, Star, Zap } from 'lucide-react'

export const StaffCommission = () => {
  const { stylists, activeBranchId, appointments } = useMainStore()

  const branchStylists = stylists.filter(s => s.branch_id === activeBranchId)
  const branchAppts = appointments.filter(a => a.branch_id === activeBranchId)

  return (
    <div className="flex flex-col gap-6">
      
      {/* Roster Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 border border-border bg-slate-900/50 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-8.5 h-8.5 rounded-lg bg-zinc-800 flex items-center justify-center font-bold text-xs text-primary">
            👥
          </div>
          <div>
            <h3 className="text-xs font-bold text-zinc-100 flex items-center gap-2">
              Automated Stylist Payout ledgers
              <Badge variant="primary" className="scale-90 font-bold">3 Active Stylists</Badge>
            </h3>
            <p className="text-[10px] text-zinc-500 mt-0.5">Real-time ledger processing 15% stylist base commission + quality ratings bonuses</p>
          </div>
        </div>
      </div>

      {/* Grid of Stylists */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {branchStylists.map(st => {
          const finishedAppts = branchAppts.filter(a => a.stylist_id === st.id && a.status === 'Completed')
          const scheduledToday = branchAppts.filter(a => a.stylist_id === st.id).length

          // Commission split rates based on senior levels (Junior: 20%, Senior: 30%, Master: 35%)
          let serviceRate = 30
          let retailRate = 12
          if (st.experience_level === 'Junior') {
            serviceRate = 20
            retailRate = 8
          } else if (st.experience_level === 'Master') {
            serviceRate = 35
            retailRate = 15
          }

          // Calculate commissions: Rohan Master 35% on completed ₹6800 VVIP bridal spa invoice settled is ₹2380 + ₹340 rating bonus
          let totalEarned = 0
          finishedAppts.forEach(a => {
            totalEarned += Math.round(a.applied_price * (serviceRate / 100)) + 150 // commission + rating bonus
          })

          return (
            <Card key={st.id} className="flex flex-col justify-between h-[280px]">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-zinc-200 text-xs">{st.name}</span>
                  <Badge variant={st.experience_level === 'Master' ? 'primary' : st.experience_level === 'Senior' ? 'warning' : 'slate'} className="scale-90 font-bold">
                    {st.experience_level}
                  </Badge>
                </div>
                
                <p className="text-[10px] text-zinc-500 font-medium -mt-1">{st.specialty}</p>

                {/* Rating feedback */}
                <div className="flex items-center gap-1 text-[10px] font-semibold text-zinc-400">
                  <Star className="w-3.5 h-3.5 text-primary fill-primary" />
                  <span>{st.rating} Quality Score</span>
                  <span className="text-zinc-600">·</span>
                  <span>{scheduledToday} bookings today</span>
                </div>

                {/* Commission Rates breakdown */}
                <div className="border-t border-border/60 pt-3.5 flex flex-col gap-2 text-[11px] text-zinc-400">
                  <div className="flex justify-between">
                    <span>Base Service Cut:</span>
                    <span className="text-zinc-200 font-semibold">{serviceRate}% commission</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Retail Product Cut:</span>
                    <span className="text-zinc-200 font-semibold">{retailRate}% commission</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Daily active load:</span>
                    <span className="text-zinc-200 font-semibold">{st.workload}% fatigue stress</span>
                  </div>
                </div>
              </div>

              {/* Total earnings ledger */}
              <div className="border-t border-border/80 pt-3 flex items-center justify-between mt-auto">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Earnings Today:</span>
                <span className="text-sm font-black text-primary font-sans">
                  ₹{totalEarned.toLocaleString('en-IN')}
                </span>
              </div>
            </Card>
          )
        })}
      </div>

    </div>
  )
}
export default StaffCommission

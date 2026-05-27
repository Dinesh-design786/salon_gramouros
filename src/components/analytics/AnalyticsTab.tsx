"use client"

import React, { useState, useEffect } from 'react'
import { useMainStore } from '../../store/mainStore'
import { Card } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts'
import { TrendingUp, Sparkles } from 'lucide-react'

// Mock analytical data mapping for Recharts
const weeklyRevenueData = [
  { name: 'Mon', 'Banjara Hills': 18000, 'Jubilee Hills': 12000, 'Madhapur': 22000 },
  { name: 'Tue', 'Banjara Hills': 24000, 'Jubilee Hills': 18000, 'Madhapur': 28000 },
  { name: 'Wed', 'Banjara Hills': 22000, 'Jubilee Hills': 16000, 'Madhapur': 26000 },
  { name: 'Thu', 'Banjara Hills': 29000, 'Jubilee Hills': 22000, 'Madhapur': 34000 },
  { name: 'Fri', 'Banjara Hills': 45000, 'Jubilee Hills': 38000, 'Madhapur': 48000 },
  { name: 'Sat', 'Banjara Hills': 65000, 'Jubilee Hills': 55000, 'Madhapur': 72000 },
  { name: 'Sun', 'Banjara Hills': 80000, 'Jubilee Hills': 68000, 'Madhapur': 95000 }
]

const peakHoursData = [
  { hour: '09 AM', capacity: 25 },
  { hour: '11 AM', capacity: 60 },
  { hour: '01 PM', capacity: 45 },
  { hour: '03 PM', capacity: 85 }, // High congestion peak!
  { hour: '05 PM', capacity: 95 }, // Max congestion peak!
  { hour: '07 PM', capacity: 70 }
]

const loyaltySegments = [
  { name: 'Platinum (15% Cut)', value: 120, color: '#7F77DD' },
  { name: 'Gold (10% Cut)', value: 340, color: '#BA7517' },
  { name: 'Silver (5% Cut)', value: 450, color: '#1D9E75' },
  { name: 'Standard (0% Cut)', value: 680, color: '#52525b' }
]

export const AnalyticsTab = () => {
  const { activeBranchId, branches, inventory } = useMainStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return <div className="text-zinc-500 text-xs py-10 italic">Loading Recharts Engine...</div>

  const activeBranch = branches.find(b => b.id === activeBranchId) || branches[0]
  const branchInventory = inventory.filter(p => p.branch_id === activeBranchId)
  const lowStockCount = branchInventory.filter(p => p.stock < p.min_stock).length

  return (
    <div className="flex flex-col gap-6">
      
      {/* KPI Cards summary row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="flex flex-col gap-2">
          <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Branch Revenue Today</span>
          <h4 className="text-2xl font-black text-primary font-sans">
            ₹{activeBranchId === 'b1000000-0000-0000-0000-000000000001' ? '1,45,820' : '92,400'}
          </h4>
          <span className="text-[10px] text-success font-semibold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> +22.4% vs last Monday
          </span>
        </Card>

        <Card className="flex flex-col gap-2">
          <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Roster Safety Shortage</span>
          <h4 className={`text-2xl font-black font-sans ${lowStockCount > 0 ? 'text-alert' : 'text-success'}`}>
            {lowStockCount} critical items
          </h4>
          <span className="text-[10px] text-zinc-500 font-semibold">Safety stocks thresholds limits breached</span>
        </Card>

        <Card className="flex flex-col gap-2">
          <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Active Occupancy Balancer</span>
          <h4 className="text-2xl font-black text-zinc-200 font-sans">
            {activeBranch.fill_rate}% fill rate
          </h4>
          <span className="text-[10px] text-zinc-500 font-semibold">
            {activeBranch.fill_rate < 30 ? 'Discounting live' : activeBranch.fill_rate > 85 ? 'Surge multiplier active' : 'Baseline rates active'}
          </span>
        </Card>
      </div>

      {/* AI Logistical recommendation executive card */}
      <Card className="border border-primary/20 bg-primary/5 text-primary text-xs leading-relaxed p-4 flex items-start gap-3">
        <Sparkles className="w-5 h-5 shrink-0 animate-pulse" />
        <div>
          <span className="font-bold">AI Executive Logistical Recommendation:</span>
          <p className="mt-1 text-zinc-300 leading-relaxed">
            Madhapur high-occupancy surge rates (90% capacity) are pushing coloring appointments to Banjara Hills tomorrow. <b>L'Oreal Professional Hair Dye (4 units remaining)</b> will stockout in <b>3 days</b>. Safety threshold is breached. AI recommends ordering <b>+16 units</b> from L'Oreal India immediately to handle the weekend booking rush.
          </p>
        </div>
      </Card>

      {/* Recharts Grid layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Weekly Revenue compare area chart */}
        <Card className="md:col-span-8 flex flex-col gap-4">
          <div>
            <h4 className="text-xs font-bold text-zinc-200">Indian Chain Weekly Revenue trends (₹ INR)</h4>
            <p className="text-[9px] text-zinc-500">Comparing active retail outlets Banjara, Jubilee and Madhapur</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyRevenueData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f1f27" />
                <XAxis dataKey="name" stroke="#52525b" fontSize={10} />
                <YAxis stroke="#52525b" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#0c0c0f', borderColor: '#1f1f27', borderRadius: 8, fontSize: 11 }} />
                <Area type="monotone" dataKey="Banjara Hills" stroke="#7F77DD" fill="rgba(127, 119, 221, 0.15)" strokeWidth={2} />
                <Area type="monotone" dataKey="Madhapur" stroke="#1D9E75" fill="rgba(29, 158, 117, 0.1)" strokeWidth={2} />
                <Area type="monotone" dataKey="Jubilee Hills" stroke="#BA7517" fill="rgba(186, 117, 23, 0.1)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Loyalty segmentation pie chart */}
        <Card className="md:col-span-4 flex flex-col gap-4">
          <div>
            <h4 className="text-xs font-bold text-zinc-200">CRM Member Tiers splits</h4>
            <p className="text-[9px] text-zinc-500">Distribution of active customer membership groups</p>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={loyaltySegments}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {loyaltySegments.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0c0c0f', borderColor: '#1f1f27', borderRadius: 8, fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Table index keys */}
          <div className="flex flex-col gap-1.5 text-[10px] text-zinc-400 font-semibold px-2">
            {loyaltySegments.map((l, idx) => (
              <div key={idx} className="flex justify-between items-center">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: l.color }} />
                  {l.name}
                </span>
                <span className="text-zinc-200">{l.value} clients</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Peak occupancy hours bar chart */}
        <Card className="md:col-span-12 flex flex-col gap-4">
          <div>
            <h4 className="text-xs font-bold text-zinc-200">Daily Roster Congestion Peak hours curves (%)</h4>
            <p className="text-[9px] text-zinc-500">Aggregated reservation blocks to schedule stylist shift rotations</p>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={peakHoursData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f1f27" />
                <XAxis dataKey="hour" stroke="#52525b" fontSize={10} />
                <YAxis stroke="#52525b" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#0c0c0f', borderColor: '#1f1f27', borderRadius: 8, fontSize: 11 }} />
                <Bar dataKey="capacity" fill="#7F77DD" radius={[4, 4, 0, 0]}>
                  {peakHoursData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.capacity > 80 ? '#D85A30' : '#7F77DD'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

      </div>

    </div>
  )
}
export default AnalyticsTab

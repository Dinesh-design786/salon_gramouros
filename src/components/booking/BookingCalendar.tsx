"use client"

import React, { useState } from 'react'
import { useMainStore } from '../../store/mainStore'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'

export const BookingCalendar = () => {
  const { 
    appointments, 
    stylists, 
    activeBranchId, 
    updateAppointmentStatus, 
    createAppointment,
    branches 
  } = useMainStore()

  const [selectedStylist, setSelectedStylist] = useState('')
  const [selectedTime, setSelectedTime] = useState('11:00')
  const [selectedService, setSelectedService] = useState('s1000000-0000-0000-0000-000000000001') // default haircut

  const activeBranch = branches.find(b => b.id === activeBranchId)
  const branchStylists = stylists.filter(s => s.branch_id === activeBranchId)
  const branchAppts = appointments.filter(a => a.branch_id === activeBranchId)

  // Calendar operating hours
  const hours = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00']

  const handleCreate = async () => {
    if (!selectedStylist) return
    const originalPrice = selectedService === 's1000000-0000-0000-0000-000000000005' ? 8000 : 500
    
    await createAppointment({
      stylist_id: selectedStylist,
      time: selectedTime,
      date: '2026-05-25',
      base_price: originalPrice,
      source: 'Walk-in',
      notes: 'Direct roster walk-in appointment.'
    })
  }

  // Get dynamic pricing badge
  const fillRate = activeBranch?.fill_rate || 30
  let pricingLabel = 'Standard pricing active'
  let pricingVariant: 'slate' | 'success' | 'alert' = 'slate'

  if (fillRate < 30) {
    pricingLabel = 'Happy Hour Active (15% Off Services)'
    pricingVariant = 'success'
  } else if (fillRate > 85) {
    pricingLabel = 'Surge Pricing Active (20% Markup)'
    pricingVariant = 'alert'
  }

  return (
    <div className="flex flex-col gap-6">
      
      {/* Calendar Header Dynamic pricing advisor banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 border border-border bg-slate-900/50 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-8.5 h-8.5 rounded-lg bg-zinc-800 flex items-center justify-center font-bold text-xs text-primary">
            📅
          </div>
          <div>
            <h3 className="text-xs font-bold text-zinc-100 flex items-center gap-2">
              Daily Roster Calendar
              <Badge variant={pricingVariant as any} className="scale-90 font-bold">{pricingLabel}</Badge>
            </h3>
            <p className="text-[10px] text-zinc-500 mt-0.5">Isolated operations for {activeBranch?.name || 'Chain branch'}</p>
          </div>
        </div>

        {/* Walk-in scheduler controls */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedStylist}
            onChange={(e) => setSelectedStylist(e.target.value)}
            className="flat-input py-1.5 px-3 bg-zinc-900 border-border text-[11px] text-zinc-300 font-medium focus:outline-none"
          >
            <option value="">Choose Stylist...</option>
            {branchStylists.map(st => (
              <option key={st.id} value={st.id}>{st.name} ({st.specialty})</option>
            ))}
          </select>

          <select
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            className="flat-input py-1.5 px-3 bg-zinc-900 border-border text-[11px] text-zinc-300 focus:outline-none"
          >
            {hours.map(h => (
              <option key={h} value={h}>{h}</option>
            ))}
          </select>

          <select
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            className="flat-input py-1.5 px-3 bg-zinc-900 border-border text-[11px] text-zinc-300 focus:outline-none"
          >
            <option value="s1000000-0000-0000-0000-000000000001">Signature Haircut (₹500)</option>
            <option value="s1000000-0000-0000-0000-000000000005">Royal Bridal Spa (₹8000)</option>
          </select>

          <Button
            onClick={handleCreate}
            variant="primary"
            size="sm"
            className="text-[10px] font-bold py-2 rounded-lg"
          >
            Add Booking
          </Button>
        </div>
      </div>

      {/* Calendar timeline grid */}
      <div className="border border-border rounded-xl overflow-hidden bg-slate-950/40">
        
        {/* Therapist headers */}
        <div className="grid grid-cols-12 border-b border-border bg-slate-900/50 py-3 text-center text-xs font-bold text-zinc-300">
          <div className="col-span-2 border-r border-border text-[10px] uppercase text-zinc-500 font-extrabold flex items-center justify-center">
            Hour
          </div>
          <div className="col-span-10 grid grid-cols-3">
            {branchStylists.map(st => (
              <div key={st.id} className="border-r border-border last:border-0 flex flex-col items-center justify-center gap-0.5">
                <span className="text-zinc-200">{st.name}</span>
                <span className="text-[9px] text-zinc-500 font-semibold">{st.rating}★ · {st.workload}% Load</span>
              </div>
            ))}
            {branchStylists.length === 0 && (
              <div className="col-span-3 text-center text-zinc-500 py-2 italic text-[11px]">
                No stylists registered under this branch.
              </div>
            )}
          </div>
        </div>

        {/* Calendar slots rows */}
        <div className="flex flex-col max-h-[460px] overflow-y-auto">
          {hours.map(hr => (
            <div key={hr} className="grid grid-cols-12 border-b border-border last:border-0 min-h-[56px] items-stretch">
              
              {/* Hour identifier */}
              <div className="col-span-2 border-r border-border flex items-center justify-center bg-slate-900/10 text-xs font-bold text-zinc-400">
                {hr}
              </div>

              {/* Roster column reservation blocks */}
              <div className="col-span-10 grid grid-cols-3">
                {branchStylists.map(st => {
                  const matchingAppts = branchAppts.filter(
                    a => a.stylist_id === st.id && a.time.startsWith(hr.substring(0, 2))
                  )

                  return (
                    <div key={st.id} className="border-r border-border last:border-0 p-1 flex flex-col gap-1 min-h-[50px] relative justify-center">
                      {matchingAppts.map(appt => {
                        const isWhatsapp = appt.source === 'WhatsApp'
                        const isCompleted = appt.status === 'Completed'

                        return (
                          <div
                            key={appt.id}
                            className={`p-2 rounded-lg text-[10px] leading-tight cursor-pointer border transition-all ${
                              isCompleted
                                ? 'bg-zinc-900 border-zinc-800 text-zinc-500 line-through'
                                : isWhatsapp
                                  ? 'bg-primary/10 border-primary/40 text-primary shadow-sm shadow-primary/5 animate-pulse-slow'
                                  : 'bg-zinc-800 border-zinc-700 text-zinc-200 hover:border-zinc-500'
                            }`}
                            onClick={() => {
                              // Transition status sequence on click
                              if (appt.status === 'Confirmed') {
                                updateAppointmentStatus(appt.id, 'In Progress')
                              } else if (appt.status === 'In Progress') {
                                updateAppointmentStatus(appt.id, 'Completed')
                              }
                            }}
                          >
                            <div className="flex items-center justify-between font-bold">
                              <span>Sanjay Rao</span>
                            </div>
                            <div className="text-[9px] text-zinc-400 mt-0.5">
                              {appt.notes ? appt.notes.split('.')[0] : 'Hair Session'}
                            </div>
                            <div className="mt-1 flex items-center justify-between gap-1 text-[8px] font-semibold tracking-wider">
                              <Badge variant={appt.status === 'Completed' ? 'slate' : appt.status === 'In Progress' ? 'warning' : 'primary'}>
                                {appt.status}
                              </Badge>
                              <span className="text-zinc-500">₹{appt.applied_price}</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )
                })}
              </div>

            </div>
          ))}
        </div>

      </div>

    </div>
  )
}
export default BookingCalendar

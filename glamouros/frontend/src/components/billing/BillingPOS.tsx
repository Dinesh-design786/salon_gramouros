"use client"

import React, { useState } from 'react'
import { useMainStore } from '../../store/mainStore'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { Receipt, CreditCard, QrCode, Printer, ShieldAlert } from 'lucide-react'

export const BillingPOS = () => {
  const { appointments, activeBranchId, updateAppointmentStatus, addNotification } = useMainStore()
  
  const [selectedApptId, setSelectedApptId] = useState('a1000000-0000-0000-0000-000000000002') // Sanjay default
  const [promoCode, setPromoCode] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'UPI' | 'Card'>('UPI')
  const [isSettled, setIsSettled] = useState(false)
  const [invoiceNumber, setInvoiceNumber] = useState('INV-550912')

  const activeAppts = appointments.filter(a => a.branch_id === activeBranchId && a.status !== 'Completed')
  const currentAppt = appointments.find(a => a.id === selectedApptId)

  // Hardcode pricing calculations to present Indian retail logic cleanly
  const baseCost = currentAppt?.applied_price || 500
  const isVvip = selectedApptId === 'a1000000-0000-0000-0000-000000000001'
  const isHighRisk = selectedApptId === 'a1000000-0000-0000-0000-000000000003' || currentAppt?.customer_id === 'c1000000-0000-0000-0000-000000000004'

  // Membership discount
  const membershipTier = isVvip ? 'Platinum' : 'Gold'
  const membershipDiscountPercent = isVvip ? 15 : 10
  const membershipDiscountAmount = Math.round(baseCost * (membershipDiscountPercent / 100))

  // AI Churn promo code: COMFORT15 triggers 15% discount
  let promoDiscountPercent = 0
  if (promoCode.toUpperCase() === 'COMFORT15') {
    promoDiscountPercent = 15
  }
  const promoDiscountAmount = Math.round(baseCost * (promoDiscountPercent / 100))

  const subtotal = baseCost
  const totalDiscounts = membershipDiscountAmount + promoDiscountAmount
  
  // GST Math: standard 18% splits (9% CGST + 9% SGST)
  const taxableAmount = Math.max(0, subtotal - totalDiscounts)
  const cgst = Math.round(taxableAmount * 0.09)
  const sgst = Math.round(taxableAmount * 0.09)
  const totalGST = cgst + sgst
  const grandTotal = taxableAmount + totalGST

  const handleSettle = () => {
    if (!currentAppt) return
    
    // Transition status to completed
    updateAppointmentStatus(currentAppt.id, 'Completed')
    setIsSettled(true)
    const newInvNo = 'INV-' + Math.floor(100000 + Math.random() * 900000)
    setInvoiceNumber(newInvNo)

    addNotification(`Invoice ${newInvNo} settled via ${paymentMethod}. Product stock levels deducted. Stylist payroll commission auto-credited.`, 'success')
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
      
      {/* POS Worksheet */}
      <Card className="md:col-span-7 flex flex-col gap-5 justify-between">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
              <Receipt className="w-4.5 h-4.5 text-primary" />
              Smart POS Billing Terminal
            </h3>
            <Badge variant="slate" className="scale-90 font-bold">SAC CODE: 999721</Badge>
          </div>

          {/* Appointment dropdown selector */}
          <div className="flex flex-col gap-1.5 text-xs">
            <span className="text-zinc-500 font-semibold">Active Unbilled Appointments:</span>
            <select
              value={selectedApptId}
              onChange={(e) => {
                setSelectedApptId(e.target.value)
                setIsSettled(false)
              }}
              className="flat-input py-2 px-3 focus:outline-none"
            >
              {activeAppts.map(a => (
                <option key={a.id} value={a.id}>
                  {a.id === 'a1000000-0000-0000-0000-000000000002' ? 'Sanjay Rao' : 'Priyanka Verma'} ({a.time} · Hair Styling)
                </option>
              ))}
              {activeAppts.length === 0 && (
                <option value="">No unbilled schedules today.</option>
              )}
            </select>
          </div>

          {/* AI Retention Advisor */}
          {isHighRisk && !isSettled && (
            <div className="p-3 bg-alert/5 border border-alert/20 rounded-lg text-xs leading-relaxed text-alert flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0" />
              <div>
                <span className="font-bold">AI Retention Alert: </span>
                Customer predicted at <b>high risk of churn (82%)</b> due to extended visit delay. Offer custom discount promo <b>"COMFORT15"</b> to incentivize re-engagement.
              </div>
            </div>
          )}

          {/* Invoice pricing ledger table */}
          <div className="border border-border rounded-lg bg-zinc-950/40 p-4 flex flex-col gap-2.5 text-xs">
            <div className="flex justify-between border-b border-border pb-2 text-zinc-400">
              <span>Treatment Description</span>
              <span className="font-semibold text-zinc-200">Signature Haircut & Style</span>
            </div>
            
            <div className="flex justify-between text-zinc-500">
              <span>Service subtotal:</span>
              <span className="text-zinc-300 font-medium">₹{subtotal.toLocaleString('en-IN')}</span>
            </div>

            <div className="flex justify-between text-zinc-500">
              <span>{membershipTier} Membership Discount ({membershipDiscountPercent}%):</span>
              <span className="text-success font-semibold">-₹{membershipDiscountAmount.toLocaleString('en-IN')}</span>
            </div>

            {promoDiscountAmount > 0 && (
              <div className="flex justify-between text-zinc-500">
                <span>AI Churn Promo Discount (15%):</span>
                <span className="text-success font-semibold">-₹{promoDiscountAmount.toLocaleString('en-IN')}</span>
              </div>
            )}

            <div className="flex justify-between border-t border-border pt-2 text-zinc-400 font-bold">
              <span>Taxable Value:</span>
              <span>₹{taxableAmount.toLocaleString('en-IN')}</span>
            </div>

            {/* Indian GST splits */}
            <div className="flex justify-between text-[11px] text-zinc-500 pl-3">
              <span>CGST (9.0%):</span>
              <span>₹{cgst.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-[11px] text-zinc-500 pl-3">
              <span>SGST (9.0%):</span>
              <span>₹{sgst.toLocaleString('en-IN')}</span>
            </div>

            <div className="flex justify-between border-t border-border pt-2.5 text-zinc-200 font-black text-sm">
              <span>Grand Total Due:</span>
              <span className="text-primary">₹{grandTotal.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Action Panel */}
        <div className="border-t border-border pt-4 flex gap-3">
          <input
            type="text"
            placeholder="Apply Promo Code..."
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            className="flat-input flex-1 py-1.5 px-3 focus:outline-none"
          />
          
          {!isSettled ? (
            <Button
              onClick={handleSettle}
              variant="glow"
              size="sm"
              className="font-bold py-2 px-5 rounded-lg"
            >
              Settle Invoice
            </Button>
          ) : (
            <a 
              href={`http://localhost:5000/api/v1/pos/pdf/${invoiceNumber}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center font-bold rounded-lg transition-all duration-150 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed bg-slate-850 text-zinc-200 border border-border hover:bg-zinc-800 px-4 py-2 text-sm gap-2"
            >
              <Printer className="w-4 h-4" /> Download PDF Receipt
            </a>
          )}
        </div>
      </Card>

      {/* Payment QR Mock Panel */}
      <Card className="md:col-span-5 flex flex-col gap-4 text-center justify-center items-center relative overflow-hidden">
        
        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-2">Digital UPI Cashless checkout</span>
        
        {/* Flat mock QR */}
        <div className="w-38 h-38 border border-border bg-slate-900 rounded-xl p-3.5 flex flex-col justify-between items-center relative">
          <div className="w-full h-full border-2 border-zinc-700 bg-zinc-950 flex items-center justify-center relative">
            <QrCode className="w-26 h-26 text-zinc-400" />
            <div className="absolute w-5 h-5 bg-primary rounded-md border border-zinc-950 flex items-center justify-center font-black text-[9px] text-zinc-950 shadow-md">
              G
            </div>
          </div>
        </div>

        <div className="mt-3 text-xs leading-relaxed text-zinc-400">
          <p className="font-semibold text-zinc-300">Scan via BHIM UPI, GPay, PhonePe</p>
          <p className="text-[10px] text-zinc-500 mt-1">UPI ID: <b>glamouros@okhdfcbank</b></p>
          
          <div className="flex items-center gap-1.5 justify-center mt-3 bg-zinc-900 border border-border py-1 px-3.5 rounded-full scale-90">
            <CreditCard className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] font-bold text-zinc-300">UPI checkout payload loaded</span>
          </div>
        </div>

        {isSettled && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-full bg-success/20 border border-success flex items-center justify-center">
              <CheckCircleIcon className="w-6 h-6 text-success" />
            </div>
            <h4 className="text-sm font-bold text-success uppercase tracking-wider">Invoice Settled!</h4>
            <p className="text-[11px] text-zinc-500 max-w-[180px] leading-relaxed">
              UPI receipt parsed. Commission credited to Stylist daily ledger.
            </p>
          </div>
        )}
      </Card>

    </div>
  )
}

const CheckCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
)

export default BillingPOS

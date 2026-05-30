"use client"

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Sparkles, Printer, User, Calendar, MapPin, QrCode, Shield, CheckCircle, ArrowLeft } from 'lucide-react'
import { useMainStore } from '../../../store/mainStore'

interface InvoiceDetails {
  id: string
  customerName: string
  phone: string
  serviceName: string
  branchName: string
  bookingDate: string
  bookingTime: string
  price: number
  tier: string
  discount: number
  tax: number
  total: number
  stylistName: string
}

export default function InvoicePortal() {
  const params = useParams()
  const router = useRouter()
  const { branches, services, stylists } = useMainStore()
  const [invoice, setInvoice] = useState<InvoiceDetails | null>(null)

  useEffect(() => {
    const id = params?.id as string
    if (!id) return

    // Simulate fetching booking details from local storage or memory
    // Let's seed realistic pricing calculations matching our customer schemas!
    const mockServices = [
      { name: 'Haircut & Styling', price: 900 },
      { name: 'Facial & Tan Removal', price: 1800 },
      { name: 'Detox Hair Spa', price: 1500 },
      { name: 'Premium Beard Styling', price: 600 }
    ]

    // Default seed fallback
    const matchedService = mockServices.find(s => id.includes('78601')) || mockServices[0]
    const serviceName = id.includes('78602') ? 'Facial & Tan Removal' : 'Haircut & Styling & Detox Hair Spa'
    const basePrice = id.includes('78602') ? 1800 : 2400 // including spa addon
    const customerName = id.includes('78602') ? 'Deepika Padukone' : 'Virat Kohli'
    const tier = id.includes('78602') ? 'Gold' : 'Platinum'
    const discountPercent = tier === 'Platinum' ? 20 : 15
    const discountAmount = Math.round(basePrice * (discountPercent / 100))
    const subtotal = basePrice - discountAmount
    const gstTax = Math.round(subtotal * 0.18)
    const finalTotal = subtotal + gstTax

    setInvoice({
      id: id,
      customerName: customerName,
      phone: id.includes('78602') ? '+91 98765 43210' : '+91 98888 77777',
      serviceName: serviceName,
      branchName: id.includes('78602') ? 'GlamourOS Jubilee Hills' : 'GlamourOS Madhapur',
      bookingDate: id.includes('78602') ? '2026-05-24' : '2026-06-02',
      bookingTime: id.includes('78602') ? '15:30' : '11:00',
      price: basePrice,
      tier: tier,
      discount: discountAmount,
      tax: gstTax,
      total: finalTotal,
      stylistName: id.includes('78602') ? 'Priya Sharma (Senior Stylist)' : 'Rahul Verma (Master Stylist)'
    })
  }, [params])

  if (!invoice) {
    return (
      <div className="min-h-screen bg-[#08080a] text-zinc-400 text-xs flex items-center justify-center italic">
        Loading Dynamic Tax Invoice Pass...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#08080a] text-zinc-200 font-sans p-6 pb-20 flex flex-col items-center justify-center print:bg-white print:text-zinc-950 print:p-0">
      
      {/* Floating Interactive Action Bar (Hidden when printing) */}
      <div className="w-full max-w-2xl flex justify-between items-center mb-6 print:hidden">
        <button 
          onClick={() => router.back()}
          className="text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-200 transition-all flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Hub
        </button>

        <button 
          onClick={() => window.print()}
          className="bg-[#7F77DD] text-zinc-950 hover:bg-[#9089e6] font-black text-xs uppercase tracking-widest px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-[#7F77DD]/10 transition-all"
        >
          <Printer className="w-4 h-4 text-zinc-950" />
          Print / Save PDF
        </button>
      </div>

      {/* Corporate Tax Invoice Card Sheet */}
      <div className="w-full max-w-2xl bg-[#0c0c0f] border border-zinc-900 rounded-3xl p-8 shadow-2xl relative overflow-hidden print:border-none print:shadow-none print:bg-white print:p-0 print:text-zinc-950">
        
        {/* Decorative branding bar (Hidden on print) */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#7F77DD] to-indigo-600 print:hidden" />

        {/* Corporate Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-zinc-900/60 pb-6 print:border-zinc-300">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#7F77DD] to-indigo-600 flex items-center justify-center shadow print:hidden">
                <Sparkles className="w-4.5 h-4.5 text-zinc-950 fill-zinc-950" />
              </div>
              <h1 className="text-base font-black uppercase tracking-widest text-zinc-100 print:text-zinc-950">GlamourOS Pvt Ltd</h1>
            </div>
            <p className="text-[9px] text-zinc-500 font-sans mt-2 leading-relaxed print:text-zinc-650">
              Corporate Office: Suite 404, Cyber Towers, Madhapur, Hyderabad, IN<br />
              GSTIN Registration Number: 36AAAAA1111A1Z9 (SAC Code: 999721)
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[10px] font-black uppercase text-[#7F77DD] tracking-widest block">Tax Invoice / Check-in Pass</span>
            <span className="text-xs font-mono font-black text-zinc-300 mt-1 block print:text-zinc-950">#{invoice.id}</span>
            <span className="text-[9px] text-zinc-500 font-semibold block mt-1">Generated: {new Date().toISOString().split('T')[0]}</span>
          </div>
        </div>

        {/* Invoice Info Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6 border-b border-zinc-900/60 print:border-zinc-300">
          <div>
            <h4 className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-2 print:text-zinc-650">Billed Customer</h4>
            <div className="flex flex-col gap-1 text-xs">
              <span className="font-extrabold text-zinc-200 flex items-center gap-1.5 print:text-zinc-950">
                <User className="w-3.5 h-3.5 text-[#7F77DD] print:hidden" /> {invoice.customerName}
              </span>
              <span className="text-zinc-400 font-mono print:text-zinc-650">{invoice.phone}</span>
              <span className="text-[8px] font-black uppercase text-[#7F77DD] tracking-wider mt-1 flex items-center gap-1">
                <Shield className="w-3 h-3 text-[#7F77DD] print:hidden" /> {invoice.tier} VVIP Elite Tier
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-2 print:text-zinc-650">Salon Booking Details</h4>
            <div className="flex flex-col gap-1 text-xs">
              <span className="font-extrabold text-zinc-200 flex items-center gap-1.5 print:text-zinc-950">
                <MapPin className="w-3.5 h-3.5 text-[#7F77DD] print:hidden" /> {invoice.branchName}
              </span>
              <span className="text-zinc-400 flex items-center gap-1.5 print:text-zinc-650">
                <Calendar className="w-3.5 h-3.5 text-zinc-600 print:hidden" /> {invoice.bookingDate} @ {invoice.bookingTime}
              </span>
              <span className="text-zinc-500 print:text-zinc-650">Stylist: {invoice.stylistName}</span>
            </div>
          </div>
        </div>

        {/* Itemized Service Table */}
        <div className="py-6 border-b border-zinc-900/60 print:border-zinc-300">
          <h4 className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-3 print:text-zinc-650">Itemized Services Ledger</h4>
          
          <div className="flex flex-col gap-3 text-xs">
            <div className="flex justify-between items-center border-b border-zinc-950 pb-2 print:border-zinc-100">
              <div>
                <span className="font-bold text-zinc-200 print:text-zinc-950">{invoice.serviceName}</span>
                <span className="text-[8.5px] text-zinc-550 block font-sans mt-0.5 print:text-zinc-650">Includes complimentary post-treatment styling wash</span>
              </div>
              <span className="font-mono text-zinc-300 print:text-zinc-950">₹{invoice.price}</span>
            </div>

            <div className="flex justify-between text-zinc-400 print:text-zinc-650">
              <span>VVIP {invoice.tier} Membership Discount:</span>
              <span className="font-mono text-rose-450 font-bold">-₹{invoice.discount}</span>
            </div>

            <div className="flex justify-between text-zinc-400 border-t border-zinc-950 pt-2 print:border-zinc-100 print:text-zinc-650">
              <span>Subtotal:</span>
              <span className="font-mono text-zinc-300 print:text-zinc-950">₹{invoice.price - invoice.discount}</span>
            </div>

            <div className="flex justify-between text-zinc-400 print:text-zinc-650">
              <span>CGST Splitting (9%):</span>
              <span className="font-mono">₹{Math.round(invoice.tax / 2)}</span>
            </div>

            <div className="flex justify-between text-zinc-400 print:text-zinc-650">
              <span>SGST Splitting (9%):</span>
              <span className="font-mono">₹{Math.round(invoice.tax / 2)}</span>
            </div>

            <div className="flex justify-between border-t border-zinc-900 pt-3 text-sm font-black print:border-zinc-300">
              <span className="text-zinc-300 print:text-zinc-950 uppercase tracking-wider">Total Net Payable (Rounded):</span>
              <span className="font-mono text-[#7F77DD] text-base print:text-zinc-950">₹{invoice.total}</span>
            </div>
          </div>
        </div>

        {/* Dynamic QR check-in & verification pass */}
        <div className="pt-6 flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2.5 rounded-2xl shadow shadow-black/50 shrink-0">
              <QrCode className="w-16 h-16 text-zinc-950" />
            </div>
            <div>
              <span className="text-[9px] font-black text-zinc-550 uppercase tracking-widest block">Digital Check-in Pass</span>
              <p className="text-[10px] text-zinc-450 leading-relaxed max-w-sm mt-1 print:text-zinc-650">
                Present this VVIP QR pass code at the branch desk. Our terminal matches your checkout records to process cashless wallet settlement instantly.
              </p>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/25 px-3 py-1.5 rounded-full text-emerald-400 text-[8px] font-black uppercase tracking-wider print:border-zinc-300 print:text-zinc-950">
            <CheckCircle className="w-3.5 h-3.5" /> Booked Confirmed
          </div>
        </div>

        {/* Terms footer */}
        <div className="mt-8 pt-6 border-t border-zinc-900/60 text-center text-[7.5px] text-zinc-600 font-sans tracking-wide leading-relaxed print:border-zinc-300 print:text-zinc-600">
          This is a computer-generated dynamic tax invoice issued under Rule 46 of the CGST Rules, 2017.<br />
          No physical signature is required. Thank you for choosing GlamourOS.
        </div>

      </div>

    </div>
  )
}

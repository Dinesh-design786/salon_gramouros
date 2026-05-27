"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useMainStore } from '../../store/mainStore'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { 
  Sparkles, Calendar, MessageSquare, Receipt, Package, Users, 
  MapPin, ChevronRight, CheckCircle, ArrowRight, Gift, Heart, QrCode, LogOut
} from 'lucide-react'

export default function CustomerBookingPage() {
  const router = useRouter()
  const {
    user,
    isAuthenticated,
    branches,
    services,
    stylists,
    createAppointment,
    addNotification,
    logout
  } = useMainStore()

  // Guard routing
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    } else if (user?.role !== 'customer') {
      router.push('/login')
    }
  }, [isAuthenticated, user, router])

  // Customer Booking States
  const [scratched, setScratched] = useState(false)
  const [couponCode, setCouponCode] = useState('')
  const [bookingBranchId, setBookingBranchId] = useState('b1000000-0000-0000-0000-000000000001')
  const [bookingServiceId, setBookingServiceId] = useState('ser1')
  const [bookingStylistId, setBookingStylistId] = useState('st100000-0000-0000-0000-000000000001')
  const [bookingDate, setBookingDate] = useState('2026-05-28')
  const [bookingTime, setBookingTime] = useState('15:30')
  const [reservationPass, setReservationPass] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isAuthenticated || user?.role !== 'customer') {
    return <div className="min-h-screen bg-[#0B0A09] flex items-center justify-center text-zinc-400 font-sans">Checking credentials...</div>
  }

  const activeBranch = branches.find(b => b.id === bookingBranchId) || branches[0]
  const activeService = services.find(s => s.id === bookingServiceId) || services[0]
  const activeStylist = stylists.find(s => s.id === bookingStylistId) || stylists[0]

  // Dynamic pricing calculations
  const originalPrice = activeService?.price || 1500
  let tierDiscountPercent = 0
  
  // Custom loyalty tier levels based on user name/email seeds
  const userName = user?.name || 'Guest Client'
  const isPlatinum = userName.includes('Virat') || userName.includes('Admin')
  const isGold = userName.includes('Deepika') || userName.includes('Guest')
  const calculatedTier = isPlatinum ? 'Platinum' : isGold ? 'Gold' : 'Silver'
  
  if (calculatedTier === 'Silver') tierDiscountPercent = 10
  else if (calculatedTier === 'Gold') tierDiscountPercent = 15
  else if (calculatedTier === 'Platinum') tierDiscountPercent = 20
  
  // Happy hour discount if branch occupancy load is low
  const isBanjaraLowLoad = bookingBranchId === 'b1000000-0000-0000-0000-000000000001'
  const dynamicDiscountPercent = isBanjaraLowLoad ? 15 : 0
  
  const discountTotal = Math.round(originalPrice * ((tierDiscountPercent + dynamicDiscountPercent) / 100))
  const tax = Math.round((originalPrice - discountTotal) * 0.18)
  const totalDue = originalPrice - discountTotal + tax

  const handleCustomerBook = async () => {
    setIsSubmitting(true)
    try {
      const appt = await createAppointment({
        customer_id: user?.phone || '+91 98765 43210',
        branch_id: bookingBranchId,
        stylist_id: bookingStylistId,
        date: bookingDate,
        time: bookingTime,
        duration: activeService?.duration || 60,
        base_price: activeService?.price || 1500,
        source: 'Website',
        notes: `Customer Booking Portal: ${user?.name} (${calculatedTier})`
      })

      setReservationPass({
        apptId: appt?.id || 'ap_' + Math.random().toString(36).substring(2, 9),
        customerName: user?.name || 'VVIP Customer',
        branchName: activeBranch?.name || 'Hyderabad Core Chain',
        serviceName: activeService?.name || 'Custom Hair Sculpt',
        stylistName: activeStylist?.name || 'Master Barber',
        dateTime: `${bookingDate} @ ${bookingTime}`,
        totalPaid: totalDue
      })
      addNotification(`Luxe Booking: Confirmed styling pass for ${user?.name}!`, 'success')
    } catch (err) {
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSignOut = () => {
    logout()
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-[#0B0A09] text-zinc-100 font-sans relative overflow-hidden flex flex-col justify-between">
      
      {/* Decorative radial gradients for high-fidelity look */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[#C5A880]/5 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-15%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#C5A880]/5 blur-[120px] pointer-events-none" />

      {/* Luxury Header */}
      <header className="max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between relative z-10">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#C5A880] flex items-center justify-center shadow-md shadow-[#C5A880]/20">
            <Sparkles className="w-5.5 h-5.5 text-white" />
          </div>
          <div>
            <h1 className="font-heading font-black text-lg tracking-tight text-white">
              GlamourOS
            </h1>
            <p className="text-[10px] text-[#C5A880] font-bold uppercase tracking-wider">Luxe Salon & Spa</p>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-zinc-450 hidden sm:inline">
            Hello, <span className="text-[#C5A880]">{user?.name}</span>
          </span>
          <Button 
            onClick={handleSignOut}
            variant="outline" 
            size="sm" 
            className="h-9 text-xs rounded-xl font-bold border-[#222120] text-rose-450 hover:text-rose-400 hover:bg-rose-950/20 bg-zinc-900/50 gap-1"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </Button>
        </div>
      </header>

      {/* Main Reservation Space */}
      <main className="relative z-10 flex-1 max-w-6xl mx-auto w-full px-6 py-8">
        
        <div className="text-center mb-8">
          <Badge variant="primary" className="px-3.5 py-1 text-[9px] font-black rounded-full mb-3 uppercase tracking-widest bg-[#C5A880]/10 border-[#C5A880]/25 text-[#C5A880]">
            💎 GlamourOS Luxe Reservations Hub
          </Badge>
          <h2 className="font-heading font-black text-3xl sm:text-4xl text-white leading-tight">Customize Your Styling Experience</h2>
          <p className="text-xs text-zinc-400 max-w-lg mx-auto mt-2 font-medium">
            Tailor your treatment schedule with Hyderabad's finest. Apply dynamic low-occupancy discounts and VVIP loyalty points seamlessly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column Form */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* VVIP Loyalty Details */}
            <Card className="p-6 bg-[#151413] border border-[#222120] rounded-3xl shadow-2xl shadow-black/80">
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center pb-3 border-b border-[#222120]">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Luxe Loyalty Profile Active</span>
                  </div>
                  <span className="text-[10px] text-zinc-400 font-bold uppercase">Member ID: {user?.id?.substring(0,8) || 'ELITE_USR'}</span>
                </div>

                {/* Glowing Member Card */}
                <div className={`p-5 rounded-2xl border relative overflow-hidden flex flex-col justify-between h-[140px] shadow-md ${
                  calculatedTier === 'Platinum' 
                    ? 'bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-950 border-zinc-700 text-white shadow-zinc-900/10' 
                    : 'bg-gradient-to-br from-[#E8DCC4] via-[#F3EFE6] to-white border-[#C5A880]/30 text-zinc-800 shadow-[#C5A880]/5'
                }`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <span className={`text-[8px] font-black uppercase tracking-widest block ${calculatedTier === 'Platinum' ? 'text-zinc-450' : 'text-[#A68A64]'}`}>
                        GlamourOS Elite Pass
                      </span>
                      <h4 className="text-base font-heading font-black tracking-tight mt-1">{user?.name}</h4>
                    </div>
                    <Badge variant={calculatedTier === 'Platinum' ? 'primary' : 'gold'} className="scale-90 font-bold tracking-widest text-[9px]">
                      {calculatedTier.toUpperCase()} MEMBER
                    </Badge>
                  </div>

                  <div className="flex justify-between items-end mt-2">
                    <div>
                      <span className={`text-[8px] block uppercase font-bold ${calculatedTier === 'Platinum' ? 'text-zinc-500' : 'text-zinc-400'}`}>Phone Link</span>
                      <span className="text-[11px] font-mono font-bold">{user?.phone || '+91 98888 77777'}</span>
                    </div>
                    <div className="text-right">
                      <span className={`text-[8px] block uppercase font-bold ${calculatedTier === 'Platinum' ? 'text-zinc-500' : 'text-zinc-400'}`}>Active Balance</span>
                      <span className={`text-xs font-black font-heading ${calculatedTier === 'Platinum' ? 'text-[#C5A880]' : 'text-zinc-900'}`}>
                        {calculatedTier === 'Platinum' ? '1,450 XP' : '850 XP'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Scratchcard reward */}
                <div className="bg-[#0B0A09] border border-[#222120] rounded-2xl p-4 text-center mt-1">
                  <span className="text-[9px] text-[#C5A880] font-black uppercase tracking-widest block mb-2">🎁 Member Daily Scratchcard Reward</span>
                  
                  {!scratched ? (
                    <button
                      onClick={() => {
                        setScratched(true)
                        const code = calculatedTier === 'Platinum' ? 'GLAMPLAT20' : 'GLAMGOLD15'
                        setCouponCode(code)
                      }}
                      className="w-full bg-zinc-900 hover:bg-[#151413] border border-dashed border-[#C5A880] rounded-xl p-3 text-xs text-[#C5A880] font-extrabold uppercase tracking-wider transition-all hover:scale-[1.01] shadow-sm shadow-[#C5A880]/5"
                    >
                      🖱️ Click to Scratch and Reveal Coupon
                    </button>
                  ) : (
                    <div className="bg-emerald-950/20 border border-emerald-900/40 rounded-xl p-2.5 animate-fadeIn">
                      <span className="text-[8px] text-emerald-400 font-bold uppercase block tracking-wider">Coupon Code Unlocked!</span>
                      <span className="text-xs font-mono font-black text-zinc-200 block tracking-widest mt-0.5">{couponCode}</span>
                      <span className="text-[8px] text-zinc-400 block mt-0.5">Complementary Moroccan Argan conditioning spray added to checkout pass!</span>
                    </div>
                  )}
                </div>

              </div>
            </Card>

            {/* Customizer */}
            <Card className="p-6 bg-[#151413] border border-[#222120] rounded-3xl shadow-2xl shadow-black/80 flex flex-col gap-4">
              <h3 className="font-bold text-white text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5 font-heading">
                <Heart className="w-4 h-4 text-[#C5A880]" />
                Step 2: Customize Booking Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] text-zinc-400 block font-bold mb-1.5 uppercase">Select Branch Location</label>
                  <select 
                    value={bookingBranchId}
                    onChange={(e) => setBookingBranchId(e.target.value)}
                    className="w-full bg-[#0B0A09] border border-[#222120] rounded-xl px-3 py-2.5 text-xs text-zinc-200 outline-none focus:border-[#C5A880]"
                  >
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[9px] text-zinc-400 block font-bold mb-1.5 uppercase">Select Treatment</label>
                  <select 
                    value={bookingServiceId}
                    onChange={(e) => setBookingServiceId(e.target.value)}
                    className="w-full bg-[#0B0A09] border border-[#222120] rounded-xl px-3 py-2.5 text-xs text-zinc-200 outline-none focus:border-[#C5A880]"
                  >
                    {services.map(s => (
                      <option key={s.id} value={s.id}>{s.name} (₹{s.price})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] text-zinc-400 block font-bold mb-1.5 uppercase">Preferred Stylist Coordinator</label>
                  <select 
                    value={bookingStylistId}
                    onChange={(e) => setBookingStylistId(e.target.value)}
                    className="w-full bg-[#0B0A09] border border-[#222120] rounded-xl px-3 py-2.5 text-xs text-zinc-200 outline-none focus:border-[#C5A880]"
                  >
                    {stylists.filter(s => s.branch_id === bookingBranchId).map(st => (
                      <option key={st.id} value={st.id}>{st.name} ({st.specialty})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[9px] text-zinc-400 block font-bold mb-1.5 uppercase">Date</label>
                    <input 
                      type="date"
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="w-full bg-[#0B0A09] border border-[#222120] rounded-xl px-2 py-2 text-[11px] text-zinc-200 outline-none focus:border-[#C5A880]"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] text-zinc-400 block font-bold mb-1.5 uppercase">Time Slot</label>
                    <input 
                      type="text"
                      value={bookingTime}
                      onChange={(e) => setBookingTime(e.target.value)}
                      className="w-full bg-[#0B0A09] border border-[#222120] rounded-xl px-2 py-2 text-[11px] text-zinc-200 outline-none focus:border-[#C5A880]"
                    />
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleCustomerBook} 
                variant="glow" 
                disabled={isSubmitting}
                className="w-full justify-center text-xs py-3.5 mt-2 rounded-xl font-extrabold bg-[#C5A880] text-white hover:bg-[#B3966E] shadow-lg shadow-[#C5A880]/15"
              >
                {isSubmitting ? 'Confirming Styling Slot...' : '⚡ Settle & Book Styling Slot'}
              </Button>
            </Card>

          </div>

          {/* Right Column invoice */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Dynamic Settle invoice */}
            <Card className="p-6 bg-[#151413] border border-[#222120] rounded-3xl flex flex-col justify-between min-h-[300px] shadow-2xl shadow-black/80 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-[#C5A880]/5 blur-xl pointer-events-none" />
              
              <div>
                <h3 className="font-bold text-zinc-400 text-[10px] uppercase tracking-wider mb-4 border-b border-[#222120] pb-2.5 font-heading">
                  Dynamic GST invoice ledger
                </h3>
                
                <div className="flex flex-col gap-3.5 text-xs text-zinc-300">
                  <div className="flex justify-between">
                    <span>Base Treatment Cost:</span>
                    <span className="text-zinc-200 font-semibold">₹{originalPrice}</span>
                  </div>
                  
                  {tierDiscountPercent > 0 && (
                    <div className="flex justify-between text-[#C5A880] font-bold">
                      <span>VVIP Loyalty Tier ({calculatedTier} - {tierDiscountPercent}%):</span>
                      <span>-₹{Math.round(originalPrice * (tierDiscountPercent / 100))}</span>
                    </div>
                  )}

                  {dynamicDiscountPercent > 0 && (
                    <div className="flex justify-between text-[#C5A880] font-bold">
                      <span>Occupancy Happy Hour (-15%):</span>
                      <span>-₹{Math.round(originalPrice * (dynamicDiscountPercent / 100))}</span>
                    </div>
                  )}

                  <div className="flex justify-between border-t border-[#222120] pt-3">
                    <span>Taxable Subtotal:</span>
                    <span className="text-zinc-200 font-bold">₹{originalPrice - discountTotal}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Indian GST splitting (SAC 999721 @ 18%):</span>
                    <span className="text-zinc-200">₹{tax}</span>
                  </div>

                  <div className="flex justify-between border-t border-[#222120] pt-3 text-sm">
                    <span className="text-zinc-100 font-black">Total Payable (Incl. Taxes):</span>
                    <span className="text-[#C5A880] font-black text-base">₹{totalDue}</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#0B0A09] border border-[#222120] rounded-xl p-3.5 mt-4 text-[10px] leading-relaxed text-zinc-450 font-medium">
                <span className="text-[8px] text-[#C5A880] font-black uppercase block mb-1">💡 Sandbox Integration Check</span>
                Once settled on the customer portal, open the **Admin Panel** and you will see the scheduling roster populate under **{activeStylist?.name || 'Stylist Coordinator'}** at **{activeBranch?.name || 'Hyderabad Location'}** in real-time!
              </div>
            </Card>

            {/* Confirmed pass */}
            {reservationPass && (
              <Card className="p-6 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-950 border border-zinc-700 rounded-3xl relative overflow-hidden shadow-2xl text-white">
                <div className="absolute top-[-10px] right-[-10px] w-14 h-14 bg-[#C5A880]/20 rounded-full blur-lg" />
                
                <div className="flex items-center gap-3 mb-4 border-b border-zinc-800 pb-3">
                  <div className="w-8 h-8 rounded-lg bg-[#C5A880]/15 border border-[#C5A880]/30 flex items-center justify-center shrink-0">
                    <CheckCircle className="w-5 h-5 text-[#C5A880]" />
                  </div>
                  <div>
                    <h4 className="font-heading font-black text-xs text-zinc-100 uppercase tracking-widest">Styling Pass Unlocked</h4>
                    <p className="text-[8px] text-zinc-500 font-mono tracking-wider font-extrabold">{reservationPass.apptId}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-2.5 text-xs text-zinc-300">
                  <div className="flex justify-between">
                    <span className="text-zinc-550">Luxe Client:</span>
                    <span className="font-bold text-zinc-200">{reservationPass.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-550">Treatment:</span>
                    <span className="text-zinc-250">{reservationPass.serviceName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-550">Specialist:</span>
                    <span className="text-zinc-250">{reservationPass.stylistName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-550">Schedule:</span>
                    <span className="font-extrabold text-[#C5A880]">{reservationPass.dateTime}</span>
                  </div>
                  <div className="flex justify-between border-t border-zinc-800 pt-2 text-zinc-200">
                    <span className="font-bold">Total Paid:</span>
                    <span className="font-black text-base text-[#C5A880]">₹{reservationPass.totalPaid}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between gap-3 bg-zinc-950 p-2.5 rounded-xl border border-zinc-900">
                  <div className="shrink-0 bg-white p-1 rounded-lg">
                    <QrCode className="w-10 h-10 text-zinc-950" />
                  </div>
                  <p className="text-[9px] text-zinc-500 leading-normal font-medium font-sans">
                    Show this dynamic QR check-in pass at the front-desk POS billing terminal to claim VVIP membership credits!
                  </p>
                </div>
              </Card>
            )}

          </div>

        </div>

      </main>

      {/* Copyright */}
      <footer className="border-t border-[#222120] py-6 text-center text-[10px] text-zinc-500 bg-[#0B0A09] relative z-10 mt-8">
        <p>© 2026 GlamourOS Retail. Secure Session Manager active.</p>
      </footer>
    </div>
  )
}

"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMainStore } from '../../store/mainStore'
import { useRouter } from 'next/navigation'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { 
  User, Calendar, Clock, Award, Shield, Wallet, Gift, 
  Share2, ShoppingBag, Brain, Trash2, Plus, Minus, CheckCircle, 
  MapPin, ClipboardList, Sparkles, AlertCircle, LogOut, ArrowLeftRight, CreditCard, ChevronRight
} from 'lucide-react'

export default function CustomerDashboard() {
  const router = useRouter()
  const { 
    user, 
    isAuthenticated, 
    logout, 
    appointments, 
    branches, 
    services,
    addNotification 
  } = useMainStore()

  // Routing security guard
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  // Active section tabs
  const [activeTab, setActiveTab] = useState<'appointments' | 'loyalty' | 'membership' | 'wallet' | 'giftcards' | 'referral' | 'store' | 'ai'>('appointments')

  // 1. My Appointments state
  const [customerBookings, setCustomerBookings] = useState<any[]>([])
  useEffect(() => {
    if (user) {
      // Seed realistic initial customer appointments
      const initial = [
        {
          id: 'apt-78601',
          serviceName: 'Haircut & Styling',
          branchName: 'GlamourOS Madhapur',
          bookingDate: '2026-06-02',
          bookingTime: '11:00',
          status: 'upcoming',
          price: 900
        },
        {
          id: 'apt-78602',
          serviceName: 'Facial & Tan Removal',
          branchName: 'GlamourOS Jubilee Hills',
          bookingDate: '2026-05-24',
          bookingTime: '15:30',
          status: 'completed',
          price: 1800
        }
      ]
      setCustomerBookings(initial)
    }
  }, [user])

  const handleCancelBooking = (id: string) => {
    setCustomerBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' } : b))
    addNotification('Appointment cancelled successfully.', 'success')
  }

  // 2. Loyalty State
  const [loyaltyPoints, setLoyaltyPoints] = useState(2450)
  const [pointsHistory, setPointsHistory] = useState([
    { reason: 'Welcome Signup Bonus', points: 500, date: '2026-05-15', type: 'earn' },
    { reason: 'Completed Facial booking', points: 180, date: '2026-05-24', type: 'earn' },
    { reason: 'Redeemed Hair Spa Coupon', points: -500, date: '2026-05-28', type: 'redeem' }
  ])

  const handleRedeemPoints = (points: number, rewardName: string) => {
    if (loyaltyPoints >= points) {
      setLoyaltyPoints(prev => prev - points)
      setPointsHistory(prev => [
        { reason: `Redeemed ${rewardName}`, points: -points, date: new Date().toISOString().split('T')[0], type: 'redeem' },
        ...prev
      ])
      addNotification(`Successfully redeemed reward: ${rewardName}! Coupon added to profile.`, 'success')
    } else {
      addNotification('Insufficient loyalty points!', 'warning')
    }
  }

  // 3. Membership State
  const [currentTier, setCurrentTier] = useState<'Silver' | 'Gold' | 'Platinum' | 'VIP'>('Gold')
  const handleUpgradeMembership = (targetTier: 'Silver' | 'Gold' | 'Platinum' | 'VIP') => {
    setCurrentTier(targetTier)
    addNotification(`Congratulations! Upgraded successfully to GlamourOS ${targetTier} membership.`, 'success')
  }

  // 4. Digital Wallet state
  const [walletBalance, setWalletBalance] = useState(3500)
  const [rewardCredits, setRewardCredits] = useState(450)
  const [refundCredits, setRefundCredits] = useState(0)

  const handleAddWalletFunds = (amount: number) => {
    setWalletBalance(prev => prev + amount)
    addNotification(`Successfully loaded ₹${amount} into your Digital Wallet!`, 'success')
  }

  // 5. Gift Cards State
  const [giftCards, setGiftCards] = useState([
    { code: 'GIFT-GLAM-99', value: 2000, status: 'active' }
  ])
  const [claimCode, setClaimCode] = useState('')

  const handleBuyGiftCard = (value: number) => {
    if (walletBalance >= value) {
      setWalletBalance(prev => prev - value)
      const newCode = `GIFT-GLAM-${Math.floor(10 + Math.random() * 90)}`
      setGiftCards(prev => [...prev, { code: newCode, value, status: 'active' }])
      addNotification(`Gift Card worth ₹${value} purchased successfully! Code: ${newCode}`, 'success')
    } else {
      addNotification('Insufficient digital wallet balance to buy gift card.', 'warning')
    }
  }

  const handleRedeemGiftCard = (code: string) => {
    const found = giftCards.find(c => c.code === code && c.status === 'active')
    if (found) {
      setGiftCards(prev => prev.map(c => c.code === code ? { ...c, status: 'redeemed' } : c))
      setWalletBalance(prev => prev + found.value)
      addNotification(`₹${found.value} added to wallet from Gift Card: ${code}`, 'success')
      setClaimCode('')
    } else {
      addNotification('Invalid or already redeemed Gift Card code!', 'warning')
    }
  }

  // 6. Referral State
  const referralLink = `https://glamouros.app/ref/${user?.name?.toLowerCase().replace(/\s+/g, '') || 'dinesh786'}`
  const [referralCount, setReferralCount] = useState(3)

  // 7. Product Store State
  const [cart, setCart] = useState<{ id: string; name: string; price: number; quantity: number }[]>([])
  const storeProducts = [
    { id: 'p1', name: 'L\'Oreal Professional Shampoo', category: 'Hair Care', price: 850, stock: 12, rating: 4.8, img: '🧴' },
    { id: 'p2', name: 'Kerastase Nutritive Hair Serum', category: 'Premium Styling', price: 2200, stock: 8, rating: 4.9, img: '💧' },
    { id: 'p3', name: 'Hydrating Face Glow Cleanser', category: 'Skin Care', price: 1100, stock: 15, rating: 4.7, img: '🧼' },
    { id: 'p4', name: 'Premium Argan Oil Mask', category: 'Treatments', price: 1750, stock: 5, rating: 4.9, img: '🍯' }
  ]

  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id)
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
      }
      return [...prev, { id: product.id, name: product.name, price: product.price, quantity: 1 }]
    })
    addNotification(`${product.name} added to cart!`, 'success')
  }

  const updateCartQuantity = (id: string, amount: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const nextQty = item.quantity + amount
        return nextQty > 0 ? { ...item, quantity: nextQty } : null
      }
      return item
    }).filter(Boolean) as any)
  }

  const handleCheckoutProducts = () => {
    const total = cart.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0)
    if (walletBalance >= total) {
      setWalletBalance(prev => prev - total)
      setCart([])
      addNotification(`Order placed successfully! ₹${total} paid from wallet.`, 'success')
    } else {
      addNotification('Insufficient wallet balance to checkout.', 'warning')
    }
  }

  if (!user) {
    return <div className="min-h-screen bg-[#08080a] text-zinc-550 text-xs flex items-center justify-center italic">Loading Secure Dashboard Session...</div>
  }

  return (
    <div className="min-h-screen bg-[#08080a] text-zinc-200 font-sans pb-16">
      
      {/* Premium Header */}
      <header className="border-b border-zinc-900 bg-[#0c0c0f]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4.5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#7F77DD] to-indigo-600 flex items-center justify-center shadow-lg shadow-[#7F77DD]/20">
              <Sparkles className="w-5.5 h-5.5 text-zinc-950 fill-zinc-950" />
            </div>
            <div>
              <h1 className="text-sm font-black text-zinc-100 uppercase tracking-widest flex items-center gap-1.5">
                GlamourOS <span className="text-[9px] text-[#7F77DD] font-bold border border-[#7F77DD]/35 px-2 py-0.5 rounded-full">VVIP Client Portal</span>
              </h1>
              <p className="text-[9px] text-zinc-500 uppercase tracking-wider font-semibold mt-0.5">Welcome Back, {user.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Wallet quick balance pill */}
            <div className="bg-[#111014] border border-zinc-850 px-3.5 py-1.5 rounded-full flex items-center gap-2 text-xs">
              <Wallet className="w-4 h-4 text-[#7F77DD]" />
              <span className="font-mono font-black text-zinc-200">₹{walletBalance}</span>
            </div>

            {/* Logout */}
            <button 
              onClick={() => {
                logout()
                router.push('/login')
              }}
              className="p-2.5 rounded-xl bg-zinc-900/50 border border-zinc-850 text-zinc-400 hover:text-rose-400 transition-all hover:bg-rose-950/20"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Grid Workspace */}
      <main className="max-w-7xl mx-auto px-6 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Navigation Sidebar Panel */}
        <section className="lg:col-span-3 flex flex-col gap-2 shrink-0">
          
          <button 
            onClick={() => router.push('/booking')}
            className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-gradient-to-r from-[#C5A880] to-[#E9DFCE] text-zinc-950 text-xs font-black uppercase tracking-widest hover:brightness-105 transition-all shadow-lg shadow-[#C5A880]/10 mb-4"
          >
            <Calendar className="w-4 h-4 text-zinc-950" />
            Book Appointment
          </button>

          <span className="text-[9px] font-black text-zinc-550 uppercase tracking-widest px-3 mb-1">Engagement Core</span>
          {[
            { id: 'appointments', label: 'My Appointments', icon: ClipboardList, badge: customerBookings.filter(b => b.status === 'upcoming').length.toString() },
            { id: 'loyalty', label: 'Loyalty & Rewards', icon: Award, suffix: `${loyaltyPoints} pts` },
            { id: 'membership', label: 'Membership Plan', icon: Shield, suffix: currentTier },
            { id: 'wallet', label: 'Digital Wallet', icon: Wallet, suffix: `₹${walletBalance}` },
            { id: 'giftcards', label: 'Gift Vouchers', icon: Gift },
            { id: 'referral', label: 'Referral Rewards', icon: Share2 },
            { id: 'store', label: 'Product Store', icon: ShoppingBag, badge: cart.length > 0 ? cart.length.toString() : undefined },
            { id: 'ai', label: 'AI Recommendations', icon: Brain, highlight: true }
          ].map(tab => {
            const Icon = tab.icon
            const active = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl border text-xs font-bold transition-all ${
                  active 
                    ? 'bg-[#7F77DD]/10 border-[#7F77DD]/35 text-[#7F77DD]' 
                    : tab.highlight 
                      ? 'bg-amber-500/5 border-amber-500/20 text-amber-500 hover:bg-amber-500/10' 
                      : 'bg-[#111014]/50 border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-[#111014]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4.5 h-4.5 ${active ? 'text-[#7F77DD]' : tab.highlight ? 'text-amber-500' : 'text-zinc-500'}`} />
                  {tab.label}
                </div>
                {tab.badge && (
                  <Badge className="bg-[#7F77DD]/20 border border-[#7F77DD]/40 text-[#7F77DD] text-[8px] font-black rounded-full px-2 py-0.5">
                    {tab.badge}
                  </Badge>
                )}
                {tab.suffix && (
                  <span className={`text-[9px] uppercase font-black tracking-wider ${active ? 'text-[#7F77DD]' : 'text-zinc-500'}`}>
                    {tab.suffix}
                  </span>
                )}
              </button>
            )
          })}
        </section>

        {/* Dynamic Display Panel */}
        <section className="lg:col-span-9">
          <AnimatePresence mode="wait">
            
            {/* 1. MY APPOINTMENTS */}
            {activeTab === 'appointments' && (
              <motion.div key="appointments" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col gap-6">
                <div>
                  <h2 className="text-lg font-black text-zinc-100 uppercase tracking-wider">My Booked Treatments</h2>
                  <p className="text-[10px] text-zinc-500 font-sans mt-0.5">Audit upcoming salon sessions or manage history invoices.</p>
                </div>

                <div className="flex flex-col gap-4">
                  {customerBookings.map(b => (
                    <Card key={b.id} className="p-5 bg-[#111014]/65 border border-zinc-850 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
                          <Calendar className="w-4.5 h-4.5 text-[#7F77DD]" />
                        </div>
                        <div>
                          <span className="text-[9px] text-[#7F77DD] font-black uppercase tracking-wider">{b.id}</span>
                          <h4 className="text-sm font-black text-zinc-200 mt-0.5">{b.serviceName}</h4>
                          <div className="flex items-center gap-2 mt-1 text-[10px] text-zinc-500 font-sans">
                            <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-zinc-650" /> {b.branchName}</span>
                            <span>·</span>
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-zinc-650" /> {b.bookingDate} @ {b.bookingTime}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
                        <div className="text-right sm:mr-3">
                          <span className="text-[9px] text-zinc-550 block font-bold uppercase tracking-wider">Session Price</span>
                          <span className="text-xs font-mono font-black text-zinc-300">₹{b.price}</span>
                        </div>

                        {b.status === 'upcoming' ? (
                          <div className="flex gap-2">
                            <Button 
                              onClick={() => handleCancelBooking(b.id)}
                              variant="outline" 
                              className="border-rose-950 text-rose-450 hover:bg-rose-950/20 text-[9px] font-black uppercase px-3 py-1.5"
                            >
                              Cancel
                            </Button>
                            <Badge className="bg-[#7F77DD]/10 border border-[#7F77DD]/35 text-[#7F77DD] text-[8px] font-black px-2.5 py-1 rounded-full uppercase">
                              Upcoming
                            </Badge>
                          </div>
                        ) : b.status === 'completed' ? (
                          <div className="flex items-center gap-2">
                            <Button 
                              onClick={() => window.open(`/invoice/${b.id}`, '_blank')}
                              className="bg-[#7F77DD] text-zinc-950 hover:bg-[#9089e6] font-black text-[9px] uppercase px-3 py-1.5"
                            >
                              Download Invoice
                            </Button>
                            <Badge className="bg-emerald-500/10 border border-emerald-500/35 text-emerald-400 text-[8px] font-black px-2.5 py-1 rounded-full uppercase">
                              Completed
                            </Badge>
                          </div>
                        ) : (
                          <Badge className="bg-zinc-900 border border-zinc-800 text-zinc-500 text-[8px] font-black px-2.5 py-1 rounded-full uppercase">
                            Cancelled
                          </Badge>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </motion.div>
            )}

            {/* 2. LOYALTY POINTS */}
            {activeTab === 'loyalty' && (
              <motion.div key="loyalty" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col gap-6">
                <div>
                  <h2 className="text-lg font-black text-zinc-100 uppercase tracking-wider">Loyalty &amp; Rewards Ledger</h2>
                  <p className="text-[10px] text-zinc-500 font-sans mt-0.5">Redeem earned points for complimentary treatments or premium product discounts.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-[#111014]/65 border border-zinc-850 p-5 flex flex-col justify-between min-h-[110px]">
                    <span className="text-[9px] text-zinc-500 font-black uppercase tracking-wider">Current Points Balance</span>
                    <h3 className="text-3xl font-black text-[#7F77DD] font-mono mt-2">{loyaltyPoints}</h3>
                    <span className="text-[8px] text-zinc-550 uppercase font-semibold mt-1">₹1 = 1 point formula active</span>
                  </Card>
                  
                  <Card className="bg-[#111014]/65 border border-zinc-850 p-5 flex flex-col justify-between min-h-[110px]">
                    <span className="text-[9px] text-zinc-550 font-black uppercase tracking-wider">Lifetime Points Earned</span>
                    <h3 className="text-2xl font-black text-zinc-200 mt-2">4,850</h3>
                    <span className="text-[8px] text-emerald-400 uppercase font-semibold mt-1">VVIP Tier Modifier +15% Active</span>
                  </Card>

                  <Card className="bg-[#111014]/65 border border-[#7F77DD]/25 p-5 flex flex-col justify-between min-h-[110px] bg-gradient-to-tr from-[#7F77DD]/5 to-transparent">
                    <span className="text-[9px] text-[#7F77DD] font-black uppercase tracking-wider">Suggested Reward</span>
                    <h3 className="text-sm font-black text-zinc-200 mt-2 truncate">Free Hair Spa Treatment</h3>
                    <button 
                      onClick={() => handleRedeemPoints(1000, 'Free Hair Spa Treatment')}
                      className="text-[9px] font-black text-[#7F77DD] uppercase tracking-widest text-left mt-2 flex items-center gap-1 hover:text-[#9089e6]"
                    >
                      Redeem 1000 Pts <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </Card>
                </div>

                {/* Redeem Catalog */}
                <div className="mt-4 flex flex-col gap-3">
                  <h3 className="text-xs font-black text-zinc-300 uppercase tracking-widest">Redemption Catalog</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { name: 'Complimentary Styling Wash', points: 400, desc: 'L\'Oreal professional wash and blowout styling.' },
                      { name: '₹500 Store Gift Coupon', points: 600, desc: 'Redeemable on Kerastase or L\'Oreal products store.' },
                      { name: 'Full Keratin Therapy Upgrade', points: 1500, desc: 'Complete premium protein treatment restructure.' }
                    ].map(reward => (
                      <Card key={reward.name} className="p-4.5 bg-[#111014]/40 border border-zinc-850 flex justify-between items-center gap-3">
                        <div>
                          <h4 className="text-xs font-bold text-zinc-200">{reward.name}</h4>
                          <p className="text-[9px] text-zinc-550 leading-normal mt-0.5">{reward.desc}</p>
                        </div>
                        <Button 
                          onClick={() => handleRedeemPoints(reward.points, reward.name)}
                          disabled={loyaltyPoints < reward.points}
                          className="bg-[#7F77DD] text-zinc-950 hover:bg-[#9089e6] font-black text-[9px] uppercase px-3 py-1.5 shrink-0"
                        >
                          {reward.points} Pts
                        </Button>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Ledger History */}
                <div className="mt-4 flex flex-col gap-3">
                  <h3 className="text-xs font-black text-zinc-300 uppercase tracking-widest">Points Ledger Audits</h3>
                  <div className="bg-[#0c0c0f] border border-zinc-900 rounded-2xl overflow-hidden text-[10px]">
                    <div className="grid grid-cols-3 bg-zinc-950 p-3 font-black text-zinc-500 uppercase tracking-wider">
                      <span>Reason</span>
                      <span>Change</span>
                      <span className="text-right">Audit Date</span>
                    </div>
                    <div className="divide-y divide-zinc-900">
                      {pointsHistory.map((h, idx) => (
                        <div key={idx} className="grid grid-cols-3 p-3 text-zinc-300 font-semibold items-center">
                          <span>{h.reason}</span>
                          <span className={h.type === 'earn' ? 'text-emerald-400 font-bold' : 'text-rose-450 font-bold'}>
                            {h.type === 'earn' ? '+' : ''}{h.points} Pts
                          </span>
                          <span className="text-right text-zinc-500 font-mono">{h.date}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </motion.div>
            )}

            {/* 3. MEMBERSHIP PLANS */}
            {activeTab === 'membership' && (
              <motion.div key="membership" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col gap-6">
                <div>
                  <h2 className="text-lg font-black text-zinc-100 uppercase tracking-wider">Membership Center</h2>
                  <p className="text-[10px] text-zinc-500 font-sans mt-0.5">Explore premium benefits or instantly upgrade your dynamic tier.</p>
                </div>

                {/* Active Membership Banner */}
                <Card className="p-5 border border-amber-500/20 bg-amber-500/5 rounded-2xl relative overflow-hidden flex flex-col gap-3">
                  <div className="absolute top-0 right-0 p-3 bg-amber-500/10 rounded-bl-2xl border-l border-b border-amber-500/25 text-amber-500 text-[8px] font-black uppercase tracking-wider">
                    ✦ VIP Active Class
                  </div>
                  <div>
                    <span className="text-[8px] text-amber-500 font-black uppercase tracking-wider">Current Membership Rank</span>
                    <h3 className="text-xl font-black text-zinc-100 uppercase tracking-widest mt-1">GlamourOS {currentTier} Plan</h3>
                    <p className="text-[10px] text-zinc-400 mt-1 leading-normal max-w-md">Enjoy 10% instant checkout discounts, priority bookings reservation routing, and access to master stylist ledgers.</p>
                  </div>
                </Card>

                {/* Tier Choices */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {[
                    { tier: 'Silver', discount: '5%', color: 'border-zinc-800 text-zinc-400', active: currentTier === 'Silver' },
                    { tier: 'Gold', discount: '10%', color: 'border-[#BA7517] text-amber-600', active: currentTier === 'Gold' },
                    { tier: 'Platinum', discount: '15%', color: 'border-emerald-700 text-emerald-450', active: currentTier === 'Platinum' },
                    { tier: 'VIP', discount: '20%', color: 'border-[#7F77DD] text-[#7F77DD]', active: currentTier === 'VIP' }
                  ].map(plan => (
                    <Card 
                      key={plan.tier}
                      className={`p-4 flex flex-col justify-between min-h-[140px] text-center border relative ${
                        plan.active ? 'bg-zinc-900/60 border-zinc-500' : 'bg-[#111014]/65 ' + plan.color.split(' ')[0]
                      }`}
                    >
                      {plan.active && (
                        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-zinc-800 border border-zinc-650 px-2 py-0.5 rounded-full text-[7px] font-black uppercase text-zinc-300">
                          Active
                        </div>
                      )}
                      
                      <span className={`text-[10px] font-black uppercase tracking-wider ${plan.color.split(' ')[1]}`}>{plan.tier}</span>
                      <h4 className="text-2xl font-black text-zinc-200 mt-2 font-mono">{plan.discount} Off</h4>
                      <p className="text-[8px] text-zinc-550 mt-1 uppercase font-semibold tracking-wider">Service Discounts</p>
                      
                      <Button
                        onClick={() => handleUpgradeMembership(plan.tier as any)}
                        disabled={plan.active}
                        className={`mt-4 py-1.5 rounded-lg font-black text-[8px] uppercase tracking-wider ${
                          plan.active ? 'bg-zinc-850 text-zinc-500 border-none' : 'bg-[#7F77DD] text-zinc-950 hover:bg-[#9089e6]'
                        }`}
                      >
                        {plan.active ? 'Current' : 'Select'}
                      </Button>
                    </Card>
                  ))}
                </div>
              </motion.div>
            )}

            {/* 4. DIGITAL WALLET */}
            {activeTab === 'wallet' && (
              <motion.div key="wallet" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col gap-6">
                <div>
                  <h2 className="text-lg font-black text-zinc-100 uppercase tracking-wider">Digital Wallet Runway</h2>
                  <p className="text-[10px] text-zinc-500 font-sans mt-0.5">Pay cashless at counter, process instant refunds, or track reward credits.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-[#111014]/65 border border-zinc-850 p-5 flex flex-col justify-between min-h-[110px]">
                    <span className="text-[9px] text-zinc-550 font-black uppercase tracking-wider">Total Wallet Balance</span>
                    <h3 className="text-3xl font-black text-emerald-450 font-mono mt-2">₹{walletBalance}</h3>
                    <span className="text-[8px] text-zinc-500 uppercase font-semibold mt-1">Cashless POS settle ready</span>
                  </Card>

                  <Card className="bg-[#111014]/65 border border-zinc-850 p-5 flex flex-col justify-between min-h-[110px]">
                    <span className="text-[9px] text-zinc-550 font-black uppercase tracking-wider">Reward Credits</span>
                    <h3 className="text-2xl font-black text-zinc-200 mt-2">₹{rewardCredits}</h3>
                    <span className="text-[8px] text-zinc-500 uppercase font-semibold mt-1">Automated referral cashbacks</span>
                  </Card>

                  <Card className="bg-[#111014]/65 border border-zinc-850 p-5 flex flex-col justify-between min-h-[110px]">
                    <span className="text-[9px] text-zinc-550 font-black uppercase tracking-wider">Refund Credits</span>
                    <h3 className="text-2xl font-black text-zinc-450 mt-2">₹{refundCredits}</h3>
                    <span className="text-[8px] text-zinc-500 uppercase font-semibold mt-1">Instant salon return guarantee</span>
                  </Card>
                </div>

                {/* Load Funds */}
                <div className="bg-[#111014]/50 border border-zinc-850 rounded-2xl p-5 flex flex-col gap-4">
                  <h3 className="text-xs font-black text-zinc-300 uppercase tracking-widest">Load Wallet Balance</h3>
                  <div className="flex flex-wrap gap-2.5">
                    {[1000, 2000, 5000, 10000].map(amt => (
                      <Button
                        key={amt}
                        onClick={() => handleAddWalletFunds(amt)}
                        className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-xs font-bold font-mono px-4 py-2.5 rounded-xl flex-1 justify-center"
                      >
                        + ₹{amt}
                      </Button>
                    ))}
                  </div>
                </div>

              </motion.div>
            )}

            {/* 5. GIFT CARDS */}
            {activeTab === 'giftcards' && (
              <motion.div key="giftcards" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col gap-6">
                <div>
                  <h2 className="text-lg font-black text-zinc-100 uppercase tracking-wider">Gift Cards Center</h2>
                  <p className="text-[10px] text-zinc-550 font-sans mt-0.5">Surprise friends with digital beauty vouchers or redeem a code to your wallet.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Buy Voucher */}
                  <Card className="bg-[#111014]/65 border border-zinc-850 p-5 flex flex-col gap-4">
                    <h3 className="text-xs font-black text-zinc-250 uppercase tracking-widest">Buy Digital Voucher</h3>
                    <p className="text-[9px] text-zinc-500 leading-normal">Purchased vouchers generate unique codes that can be shared with friends to add directly to their digital wallets.</p>
                    <div className="grid grid-cols-3 gap-2">
                      {[1000, 2000, 5000].map(val => (
                        <Button
                          key={val}
                          onClick={() => handleBuyGiftCard(val)}
                          className="bg-[#7F77DD] text-zinc-950 hover:bg-[#9089e6] font-black text-[9px] uppercase py-2.5 rounded-xl justify-center"
                        >
                          Buy ₹{val}
                        </Button>
                      ))}
                    </div>
                  </Card>

                  {/* Redeem Voucher */}
                  <Card className="bg-[#111014]/65 border border-zinc-850 p-5 flex flex-col gap-4">
                    <h3 className="text-xs font-black text-zinc-250 uppercase tracking-widest">Redeem Voucher Code</h3>
                    <p className="text-[9px] text-zinc-500 leading-normal">Enter voucher code received via gift message to add credit balance instantly.</p>
                    <div className="flex gap-2">
                      <input 
                        type="text"
                        placeholder="e.g. GIFT-GLAM-99"
                        value={claimCode}
                        onChange={(e) => setClaimCode(e.target.value.toUpperCase())}
                        className="flex-1 bg-zinc-950 border border-zinc-850 rounded-xl px-3 text-xs text-zinc-200 uppercase font-mono outline-none focus:border-[#7F77DD]"
                      />
                      <Button
                        onClick={() => handleRedeemGiftCard(claimCode)}
                        disabled={!claimCode}
                        className="bg-[#7F77DD] text-zinc-950 hover:bg-[#9089e6] font-black text-[9px] uppercase px-4 py-2.5 rounded-xl border-none"
                      >
                        Redeem
                      </Button>
                    </div>
                  </Card>
                </div>

                {/* Purchased cards ledger */}
                <div className="flex flex-col gap-3 mt-2">
                  <h3 className="text-xs font-black text-zinc-300 uppercase tracking-widest">Active Vouchers Ledger</h3>
                  <div className="flex flex-col gap-2">
                    {giftCards.map(gc => (
                      <Card key={gc.code} className="p-4 bg-[#111014]/40 border border-zinc-850 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <Gift className="w-5 h-5 text-[#7F77DD]" />
                          <div>
                            <span className="font-mono text-xs font-black text-zinc-300">{gc.code}</span>
                            <span className="text-[9px] text-zinc-550 block font-semibold">Value: ₹{gc.value}</span>
                          </div>
                        </div>
                        <Badge className={`text-[8px] font-black px-2.5 py-1 rounded-full uppercase ${
                          gc.status === 'active' ? 'bg-emerald-500/10 border border-emerald-500/35 text-emerald-400' : 'bg-zinc-800 text-zinc-500'
                        }`}>
                          {gc.status}
                        </Badge>
                      </Card>
                    ))}
                  </div>
                </div>

              </motion.div>
            )}

            {/* 6. REFERRAL PROGRAM */}
            {activeTab === 'referral' && (
              <motion.div key="referral" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col gap-6">
                <div>
                  <h2 className="text-lg font-black text-zinc-100 uppercase tracking-wider">Referral Program Center</h2>
                  <p className="text-[10px] text-zinc-550 font-sans mt-0.5">Invite friends to checkout GlamourOS and earn ₹500 wallet credits for each booking.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Share code */}
                  <Card className="bg-[#111014]/65 border border-[#7F77DD]/35 p-5 flex flex-col gap-4 justify-between bg-gradient-to-tr from-[#7F77DD]/5 to-transparent">
                    <div>
                      <span className="text-[8px] text-[#7F77DD] font-black uppercase tracking-wider">Special Inviter Link</span>
                      <h3 className="text-xs font-black text-zinc-200 uppercase tracking-widest mt-1">Unique Referral Code</h3>
                    </div>
                    <div className="bg-zinc-950 border border-zinc-900 px-4 py-2.5 rounded-xl font-mono text-[10px] text-zinc-300 select-all overflow-x-auto truncate">
                      {referralLink}
                    </div>
                    <Button
                      onClick={() => {
                        navigator.clipboard.writeText(referralLink)
                        addNotification('Referral link copied to clipboard!', 'success')
                      }}
                      className="bg-[#7F77DD] text-zinc-950 hover:bg-[#9089e6] font-black text-[9px] uppercase py-2.5 rounded-xl border-none justify-center"
                    >
                      Copy Link
                    </Button>
                  </Card>

                  {/* Summary */}
                  <Card className="bg-[#111014]/65 border border-zinc-850 p-5 flex flex-col justify-between">
                    <div>
                      <span className="text-[8px] text-zinc-500 font-black uppercase tracking-wider">Successful Registrations</span>
                      <h3 className="text-3xl font-black text-zinc-100 mt-2 font-mono">{referralCount} Friends</h3>
                      <p className="text-[9px] text-zinc-550 leading-relaxed mt-2">You earned +500 points bonus and ₹200 wallet reward credits for each successfully confirmed booking.</p>
                    </div>
                    <div className="flex gap-2 border-t border-zinc-900 pt-3 text-[10px] text-zinc-500 font-semibold justify-between">
                      <span>Total Earnings</span>
                      <span className="text-emerald-400 font-bold">₹600 Wallet + 1500 Points</span>
                    </div>
                  </Card>
                </div>

              </motion.div>
            )}

            {/* 7. PRODUCT STORE */}
            {activeTab === 'store' && (
              <motion.div key="store" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Store Catalog */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                  <div>
                    <h2 className="text-lg font-black text-zinc-100 uppercase tracking-wider">Premium Cosmetics Store</h2>
                    <p className="text-[10px] text-zinc-550 font-sans mt-0.5">Explore master recommended styling products for dynamic post-salon upkeep.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {storeProducts.map(prod => (
                      <Card key={prod.id} className="p-4 bg-[#111014]/65 border border-zinc-850 flex flex-col justify-between relative overflow-hidden">
                        <div className="text-4xl absolute -right-2 -bottom-2 opacity-15 select-none">{prod.img}</div>
                        <div>
                          <div className="flex justify-between items-start gap-2">
                            <span className="text-[7.5px] font-black uppercase tracking-widest text-[#7F77DD] border border-[#7F77DD]/30 px-1.5 py-0.5 rounded-full">{prod.category}</span>
                            <span className="text-[9px] text-amber-500 font-bold">{prod.rating}★</span>
                          </div>
                          <h4 className="text-xs font-black text-zinc-200 mt-2 max-w-[190px]">{prod.name}</h4>
                          <span className="text-[9px] text-zinc-550 block font-mono font-semibold mt-1">Price: ₹{prod.price}</span>
                        </div>
                        <Button
                          onClick={() => addToCart(prod)}
                          className="mt-4 bg-zinc-900 hover:bg-zinc-800 text-[#7F77DD] font-black text-[9px] uppercase tracking-wider py-1.5 border border-zinc-800 rounded-lg justify-center"
                        >
                          Add to Cart
                        </Button>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Cart sidebar details */}
                <div className="lg:col-span-4">
                  <Card className="p-5 bg-[#111014] border border-zinc-850 flex flex-col gap-4 min-h-[300px] justify-between">
                    <div>
                      <h3 className="text-xs font-black text-zinc-200 uppercase tracking-widest flex items-center gap-1.5">
                        🛒 Checkout Basket
                      </h3>
                      
                      {cart.length === 0 ? (
                        <div className="text-center py-12 text-[10px] text-zinc-650 italic font-semibold">Your basket is empty.</div>
                      ) : (
                        <div className="flex flex-col gap-3 mt-4 overflow-y-auto max-h-[220px] pr-1">
                          {cart.map(item => (
                            <div key={item.id} className="flex justify-between items-center gap-2 border-b border-zinc-900 pb-2 text-[10px]">
                              <div>
                                <span className="text-zinc-200 font-bold block truncate max-w-[140px]">{item.name}</span>
                                <span className="text-zinc-550 font-mono">₹{item.price} each</span>
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <button onClick={() => updateCartQuantity(item.id, -1)} className="w-5 h-5 bg-zinc-900 rounded flex items-center justify-center text-zinc-400 hover:text-zinc-200"><Minus className="w-2.5 h-2.5" /></button>
                                <span className="font-mono text-zinc-300 font-bold">{item.quantity}</span>
                                <button onClick={() => updateCartQuantity(item.id, 1)} className="w-5 h-5 bg-zinc-900 rounded flex items-center justify-center text-zinc-400 hover:text-zinc-200"><Plus className="w-2.5 h-2.5" /></button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {cart.length > 0 && (
                      <div className="border-t border-zinc-900 pt-4 flex flex-col gap-3">
                        <div className="flex justify-between items-center text-xs font-bold text-zinc-400">
                          <span>Total Amount</span>
                          <span className="font-mono text-emerald-450 text-sm">
                            ₹{cart.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0)}
                          </span>
                        </div>
                        <Button
                          onClick={handleCheckoutProducts}
                          className="bg-[#7F77DD] text-zinc-950 hover:bg-[#9089e6] font-black text-[9px] uppercase tracking-widest py-3 rounded-xl justify-center border-none w-full"
                        >
                          Checkout from Wallet
                        </Button>
                      </div>
                    )}
                  </Card>
                </div>

              </motion.div>
            )}

            {/* 8. AI RECOMMENDATIONS */}
            {activeTab === 'ai' && (
              <motion.div key="ai" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col gap-6">
                <div>
                  <h2 className="text-lg font-black text-[#7F77DD] uppercase tracking-widest flex items-center gap-2">
                    🤖 Personalized AI Recommendations
                  </h2>
                  <p className="text-[10px] text-zinc-550 font-sans mt-0.5">Automated recommendations based on dynamic treatment history and preference analytics.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Service Rec */}
                  <Card className="bg-[#111014]/65 border border-zinc-850 p-5 flex flex-col gap-3 relative overflow-hidden bg-gradient-to-tr from-[#7F77DD]/5 to-transparent">
                    <span className="text-[7.5px] font-black uppercase tracking-widest text-[#7F77DD] border border-[#7F77DD]/35 px-2 py-0.5 rounded-full self-start">Recommended Service</span>
                    <div>
                      <h4 className="text-sm font-black text-zinc-200 mt-2">Detox Hair Spa</h4>
                      <p className="text-[9px] text-zinc-500 mt-1 leading-relaxed">Perfect follow-up treatment matching your recent Haircut session to re-hydrate hair roots.</p>
                    </div>
                    <Button 
                      onClick={() => router.push('/booking')}
                      className="bg-[#7F77DD] text-zinc-950 hover:bg-[#9089e6] font-black text-[8px] uppercase tracking-wider py-2 mt-4 justify-center"
                    >
                      Book Treatment
                    </Button>
                  </Card>

                  {/* Product Rec */}
                  <Card className="bg-[#111014]/65 border border-zinc-850 p-5 flex flex-col gap-3 relative overflow-hidden bg-gradient-to-tr from-amber-500/5 to-transparent">
                    <span className="text-[7.5px] font-black uppercase tracking-widest text-amber-500 border border-amber-500/35 px-2 py-0.5 rounded-full self-start">Recommended Product</span>
                    <div>
                      <h4 className="text-sm font-black text-zinc-200 mt-2">Kerastase Styling Serum</h4>
                      <p className="text-[9px] text-zinc-500 mt-1 leading-relaxed">Highly recommended by stylist Priya to protect hair strands and lock in shine post wash.</p>
                    </div>
                    <Button 
                      onClick={() => {
                        addToCart({ id: 'p2', name: 'Kerastase Nutritive Hair Serum', price: 2200 })
                        setActiveTab('store')
                      }}
                      className="bg-amber-500 text-zinc-950 hover:bg-amber-400 font-black text-[8px] uppercase tracking-wider py-2 mt-4 justify-center"
                    >
                      Add to Cart
                    </Button>
                  </Card>

                  {/* Membership Rec */}
                  <Card className="bg-[#111014]/65 border border-zinc-850 p-5 flex flex-col gap-3 relative overflow-hidden bg-gradient-to-tr from-[#7F77DD]/5 to-transparent">
                    <span className="text-[7.5px] font-black uppercase tracking-widest text-[#7F77DD] border border-[#7F77DD]/35 px-2 py-0.5 rounded-full self-start">Recommended Membership</span>
                    <div>
                      <h4 className="text-sm font-black text-zinc-200 mt-2">VVIP Elite Class</h4>
                      <p className="text-[9px] text-zinc-500 mt-1 leading-relaxed">Save up to ₹2,500 every month on dynamic bookings with automated 20% checkout discounts.</p>
                    </div>
                    <Button 
                      onClick={() => {
                        handleUpgradeMembership('VIP')
                        setActiveTab('membership')
                      }}
                      className="bg-[#7F77DD] text-zinc-950 hover:bg-[#9089e6] font-black text-[8px] uppercase tracking-wider py-2 mt-4 justify-center"
                    >
                      Upgrade One-Click
                    </Button>
                  </Card>
                </div>

              </motion.div>
            )}

          </AnimatePresence>
        </section>

      </main>

    </div>
  )
}

"use client"

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useMainStore } from '../../../store/mainStore'
import { Button } from '../../../components/ui/Button'
import { 
  QrCode, ArrowLeft, Camera, ShieldCheck, CheckCircle2, 
  AlertCircle, Play, Sparkles, User, RefreshCw, UserCheck, 
  MapPin, Clock, Calendar, Check, Volume2
} from 'lucide-react'

export default function ReceptionScannerPage() {
  const { appointments, checkInAppointment, initData, addNotification } = useMainStore()
  const [scanMode, setScanMode] = useState<'camera' | 'simulator'>('simulator')
  const [selectedApptId, setSelectedApptId] = useState<string>('')
  const [isScanning, setIsScanning] = useState(false)
  const [scanSuccess, setScanSuccess] = useState<any | null>(null)
  const [scanError, setScanError] = useState<string | null>(null)
  
  // Camera scanning states
  const [cameraActive, setCameraActive] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [copiedData, setCopiedData] = useState<string>('')

  useEffect(() => {
    initData()
  }, [initData])

  // Filter pending check-in bookings
  const pendingCheckins = appointments.filter(a => a.checkInStatus !== 'checked_in')

  // Play mock success beep sound
  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioCtx.createOscillator()
      const gainNode = audioCtx.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioCtx.destination)
      
      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(1000, audioCtx.currentTime) // 1000Hz frequency
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime)
      
      oscillator.start()
      oscillator.stop(audioCtx.currentTime + 0.15) // Play for 150ms
    } catch (e) {
      console.log('Audio Context beep blocked by browser permissions.', e)
    }
  }

  // Camera toggle
  const startCamera = async () => {
    setScanError(null)
    try {
      setCameraActive(true)
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (err: any) {
      console.warn('Webcam capture blocked or not present:', err.message)
      setScanError('Webcam access was denied or not found. Switching to high-fidelity scan simulator mode!')
      setScanMode('simulator')
      setCameraActive(false)
    }
  }

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      const tracks = stream.getTracks()
      tracks.forEach(track => track.stop())
    }
    setCameraActive(false)
  }

  useEffect(() => {
    if (scanMode === 'camera') {
      startCamera()
    } else {
      stopCamera()
    }
    return () => stopCamera()
  }, [scanMode])

  // Handle Simulation scan execution
  const executeScanSimulation = async () => {
    if (!selectedApptId) {
      setScanError('Please select an active customer reservation from the scanner dropdown roster!')
      return
    }

    setScanError(null)
    setIsScanning(true)
    setScanSuccess(null)

    // Simulate scanning beam animation duration
    setTimeout(async () => {
      try {
        const appt = appointments.find(a => a.id === selectedApptId)
        if (!appt) {
          throw new Error('Appointment reference not found in store roster.')
        }

        // Trigger store action check-in
        await checkInAppointment(selectedApptId)
        playBeep()

        // Construct success display object
        setScanSuccess({
          bookingId: selectedApptId,
          customerName: appt.customerName || 'Virat Kohli',
          email: appt.email || 'virat@kohli.com',
          serviceName: appt.serviceName || 'Signature Balayage & Gold Roster',
          branchName: appt.branchName || 'Banjara Hills',
          bookingDate: appt.bookingDate || '2026-05-30',
          bookingTime: appt.bookingTime || '15:30',
          timestamp: new Date().toLocaleTimeString()
        })

        addNotification(`Reception Check-In Scanner authenticated ${appt.customerName || 'Customer'} successfully! ✓`, 'success')
      } catch (err: any) {
        setScanError(err.message || 'Verification Error: Failed to parse or sync QR data.')
      } finally {
        setIsScanning(false)
      }
    }, 1800)
  }

  // Handle Mock Camera Scan (triggers random pending booking scanning simulation!)
  const simulateCameraScan = () => {
    if (pendingCheckins.length === 0) {
      setScanError('All active bookings in this session have already checked-in successfully! ✓')
      return
    }
    // Select first pending booking to simulate webcam detection
    setSelectedApptId(pendingCheckins[0].id)
    setIsScanning(true)
    setTimeout(() => {
      executeScanSimulation()
    }, 200)
  }

  const resetScanner = () => {
    setScanSuccess(null)
    setScanError(null)
    setSelectedApptId('')
  }

  return (
    <div className="min-h-screen bg-[#060608] text-zinc-100 flex flex-col font-sans relative overflow-hidden pb-12">
      {/* Dynamic light glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[#7F77DD]/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[#1D9E75]/10 blur-[130px] pointer-events-none" />

      {/* Header */}
      <header className="border-b border-[#2a2826]/20 bg-[#0B0A09]/60 backdrop-blur-md relative z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-zinc-400 hover:text-zinc-200 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Operational Hub</span>
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#7F77DD]/10 border border-[#7F77DD]/30 flex items-center justify-center animate-pulse">
              <Camera className="w-4 h-4 text-[#7F77DD]" />
            </div>
            <h1 className="text-sm font-black tracking-widest text-zinc-100 uppercase">Reception QR Desk</h1>
          </div>
          <div className="w-12" /> {/* spacer */}
        </div>
      </header>

      {/* Content Container */}
      <main className="max-w-xl mx-auto w-full px-4 py-8 flex-1 relative z-10 flex flex-col justify-center">
        
        {/* State 1: Active Scan Verification Success Screen */}
        <AnimatePresence mode="wait">
          {scanSuccess ? (
            <motion.div
              key="success"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#111014]/90 border-2 border-[#1D9E75]/40 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden flex flex-col items-center text-center"
            >
              {/* Confetti element */}
              <div className="absolute top-[-30%] w-[300px] h-[300px] rounded-full bg-[#1D9E75]/10 blur-[60px] pointer-events-none" />
              
              {/* Success Icon badge */}
              <div className="w-16 h-16 rounded-full bg-[#1D9E75]/10 border-2 border-[#1D9E75] flex items-center justify-center text-[#1D9E75] mb-5 relative">
                <CheckCircle2 className="w-8 h-8" />
                <span className="absolute inset-0 rounded-full border border-[#1D9E75] animate-ping opacity-35" />
              </div>

              <span className="text-[10px] font-black uppercase text-[#1D9E75] tracking-widest bg-[#1D9E75]/10 border border-[#1D9E75]/20 px-3 py-1 rounded-full flex items-center gap-1.5 mb-2">
                <Sparkles className="w-3.5 h-3.5" /> Check-In Authenticated ✓
              </span>
              <h2 className="text-xl font-black text-zinc-100 uppercase tracking-tight mb-6">
                Welcome, {scanSuccess.customerName}!
              </h2>

              {/* Verified Details list */}
              <div className="w-full bg-[#060608]/80 border border-zinc-900 rounded-2xl p-5 mb-6 text-left text-xs flex flex-col gap-3.5">
                <div className="flex justify-between border-b border-zinc-900/60 pb-2">
                  <span className="text-zinc-550 flex items-center gap-1.5 uppercase font-bold text-[9px] tracking-wide"><User className="w-3.5 h-3.5" /> Customer Name</span>
                  <span className="text-zinc-200 font-bold">{scanSuccess.customerName}</span>
                </div>
                <div className="flex justify-between border-b border-zinc-900/60 pb-2">
                  <span className="text-zinc-550 flex items-center gap-1.5 uppercase font-bold text-[9px] tracking-wide"><ShieldCheck className="w-3.5 h-3.5" /> Booking Ref</span>
                  <span className="text-zinc-200 font-mono font-bold text-[#7F77DD]">{scanSuccess.bookingId}</span>
                </div>
                <div className="flex justify-between border-b border-zinc-900/60 pb-2">
                  <span className="text-zinc-550 flex items-center gap-1.5 uppercase font-bold text-[9px] tracking-wide"><Sparkles className="w-3.5 h-3.5" /> Reserved Service</span>
                  <span className="text-zinc-200 font-bold text-amber-500">{scanSuccess.serviceName}</span>
                </div>
                <div className="flex justify-between border-b border-zinc-900/60 pb-2">
                  <span className="text-zinc-550 flex items-center gap-1.5 uppercase font-bold text-[9px] tracking-wide"><MapPin className="w-3.5 h-3.5" /> Branch Desk</span>
                  <span className="text-zinc-200 font-bold">{scanSuccess.branchName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-550 flex items-center gap-1.5 uppercase font-bold text-[9px] tracking-wide"><Clock className="w-3.5 h-3.5" /> Timing Slot</span>
                  <span className="text-zinc-200 font-bold">{scanSuccess.bookingDate} @ {scanSuccess.bookingTime}</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 w-full">
                <Button
                  onClick={resetScanner}
                  className="flex-1 py-3 text-[10px] font-black uppercase tracking-widest bg-[#1D9E75] hover:bg-[#1bb886] text-zinc-950 rounded-xl justify-center gap-1.5 shadow-md shadow-[#1D9E75]/20 border-none"
                >
                  <RefreshCw className="w-4 h-4 text-zinc-950" />
                  Scan Next Ticket
                </Button>
                <Link href="/dashboard" className="flex-1">
                  <Button
                    variant="outline"
                    className="w-full py-3 text-[10px] font-black uppercase tracking-widest border-zinc-800 text-zinc-300 hover:text-zinc-100 hover:bg-zinc-900 rounded-xl justify-center"
                  >
                    Control Panel
                  </Button>
                </Link>
              </div>

            </motion.div>
          ) : (
            
            /* State 2: Main Scanner Hub card */
            <motion.div
              key="scanner-main"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-[#111014]/65 border border-zinc-850 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#7F77DD] to-transparent animate-pulse" />

              {/* Toggle Scan Mode */}
              <div className="bg-[#060608] border border-zinc-900 p-1 rounded-xl flex gap-1 mb-6">
                <button
                  onClick={() => setScanMode('simulator')}
                  className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center justify-center gap-1 transition-all ${
                    scanMode === 'simulator'
                      ? 'bg-zinc-900 text-[#7F77DD] border border-zinc-800 shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-350'
                  }`}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Scan Simulator
                </button>
                <button
                  onClick={() => setScanMode('camera')}
                  className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center justify-center gap-1 transition-all ${
                    scanMode === 'camera'
                      ? 'bg-zinc-900 text-[#7F77DD] border border-zinc-800 shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-350'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5" />
                  Live Camera Feed
                </button>
              </div>

              {/* Scanner Screen Frame */}
              <div className="relative aspect-video w-full rounded-2xl border border-zinc-850 bg-[#060608] overflow-hidden flex items-center justify-center shadow-inner mb-6 group">
                
                {/* Laser Scanning Beam Beam */}
                {isScanning && (
                  <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-transparent via-[#7F77DD] to-transparent animate-[bounce_1.5s_infinite] shadow-md shadow-[#7F77DD]/80 z-20" />
                )}

                {/* Mode A: Camera feed display */}
                {scanMode === 'camera' && (
                  <div className="w-full h-full relative flex items-center justify-center">
                    {cameraActive ? (
                      <video 
                        ref={videoRef} 
                        autoPlay 
                        playsInline 
                        muted 
                        className="w-full h-full object-cover scale-x-[-1]"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Camera className="w-8 h-8 text-zinc-650 animate-pulse" />
                        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Activating Camera Stream...</span>
                      </div>
                    )}
                    {/* Scanner Target Box HUD */}
                    <div className="absolute w-[140px] h-[140px] border-2 border-dashed border-[#7F77DD]/40 rounded-xl flex items-center justify-center pointer-events-none z-10">
                      <div className="absolute inset-[-4px] border-2 border-[#7F77DD] rounded-xl animate-pulse" />
                    </div>
                  </div>
                )}

                {/* Mode B: Simulator Dynamic display */}
                {scanMode === 'simulator' && (
                  <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
                    {isScanning ? (
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-full border-2 border-t-transparent border-[#7F77DD] animate-spin flex items-center justify-center" />
                        <span className="text-[9px] text-[#7F77DD] font-black uppercase tracking-widest animate-pulse">Scanning QR Signature...</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-3">
                        <QrCode className="w-12 h-12 text-[#7F77DD]/30 group-hover:scale-105 transition-transform" />
                        <div>
                          <span className="text-[10px] text-zinc-450 block font-bold uppercase tracking-wider mb-1">
                            Scan Simulator Panel Active
                          </span>
                          <p className="text-[9px] text-zinc-550 max-w-[280px] leading-normal font-sans">
                            Select a customer booking from the roster dropdown below, and click **DECODING KEY** to trigger the dynamic QR matrix simulator!
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Audio volume badge indicator */}
                <div className="absolute bottom-3 left-3 bg-zinc-950/80 border border-zinc-800 text-[8px] font-black px-2 py-1 rounded-lg text-zinc-400 flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                  AUDIO BEEP ACTIVE
                </div>
              </div>

              {/* Feedback messages */}
              <AnimatePresence>
                {scanError && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-rose-950/20 border border-rose-900/30 rounded-xl p-3 flex gap-2.5 items-start text-[10px] text-rose-400 font-sans mb-4"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                    <span>{scanError}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Form elements / Simulator controls */}
              <div className="flex flex-col gap-4">
                
                {/* Roster dropdown */}
                <div>
                  <label className="text-[9px] text-zinc-500 block font-bold mb-2 uppercase tracking-widest">
                    Live Active Roster Pending Check-In
                  </label>
                  
                  {pendingCheckins.length > 0 ? (
                    <select
                      value={selectedApptId}
                      onChange={(e) => {
                        setSelectedApptId(e.target.value)
                        setScanError(null)
                      }}
                      className="w-full bg-[#060608] border border-zinc-850 rounded-xl px-4 py-2.5 text-xs text-zinc-200 outline-none focus:border-[#7F77DD] transition-all font-bold"
                    >
                      <option value="">-- Choose Customer Reservation --</option>
                      {pendingCheckins.map((appt) => (
                        <option key={appt.id} value={appt.id}>
                          {appt.customerName || 'VVIP Client'} ({appt.serviceName}) - {appt.bookingTime}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="bg-[#060608] border border-dashed border-zinc-850 p-4 rounded-xl text-center">
                      <span className="text-[10px] text-emerald-400 font-black uppercase">✓ All Customers Checked-In successfully!</span>
                      <p className="text-[8px] text-zinc-650 mt-0.5">No pending reservations inside the active operational queue.</p>
                    </div>
                  )}
                </div>

                {/* Main Scanning trigger button */}
                {scanMode === 'simulator' ? (
                  <Button
                    onClick={executeScanSimulation}
                    disabled={isScanning || !selectedApptId}
                    className="w-full justify-center gap-2 rounded-xl py-3.5 mt-2 font-black text-xs uppercase tracking-widest bg-[#7F77DD] text-zinc-950 hover:bg-[#9089e6] shadow-md shadow-[#7F77DD]/10 border-none"
                  >
                    {isScanning ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-zinc-950 border-t-transparent animate-spin rounded-full"></span>
                        DECODING DYNAMIC QR SIGN...
                      </span>
                    ) : (
                      <>
                        DECODING SCANNER KEY
                        <Play className="w-4 h-4 text-zinc-950 fill-zinc-950" />
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={simulateCameraScan}
                    disabled={isScanning || pendingCheckins.length === 0}
                    className="w-full justify-center gap-2 rounded-xl py-3.5 mt-2 font-black text-xs uppercase tracking-widest bg-emerald-500 text-zinc-950 hover:bg-emerald-400 shadow-md border-none"
                  >
                    {isScanning ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-zinc-950 border-t-transparent animate-spin rounded-full"></span>
                        CAPTURE DETECTED PAYLOAD...
                      </span>
                    ) : (
                      <>
                        SIMULATE CAMERA DECODER
                        <Camera className="w-4 h-4 text-zinc-950" />
                      </>
                    )}
                  </Button>
                )}
              </div>

            </motion.div>
          )}
        </AnimatePresence>

      </main>

      {/* Footer */}
      <footer className="border-t border-[#2a2826]/20 py-5 text-center text-[9px] text-zinc-650 bg-zinc-950/20 relative z-10 mt-6">
        <p>© 2026 GlamourOS Enterprise. Checked-in payloads synced over Socket.IO live stream.</p>
      </footer>
    </div>
  )
}

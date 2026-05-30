"use client"

import React, { useState } from 'react'
import { useMainStore } from '../../store/mainStore'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { MessageSquare, Send, Check, SmartLink, Smartphone } from 'lucide-react'

export const WhatsAppMock = () => {
  const { sendWhatsAppMessage, activeBranchId } = useMainStore()
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'agent'; text: string; time: string }>>([
    { sender: 'agent', text: 'Namaste! Welcome to GlamourOS Salon chains. How can I help you book your style session today?', time: '02:00 PM' }
  ])
  const [inputVal, setInputVal] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  const handleSend = async (customText?: string) => {
    const textToSend = customText || inputVal
    if (!textToSend.trim()) return

    const timeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    const userMsg = { sender: 'user' as const, text: textToSend, time: timeStr }
    
    setMessages(prev => [...prev, userMsg])
    if (!customText) setInputVal('')
    setIsTyping(true)

    // Send to Zustand store NLP parser
    setTimeout(async () => {
      const reply = await sendWhatsAppMessage(textToSend)
      const agentMsg = { sender: 'agent' as const, text: reply, time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) }
      setMessages(prev => [...prev, agentMsg])
      setIsTyping(false)
    }, 1200)
  }

  const prompts = [
    { title: 'Standard Haircut', text: 'Kal subah haircut appointment chahiye' },
    { title: 'Conflict Conflict Check', text: 'Sandeep ke sath afternoon 3:30 PM slot haircut double-book check conflict' },
    { title: 'Bridal Package Spa', text: 'Bridal Spa Packages standard catalog prices details please' }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
      
      {/* Scenario control deck */}
      <Card className="md:col-span-5 flex flex-col gap-4">
        <div>
          <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
            <MessageSquare className="w-4.5 h-4.5 text-primary" />
            WhatsApp Simulator Core
          </h3>
          <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">
            Click these quick-start templates to showcase multi-lingual parsing (English/Hinglish) and automated scheduler conflict override engines during live presentation runways.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          {prompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(p.text)}
              className="text-left p-3 rounded-lg border border-border bg-slate-900 hover:border-primary/40 transition-colors text-xs flex flex-col gap-1 text-zinc-300"
            >
              <span className="font-semibold text-[10px] text-primary uppercase tracking-wider">{p.title}</span>
              <span className="truncate italic text-[11px] text-zinc-400">"{p.text}"</span>
            </button>
          ))}
        </div>

        <div className="mt-auto border-t border-border pt-4 text-[10px] text-zinc-500 leading-relaxed">
          <Badge variant="slate" className="mb-2">CTO ARCHITECT SPECS</Badge>
          <p>Twilio Sandbox mapping integrates directly. Natural Language processing extracts: <b>Service</b>, <b>Branch</b>, <b>Time</b>, and routes to staff capacity filters.</p>
        </div>
      </Card>

      {/* WhatsApp chat screen mockup container */}
      <div className="md:col-span-7 flex flex-col border border-border rounded-xl bg-slate-950/60 overflow-hidden min-h-[460px] relative">
        
        {/* Chat Phone Header */}
        <div className="bg-slate-900 border-b border-border py-3 px-4 flex items-center gap-3">
          <div className="w-7.5 h-7.5 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-xs text-primary">
            💅
          </div>
          <div>
            <h4 className="text-xs font-bold text-zinc-200">GlamourOS Omnichannel AI</h4>
            <p className="text-[9px] text-success flex items-center gap-1 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" /> Online operator
            </p>
          </div>
        </div>

        {/* Message bubble stream */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 max-h-[330px]">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed flex flex-col gap-1 ${
                m.sender === 'user'
                  ? 'bg-zinc-800 text-zinc-200 border border-zinc-700 ml-auto'
                  : 'bg-primary/10 text-primary border border-primary/20 mr-auto'
              }`}
            >
              <p>{m.text}</p>
              <span className="text-[8px] text-zinc-500 self-end font-medium">{m.time}</span>
            </div>
          ))}
          {isTyping && (
            <div className="bg-primary/5 text-primary border border-primary/10 rounded-xl px-3.5 py-2 mr-auto text-[10px] font-semibold tracking-wider animate-pulse">
              GlamourOS AI is parsing parameters...
            </div>
          )}
        </div>

        {/* Chat Input panel */}
        <div className="p-3 bg-slate-900 border-t border-border mt-auto flex gap-2">
          <input
            type="text"
            placeholder="Type Hinglish / English booking request..."
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 bg-background border border-border rounded-lg text-xs py-2 px-3 text-zinc-100 focus:outline-none focus:border-primary"
          />
          <Button
            onClick={() => handleSend()}
            variant="primary"
            size="sm"
            className="px-3 rounded-lg"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>

      </div>

    </div>
  )
}
export default WhatsAppMock

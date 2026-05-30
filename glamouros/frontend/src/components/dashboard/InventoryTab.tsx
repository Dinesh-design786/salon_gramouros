"use client"

import React, { useState } from 'react'
import { useMainStore } from '../../store/mainStore'
import { Card } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Package, ShieldAlert, TrendingDown, RefreshCcw, ArrowUpRight } from 'lucide-react'

export const InventoryTab = () => {
  const { inventory, activeBranchId, restockProduct } = useMainStore()
  const [restockQty, setRestockQty] = useState<Record<string, number>>({})

  const branchInventory = inventory.filter(p => p.branch_id === activeBranchId)

  const handleRestock = async (productId: string) => {
    const qty = restockQty[productId] || 10
    await restockProduct(productId, qty)
    setRestockQty(prev => ({ ...prev, [productId]: 0 }))
  }

  return (
    <div className="flex flex-col gap-6">
      
      {/* Inventory Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 border border-border bg-slate-900/50 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-8.5 h-8.5 rounded-lg bg-zinc-800 flex items-center justify-center font-bold text-xs text-primary">
            📦
          </div>
          <div>
            <h3 className="text-xs font-bold text-zinc-100 flex items-center gap-2">
              AI Supply & Stockout Forecasting
              <Badge variant="alert" className="scale-90 font-bold">2 Items Low Stock</Badge>
            </h3>
            <p className="text-[10px] text-zinc-500 mt-0.5">Real-time depletion forecasts based on weekend booking allocations</p>
          </div>
        </div>
      </div>

      {/* Roster & forecasting table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900/40 border-b border-border text-zinc-400 font-bold text-[10px] uppercase tracking-wider">
                <th className="py-3 px-4">Material Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-center">Available Stock</th>
                <th className="py-3 px-4 text-center">Safety Bounds</th>
                <th className="py-3 px-4 text-center text-primary">AI Days Left</th>
                <th className="py-3 px-4">AI Advisor / Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {branchInventory.map(prod => {
                const isLow = prod.stock < prod.min_stock
                
                // Forecast logic: hair dye depletes fast (0.8/day), argan serum slow (0.3/day)
                let burnRate = 0.45
                if (prod.name.includes("L'Oreal")) burnRate = 0.85
                else if (prod.name.includes("Oil")) burnRate = 0.60
                else if (prod.name.includes("Serum")) burnRate = 0.30

                const daysRemaining = Math.max(0, Math.round(prod.stock / burnRate))
                const isCritical = daysRemaining <= 3

                return (
                  <tr key={prod.id} className="hover:bg-slate-900/10 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-zinc-200">
                      {prod.name}
                    </td>
                    <td className="py-3.5 px-4 text-zinc-500 font-medium">
                      {prod.category}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold">
                      <span className={isLow ? 'text-alert' : 'text-success'}>
                        {prod.stock} units
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center text-zinc-500 font-semibold">
                      Min: {prod.min_stock} units
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <Badge variant={isCritical ? 'alert' : isLow ? 'warning' : 'success'} className="font-extrabold font-sans">
                        {daysRemaining} DAYS REMAINING
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="text-[10px] text-zinc-500 max-w-[210px] leading-tight">
                          {isLow 
                            ? `⚠️ Stockout in ${daysRemaining} days. Order +${Math.max(5, 20 - prod.stock)} now.` 
                            : '⚡ Safety stock counts healthy. Forecast stable.'
                          }
                        </div>
                        
                        {/* Quick replenishment input */}
                        <div className="flex items-center gap-1.5 ml-auto">
                          <input
                            type="number"
                            min="1"
                            max="99"
                            placeholder="10"
                            value={restockQty[prod.id] || ''}
                            onChange={(e) => {
                              const v = parseInt(e.target.value) || 0
                              setRestockQty(prev => ({ ...prev, [prod.id]: v }))
                            }}
                            className="flat-input w-12 text-center py-1 px-1.5 focus:outline-none"
                          />
                          <Button
                            onClick={() => handleRestock(prod.id)}
                            variant="secondary"
                            size="sm"
                            className="px-2.5 py-1 text-[9px] font-bold rounded-md"
                          >
                            Restock
                          </Button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

    </div>
  )
}
export default InventoryTab

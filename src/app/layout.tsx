import React from 'react'
import './globals.css'

export const metadata = {
  title: 'GlamourOS — AI-Powered Multi-Branch Salon Management OS',
  description: 'Enterprise omnichannel scheduling, automated commissions ledger, predictive restock index, and dynamic surge pricing billing terminals for Indian retail chains.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>💅</text></svg>" />
      </head>
      <body className="bg-background text-zinc-100 min-h-screen">
        {children}
      </body>
    </html>
  )
}

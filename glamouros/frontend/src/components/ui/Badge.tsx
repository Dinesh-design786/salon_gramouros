import React from 'react'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'primary' | 'success' | 'warning' | 'alert' | 'slate'
  className?: string
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'primary', className = '' }) => {
  const styles = {
    primary: 'border border-primary text-primary bg-primary/10',
    success: 'border border-success text-success bg-success/10',
    warning: 'border border-warning text-warning bg-warning/10',
    alert: 'border border-alert text-alert bg-alert/10',
    slate: 'border border-zinc-700 text-zinc-400 bg-zinc-800/40'
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase ${styles[variant]} ${className}`}>
      {children}
    </span>
  )
}

export default Badge

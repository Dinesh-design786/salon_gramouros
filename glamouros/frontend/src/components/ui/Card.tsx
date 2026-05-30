import React from 'react'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  hoverEffect?: boolean
}

export const Card: React.FC<CardProps> = ({ children, hoverEffect = false, className = '', ...props }) => {
  return (
    <div 
      className={`flat-card p-5 transition-all duration-200 ${
        hoverEffect ? 'hover:border-zinc-700 cursor-pointer' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export default Card

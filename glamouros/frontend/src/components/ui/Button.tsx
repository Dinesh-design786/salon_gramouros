import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'outline' | 'glow'
  size?: 'sm' | 'md' | 'lg'
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  ...props 
}) => {
  
  const baseStyle = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variants = {
    primary: 'bg-primary text-zinc-950 hover:bg-primary/90 font-bold border border-primary/20',
    secondary: 'bg-slate-850 text-zinc-200 border border-border hover:bg-zinc-800',
    outline: 'bg-transparent text-zinc-400 border border-zinc-800 hover:text-zinc-200 hover:border-zinc-700',
    glow: 'bg-primary text-zinc-950 font-bold border border-primary/50 shadow-lg shadow-primary/10 hover:bg-primary/95'
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-2.5 text-base'
  }

  return (
    <button 
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button

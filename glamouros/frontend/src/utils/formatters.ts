// GlamourOS Indian Retail formatting utilities
export const formatRupee = (value: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value)
}

export const formatClockTime = (time24: string): string => {
  const [hours, minutes] = time24.split(':')
  const h = parseInt(hours)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const displayHours = h % 12 || 12
  return `${displayHours}:${minutes} ${ampm}`
}

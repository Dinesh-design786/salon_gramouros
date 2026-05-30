// GlamourOS Frontend library utilities
export function cn(...inputs: string[]) {
  return inputs.filter(Boolean).join(' ')
}

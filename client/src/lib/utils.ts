import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPercent(val: number) {
  return `${Math.round(val)}%`
}

export function getClassificationColor(c: string) {
  const map: Record<string, string> = {
    'STRONG':        'text-emerald-400',
    'GOOD':          'text-navy-300',
    'AVERAGE':       'text-amber-400',
    'NEEDS PRACTICE':'text-rose-400',
  }
  return map[c] ?? 'text-navy-200'
}

export function getClassificationBg(c: string) {
  const map: Record<string, string> = {
    'STRONG':         'bg-emerald-500/15 border-emerald-500/30',
    'GOOD':           'bg-navy-500/15 border-navy-500/30',
    'AVERAGE':        'bg-amber-500/15 border-amber-500/30',
    'NEEDS PRACTICE': 'bg-rose-500/15 border-rose-500/30',
  }
  return map[c] ?? 'bg-navy-800/40 border-navy-600/20'
}

export function readinessLabel(score: number): string {
  if (score >= 80) return 'Interview Ready'
  if (score >= 65) return 'On Track'
  if (score >= 50) return 'Needs Focus'
  return 'Early Stage'
}

export function readinessColor(score: number): string {
  if (score >= 80) return 'text-emerald-400'
  if (score >= 65) return 'text-gold-500'
  if (score >= 50) return 'text-amber-400'
  return 'text-rose-400'
}

// Debounce
export function debounce<T extends (...args: unknown[]) => void>(fn: T, ms = 300) {
  let timer: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), ms)
  }
}

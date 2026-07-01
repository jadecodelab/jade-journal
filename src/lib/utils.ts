import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Parse date strings as local noon so UTC-stored timestamps don't shift to previous day
function toLocalDate(date: string | Date): Date {
  const s = typeof date === 'string' ? date : date.toISOString()
  return new Date(s.slice(0, 10) + 'T12:00:00')
}

export function formatDate(date: string | Date): string {
  return toLocalDate(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatShortDate(date: string | Date): string {
  return toLocalDate(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatMonthYear(date: string | Date): string {
  return toLocalDate(date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

// Use local date parts instead of UTC to avoid off-by-one-day on dates near midnight
export function todayISO(): string {
  const d = new Date()
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-')
}

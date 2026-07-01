import type { Entry, DashboardData, TimelineEntry, MonthlyReflection, YearlyReflection } from '../types'

async function req<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error((err as { error: string }).error ?? res.statusText)
  }
  return res.json() as Promise<T>
}

// Auth
export const verifyPassword = (password: string) =>
  req<{ ok: boolean }>('/auth/verify', {
    method: 'POST',
    body: JSON.stringify({ password }),
  })

// Entries
export const getEntries = () => req<Entry[]>('/entries')
export const getEntry = (id: string) => req<Entry>(`/entries/${id}`)
export const createEntry = (data: Partial<Entry> & { tags?: string[] }) =>
  req<Entry>('/entries', { method: 'POST', body: JSON.stringify(data) })
export const updateEntry = (id: string, data: Partial<Entry> & { tags?: string[] }) =>
  req<Entry>(`/entries/${id}`, { method: 'PATCH', body: JSON.stringify(data) })
export const deleteEntry = (id: string) =>
  req<void>(`/entries/${id}`, { method: 'DELETE' })

// Search
export const searchEntries = (params: Record<string, string>) => {
  const qs = new URLSearchParams(params).toString()
  return req<Entry[]>(`/search?${qs}`)
}

// Timeline
export const getTimeline = (year: number, month: number) =>
  req<TimelineEntry[]>(`/timeline?year=${year}&month=${month}`)
export const getOnThisDay = (month: number, day: number) =>
  req<(Entry & { yearsAgo: number })[]>(`/timeline/on-this-day?month=${month}&day=${day}`)

// Dashboard
export const getDashboard = () => req<DashboardData>('/dashboard')

// AI
export const aiImprove = (id: string) =>
  req<{ text: string; isFallback: boolean; model: string }>(`/entries/${id}/ai/improve`, { method: 'POST' })
export const aiOrganize = (id: string) =>
  req<{ text: string; isFallback: boolean; model: string }>(`/entries/${id}/ai/organize`, { method: 'POST' })
export const aiInsights = (id: string) =>
  req<{ wins: string[]; challenges: string[]; lessons: string[]; goals: string[]; suggestedTags: string[]; isFallback: boolean; model: string }>(`/entries/${id}/ai/insights`, { method: 'POST' })

// Reflections
export const generateMonthlyReflection = (year: number, month: number) =>
  req<MonthlyReflection>('/reflections/monthly', { method: 'POST', body: JSON.stringify({ year, month }) })
export const generateYearlyReflection = (year: number) =>
  req<YearlyReflection>('/reflections/yearly', { method: 'POST', body: JSON.stringify({ year }) })

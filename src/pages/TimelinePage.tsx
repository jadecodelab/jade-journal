import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getTimeline } from '@/lib/api'
import type { TimelineEntry } from '@/types'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

export function TimelinePage() {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth() + 1)
  const [entries, setEntries] = useState<TimelineEntry[]>([])
  const [selectedDay, setSelectedDay] = useState<number | null>(
    today.getDate()
  )

  useEffect(() => {
    getTimeline(year, month).then(setEntries)
  }, [year, month])

  function prevMonth() {
    if (month === 1) { setMonth(12); setYear((y) => y - 1) }
    else setMonth((m) => m - 1)
    setSelectedDay(null)
  }

  function nextMonth() {
    if (month === 12) { setMonth(1); setYear((y) => y + 1) }
    else setMonth((m) => m + 1)
    setSelectedDay(null)
  }

  const firstDay = new Date(year, month - 1, 1).getDay()
  const daysInMonth = new Date(year, month, 0).getDate()

  // Use getUTCDate() so UTC-midnight timestamps map to the correct local calendar day
  const entryMap = new Map<number, TimelineEntry[]>()
  for (const entry of entries) {
    const d = new Date(entry.entryDate).getUTCDate()
    entryMap.set(d, [...(entryMap.get(d) ?? []), entry])
  }

  const monthLabel = new Date(year, month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })
  const selectedEntries = selectedDay ? (entryMap.get(selectedDay) ?? []) : []

  const isCurrentMonth = month === today.getMonth() + 1 && year === today.getFullYear()

  return (
    <div className="pb-nav min-h-full">
      <div className="px-5 pt-12 pb-4">
        <h1 className="text-2xl font-semibold mb-5">Timeline</h1>

        {/* Month nav */}
        <div className="flex items-center justify-between mb-5">
          <button onClick={prevMonth} className="p-2 rounded-xl hover:bg-muted active:scale-95 transition-all">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <p className="font-semibold">{monthLabel}</p>
          <button onClick={nextMonth} className="p-2 rounded-xl hover:bg-muted active:scale-95 transition-all">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 mb-1">
          {WEEKDAYS.map((d) => (
            <div key={d} className="text-center text-[11px] font-medium text-muted-foreground py-1">{d}</div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const hasEntry = entryMap.has(day)
            const isToday = isCurrentMonth && day === today.getDate()
            const isSelected = day === selectedDay

            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day === selectedDay ? null : day)}
                className={cn(
                  'aspect-square flex flex-col items-center justify-center rounded-xl text-sm transition-all active:scale-95',
                  isSelected && 'bg-primary text-primary-foreground',
                  !isSelected && isToday && 'ring-2 ring-primary text-primary font-semibold',
                  !isSelected && hasEntry && !isToday && 'bg-sage-100 text-sage-700 font-medium',
                  !isSelected && !hasEntry && !isToday && 'text-muted-foreground',
                )}
              >
                {day}
                {hasEntry && !isSelected && (
                  <span className="w-1 h-1 rounded-full bg-primary mt-0.5 block" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Selected day entries */}
      {selectedDay !== null && (
        <div className="px-5 mt-2 animate-slide-up">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            {new Date(year, month - 1, selectedDay).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </h2>

          {selectedEntries.length === 0 ? (
            <Link to="/write" className="block">
              <div className="rounded-2xl border border-dashed border-border p-5 text-center text-muted-foreground text-sm">
                <p>No entry for this day</p>
                <p className="text-primary text-xs mt-1 font-medium">Tap to write one</p>
              </div>
            </Link>
          ) : (
            <div className="space-y-2">
              {selectedEntries.map((entry) => (
                <Link key={entry.id} to={`/entry/${entry.id}`}>
                  <Card className="active:scale-[0.99] transition-transform">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm truncate">{entry.title || 'Untitled'}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{entry.wordCount} words</p>
                        </div>
                        {entry.mood && <span className="text-xl flex-shrink-0">{entry.mood.split(' ')[0]}</span>}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

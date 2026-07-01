import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PenLine, Flame, BookOpen, Type } from 'lucide-react'
import { getEntries, getOnThisDay, getDashboard } from '@/lib/api'
import type { Entry, DashboardData } from '@/types'
import { formatShortDate } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

export function HomePage() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [dashboard, setDashboard] = useState<DashboardData | null>(null)
  const [onThisDay, setOnThisDay] = useState<(Entry & { yearsAgo: number })[]>([])
  const navigate = useNavigate()
  const today = new Date()

  useEffect(() => {
    getEntries().then((e) => setEntries(e.slice(0, 10)))
    getDashboard().then(setDashboard)
    getOnThisDay(today.getMonth() + 1, today.getDate()).then(setOnThisDay)
  }, [])

  return (
    <div className="pb-nav min-h-full">
      {/* Header */}
      <div className="px-5 pt-12 pb-6">
        <p className="text-sm text-muted-foreground font-medium">{today.toLocaleDateString('en-US', { weekday: 'long' })}</p>
        <h1 className="text-2xl font-semibold text-foreground mt-0.5">
          {today.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
        </h1>
      </div>

      {/* New Entry Button */}
      <div className="px-5 mb-6">
        <button
          onClick={() => navigate('/write')}
          className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-semibold text-base flex items-center justify-center gap-2.5 shadow-sm active:scale-[0.98] transition-transform"
        >
          <PenLine className="h-5 w-5" />
          New Journal Entry
        </button>
      </div>

      {/* Stats Strip */}
      {dashboard && (
        <div className="px-5 mb-6">
          <div className="grid grid-cols-3 gap-3">
            <StatCard icon={<Flame className="h-4 w-4 text-orange-500" />} value={dashboard.currentStreak} label="day streak" />
            <StatCard icon={<BookOpen className="h-4 w-4 text-primary" />} value={dashboard.totalEntries} label="entries" />
            <StatCard icon={<Type className="h-4 w-4 text-muted-foreground" />} value={dashboard.totalWords.toLocaleString()} label="words" />
          </div>
        </div>
      )}

      {/* On This Day */}
      {onThisDay.length > 0 && (
        <div className="px-5 mb-6">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">On This Day</h2>
          <div className="space-y-2">
            {onThisDay.map((entry) => (
              <Link key={entry.id} to={`/entry/${entry.id}`}>
                <Card className="active:scale-[0.99] transition-transform">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{entry.title || 'Untitled'}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{entry.yearsAgo} year{entry.yearsAgo !== 1 ? 's' : ''} ago</p>
                      </div>
                      {entry.mood && <span className="text-xl flex-shrink-0">{entry.mood.split(' ')[0]}</span>}
                    </div>
                    {entry.rawContent && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{entry.rawContent}</p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Recent Entries */}
      <div className="px-5">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Recent Entries</h2>
        {entries.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-4xl mb-3">📖</p>
            <p className="text-sm">No entries yet. Start writing!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {entries.map((entry) => (
              <Link key={entry.id} to={`/entry/${entry.id}`}>
                <Card className="active:scale-[0.99] transition-transform">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm truncate">{entry.title || 'Untitled'}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{formatShortDate(entry.entryDate)}</p>
                      </div>
                      {entry.mood && <span className="text-xl flex-shrink-0">{entry.mood.split(' ')[0]}</span>}
                    </div>
                    {entry.rawContent && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{entry.rawContent}</p>
                    )}
                    {entry.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {entry.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="sage">{tag}</Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ icon, value, label }: { icon: React.ReactNode; value: string | number; label: string }) {
  return (
    <div className="rounded-2xl border bg-card p-3.5 flex flex-col gap-1">
      <div className="flex items-center gap-1.5">{icon}</div>
      <p className="text-xl font-bold text-foreground leading-none">{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  )
}

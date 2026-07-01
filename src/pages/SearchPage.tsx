import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Search, X } from 'lucide-react'
import { searchEntries } from '@/lib/api'
import type { Entry } from '@/types'
import { MOODS, CONFIDENCE_LEVELS, TAGS } from '@/types'
import { formatShortDate } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export function SearchPage() {
  const [query, setQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState('')
  const [selectedMood, setSelectedMood] = useState('')
  const [selectedConfidence, setSelectedConfidence] = useState('')
  const [results, setResults] = useState<Entry[]>([])
  const [searched, setSearched] = useState(false)
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (debounce.current) clearTimeout(debounce.current)
    debounce.current = setTimeout(() => {
      runSearch()
    }, 400)
  }, [query, selectedTag, selectedMood, selectedConfidence])

  async function runSearch() {
    const params: Record<string, string> = {}
    if (query) params.q = query
    if (selectedTag) params.tag = selectedTag
    if (selectedMood) params.mood = selectedMood
    if (selectedConfidence) params.confidence = selectedConfidence

    if (!Object.keys(params).length) {
      setResults([])
      setSearched(false)
      return
    }

    const res = await searchEntries(params)
    setResults(res)
    setSearched(true)
  }

  function clearAll() {
    setQuery('')
    setSelectedTag('')
    setSelectedMood('')
    setSelectedConfidence('')
    setResults([])
    setSearched(false)
  }

  const hasFilters = query || selectedTag || selectedMood || selectedConfidence

  return (
    <div className="pb-nav min-h-full">
      <div className="px-5 pt-12 pb-4">
        <h1 className="text-2xl font-semibold mb-4">Search</h1>

        {/* Search input */}
        <div className="relative mb-4">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search entries…"
            className="w-full h-11 rounded-xl border border-input bg-card pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-ring transition-all"
          />
          {query && (
            <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="space-y-3">
          {/* Mood filter */}
          <div>
            <p className="text-xs text-muted-foreground font-medium mb-1.5">Mood</p>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {MOODS.map(({ emoji, label }) => {
                const val = `${emoji} ${label}`
                return (
                  <button
                    key={val}
                    onClick={() => setSelectedMood(selectedMood === val ? '' : val)}
                    className={cn(
                      'flex-shrink-0 flex items-center gap-1.5 h-8 px-3 rounded-full text-xs transition-all border',
                      selectedMood === val
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'border-border text-muted-foreground hover:border-primary/40'
                    )}
                  >
                    {emoji} {label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Confidence filter */}
          <div>
            <p className="text-xs text-muted-foreground font-medium mb-1.5">Confidence</p>
            <div className="flex gap-2">
              {CONFIDENCE_LEVELS.map((level) => (
                <button
                  key={level}
                  onClick={() => setSelectedConfidence(selectedConfidence === level ? '' : level)}
                  className={cn(
                    'flex-1 h-8 rounded-lg text-xs font-medium transition-all border',
                    selectedConfidence === level
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-border text-muted-foreground hover:border-primary/40'
                  )}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Tag filter */}
          <div>
            <p className="text-xs text-muted-foreground font-medium mb-1.5">Tag</p>
            <div className="flex flex-wrap gap-1.5">
              {TAGS.map((tag) => (
                <button key={tag} onClick={() => setSelectedTag(selectedTag === tag ? '' : tag)}>
                  <Badge
                    variant={selectedTag === tag ? 'default' : 'outline'}
                    className="cursor-pointer active:scale-95 transition-transform"
                  >
                    {tag}
                  </Badge>
                </button>
              ))}
            </div>
          </div>

          {hasFilters && (
            <button onClick={clearAll} className="text-xs text-muted-foreground underline underline-offset-2">
              Clear all filters
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="px-5">
        {searched && results.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-3xl mb-2">🔍</p>
            <p className="text-sm">No entries found</p>
          </div>
        )}

        {results.length > 0 && (
          <>
            <p className="text-xs text-muted-foreground mb-3">{results.length} result{results.length !== 1 ? 's' : ''}</p>
            <div className="space-y-2">
              {results.map((entry) => (
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
                          {entry.tags.map((tag) => (
                            <Badge key={tag} variant="sage">{tag}</Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

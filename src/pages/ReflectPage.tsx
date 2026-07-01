import { useState } from 'react'
import { Sparkles, Loader2, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { generateMonthlyReflection, generateYearlyReflection } from '@/lib/api'
import type { MonthlyReflection, YearlyReflection } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/useToast'
import { cn } from '@/lib/utils'

type ReflectMode = 'monthly' | 'yearly'

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]

export function ReflectPage() {
  const today = new Date()
  const [mode, setMode] = useState<ReflectMode>('monthly')
  const [month, setMonth] = useState(today.getMonth() + 1)
  const [year, setYear] = useState(today.getFullYear())
  const [loading, setLoading] = useState(false)
  const [monthly, setMonthly] = useState<MonthlyReflection | null>(null)
  const [yearly, setYearly] = useState<YearlyReflection | null>(null)

  const years = Array.from({ length: 5 }, (_, i) => today.getFullYear() - i)

  async function generate() {
    setLoading(true)
    try {
      if (mode === 'monthly') {
        const r = await generateMonthlyReflection(year, month)
        setMonthly(r)
        setYearly(null)
      } else {
        const r = await generateYearlyReflection(year)
        setYearly(r)
        setMonthly(null)
      }
    } catch (e: unknown) {
      toast({ title: (e as Error).message ?? 'Failed to generate', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="pb-nav min-h-full">
      <div className="px-5 pt-12 pb-4">
        <h1 className="text-2xl font-semibold mb-1">Reflect</h1>
        <p className="text-sm text-muted-foreground mb-6">AI-powered reflections on your journey</p>

        {/* Mode toggle */}
        <div className="flex rounded-xl border border-border p-1 mb-5 bg-muted/40">
          {(['monthly', 'yearly'] as const).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setMonthly(null); setYearly(null) }}
              className={cn(
                'flex-1 h-8 rounded-lg text-sm font-medium transition-all',
                mode === m ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground'
              )}
            >
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </button>
          ))}
        </div>

        {/* Period selector */}
        <div className="flex gap-2 mb-5">
          {mode === 'monthly' && (
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="flex-1 h-10 rounded-xl border border-input bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            >
              {MONTHS.map((name, i) => (
                <option key={name} value={i + 1}>{name}</option>
              ))}
            </select>
          )}
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className={cn(
              'h-10 rounded-xl border border-input bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring',
              mode === 'monthly' ? 'w-28' : 'flex-1'
            )}
          >
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        <Button onClick={generate} disabled={loading} className="w-full h-12">
          {loading ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Generating…</>
          ) : (
            <><Sparkles className="h-4 w-4" /> Generate {mode === 'monthly' ? `${MONTHS[month - 1]} ${year}` : `${year}`} Reflection</>
          )}
        </Button>
      </div>

      {/* Monthly result */}
      {monthly && !loading && (
        <div className="px-5 space-y-4 animate-slide-up">
          {monthly.isFallback && <FallbackNotice />}

          <ReflectSection title="🏆 Biggest Wins" items={monthly.biggestWins} />
          <ReflectSection title="💪 Challenges" items={monthly.challenges} />
          <ReflectSection title="📚 Lessons Learned" items={monthly.lessonsLearned} />
          <ReflectSection title="✨ Interesting Memories" items={monthly.interestingMemories} />
          <ReflectSection title="🔁 Recurring Themes" items={monthly.recurringThemes} />

          {(monthly.moodTrend || monthly.confidenceTrend) && (
            <Card>
              <CardContent className="p-4 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground">TRENDS</p>
                {monthly.moodTrend && <p className="text-sm"><span className="font-medium">Mood: </span>{monthly.moodTrend}</p>}
                {monthly.confidenceTrend && <p className="text-sm"><span className="font-medium">Confidence: </span>{monthly.confidenceTrend}</p>}
              </CardContent>
            </Card>
          )}

          {monthly.quoteFromYourself && (
            <Card className="bg-sage-50 border-sage-200">
              <CardContent className="p-4">
                <p className="text-xs font-semibold text-sage-600 mb-2">YOUR OWN WORDS</p>
                <blockquote className="text-sm italic text-sage-800 leading-relaxed">
                  "{monthly.quoteFromYourself}"
                </blockquote>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Yearly result */}
      {yearly && !loading && (
        <div className="px-5 space-y-4 animate-slide-up">
          {yearly.isFallback && <FallbackNotice />}

          {yearly.letterFromAI && (
            <Card className="bg-sage-50 border-sage-200">
              <CardContent className="p-4">
                <p className="text-xs font-semibold text-sage-600 mb-2">LETTER FROM YOUR JOURNAL</p>
                <p className="text-sm text-sage-800 leading-relaxed whitespace-pre-wrap">{yearly.letterFromAI}</p>
              </CardContent>
            </Card>
          )}

          {yearly.whatHappened && (
            <Card>
              <CardContent className="p-4">
                <p className="text-xs font-semibold text-muted-foreground mb-2">THIS YEAR IN SUMMARY</p>
                <p className="text-sm leading-relaxed">{yearly.whatHappened}</p>
              </CardContent>
            </Card>
          )}

          <ReflectSection title="🏆 Biggest Accomplishments" items={yearly.biggestAccomplishments} />
          <ReflectSection title="😤 Biggest Failures" items={yearly.biggestFailures} />
          <ReflectSection title="📚 What I Learned" items={yearly.whatILearned} />
          <ReflectSection title="😮 What Surprised Me" items={yearly.whatSurprisedMe} />
          <ReflectSection title="👥 People Who Mattered" items={yearly.peopleMattered} />
          <ReflectSection title="🔁 Most Common Themes" items={yearly.mostCommonThemes} />
          <ReflectSection title="🛠 Skills Developed" items={yearly.skillsDeveloped} />
          <ReflectSection title="😌 Worried About, Never Happened" items={yearly.worriedAboutNeverHappened} />

          {yearly.howIChanged && (
            <Card>
              <CardContent className="p-4">
                <p className="text-xs font-semibold text-muted-foreground mb-2">HOW I CHANGED</p>
                <p className="text-sm leading-relaxed">{yearly.howIChanged}</p>
              </CardContent>
            </Card>
          )}

          {yearly.adviceToNextYear && (
            <Card className="bg-sage-50 border-sage-200">
              <CardContent className="p-4">
                <p className="text-xs font-semibold text-sage-600 mb-2">ADVICE TO NEXT YEAR'S ME</p>
                <p className="text-sm italic text-sage-800 leading-relaxed">{yearly.adviceToNextYear}</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}

function ReflectSection({ title, items }: { title: string; items: string[] }) {
  const [open, setOpen] = useState(true)
  if (!items.length) return null
  return (
    <Card>
      <CardContent className="p-4">
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center justify-between w-full"
        >
          <p className="text-sm font-semibold">{title}</p>
          {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </button>
        {open && (
          <ul className="mt-3 space-y-1.5">
            {items.map((item, i) => (
              <li key={i} className="text-sm flex gap-2">
                <span className="text-muted-foreground mt-0.5 flex-shrink-0">·</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

function FallbackNotice() {
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted rounded-xl px-3 py-2">
      <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
      <span>Fallback response — add OPENAI_API_KEY to .env for full AI reflections</span>
    </div>
  )
}

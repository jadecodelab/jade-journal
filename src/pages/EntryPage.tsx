import { useEffect, useState } from 'react'
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Pencil, Trash2, Sparkles, Loader2, AlertCircle, Check } from 'lucide-react'
import { getEntry, deleteEntry, aiImprove, aiOrganize, aiInsights, updateEntry } from '@/lib/api'
import type { Entry } from '@/types'
import { formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from '@/hooks/useToast'
import { cn } from '@/lib/utils'

type AiTab = 'improve' | 'organize' | 'insights' | null

export function EntryPage() {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [entry, setEntry] = useState<Entry | null>(null)
  const [activeTab, setActiveTab] = useState<AiTab>(
    (searchParams.get('tab') as AiTab) ?? null
  )
  const [aiResult, setAiResult] = useState<{
    text?: string
    wins?: string[]
    challenges?: string[]
    lessons?: string[]
    goals?: string[]
    suggestedTags?: string[]
    isFallback?: boolean
  } | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [applying, setApplying] = useState(false)

  useEffect(() => {
    if (id) getEntry(id).then(setEntry)
  }, [id])

  useEffect(() => {
    if (activeTab && entry && !aiResult) runAI(activeTab)
  }, [activeTab, entry])

  async function runAI(tab: AiTab) {
    if (!id || !tab) return
    setAiLoading(true)
    setAiResult(null)
    try {
      if (tab === 'improve') {
        const r = await aiImprove(id)
        setAiResult(r)
      } else if (tab === 'organize') {
        const r = await aiOrganize(id)
        setAiResult(r)
      } else if (tab === 'insights') {
        const r = await aiInsights(id)
        setAiResult(r)
      }
    } catch {
      toast({ title: 'AI request failed', variant: 'destructive' })
    } finally {
      setAiLoading(false)
    }
  }

  function handleTabClick(tab: AiTab) {
    if (activeTab === tab) {
      setActiveTab(null)
      setAiResult(null)
    } else {
      setActiveTab(tab)
      setAiResult(null)
    }
  }

  async function applyImprovement() {
    if (!id || !aiResult?.text) return
    setApplying(true)
    try {
      const updated = await updateEntry(id, { rawContent: aiResult.text })
      setEntry(updated)
      setActiveTab(null)
      setAiResult(null)
      toast({ title: 'Writing updated' })
    } catch {
      toast({ title: 'Failed to apply', variant: 'destructive' })
    } finally {
      setApplying(false)
    }
  }

  async function handleDelete() {
    if (!id || !confirm('Delete this entry?')) return
    await deleteEntry(id)
    navigate('/')
  }

  if (!entry) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="pb-nav min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-12 pb-3 border-b border-border/50">
        <button onClick={() => navigate(-1)} className="p-1 -ml-1 text-muted-foreground active:opacity-60">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          <Link to={`/write?edit=${entry.id}`}>
            <button className="p-2 text-muted-foreground hover:text-foreground active:opacity-60">
              <Pencil className="h-4 w-4" />
            </button>
          </Link>
          <button onClick={handleDelete} className="p-2 text-muted-foreground hover:text-destructive active:opacity-60">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="px-5 py-5">
        {/* Date & mood */}
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-muted-foreground">{formatDate(entry.entryDate)}</p>
          {entry.mood && <span className="text-2xl">{entry.mood.split(' ')[0]}</span>}
        </div>

        {/* Title */}
        <h1 className="text-2xl font-semibold mb-4">{entry.title || 'Untitled'}</h1>

        {/* Confidence & tags */}
        <div className="flex flex-wrap items-center gap-2 mb-5">
          {entry.confidence && (
            <Badge variant="secondary">{entry.confidence} confidence</Badge>
          )}
          {entry.tags.map((tag) => (
            <Badge key={tag} variant="sage">{tag}</Badge>
          ))}
          <span className="text-xs text-muted-foreground ml-auto">{entry.wordCount} words</span>
        </div>

        {/* Raw content */}
        <p className="text-base leading-relaxed text-foreground whitespace-pre-wrap">{entry.rawContent}</p>

        {/* AI Panel */}
        <div className="mt-8">
          <div className="flex items-center gap-1.5 mb-3">
            <Sparkles className="h-4 w-4 text-primary" />
            <p className="text-sm font-medium text-foreground">AI Assistant</p>
          </div>

          <div className="flex gap-2 mb-4">
            {(['improve', 'organize', 'insights'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabClick(tab)}
                className={cn(
                  'flex-1 h-9 rounded-xl text-xs font-medium transition-all border',
                  activeTab === tab
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
                )}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {aiLoading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-6 justify-center">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Thinking…</span>
            </div>
          )}

          {aiResult && !aiLoading && (
            <div className="animate-slide-up">
              {aiResult.isFallback && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted rounded-xl px-3 py-2 mb-3">
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>Fallback response — add OPENAI_API_KEY for full AI</span>
                </div>
              )}

              {(activeTab === 'improve' || activeTab === 'organize') && aiResult.text && (
                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{aiResult.text}</p>
                    {activeTab === 'improve' && (
                      <Button
                        size="sm"
                        className="mt-3 w-full"
                        onClick={applyImprovement}
                        disabled={applying}
                      >
                        {applying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                        Apply to entry
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}

              {activeTab === 'insights' && (
                <div className="space-y-3">
                  <InsightSection label="🏆 Wins" items={aiResult.wins ?? []} />
                  <InsightSection label="💪 Challenges" items={aiResult.challenges ?? []} />
                  <InsightSection label="📚 Lessons" items={aiResult.lessons ?? []} />
                  <InsightSection label="🎯 Goals" items={aiResult.goals ?? []} />
                  {(aiResult.suggestedTags ?? []).length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1.5">Suggested Tags</p>
                      <div className="flex flex-wrap gap-1.5">
                        {aiResult.suggestedTags!.map((tag) => (
                          <Badge key={tag} variant="sage">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function InsightSection({ label, items }: { label: string; items: string[] }) {
  if (!items.length) return null
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs font-semibold text-muted-foreground mb-2">{label}</p>
        <ul className="space-y-1">
          {items.map((item, i) => (
            <li key={i} className="text-sm flex gap-2">
              <span className="text-muted-foreground mt-0.5">·</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

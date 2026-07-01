import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Sparkles } from 'lucide-react'
import { createEntry, updateEntry } from '@/lib/api'
import { MOODS, CONFIDENCE_LEVELS, TAGS, type Entry } from '@/types'
import { toast } from '@/hooks/useToast'
import { todayISO } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const AUTOSAVE_MS = 1500

interface WritePageProps {
  initialEntry?: Entry
}

export function WritePage({ initialEntry }: WritePageProps) {
  const navigate = useNavigate()
  const [entryId, setEntryId] = useState(initialEntry?.id ?? '')
  const [title, setTitle] = useState(initialEntry?.title ?? '')
  const [content, setContent] = useState(initialEntry?.rawContent ?? '')
  const [mood, setMood] = useState(initialEntry?.mood ?? '')
  const [confidence, setConfidence] = useState(initialEntry?.confidence ?? '')
  const [selectedTags, setSelectedTags] = useState<string[]>(initialEntry?.tags ?? [])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [wordCount, setWordCount] = useState(initialEntry?.wordCount ?? 0)
  const [showMoodPicker, setShowMoodPicker] = useState(false)
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isDirty = useRef(false)
  const isFirstRender = useRef(true)

  useEffect(() => {
    const count = content.trim().split(/\s+/).filter(Boolean).length
    setWordCount(count)
  }, [content])

  const save = useCallback(async () => {
    if (!isDirty.current) return
    setSaving(true)
    setSaved(false)
    try {
      const data = { title, rawContent: content, mood: mood || null, confidence: confidence || null, tags: selectedTags }
      if (entryId) {
        await updateEntry(entryId, data)
      } else {
        const entry = await createEntry({ ...data, entryDate: todayISO() })
        setEntryId(entry.id)
      }
      isDirty.current = false
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {
      toast({ title: 'Autosave failed', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }, [title, content, mood, confidence, selectedTags, entryId])

  // Reschedule the debounced save whenever a field changes, after React
  // commits the new state — avoids autosaving a stale closure's values.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    isDirty.current = true
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current)
    autosaveTimer.current = setTimeout(save, AUTOSAVE_MS)
  }, [title, content, mood, confidence, selectedTags, save])

  function toggleTag(tag: string) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  async function handleBack() {
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current)
    if (isDirty.current) await save()
    if (entryId) {
      navigate(`/entry/${entryId}`)
    } else {
      navigate('/')
    }
  }

  return (
    <div className="flex flex-col min-h-full pb-nav">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 pt-12 pb-3 border-b border-border/50">
        <button onClick={handleBack} className="flex items-center gap-1.5 text-muted-foreground active:opacity-60 -ml-1 p-1">
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">{wordCount} words</span>
          {saving && <span className="text-xs text-muted-foreground">Saving…</span>}
          {saved && <span className="text-xs text-primary">Saved</span>}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 px-5 py-4 space-y-3">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="w-full text-xl font-semibold bg-transparent outline-none placeholder:text-muted-foreground/50 text-foreground"
        />

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind…"
          autoFocus={!initialEntry}
          className="w-full min-h-[40vh] bg-transparent outline-none text-base leading-relaxed placeholder:text-muted-foreground/50 text-foreground"
        />
      </div>

      {/* Mood + Confidence + Tags */}
      <div className="px-5 pb-4 space-y-4 border-t border-border/50 pt-4">
        {/* Mood picker */}
        <div>
          <p className="text-xs text-muted-foreground font-medium mb-2">How are you feeling?</p>
          {!showMoodPicker ? (
            <button
              onClick={() => setShowMoodPicker(true)}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {mood ? (
                <span className="text-2xl">{mood.split(' ')[0]}</span>
              ) : (
                <span className="text-2xl opacity-30">☺</span>
              )}
              <span>{mood ? mood.split(' ').slice(1).join(' ') : 'Pick a mood'}</span>
            </button>
          ) : (
            <div className="grid grid-cols-4 gap-2 animate-fade-in">
              {MOODS.map(({ emoji, label }) => {
                const value = `${emoji} ${label}`
                return (
                  <button
                    key={value}
                    onClick={() => {
                      setMood(mood === value ? '' : value)
                      setShowMoodPicker(false)
                    }}
                    className={cn(
                      'flex flex-col items-center gap-1 rounded-xl p-2 transition-all',
                      mood === value ? 'bg-primary/10 ring-1 ring-primary' : 'hover:bg-muted active:scale-95'
                    )}
                  >
                    <span className="text-2xl">{emoji}</span>
                    <span className="text-[10px] text-muted-foreground">{label}</span>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Confidence */}
        <div>
          <p className="text-xs text-muted-foreground font-medium mb-2">Confidence</p>
          <div className="flex gap-2">
            {CONFIDENCE_LEVELS.map((level) => (
              <button
                key={level}
                onClick={() => setConfidence(confidence === level ? '' : level)}
                className={cn(
                  'flex-1 h-8 rounded-lg text-sm font-medium transition-all',
                  confidence === level
                    ? 'bg-primary text-primary-foreground'
                    : 'border border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
                )}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div>
          <p className="text-xs text-muted-foreground font-medium mb-2">Tags</p>
          <div className="flex flex-wrap gap-1.5">
            {TAGS.map((tag) => (
              <button key={tag} onClick={() => toggleTag(tag)}>
                <Badge
                  variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                  className="cursor-pointer active:scale-95 transition-transform"
                >
                  {tag}
                </Badge>
              </button>
            ))}
          </div>
        </div>

        {/* AI Actions — shown only after save */}
        {entryId && (
          <AIActions entryId={entryId} />
        )}
      </div>
    </div>
  )
}

function AIActions({ entryId }: { entryId: string }) {
  const navigate = useNavigate()
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-2">
        <Sparkles className="h-3.5 w-3.5 text-primary" />
        <p className="text-xs text-muted-foreground font-medium">AI Assistant</p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => navigate(`/entry/${entryId}?tab=improve`)}
          className="flex-1 h-9 rounded-xl border border-primary/30 text-primary text-xs font-medium hover:bg-primary/5 transition-colors active:scale-95"
        >
          Improve
        </button>
        <button
          onClick={() => navigate(`/entry/${entryId}?tab=organize`)}
          className="flex-1 h-9 rounded-xl border border-primary/30 text-primary text-xs font-medium hover:bg-primary/5 transition-colors active:scale-95"
        >
          Organize
        </button>
        <button
          onClick={() => navigate(`/entry/${entryId}?tab=insights`)}
          className="flex-1 h-9 rounded-xl border border-primary/30 text-primary text-xs font-medium hover:bg-primary/5 transition-colors active:scale-95"
        >
          Insights
        </button>
      </div>
    </div>
  )
}

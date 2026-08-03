import OpenAI from 'openai'

function getClient(): OpenAI {
  const provider = process.env.AI_PROVIDER ?? 'openai'

  if (provider === 'ollama') {
    const base = (process.env.OLLAMA_URL ?? 'http://localhost:11434').replace(/\/+$/, '')
    return new OpenAI({
      baseURL: base.endsWith('/v1') ? base : `${base}/v1`,
      apiKey: 'ollama',
    })
  }

  if (!process.env.OPENAI_API_KEY) throw new Error('no_key')
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
}

function MODEL(): string {
  const provider = process.env.AI_PROVIDER ?? 'openai'
  if (provider === 'ollama') return process.env.OLLAMA_MODEL ?? 'llama3.2'
  return process.env.OPENAI_MODEL ?? 'gpt-4o'
}

async function chat(system: string, user: string): Promise<string> {
  const ai = getClient()
  const res = await ai.chat.completions.create({
    model: MODEL(),
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
    temperature: 0.7,
  })
  return res.choices[0]?.message?.content?.trim() ?? ''
}

function stripJsonFences(text: string): string {
  return text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
}

function isEnabled(): boolean {
  const provider = process.env.AI_PROVIDER ?? 'openai'
  if (provider === 'ollama') return true
  return !!process.env.OPENAI_API_KEY
}

// ─── Public API ─────────────────────────────────────────────────────────────

export async function improveWriting(rawContent: string): Promise<{ text: string; isFallback: boolean; model: string }> {
  if (!isEnabled()) return { text: rawContent, isFallback: true, model: 'fallback' }
  try {
    const text = await chat(
      "You are a careful editor. Fix grammar, punctuation, and clarity issues in the journal entry. Do NOT change the author's tone, personality, or voice. Do NOT make it sound like AI. Keep their personality. Return only the polished text, nothing else.",
      rawContent,
    )
    return { text, isFallback: false, model: MODEL() }
  } catch (err) {
    console.error('[ai] improveWriting failed:', err)
    return { text: rawContent, isFallback: true, model: 'fallback' }
  }
}

export async function organizeEntry(rawContent: string): Promise<{ text: string; isFallback: boolean; model: string }> {
  if (!isEnabled()) return { text: fallbackOrganize(rawContent), isFallback: true, model: 'fallback' }
  try {
    const text = await chat(
      "Reorganize the journal entry into four clearly labeled sections with markdown headings: ## What Happened, ## How I Felt, ## What I Learned, ## Next Steps. Keep the author's words as much as possible. Return only the organized text.",
      rawContent,
    )
    return { text, isFallback: false, model: MODEL() }
  } catch (err) {
    console.error('[ai] organizeEntry failed:', err)
    return { text: fallbackOrganize(rawContent), isFallback: true, model: 'fallback' }
  }
}

export interface InsightResult {
  wins: string[]
  challenges: string[]
  lessons: string[]
  goals: string[]
  suggestedTags: string[]
  isFallback: boolean
  model: string
}

export async function extractInsights(rawContent: string): Promise<InsightResult> {
  if (!isEnabled()) return { ...fallbackInsights(), isFallback: true, model: 'fallback' }
  try {
    const raw = await chat(
      `Extract structured insights from this journal entry. Return ONLY a valid JSON object with exactly these keys:
{
  "wins": ["..."],
  "challenges": ["..."],
  "lessons": ["..."],
  "goals": ["..."],
  "suggestedTags": ["..."]
}
suggestedTags must only use values from: Interview, Career, School, Family, Programming, Health, Relationships, Personal Growth.
Return only the JSON object. No markdown, no explanation.`,
      rawContent,
    )
    const json = JSON.parse(stripJsonFences(raw)) as Omit<InsightResult, 'isFallback' | 'model'>
    return { ...json, isFallback: false, model: MODEL() }
  } catch (err) {
    console.error('[ai] extractInsights failed:', err)
    return { ...fallbackInsights(), isFallback: true, model: 'fallback' }
  }
}

export interface MonthlyReflectionResult {
  biggestWins: string[]
  challenges: string[]
  lessonsLearned: string[]
  interestingMemories: string[]
  recurringThemes: string[]
  moodTrend: string
  confidenceTrend: string
  quoteFromYourself: string
  isFallback: boolean
  model: string
}

export async function generateMonthlyReflection(
  entries: { rawContent: string; mood?: string | null; confidence?: string | null; entryDate: Date }[],
  period: string,
): Promise<MonthlyReflectionResult> {
  if (!isEnabled()) return { ...fallbackMonthly(period), isFallback: true, model: 'fallback' }

  const context = entries
    .map((e) => `[${new Date(e.entryDate).toLocaleDateString()} | mood: ${e.mood ?? 'N/A'} | confidence: ${e.confidence ?? 'N/A'}]\n${e.rawContent}`)
    .join('\n\n---\n\n')

  try {
    const raw = await chat(
      `You are a thoughtful journaling companion. Analyze these journal entries from ${period} and return ONLY a valid JSON object with exactly these keys:
{
  "biggestWins": ["..."],
  "challenges": ["..."],
  "lessonsLearned": ["..."],
  "interestingMemories": ["..."],
  "recurringThemes": ["..."],
  "moodTrend": "...",
  "confidenceTrend": "...",
  "quoteFromYourself": "..."
}
quoteFromYourself must be a direct verbatim quote from the entries that captures the month well.
Return only the JSON object. No markdown, no explanation.`,
      context,
    )
    const json = JSON.parse(stripJsonFences(raw)) as Omit<MonthlyReflectionResult, 'isFallback' | 'model'>
    return { ...json, isFallback: false, model: MODEL() }
  } catch (err) {
    console.error('[ai] generateMonthlyReflection failed:', err)
    return { ...fallbackMonthly(period), isFallback: true, model: 'fallback' }
  }
}

export interface YearlyReflectionResult {
  whatHappened: string
  biggestAccomplishments: string[]
  biggestFailures: string[]
  whatILearned: string[]
  howIChanged: string
  whatSurprisedMe: string[]
  peopleMattered: string[]
  mostCommonThemes: string[]
  skillsDeveloped: string[]
  worriedAboutNeverHappened: string[]
  adviceToNextYear: string
  letterFromAI: string
  isFallback: boolean
  model: string
}

export async function generateYearlyReflection(
  entries: { rawContent: string; mood?: string | null; confidence?: string | null; entryDate: Date }[],
  year: number,
): Promise<YearlyReflectionResult> {
  if (!isEnabled()) return { ...fallbackYearly(year), isFallback: true, model: 'fallback' }

  const context = entries
    .map((e) => `[${new Date(e.entryDate).toLocaleDateString()} | mood: ${e.mood ?? 'N/A'} | confidence: ${e.confidence ?? 'N/A'}]\n${e.rawContent}`)
    .join('\n\n---\n\n')

  try {
    const raw = await chat(
      `You are a deeply empathetic journaling companion reviewing a full year of journal entries from ${year}. Return ONLY a valid JSON object with exactly these keys:
{
  "whatHappened": "...",
  "biggestAccomplishments": ["..."],
  "biggestFailures": ["..."],
  "whatILearned": ["..."],
  "howIChanged": "...",
  "whatSurprisedMe": ["..."],
  "peopleMattered": ["..."],
  "mostCommonThemes": ["..."],
  "skillsDeveloped": ["..."],
  "worriedAboutNeverHappened": ["..."],
  "adviceToNextYear": "...",
  "letterFromAI": "..."
}
letterFromAI should be a heartfelt, personal 2-3 paragraph letter celebrating growth and acknowledging struggles.
Return only the JSON object. No markdown, no explanation.`,
      context,
    )
    const json = JSON.parse(stripJsonFences(raw)) as Omit<YearlyReflectionResult, 'isFallback' | 'model'>
    return { ...json, isFallback: false, model: MODEL() }
  } catch (err) {
    console.error('[ai] generateYearlyReflection failed:', err)
    return { ...fallbackYearly(year), isFallback: true, model: 'fallback' }
  }
}

// ─── Deterministic fallbacks ─────────────────────────────────────────────────

function fallbackOrganize(text: string): string {
  return `## What Happened\n\n${text}\n\n## How I Felt\n\n*(Add your feelings here)*\n\n## What I Learned\n\n*(Add your lessons here)*\n\n## Next Steps\n\n*(Add your next steps here)*`
}

function fallbackInsights(): Omit<InsightResult, 'isFallback' | 'model'> {
  return {
    wins: ['Took time to journal today'],
    challenges: ['Identifying patterns takes time'],
    lessons: ['Reflection is a practice'],
    goals: ['Keep journaling consistently'],
    suggestedTags: ['Personal Growth'],
  }
}

function fallbackMonthly(period: string): Omit<MonthlyReflectionResult, 'isFallback' | 'model'> {
  return {
    biggestWins: ['Maintained a journaling habit'],
    challenges: [`AI reflection unavailable for ${period}`],
    lessonsLearned: ['Every entry is progress'],
    interestingMemories: [],
    recurringThemes: [],
    moodTrend: 'No trend data available',
    confidenceTrend: 'No trend data available',
    quoteFromYourself: '',
  }
}

function fallbackYearly(year: number): Omit<YearlyReflectionResult, 'isFallback' | 'model'> {
  return {
    whatHappened: `A year of journaling in ${year}.`,
    biggestAccomplishments: ['Kept a journal'],
    biggestFailures: [],
    whatILearned: ['Reflection is valuable'],
    howIChanged: 'Growth happens quietly.',
    whatSurprisedMe: [],
    peopleMattered: [],
    mostCommonThemes: [],
    skillsDeveloped: [],
    worriedAboutNeverHappened: [],
    adviceToNextYear: 'Keep writing.',
    letterFromAI: `Start Ollama and set AI_PROVIDER=ollama in .env to unlock AI reflections for ${year}.`,
  }
}

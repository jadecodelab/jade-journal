import OpenAI from 'openai'

let client: OpenAI | null = null

function getClient(): OpenAI | null {
  if (!process.env.OPENAI_API_KEY) return null
  if (!client) client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  return client
}

const MODEL = () => process.env.OPENAI_MODEL ?? 'gpt-4o'

export async function improveWriting(rawContent: string): Promise<{ text: string; isFallback: boolean; model: string }> {
  const ai = getClient()
  if (!ai) return { text: fallbackImprove(rawContent), isFallback: true, model: 'fallback' }

  try {
    const response = await ai.responses.create({
      model: MODEL(),
      input: [
        {
          role: 'system',
          content:
            'You are a careful editor. Fix grammar, punctuation, and clarity issues in the journal entry below. Do NOT change the author\'s tone, personality, or voice. Do NOT make it sound like AI. Return only the polished text, nothing else.',
        },
        { role: 'user', content: rawContent },
      ],
    })
    return { text: response.output_text.trim(), isFallback: false, model: MODEL() }
  } catch {
    return { text: fallbackImprove(rawContent), isFallback: true, model: 'fallback' }
  }
}

export async function organizeEntry(rawContent: string): Promise<{ text: string; isFallback: boolean; model: string }> {
  const ai = getClient()
  if (!ai) return { text: fallbackOrganize(rawContent), isFallback: true, model: 'fallback' }

  try {
    const response = await ai.responses.create({
      model: MODEL(),
      input: [
        {
          role: 'system',
          content:
            'Reorganize the journal entry into four clearly labeled sections: "What Happened", "How I Felt", "What I Learned", and "Next Steps". Keep the author\'s words as much as possible. Return only the organized text with markdown headings.',
        },
        { role: 'user', content: rawContent },
      ],
    })
    return { text: response.output_text.trim(), isFallback: false, model: MODEL() }
  } catch {
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
  const ai = getClient()
  if (!ai) return { ...fallbackInsights(), isFallback: true, model: 'fallback' }

  try {
    const response = await ai.responses.create({
      model: MODEL(),
      input: [
        {
          role: 'system',
          content: `Extract structured insights from this journal entry. Return a JSON object with exactly these keys:
{
  "wins": ["..."],
  "challenges": ["..."],
  "lessons": ["..."],
  "goals": ["..."],
  "suggestedTags": ["..."]
}
suggestedTags should be from: Interview, Career, School, Family, Programming, Health, Relationships, Personal Growth.
Return only valid JSON.`,
        },
        { role: 'user', content: rawContent },
      ],
    })

    const json = JSON.parse(response.output_text.trim()) as InsightResult
    return { ...json, isFallback: false, model: MODEL() }
  } catch {
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
  const ai = getClient()
  if (!ai) return { ...fallbackMonthly(period), isFallback: true, model: 'fallback' }

  const context = entries
    .map((e) => `[${new Date(e.entryDate).toLocaleDateString()} | mood: ${e.mood ?? 'N/A'} | confidence: ${e.confidence ?? 'N/A'}]\n${e.rawContent}`)
    .join('\n\n---\n\n')

  try {
    const response = await ai.responses.create({
      model: MODEL(),
      input: [
        {
          role: 'system',
          content: `You are a thoughtful journaling companion. Analyze these journal entries from ${period} and return a JSON object with exactly:
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
quoteFromYourself should be a direct quote (verbatim) from the entries that captures the month well.
Return only valid JSON.`,
        },
        { role: 'user', content: context },
      ],
    })
    const json = JSON.parse(response.output_text.trim()) as MonthlyReflectionResult
    return { ...json, isFallback: false, model: MODEL() }
  } catch {
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
  const ai = getClient()
  if (!ai) return { ...fallbackYearly(year), isFallback: true, model: 'fallback' }

  const context = entries
    .map((e) => `[${new Date(e.entryDate).toLocaleDateString()} | mood: ${e.mood ?? 'N/A'} | confidence: ${e.confidence ?? 'N/A'}]\n${e.rawContent}`)
    .join('\n\n---\n\n')

  try {
    const response = await ai.responses.create({
      model: MODEL(),
      input: [
        {
          role: 'system',
          content: `You are a deeply empathetic journaling companion reviewing a full year of journal entries from ${year}. Return a JSON object with exactly these keys:
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
Return only valid JSON.`,
        },
        { role: 'user', content: context },
      ],
    })
    const json = JSON.parse(response.output_text.trim()) as YearlyReflectionResult
    return { ...json, isFallback: false, model: MODEL() }
  } catch {
    return { ...fallbackYearly(year), isFallback: true, model: 'fallback' }
  }
}

// ─── Deterministic fallbacks ───────────────────────────────────────────────

function fallbackImprove(text: string): string {
  return text
}

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
    challenges: ['AI reflection unavailable — add your OPENAI_API_KEY to enable it'],
    lessonsLearned: ['Every entry is progress'],
    interestingMemories: [],
    recurringThemes: [],
    moodTrend: `No trend data for ${period}`,
    confidenceTrend: `No trend data for ${period}`,
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
    letterFromAI: `Add your OPENAI_API_KEY to .env to unlock a personalized yearly reflection letter for ${year}.`,
  }
}

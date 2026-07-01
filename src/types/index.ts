export interface Entry {
  id: string
  title: string
  entryDate: string
  rawContent: string
  mood: string | null
  confidence: string | null
  wordCount: number
  createdAt: string
  updatedAt: string
  tags: string[]
  insights?: Insight
}

export interface Insight {
  id: string
  entryId: string
  wins: string
  challenges: string
  lessons: string
  goals: string
  suggestedTags: string
  model: string | null
  isFallback: boolean
  createdAt: string
}

export interface DashboardData {
  totalEntries: number
  totalWords: number
  currentStreak: number
  longestStreak: number
  moodDistribution: Record<string, number>
  confidenceDistribution: Record<string, number>
  topTags: { name: string; count: number }[]
  monthlyWords: { month: string; words: number }[]
}

export interface TimelineEntry {
  id: string
  title: string
  entryDate: string
  mood: string | null
  wordCount: number
}

export interface MonthlyReflection {
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

export interface YearlyReflection {
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

export const MOODS = [
  { emoji: '😄', label: 'Excited' },
  { emoji: '😊', label: 'Happy' },
  { emoji: '😌', label: 'Calm' },
  { emoji: '😐', label: 'Neutral' },
  { emoji: '😔', label: 'Sad' },
  { emoji: '😰', label: 'Anxious' },
  { emoji: '😤', label: 'Frustrated' },
  { emoji: '😩', label: 'Exhausted' },
] as const

export const CONFIDENCE_LEVELS = ['Low', 'Medium', 'High'] as const

export const TAGS = [
  'Interview', 'Career', 'School', 'Family',
  'Programming', 'Health', 'Relationships', 'Personal Growth',
] as const

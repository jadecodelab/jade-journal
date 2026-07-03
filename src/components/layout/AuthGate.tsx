import { useState } from 'react'
import { verifyPassword } from '@/lib/api'

const SESSION_KEY = 'jade_auth'

export function isAuthenticated(): boolean {
  return sessionStorage.getItem(SESSION_KEY) === 'true'
}

interface AuthGateProps {
  children: React.ReactNode
}

export function AuthGate({ children }: AuthGateProps) {
  const [authed, setAuthed] = useState(isAuthenticated)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { ok } = await verifyPassword(password)
      if (ok) {
        sessionStorage.setItem(SESSION_KEY, 'true')
        setAuthed(true)
      } else {
        setError('Incorrect password')
      }
    } catch {
      setError('Incorrect password')
    } finally {
      setLoading(false)
    }
  }

  if (authed) return <>{children}</>

  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center px-6">
      <div className="w-full max-w-sm animate-slide-up">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4 overflow-hidden">
            <img src="/Jade.png" alt="Jade Journal" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground">Jade Journal</h1>
          <p className="text-muted-foreground text-sm mt-1">Your private space to reflect</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              autoFocus
              className="w-full h-12 rounded-xl border border-input bg-card px-4 text-base outline-none focus:ring-2 focus:ring-ring transition-all placeholder:text-muted-foreground"
            />
          </div>

          {error && (
            <p className="text-destructive text-sm text-center animate-fade-in">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-medium text-base transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90"
          >
            {loading ? 'Unlocking…' : 'Unlock'}
          </button>
        </form>
      </div>
    </div>
  )
}

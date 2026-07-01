import { NavLink } from 'react-router-dom'
import { Home, PenLine, CalendarDays, Sparkles, Search } from 'lucide-react'
import { cn } from '@/lib/utils'

const tabs = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/write', icon: PenLine, label: 'Write' },
  { to: '/timeline', icon: CalendarDays, label: 'Timeline' },
  { to: '/reflect', icon: Sparkles, label: 'Reflect' },
  { to: '/search', icon: Search, label: 'Search' },
]

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-sm safe-bottom">
      <div className="flex items-stretch h-16 max-w-lg mx-auto">
        {tabs.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex-1 flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  className={cn('h-5 w-5 transition-all', isActive && 'scale-110')}
                  strokeWidth={isActive ? 2.5 : 1.8}
                />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

import { BrowserRouter, Routes, Route, useLocation, useSearchParams } from 'react-router-dom'
import { AuthGate } from '@/components/layout/AuthGate'
import { BottomNav } from '@/components/layout/BottomNav'
import { ToastContainer } from '@/components/layout/ToastContainer'
import { HomePage } from '@/pages/HomePage'
import { WritePage } from '@/pages/WritePage'
import { EntryPage } from '@/pages/EntryPage'
import { SearchPage } from '@/pages/SearchPage'
import { TimelinePage } from '@/pages/TimelinePage'
import { ReflectPage } from '@/pages/ReflectPage'

function WritePageWrapper() {
  const [searchParams] = useSearchParams()
  const editId = searchParams.get('edit')
  return <WritePage key={editId ?? 'new'} />
}

function AppShell() {
  const location = useLocation()
  const hideNav = location.pathname.startsWith('/entry/')

  return (
    <div className="flex flex-col min-h-full max-w-lg mx-auto relative">
      <main className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/write" element={<WritePageWrapper />} />
          <Route path="/entry/:id" element={<EntryPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/timeline" element={<TimelinePage />} />
          <Route path="/reflect" element={<ReflectPage />} />
        </Routes>
      </main>
      {!hideNav && <BottomNav />}
      <ToastContainer />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthGate>
        <AppShell />
      </AuthGate>
    </BrowserRouter>
  )
}

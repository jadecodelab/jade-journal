import { BrowserRouter, Routes, Route, useSearchParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { AuthGate } from '@/components/layout/AuthGate'
import { BottomNav } from '@/components/layout/BottomNav'
import { ToastContainer } from '@/components/layout/ToastContainer'
import { HomePage } from '@/pages/HomePage'
import { WritePage } from '@/pages/WritePage'
import { EntryPage } from '@/pages/EntryPage'
import { SearchPage } from '@/pages/SearchPage'
import { TimelinePage } from '@/pages/TimelinePage'
import { ReflectPage } from '@/pages/ReflectPage'
import { getEntry } from '@/lib/api'
import type { Entry } from '@/types'

function WritePageWrapper() {
  const [searchParams] = useSearchParams()
  const editId = searchParams.get('edit')
  const [entry, setEntry] = useState<Entry | null>(null)
  const [loading, setLoading] = useState(!!editId)

  useEffect(() => {
    if (!editId) return
    getEntry(editId).then((e) => { setEntry(e); setLoading(false) })
  }, [editId])

  if (loading) return null
  return <WritePage key={editId ?? 'new'} initialEntry={entry ?? undefined} />
}

function AppShell() {
  return (
    <div className="flex flex-col min-h-full w-full max-w-lg mx-auto relative">
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
      <BottomNav />
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

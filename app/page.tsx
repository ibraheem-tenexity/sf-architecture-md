'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppShell } from '@/app/components/AppShell'
import { SavedDocsList } from '@/app/components/SavedDocsList'
import { ErrorCard } from '@/app/components/ErrorCard'

const SAMPLE_REPO_URL = 'https://github.com/sample/architecture-demo'

export default function HomePage() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [genError, setGenError] = useState<string | null>(null)
  const router = useRouter()

  const handleGenerate = async () => {
    if (!url.trim()) return
    setLoading(true)
    setGenError(null)
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl: url.trim() }),
      })
      const data = await res.json()
      if (data.id) {
        router.push(`/doc/${data.id}`)
      } else {
        setGenError(data.error || 'Generation failed')
        setLoading(false)
      }
    } catch {
      setGenError('Network error')
      setLoading(false)
    }
  }

  const handleRetry = () => {
    setGenError(null)
    handleGenerate()
  }

  const handleTrySample = () => {
    setUrl(SAMPLE_REPO_URL)
    setGenError(null)
  }

  return (
    <AppShell leftRail={<SavedDocsList />}>
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-2xl space-y-8">
          <div className="text-center space-y-3">
            <p className="category-label">architecture.md</p>
            <h1 className="font-display text-display-lg text-foreground">
              Generate a living ARCHITECTURE.md
            </h1>
            <p className="text-body-lg text-secondary">
              Connect a public GitHub repo and get a prose overview, module map,
              Mermaid diagram, and codemap index — ready to commit.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="url"
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="https://github.com/owner/repo"
                aria-label="Repository URL"
                className="flex-1 h-11 px-4 rounded-md border border-input bg-raised text-body-md placeholder:text-tertiary focus-visible:ring-2 focus-visible:ring-brand/50 outline-none transition-shadow"
                onKeyDown={e => e.key === 'Enter' && handleGenerate()}
                disabled={loading}
              />
              <button
                onClick={handleGenerate}
                disabled={loading || !url.trim()}
                className="h-11 px-6 rounded-md bg-brand text-brand-foreground text-body-md font-medium hover:bg-brand-deep transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Generating…' : 'Generate architecture doc'}
              </button>
            </div>
            <button
              onClick={() => setUrl(SAMPLE_REPO_URL)}
              className="text-body-sm text-brand hover:text-brand-deep transition-colors underline underline-offset-2"
            >
              Use sample repo
            </button>
          </div>

          {genError && (
            <ErrorCard
              error={genError}
              retainedUrl={url}
              onRetry={handleRetry}
              onTrySample={handleTrySample}
            />
          )}
        </div>
      </div>
    </AppShell>
  )
}

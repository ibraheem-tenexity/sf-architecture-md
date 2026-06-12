'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface DocSummary {
  id: string
  title: string
  repoUrl: string
  status: string
  updatedAt: string
}

function statusColor(status: string) {
  if (status === 'ready' || status === 'partial') return 'text-success bg-success-soft'
  if (status === 'generating') return 'text-info bg-info-soft'
  if (status === 'failed') return 'text-danger bg-danger-soft'
  return 'text-tertiary bg-sunken'
}

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diff / 60_000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function SavedDocsList() {
  const [docs, setDocs] = useState<DocSummary[]>([])
  const [loading, setLoading] = useState(true)

  const fetchDocs = async () => {
    try {
      const res = await fetch('/api/docs')
      const data = await res.json()
      setDocs(data.docs || [])
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDocs()
    // Refresh every 10s so new docs show up
    const interval = setInterval(fetchDocs, 10_000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div data-testid="saved-docs-list" className="px-4 py-6 text-body-sm text-secondary">
        Loading…
      </div>
    )
  }

  if (docs.length === 0) {
    return (
      <div data-testid="saved-docs-list" className="px-4 py-6 text-body-sm text-secondary">
        No docs yet. Generate one!
      </div>
    )
  }

  return (
    <div data-testid="saved-docs-list" className="py-2">
      <p className="px-4 py-2 text-body-xs font-semibold text-tertiary uppercase tracking-widest">
        Recent docs
      </p>
      <ul>
        {docs.map((doc) => {
          const repoName = doc.repoUrl?.match(/github\.com\/[^/]+\/([^/?#]+)/)?.[1] || doc.title
          return (
            <li key={doc.id}>
              <Link
                href={`/doc/${doc.id}`}
                className="flex flex-col gap-1 px-4 py-3 hover:bg-sunken transition-colors group"
              >
                <span className="text-body-sm font-medium text-foreground group-hover:text-brand transition-colors truncate">
                  {doc.title || repoName}
                </span>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium ${statusColor(doc.status)}`}
                  >
                    {doc.status}
                  </span>
                  <span className="text-body-xs text-tertiary">{relativeTime(doc.updatedAt)}</span>
                </div>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

'use client'
import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AppShell } from '@/app/components/AppShell'
import { SavedDocsList } from '@/app/components/SavedDocsList'
import { GeneratingStatus } from '@/app/components/GeneratingStatus'
import { DocumentView } from '@/app/components/DocumentView'
import { ErrorCard } from '@/app/components/ErrorCard'

const GENERATION_STEPS = [
  'Fetching repository tree',
  'Building codemap',
  'Synthesizing with AI',
  'Validating diagram',
]

interface Section {
  sectionKey: string
  contentMd: string
  position: number
  aiGenerated: boolean
}

interface Doc {
  id: string
  title: string
  mermaid: string
  status: string
  truncated: boolean
  codemap: string
  sections: Section[]
}

export default function DocPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string

  const [status, setStatus] = useState<string>('generating')
  const [doc, setDoc] = useState<Doc | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState(0)

  const fetchFullDoc = useCallback(async () => {
    try {
      const res = await fetch(`/api/docs/${id}`)
      if (res.ok) {
        const data = await res.json()
        setDoc(data.doc)
      } else {
        setError('Failed to load document')
      }
    } catch {
      setError('Network error while loading document')
    }
  }, [id])

  useEffect(() => {
    if (!id) return

    let intervalId: ReturnType<typeof setInterval> | null = null
    let stepIntervalId: ReturnType<typeof setInterval> | null = null
    let cancelled = false

    // Animate through steps while generating
    stepIntervalId = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < GENERATION_STEPS.length - 1) return prev + 1
        return prev
      })
    }, 4000)

    const pollStatus = async () => {
      try {
        const res = await fetch(`/api/docs/${id}/status`)
        if (!res.ok) {
          if (cancelled) return
          setStatus('failed')
          setError('Document not found')
          clearInterval(intervalId!)
          clearInterval(stepIntervalId!)
          return
        }

        const data = await res.json()
        if (cancelled) return

        setStatus(data.status)

        if (data.status === 'ready' || data.status === 'partial') {
          clearInterval(intervalId!)
          clearInterval(stepIntervalId!)
          setCurrentStep(GENERATION_STEPS.length)
          await fetchFullDoc()
        } else if (data.status === 'failed') {
          clearInterval(intervalId!)
          clearInterval(stepIntervalId!)
          setError('Architecture generation failed. Please try again.')
        }
      } catch {
        if (cancelled) return
        setStatus('failed')
        setError('Network error while checking status')
        clearInterval(intervalId!)
        clearInterval(stepIntervalId!)
      }
    }

    // Poll immediately, then every 2s
    pollStatus()
    intervalId = setInterval(pollStatus, 2000)

    return () => {
      cancelled = true
      if (intervalId) clearInterval(intervalId)
      if (stepIntervalId) clearInterval(stepIntervalId)
    }
  }, [id, fetchFullDoc])

  const handleCancel = () => {
    router.push('/')
  }

  const handleRetry = () => {
    router.push('/')
  }

  const handleTrySample = () => {
    router.push('/')
  }

  return (
    <AppShell leftRail={<SavedDocsList />}>
      <div className="min-h-full p-6">
        {status === 'generating' && (
          <GeneratingStatus
            steps={GENERATION_STEPS}
            currentStep={currentStep}
            onCancel={handleCancel}
          />
        )}

        {(status === 'ready' || status === 'partial') && doc && (
          <DocumentView doc={doc} />
        )}

        {status === 'failed' && (
          <div className="max-w-lg mx-auto py-12">
            <ErrorCard
              error={error || 'Architecture generation failed.'}
              onRetry={handleRetry}
              onTrySample={handleTrySample}
            />
          </div>
        )}

        {(status === 'ready' || status === 'partial') && !doc && (
          <div className="text-body-sm text-secondary py-12 text-center">Loading document…</div>
        )}
      </div>
    </AppShell>
  )
}

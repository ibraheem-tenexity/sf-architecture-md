'use client'
import dynamic from 'next/dynamic'
import { useState, useEffect, useRef, useCallback } from 'react'

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false })

interface SectionEditorProps {
  docId: string
  sectionKey: string
  initialContent: string
  onSave: (newContent: string) => void
  onCancel: () => void
}

export function SectionEditor({ docId, sectionKey, initialContent, onSave, onCancel }: SectionEditorProps) {
  const [value, setValue] = useState(initialContent)
  const [saving, setSaving] = useState(false)
  const [announcement, setAnnouncement] = useState('')
  const isDirty = value !== initialContent
  const containerRef = useRef<HTMLDivElement>(null)

  const handleSave = useCallback(async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/docs/${docId}/sections/${sectionKey}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content_md: value }),
      })
      if (res.ok) {
        setAnnouncement('Section saved')
        onSave(value)
      } else {
        setAnnouncement('Save failed')
      }
    } catch {
      setAnnouncement('Save failed')
    } finally {
      setSaving(false)
    }
  }, [docId, sectionKey, value, onSave])

  // Focus trap: Tab / Shift-Tab within editor, Esc cancels
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onCancel])

  return (
    <div
      ref={containerRef}
      className="space-y-3"
      data-color-mode="light"
    >
      {/* aria-live announcement region */}
      <div
        role="status"
        aria-live="polite"
        className="sr-only"
      >
        {announcement}
      </div>

      <MDEditor
        value={value}
        onChange={(v) => setValue(v ?? '')}
        height={320}
        preview="edit"
      />

      <div className="flex items-center gap-3">
        <button
          data-testid={`save-${sectionKey}`}
          onClick={handleSave}
          disabled={saving || !isDirty}
          className="h-9 px-4 rounded-md bg-brand text-brand-foreground text-body-sm font-medium hover:bg-brand-deep transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
        <button
          data-testid={`cancel-${sectionKey}`}
          onClick={onCancel}
          className="h-9 px-4 rounded-md border border-border-default bg-raised text-body-sm font-medium hover:bg-sunken transition-colors"
        >
          Cancel
        </button>
        {isDirty && (
          <span className="text-body-xs text-warning" aria-live="polite">
            Unsaved changes
          </span>
        )}
      </div>
    </div>
  )
}

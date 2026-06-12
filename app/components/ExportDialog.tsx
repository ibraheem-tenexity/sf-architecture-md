'use client'
import { useState, useRef, useEffect } from 'react'

interface ExportDialogProps {
  docId: string
  title: string
}

export function ExportDialog({ docId, title }: ExportDialogProps) {
  const [open, setOpen] = useState(false)
  const [markdown, setMarkdown] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const dialogRef = useRef<HTMLDivElement>(null)

  const openDialog = async () => {
    setLoading(true)
    setOpen(true)
    try {
      const res = await fetch(`/api/docs/${docId}/export`)
      const data = await res.json()
      setMarkdown(data.markdown || '')
    } catch {
      setMarkdown('')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setOpen(false)
    setMarkdown('')
    setCopied(false)
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(markdown)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback: select text
      const textarea = dialogRef.current?.querySelector('textarea')
      if (textarea) {
        textarea.select()
        document.execCommand('copy')
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    }
  }

  const handleDownload = () => {
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'ARCHITECTURE.md'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Trap focus within dialog
  useEffect(() => {
    if (!open) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open])

  return (
    <>
      <button
        data-testid="export-button"
        onClick={openDialog}
        className="h-9 px-4 rounded-md border border-border-default bg-raised text-body-sm font-medium hover:bg-sunken transition-colors"
      >
        Export
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Export ${title}`}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={handleClose}
            aria-hidden="true"
          />

          {/* Dialog panel */}
          <div
            ref={dialogRef}
            className="relative w-full max-w-2xl bg-raised rounded-xl shadow-xl border border-border-default flex flex-col max-h-[80vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle">
              <h2 className="text-heading-sm font-semibold">Export ARCHITECTURE.md</h2>
              <button
                onClick={handleClose}
                aria-label="Close export dialog"
                className="text-tertiary hover:text-foreground transition-colors text-lg leading-none"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {loading ? (
                <p className="text-body-sm text-secondary">Loading export…</p>
              ) : (
                <textarea
                  data-testid="export-markdown-textarea"
                  value={markdown}
                  readOnly
                  rows={16}
                  className="w-full font-mono text-xs bg-sunken border border-border-subtle rounded-md p-3 resize-none focus-visible:ring-2 focus-visible:ring-brand/50 outline-none"
                  aria-label="Exported markdown content"
                />
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center gap-3 px-6 py-4 border-t border-border-subtle">
              <button
                onClick={handleCopy}
                disabled={loading || !markdown}
                className="h-9 px-4 rounded-md bg-brand text-brand-foreground text-body-sm font-medium hover:bg-brand-deep transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {copied ? 'Copied!' : 'Copy to clipboard'}
              </button>
              <button
                onClick={handleDownload}
                disabled={loading || !markdown}
                className="h-9 px-4 rounded-md border border-border-default bg-raised text-body-sm font-medium hover:bg-sunken transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Download ARCHITECTURE.md
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

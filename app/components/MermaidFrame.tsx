'use client'
import { useEffect, useRef, useState } from 'react'

interface MermaidFrameProps {
  mermaidSource: string
  moduleIds: string[]
}

export function MermaidFrame({ mermaidSource, moduleIds }: MermaidFrameProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [listExpanded, setListExpanded] = useState(false)
  const [renderError, setRenderError] = useState(false)

  useEffect(() => {
    if (!mermaidSource || !ref.current) return

    let cancelled = false

    import('mermaid').then((m) => {
      if (cancelled) return
      m.default.initialize({
        startOnLoad: false,
        theme: 'default',
        securityLevel: 'loose',
      })

      const id = 'mermaid-diagram-' + Math.random().toString(36).slice(2, 8)

      m.default
        .render(id, mermaidSource)
        .then(({ svg }) => {
          if (cancelled || !ref.current) return
          ref.current.innerHTML = svg

          const svgEl = ref.current.querySelector('svg')
          if (svgEl) {
            svgEl.setAttribute('role', 'img')
            svgEl.setAttribute('aria-label', 'System architecture diagram')
          }
        })
        .catch(() => {
          if (cancelled || !ref.current) return
          setRenderError(true)
          ref.current.innerHTML = ''
        })
    })

    return () => {
      cancelled = true
    }
  }, [mermaidSource])

  return (
    <div
      data-testid="diagram-frame"
      className="rounded-lg border border-border-subtle bg-[hsl(var(--card))] overflow-hidden"
    >
      {renderError ? (
        <div className="p-6 text-body-sm text-secondary">
          Diagram could not be rendered. The raw Mermaid source is available in the export.
        </div>
      ) : (
        <div
          ref={ref}
          className="p-4 overflow-x-auto min-h-[200px] flex items-center justify-center"
          aria-label="System architecture diagram"
        />
      )}

      <div className="px-4 pb-4 flex items-center gap-3">
        <button
          data-testid="diagram-view-as-list"
          onClick={() => setListExpanded((v) => !v)}
          className="text-body-sm text-brand hover:text-brand-deep underline underline-offset-2 transition-colors"
          aria-expanded={listExpanded}
          aria-controls="diagram-text-alternative"
        >
          {listExpanded ? 'Hide list' : 'View as list'}
        </button>
      </div>

      {listExpanded && (
        <ol
          id="diagram-text-alternative"
          data-testid="diagram-text-alternative"
          className="sr-only"
          aria-label="Architecture nodes"
        >
          {moduleIds.map((id) => (
            <li key={id}>{id}</li>
          ))}
        </ol>
      )}
    </div>
  )
}

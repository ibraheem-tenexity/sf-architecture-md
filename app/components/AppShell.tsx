'use client'
import { useState } from 'react'
import Link from 'next/link'

interface AppShellProps {
  leftRail?: React.ReactNode
  rightRail?: React.ReactNode
  children: React.ReactNode
}

export function AppShell({ leftRail, rightRail, children }: AppShellProps) {
  const [rightOpen, setRightOpen] = useState(false)

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      {/* Left rail */}
      <aside className="w-64 flex-shrink-0 border-r border-border-subtle bg-raised flex flex-col">
        <div className="h-14 flex items-center px-4 border-b border-border-subtle">
          <Link href="/" className="font-display text-heading-sm text-foreground hover:text-brand transition-colors">
            architecture.md
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto">
          {leftRail}
        </div>
      </aside>

      {/* Center pane */}
      <main id="main-content" className="flex-1 overflow-y-auto">
        {children}
      </main>

      {/* Right rail (collapsible co-pilot) */}
      {rightOpen && (
        <aside className="w-80 flex-shrink-0 border-l border-border-subtle bg-raised flex flex-col">
          <div className="h-14 flex items-center justify-between px-4 border-b border-border-subtle">
            <span className="text-body-sm font-medium">Co-pilot</span>
            <button
              onClick={() => setRightOpen(false)}
              aria-label="Close co-pilot"
              className="text-tertiary hover:text-foreground transition-colors"
            >
              ✕
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <p className="text-body-sm text-secondary">AI co-pilot coming soon.</p>
          </div>
        </aside>
      )}

      {/* Toggle button for right rail */}
      {!rightOpen && (
        <button
          onClick={() => setRightOpen(true)}
          aria-label="Open co-pilot"
          className="fixed bottom-6 right-6 w-10 h-10 rounded-full bg-brand text-brand-foreground shadow-md hover:bg-brand-deep transition-colors flex items-center justify-center text-lg z-10"
        >
          ✦
        </button>
      )}
    </div>
  )
}

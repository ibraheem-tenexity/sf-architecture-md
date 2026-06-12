interface ErrorCardProps {
  error: string
  retainedUrl?: string
  onRetry?: () => void
  onTrySample?: () => void
}

export function ErrorCard({ error, retainedUrl: _retainedUrl, onRetry, onTrySample }: ErrorCardProps) {
  return (
    <div
      data-testid="error-card"
      role="alert"
      className="rounded-lg border border-danger/30 bg-danger-soft p-6 space-y-4"
    >
      <div className="space-y-1">
        <h2 className="text-heading-sm font-medium text-danger">Generation failed</h2>
        <p className="text-body-sm text-secondary">{error}</p>
      </div>
      <div className="flex gap-3">
        {onRetry && (
          <button
            onClick={onRetry}
            className="h-9 px-4 rounded-md bg-brand text-brand-foreground text-body-sm font-medium hover:bg-brand-deep transition-colors"
          >
            Retry
          </button>
        )}
        {onTrySample && (
          <button
            onClick={onTrySample}
            className="h-9 px-4 rounded-md border border-border-default bg-raised text-body-sm font-medium hover:bg-sunken transition-colors"
          >
            Try sample repo
          </button>
        )}
      </div>
    </div>
  )
}

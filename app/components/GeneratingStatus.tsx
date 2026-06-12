interface GeneratingStatusProps {
  steps: string[]
  currentStep: number
  onCancel: () => void
}

export function GeneratingStatus({ steps, currentStep, onCancel }: GeneratingStatusProps) {
  return (
    <div
      data-testid="generating-status"
      aria-busy="true"
      aria-live="polite"
      className="w-full max-w-lg mx-auto space-y-6 py-12 px-6"
    >
      <div className="space-y-1">
        <h2 className="text-heading-md font-semibold text-foreground">Generating architecture doc…</h2>
        <p className="text-body-sm text-secondary">This may take a moment while we analyze the repository.</p>
      </div>

      <ol className="space-y-3" role="list">
        {steps.map((step, index) => {
          const isDone = index < currentStep
          const isCurrent = index === currentStep
          const isPending = index > currentStep

          return (
            <li
              key={step}
              className={[
                'flex items-center gap-3 text-body-sm',
                isDone ? 'text-success' : isCurrent ? 'text-foreground' : 'text-tertiary',
              ].join(' ')}
              aria-current={isCurrent ? 'step' : undefined}
            >
              <span
                className={[
                  'flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full text-xs font-semibold',
                  isDone
                    ? 'bg-success text-success-foreground'
                    : isCurrent
                    ? 'bg-brand text-brand-foreground'
                    : 'bg-sunken text-tertiary',
                ].join(' ')}
                aria-hidden="true"
              >
                {isDone ? (
                  <CheckIcon />
                ) : isCurrent ? (
                  <SpinnerIcon />
                ) : (
                  <span>{index + 1}</span>
                )}
              </span>
              <span>{step}</span>
            </li>
          )
        })}
      </ol>

      <button
        onClick={onCancel}
        className="text-body-sm text-secondary hover:text-foreground underline underline-offset-2 transition-colors"
      >
        Cancel
      </button>

      <style jsx global>{`
        @media (prefers-reduced-motion: reduce) {
          .spin-anim {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  )
}

function CheckIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
      <path d="M2 5l2.5 2.5L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function SpinnerIcon() {
  return (
    <svg
      className="spin-anim"
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      aria-hidden="true"
      style={{ animation: 'spin 1s linear infinite' }}
    >
      <circle cx="5" cy="5" r="4" stroke="currentColor" strokeWidth="1.5" strokeDasharray="18" strokeDashoffset="6" strokeLinecap="round" />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </svg>
  )
}

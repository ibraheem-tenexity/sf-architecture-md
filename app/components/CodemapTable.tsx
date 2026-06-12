interface CodemapModule {
  id: string
  path: string
  language: string
  responsibility?: string
}

interface CodemapTableProps {
  codemap: {
    modules: CodemapModule[]
    truncated?: boolean
  }
}

export function CodemapTable({ codemap }: CodemapTableProps) {
  const { modules, truncated } = codemap

  return (
    <div className="space-y-3">
      {truncated && (
        <div
          role="status"
          className="rounded-md border border-warning/30 bg-warning-soft px-4 py-2 text-body-sm text-warning"
        >
          This repository is large. The codemap shows a representative sample of modules.
        </div>
      )}

      <div className="overflow-x-auto">
        <table
          data-testid="codemap-table"
          className="w-full text-body-sm border-collapse"
        >
          <thead>
            <tr className="border-b border-border-default">
              <th scope="col" className="py-2 px-3 text-left font-medium text-secondary whitespace-nowrap">
                Path
              </th>
              <th scope="col" className="py-2 px-3 text-left font-medium text-secondary">
                Responsibility
              </th>
              <th scope="col" className="py-2 px-3 text-left font-medium text-secondary whitespace-nowrap">
                Language
              </th>
            </tr>
          </thead>
          <tbody>
            {modules.map((mod) => (
              <tr
                key={mod.id}
                data-module-id={mod.id}
                tabIndex={0}
                className="border-b border-border-subtle hover:bg-sunken transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand/50"
              >
                <td className="py-2 px-3 font-mono text-xs text-foreground whitespace-nowrap">
                  {mod.path}
                </td>
                <td className="py-2 px-3 text-secondary">
                  {mod.responsibility || '—'}
                </td>
                <td className="py-2 px-3 text-secondary whitespace-nowrap">
                  {mod.language}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

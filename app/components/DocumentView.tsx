'use client'
import dynamic from 'next/dynamic'
import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSanitize from 'rehype-sanitize'
import { CodemapTable } from './CodemapTable'
import { ExportDialog } from './ExportDialog'

const MermaidFrame = dynamic(() => import('./MermaidFrame').then((m) => ({ default: m.MermaidFrame })), {
  ssr: false,
  loading: () => (
    <div className="rounded-lg border border-border-subtle bg-sunken p-6 text-body-sm text-secondary">
      Loading diagram…
    </div>
  ),
})

const SectionEditor = dynamic(
  () => import('./SectionEditor').then((m) => ({ default: m.SectionEditor })),
  { ssr: false }
)

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

interface DocumentViewProps {
  doc: Doc
}

function parseCodemap(raw: string) {
  try {
    return JSON.parse(raw)
  } catch {
    return { modules: [] }
  }
}

function MarkdownSection({ content }: { content: string }) {
  return (
    <div className="prose prose-sm max-w-none text-foreground">
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
        {content}
      </ReactMarkdown>
    </div>
  )
}

export function DocumentView({ doc }: DocumentViewProps) {
  const [editingSection, setEditingSection] = useState<string | null>(null)
  const [sectionContents, setSectionContents] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {}
    for (const s of doc.sections) {
      map[s.sectionKey] = s.contentMd
    }
    return map
  })

  const codemap = parseCodemap(doc.codemap)
  const moduleIds = (codemap.modules || []).map((m: { id: string }) => m.id)

  const overviewSection = doc.sections.find((s) => s.sectionKey === 'overview')
  const moduleMapSection = doc.sections.find((s) => s.sectionKey === 'module_map')
  const diagramSection = doc.sections.find((s) => s.sectionKey === 'diagram')
  const codemapSection = doc.sections.find((s) => s.sectionKey === 'codemap')

  const mermaidSource = diagramSection
    ? sectionContents['diagram'] || diagramSection.contentMd
    : doc.mermaid || ''

  const handleSectionSave = (key: string) => (newContent: string) => {
    setSectionContents((prev) => ({ ...prev, [key]: newContent }))
    setEditingSection(null)
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-10">
      {/* Skip-to-content link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-brand focus:text-brand-foreground focus:rounded-md focus:text-body-sm"
      >
        Skip to content
      </a>

      {/* Title row */}
      <div className="flex items-start justify-between gap-4">
        <h1
          id="doc-title"
          tabIndex={-1}
          className="font-display text-display-md text-foreground"
        >
          {doc.title}
        </h1>
        <ExportDialog docId={doc.id} title={doc.title} />
      </div>

      {/* Overview */}
      <section
        id="section-overview"
        data-testid="section-overview"
        className="space-y-3"
        aria-labelledby="heading-overview"
      >
        <div className="flex items-center justify-between">
          <h2 id="heading-overview" className="text-heading-lg font-semibold text-foreground">
            Overview
          </h2>
          {editingSection !== 'overview' && (
            <button
              data-testid="edit-overview"
              onClick={() => setEditingSection('overview')}
              className="text-body-sm text-brand hover:text-brand-deep transition-colors"
              aria-label="Edit Overview section"
            >
              Edit
            </button>
          )}
        </div>

        {editingSection === 'overview' ? (
          <SectionEditor
            docId={doc.id}
            sectionKey="overview"
            initialContent={sectionContents['overview'] ?? overviewSection?.contentMd ?? ''}
            onSave={handleSectionSave('overview')}
            onCancel={() => setEditingSection(null)}
          />
        ) : (
          <MarkdownSection content={sectionContents['overview'] ?? overviewSection?.contentMd ?? ''} />
        )}
      </section>

      {/* Module map */}
      <section
        id="section-module-map"
        data-testid="section-module-map"
        className="space-y-3"
        aria-labelledby="heading-module-map"
      >
        <div className="flex items-center justify-between">
          <h2 id="heading-module-map" className="text-heading-lg font-semibold text-foreground">
            Module map
          </h2>
          {editingSection !== 'module_map' && (
            <button
              data-testid="edit-module_map"
              onClick={() => setEditingSection('module_map')}
              className="text-body-sm text-brand hover:text-brand-deep transition-colors"
              aria-label="Edit Module map section"
            >
              Edit
            </button>
          )}
        </div>

        {editingSection === 'module_map' ? (
          <SectionEditor
            docId={doc.id}
            sectionKey="module_map"
            initialContent={sectionContents['module_map'] ?? moduleMapSection?.contentMd ?? ''}
            onSave={handleSectionSave('module_map')}
            onCancel={() => setEditingSection(null)}
          />
        ) : (
          <MarkdownSection content={sectionContents['module_map'] ?? moduleMapSection?.contentMd ?? ''} />
        )}
      </section>

      {/* System diagram */}
      <section
        id="section-diagram"
        data-testid="section-diagram"
        className="space-y-3"
        aria-labelledby="heading-diagram"
      >
        <div className="flex items-center justify-between">
          <h2 id="heading-diagram" className="text-heading-lg font-semibold text-foreground">
            System diagram
          </h2>
        </div>

        <MermaidFrame mermaidSource={mermaidSource} moduleIds={moduleIds} />
      </section>

      {/* Codemap */}
      <section
        id="section-codemap"
        data-testid="section-codemap"
        className="space-y-3"
        aria-labelledby="heading-codemap"
      >
        <div className="flex items-center justify-between">
          <h2 id="heading-codemap" className="text-heading-lg font-semibold text-foreground">
            Codemap
          </h2>
          {editingSection !== 'codemap' && codemapSection && (
            <button
              data-testid="edit-codemap"
              onClick={() => setEditingSection('codemap')}
              className="text-body-sm text-brand hover:text-brand-deep transition-colors"
              aria-label="Edit Codemap section"
            >
              Edit
            </button>
          )}
        </div>

        <CodemapTable
          codemap={{
            modules: codemap.modules || [],
            truncated: doc.truncated,
          }}
        />

        {codemapSection && (
          <>
            {editingSection === 'codemap' ? (
              <SectionEditor
                docId={doc.id}
                sectionKey="codemap"
                initialContent={sectionContents['codemap'] ?? codemapSection.contentMd}
                onSave={handleSectionSave('codemap')}
                onCancel={() => setEditingSection(null)}
              />
            ) : null}
          </>
        )}
      </section>
    </div>
  )
}

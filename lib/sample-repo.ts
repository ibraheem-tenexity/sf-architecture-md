// Pre-baked data for https://github.com/sample/architecture-demo
// Used when GITHUB_TOKEN is empty or for reliable Playwright testing

export const SAMPLE_REPO_URL = 'https://github.com/sample/architecture-demo'

export const SAMPLE_CODEMAP = {
  modules: [
    { id: 'frontend', path: 'src/components', language: 'TypeScript', responsibility: 'React UI components and pages' },
    { id: 'api', path: 'src/api', language: 'TypeScript', responsibility: 'REST API handlers' },
    { id: 'lib', path: 'src/lib', language: 'TypeScript', responsibility: 'Shared utilities and helpers' },
    { id: 'styles', path: 'src/styles', language: 'CSS', responsibility: 'Global styles and design tokens' },
    { id: 'config', path: 'config', language: 'JSON', responsibility: 'Build and runtime configuration' },
  ],
  files: [
    { path: 'src/components/App.tsx', module: 'frontend', isEntrypoint: true },
    { path: 'src/api/index.ts', module: 'api', isEntrypoint: true },
    { path: 'src/lib/utils.ts', module: 'lib', isEntrypoint: false },
    { path: 'package.json', module: 'config', isEntrypoint: false },
  ],
  edges: [
    { from: 'frontend', to: 'api' },
    { from: 'frontend', to: 'lib' },
    { from: 'api', to: 'lib' },
  ],
  entrypoints: ['src/components/App.tsx', 'src/api/index.ts'],
  languages: ['TypeScript', 'CSS', 'JSON'],
  truncated: false,
}

export const SAMPLE_SECTIONS = {
  overview: `# architecture-demo

architecture-demo is a small demonstration application showing how to structure a modern TypeScript web application. It pairs a React frontend with a lightweight REST API backend, connected by a shared utility layer.

The codebase is organized around three concerns: user interface (components), data access (api), and shared logic (lib). Configuration lives at the root level.`,

  module_map: `## Module Map

| Module | Path | Language | Responsibility |
|---|---|---|---|
| **frontend** | \`src/components\` | TypeScript | React UI components and pages |
| **api** | \`src/api\` | TypeScript | REST API handlers |
| **lib** | \`src/lib\` | TypeScript | Shared utilities and helpers |
| **styles** | \`src/styles\` | CSS | Global styles and design tokens |
| **config** | \`config\` | JSON | Build and runtime configuration |

### Dependencies
- \`frontend\` → \`api\`, \`lib\`
- \`api\` → \`lib\``,

  diagram: `flowchart TD
  frontend["frontend\\nsrc/components"]
  api["api\\nsrc/api"]
  lib["lib\\nsrc/lib"]
  styles["styles\\nsrc/styles"]
  config["config\\nconfig"]

  frontend --> api
  frontend --> lib
  api --> lib`,

  codemap: `## Codemap Index

| Path | Responsibility | Key Files |
|---|---|---|
| \`src/components\` | React UI components and pages | \`App.tsx\` |
| \`src/api\` | REST API handlers | \`index.ts\` |
| \`src/lib\` | Shared utilities and helpers | \`utils.ts\` |
| \`src/styles\` | Global styles and design tokens | |
| \`config\` | Build and runtime configuration | \`package.json\` |`,
}

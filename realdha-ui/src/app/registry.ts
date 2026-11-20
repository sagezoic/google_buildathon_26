import type { ComponentType } from 'react'

/**
 * Screens register themselves by file name under src/routes/<domain>/.../<slug>.tsx
 * with a default export. One responsive screen per frame ID.
 */
const modules = import.meta.glob<{ default: ComponentType }>('../routes/**/*.tsx')

export const REGISTRY: Record<string, () => Promise<{ default: ComponentType }>> = {}
for (const [file, loader] of Object.entries(modules)) {
  if (file.includes('/parts/')) continue
  const slug = file.split('/').pop()!.replace(/\.tsx$/, '')
  REGISTRY[slug] = loader
}

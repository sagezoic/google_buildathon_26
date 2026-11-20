import type { ComponentType } from 'react'

/**
 * Screens register themselves by file name: src/screens/<slug>.tsx (e.g. GP-01-Signup.tsx)
 * with a default export. One responsive screen per frame ID; 1440, 834 and 390 are the
 * same route at three breakpoints.
 */
const modules = import.meta.glob<{ default: ComponentType }>('../screens/*.tsx')

export const REGISTRY: Record<string, () => Promise<{ default: ComponentType }>> = {}
for (const [file, loader] of Object.entries(modules)) {
  const slug = file.split('/').pop()!.replace(/\.tsx$/, '')
  REGISTRY[slug] = loader
}

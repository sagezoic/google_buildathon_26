import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

// Custom type-scale names must be declared, or tailwind-merge reads `text-control` as a colour
// and drops the real text colour next to it.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [{ text: ['display', 'h1', 'h2', 'h3', 'body', 'control', 'small', 'chip', 'label', 'overline'] }],
    },
  },
})
export const cn = (...i: ClassValue[]) => twMerge(clsx(i))

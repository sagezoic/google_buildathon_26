import { useEffect, useRef } from 'react'
import { TOUR_ID } from '../../data/tour'
import { cn } from '../../lib/cn'

const SCRIPT_SRC = 'https://app.cloudpano.com/public/shareScript.js'

type Tour360Props = {
  shortId?: string
  height?: string
  className?: string
}

/**
 * CloudPano 360° tour embed. The share script must be created at runtime
 * (React won't execute a <script> from JSX) and appended inside the host div.
 * Mount it only while visible; cleanup empties the host so remounts and
 * StrictMode's double effect never leave two players behind.
 */
export function Tour360({ shortId = TOUR_ID, height = '500px', className }: Tour360Props) {
  const hostRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return

    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.async = true
    script.src = SCRIPT_SRC
    script.setAttribute('data-short', shortId)
    script.setAttribute('data-path', 'tours')
    script.setAttribute('data-is-self-hosted', 'false')
    script.setAttribute('width', '100%')
    script.setAttribute('height', height)
    host.appendChild(script)

    return () => {
      host.replaceChildren()
    }
  }, [shortId, height])

  return (
    <div className={cn('relative min-h-[460px] overflow-hidden rounded-card border border-line bg-sunken', className)}>
      <div className="absolute inset-0 flex items-center justify-center text-small text-muted">Loading 360° tour…</div>
      <div ref={hostRef} id={shortId} className="relative size-full min-h-[460px]" />
    </div>
  )
}

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import * as maplibregl from 'maplibre-gl'
import { cn } from '../../lib/cn'
import { toLngLat } from './osm-geometry'
import { useOsmMap } from './OsmMap'
import type { MarkerProps } from './types'

const NUDGE_PX = 10

export default function OsmMarker({
  position,
  draggable = false,
  onDragEnd,
  onClick,
  className,
  ariaLabel = 'Map pin',
  children,
}: MarkerProps) {
  const { map, ready } = useOsmMap()
  const markerRef = useRef<maplibregl.Marker | null>(null)
  const [el] = useState(() => document.createElement('div'))

  const liveRef = useRef({ position, onDragEnd, onClick, ariaLabel, className })
  useEffect(() => {
    liveRef.current = { position, onDragEnd, onClick, ariaLabel, className }
  })

  // Initialize MapLibre Marker
  useEffect(() => {
    if (!map || !ready) return

    el.className = cn('cursor-pointer focus-visible:outline-none', className)

    const initialPos = toLngLat(position)
    const marker = new maplibregl.Marker({
      element: el,
      draggable,
      anchor: 'bottom',
    })
      .setLngLat(initialPos)
      .addTo(map)

    if (draggable) {
      marker.on('dragend', () => {
        const p = marker.getLngLat()
        liveRef.current.onDragEnd?.([p.lng, p.lat])
      })

      // Keyboard arrow nudge support for accessibility
      el.tabIndex = 0
      el.setAttribute('role', 'button')
      el.setAttribute('aria-label', ariaLabel)

      el.addEventListener('keydown', (e) => {
        const d = ({
          ArrowLeft: [-1, 0],
          ArrowRight: [1, 0],
          ArrowUp: [0, -1],
          ArrowDown: [0, 1],
        } as Record<string, [number, number]>)[e.key]

        if (!d) return
        e.preventDefault()
        const pt = map.project(marker.getLngLat())
        const next = map.unproject([
          pt.x + d[0] * NUDGE_PX,
          pt.y + d[1] * NUDGE_PX,
        ])
        marker.setLngLat(next)
        liveRef.current.onDragEnd?.([next.lng, next.lat])
      })
    }

    if (onClick) {
      el.addEventListener('click', (e) => {
        e.stopPropagation()
        liveRef.current.onClick?.()
      })
    }

    markerRef.current = marker

    return () => {
      marker.remove()
      markerRef.current = null
    }
  }, [map, ready, draggable, el, className, position, onClick, ariaLabel])

  // Update position if changed externally
  useEffect(() => {
    if (!markerRef.current) return
    const pos = toLngLat(position)
    const cur = markerRef.current.getLngLat()
    if (Math.abs(cur.lng - pos[0]) > 1e-6 || Math.abs(cur.lat - pos[1]) > 1e-6) {
      markerRef.current.setLngLat(pos)
    }
  }, [position])

  return createPortal(
    children ?? (
      <div className="flex size-9 -translate-y-1 items-center justify-center">
        <svg
          width="28"
          height="36"
          viewBox="0 0 30 38"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M15 36 C15 36 3 22 3 14 a12 12 0 0 1 24 0 c0 8-12 22-12 22z"
            fill="#2F64B8"
            stroke="#ffffff"
            strokeWidth="2.5"
          />
          <circle cx="15" cy="14" r="4.5" fill="#ffffff" />
        </svg>
      </div>
    ),
    el
  )
}

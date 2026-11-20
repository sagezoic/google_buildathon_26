import { useEffect, useRef, useState, type ReactNode } from 'react'
import * as maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import type { Feature, Polygon } from 'geojson'
import { cn } from '../../lib/cn'
import type { GeoPin } from '../../lib/property-store'
import { baseStyle, STREET_IDS, STREET_PAINT } from './market-map'

/**
 * Live map for picking a plot's location (GP-07). A draggable pin, plus a dashed outline sized from the plot area.
 * Reuses the Flat Finder base style from market-map.tsx; flat (no tilt) so the outline reads as land.
 * `market-map.tsx` registers the MapLibre worker when imported, so nothing to set up here.
 */

type Base = 'map' | 'satellite'
const SHAPE = 'plot-shape'
const NUDGE_PX = 12
const FALLBACK_PRIMARY = '#2F64B8'

export interface PlotMapProps {
  pin: GeoPin
  onPinChange: (p: GeoPin) => void
  /** Outline to draw around the pin, or null when the area is not usable. */
  shape: Feature<Polygon> | null
  /** Changes when the shape's size changes; the camera re-frames the shape then. */
  fitKey: string
  /** Show the "Drag to place the pin" hint until the pin has moved. */
  hint: boolean
  /** Short map in the stacked layouts: skip the hint and style switch. */
  compact?: boolean
  className?: string
  /** Overlays (search box etc.), rendered above the map. */
  children?: ReactNode
}

function pinElement(): HTMLButtonElement {
  const el = document.createElement('button')
  el.type = 'button'
  el.setAttribute('aria-label', 'Property pin. Drag, or use the arrow keys, to move it.')
  el.className = 'flex size-11 cursor-grab touch-none items-end justify-center rounded-control focus-visible:outline-2 focus-visible:outline-focus active:cursor-grabbing'
  el.innerHTML = '<svg width="34" height="44" viewBox="0 0 30 38" aria-hidden="true"><path d="M15 36 C15 36 3 22 3 14 a12 12 0 0 1 24 0 c0 8-12 22-12 22z" fill="#2F64B8" stroke="#fff" stroke-width="2.5"/><circle cx="15" cy="14" r="4.5" fill="#fff"/></svg>'
  return el
}

const prefersReducedMotion = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches

export default function PlotMap({ pin, onPinChange, shape, fitKey, hint, compact, className, children }: PlotMapProps) {
  const box = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const markerRef = useRef<maplibregl.Marker | null>(null)
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)
  const [base, setBase] = useState<Base>('map')

  // Latest values for map callbacks, which are bound once.
  const live = useRef({ pin, shape, onPinChange })
  useEffect(() => { live.current = { pin, shape, onPinChange } })

  useEffect(() => {
    if (!box.current) return
    let map: maplibregl.Map
    try {
      map = new maplibregl.Map({
        container: box.current,
        style: baseStyle(),
        center: [live.current.pin.lng, live.current.pin.lat],
        zoom: 17,
        maxZoom: 19,
        pitch: 0,
        maxPitch: 0,
        dragRotate: false,
        touchPitch: false,
        attributionControl: { compact: true },
      })
    } catch {
      setFailed(true)
      return
    }
    map.touchZoomRotate.disableRotation()
    map.keyboard.disableRotation()
    map.addControl(new maplibregl.NavigationControl({ showCompass: false, showZoom: true }), 'top-right')
    map.addControl(new maplibregl.ScaleControl({ unit: 'metric', maxWidth: 90 }), 'bottom-right')
    map.on('error', (e) => console.warn('[plot-map]', e.error?.message ?? e))

    const el = pinElement()
    const marker = new maplibregl.Marker({ element: el, draggable: true, anchor: 'bottom' }).setLngLat([live.current.pin.lng, live.current.pin.lat]).addTo(map)
    const commit = () => { const p = marker.getLngLat(); live.current.onPinChange({ lng: p.lng, lat: p.lat }) }
    marker.on('dragend', commit)
    el.addEventListener('keydown', (e) => {
      const d = ({ ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] } as Record<string, [number, number]>)[e.key]
      if (!d) return
      e.preventDefault()
      const pt = map.project(marker.getLngLat())
      const p = map.unproject([pt.x + d[0] * NUDGE_PX, pt.y + d[1] * NUDGE_PX])
      live.current.onPinChange({ lng: p.lng, lat: p.lat })
    })
    map.on('click', (e) => live.current.onPinChange({ lng: e.lngLat.lng, lat: e.lngLat.lat }))

    map.on('load', () => {
      const css = getComputedStyle(document.documentElement).getPropertyValue('--rd-primary').trim() || FALLBACK_PRIMARY
      map.addSource(SHAPE, { type: 'geojson', data: live.current.shape ?? { type: 'FeatureCollection', features: [] } })
      map.addLayer({ id: 'plot-fill', type: 'fill', source: SHAPE, paint: { 'fill-color': css, 'fill-opacity': 0.25 } })
      map.addLayer({ id: 'plot-line', type: 'line', source: SHAPE, paint: { 'line-color': css, 'line-width': 2.5, 'line-dasharray': [3, 2] } })
      setReady(true)
    })

    mapRef.current = map
    markerRef.current = marker
    return () => { marker.remove(); map.remove(); mapRef.current = null; markerRef.current = null; setReady(false) }
  }, [])

  // Pin and outline follow the draft.
  useEffect(() => {
    markerRef.current?.setLngLat([pin.lng, pin.lat])
    const map = mapRef.current
    if (!map || !ready) return
    ;(map.getSource(SHAPE) as maplibregl.GeoJSONSource).setData(shape ?? { type: 'FeatureCollection', features: [] })
  }, [pin, shape, ready])

  // Re-frame when the plot's size changes (not on every drag).
  useEffect(() => {
    const map = mapRef.current
    const ring = live.current.shape?.geometry.coordinates[0]
    if (!map || !ready) return
    if (!ring) { map.easeTo({ center: [live.current.pin.lng, live.current.pin.lat], duration: prefersReducedMotion() ? 0 : 400 }); return }
    const b = new maplibregl.LngLatBounds()
    ring.forEach((c) => b.extend([c[0], c[1]]))
    map.fitBounds(b, { padding: 80, maxZoom: 19, duration: prefersReducedMotion() ? 0 : 600 })
  }, [fitKey, ready])

  // Map (dark streets) or satellite imagery: land is easier to place on satellite.
  useEffect(() => {
    const map = mapRef.current
    if (!map || !ready) return
    const sat = base === 'satellite'
    const vis = (id: string, on: boolean) => map.setLayoutProperty(id, 'visibility', on ? 'visible' : 'none')
    STREET_IDS.forEach((id) => vis(id, !sat))
    vis('sat', sat)
    vis('roads', false)
    vis('city', !sat)
    if (sat) {
      map.setPaintProperty('sat', 'raster-brightness-max', 1)
      map.setPaintProperty('sat', 'raster-saturation', 0)
      map.setPaintProperty('sat', 'raster-contrast', 0)
      map.setPaintProperty('sat', 'raster-hue-rotate', 0)
    } else {
      for (const [id, [prop, v]] of Object.entries(STREET_PAINT.streets)) map.setPaintProperty(id, prop as 'line-color', v as string)
    }
  }, [base, ready])

  if (failed) {
    return <p role="alert" className={cn('flex items-center justify-center rounded-lg border border-line bg-sunken p-4 text-center text-small text-muted', className)}>The map needs WebGL, which is not available in this browser. Enter the details on the left; the GPS pin is optional.</p>
  }

  return (
    <div className={cn('relative overflow-hidden bg-[#050506]', className)}>
      {/* MapLibre's CSS forces position:relative on its container, so size it from a wrapper instead of inset-0. */}
      <div className="absolute inset-0"><div ref={box} className="size-full" /></div>
      {!ready && <div aria-busy="true" className="absolute inset-0 animate-pulse bg-[#050506] motion-reduce:animate-none" />}
      {!compact && (
        <div role="radiogroup" aria-label="Map style" className="absolute bottom-8 left-3.5 inline-flex overflow-hidden rounded-control border border-line-strong bg-surface text-chip font-medium">
          {(['map', 'satellite'] as const).map((b) => (
            <button key={b} type="button" role="radio" aria-checked={base === b} onClick={() => setBase(b)}
              className={cn('min-h-9 cursor-pointer px-3 capitalize focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus', base === b ? 'bg-primary text-on-primary' : 'text-text hover:bg-primary-tint')}>
              {b}
            </button>
          ))}
        </div>
      )}
      {hint && !compact && <div className="pointer-events-none absolute top-16 left-1/2 -translate-x-1/2 rounded-control bg-text px-2 py-1 text-label whitespace-nowrap text-surface">Drag the pin or click the map to place it</div>}
      {children}
    </div>
  )
}

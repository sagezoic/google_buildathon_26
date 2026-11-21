import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import * as maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'
import { Layers, MapPin, Satellite } from 'lucide-react'
import { cn } from '../../lib/cn'
import { collapseAttribution } from './attribution'
import { toLngLat } from './osm-geometry'
import { getMapStyle, type MapTheme } from './osm-styles'
import type { OsmMapProps } from './types'

// Vite worker URL setup for MapLibre
maplibregl.setWorkerUrl(workerUrl)

export const OsmMapContext = createContext<{
  map: maplibregl.Map | null
  ready: boolean
}>({
  map: null,
  ready: false,
})

export const useOsmMap = () => useContext(OsmMapContext)

const prefersReducedMotion = () =>
  typeof matchMedia === 'function' &&
  matchMedia('(prefers-reduced-motion: reduce)').matches

export default function OsmMap({
  center = [73.8567, 18.5204], // Pune default
  zoom = 14,
  minZoom = 3,
  maxZoom = 19,
  pitch = 0,
  theme: initialTheme = 'streets',
  interactive = true,
  showControls = true,
  showScale = true,
  showThemeToggle = false,
  className,
  style,
  onLoad,
  onMove,
  onClick,
  children,
}: OsmMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const [mapInstance, setMapInstance] = useState<maplibregl.Map | null>(null)
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)
  const [currentTheme, setCurrentTheme] = useState<MapTheme>(initialTheme)

  const callbacksRef = useRef({ onLoad, onMove, onClick })
  useEffect(() => {
    callbacksRef.current = { onLoad, onMove, onClick }
  })

  // Initialize Map
  useEffect(() => {
    if (!containerRef.current) return

    const initialCenter = toLngLat(center)
    let map: maplibregl.Map

    try {
      map = new maplibregl.Map({
        container: containerRef.current,
        style: getMapStyle(currentTheme),
        center: initialCenter,
        zoom,
        minZoom,
        maxZoom,
        pitch,
        dragRotate: pitch > 0,
        interactive,
        attributionControl: { compact: true },
      })
    } catch (err) {
      console.warn('[OsmMap] Failed to initialize WebGL map:', err)
      setFailed(true)
      return
    }

    collapseAttribution(map)

    if (!interactive) {
      map.scrollZoom.disable()
      map.boxZoom.disable()
      map.dragPan.disable()
      map.dragRotate.disable()
      map.keyboard.disable()
      map.doubleClickZoom.disable()
      map.touchZoomRotate.disable()
    } else {
      if (showControls) {
        map.addControl(
          new maplibregl.NavigationControl({
            showCompass: pitch > 0,
            showZoom: true,
          }),
          'top-right'
        )
      }
      if (showScale) {
        map.addControl(
          new maplibregl.ScaleControl({ unit: 'metric', maxWidth: 100 }),
          'bottom-right'
        )
      }
    }

    map.on('load', () => {
      setMapInstance(map)
      setReady(true)
      callbacksRef.current.onLoad?.(map)
    })

    map.on('move', () => {
      const c = map.getCenter()
      callbacksRef.current.onMove?.([c.lng, c.lat], map.getZoom())
    })

    map.on('click', (e) => {
      callbacksRef.current.onClick?.([e.lngLat.lng, e.lngLat.lat])
    })

    map.on('error', (e) => {
      console.warn('[OsmMap] MapLibre error:', e.error?.message ?? e)
    })

    // Resize observer to ensure proper dimensions after layout shifts
    const resizeObserver = new ResizeObserver(() => {
      map.resize()
    })
    resizeObserver.observe(containerRef.current)

    mapRef.current = map

    return () => {
      resizeObserver.disconnect()
      map.remove()
      mapRef.current = null
      setMapInstance(null)
      setReady(false)
    }
  }, []) // Mount once

  // Update theme when changed
  useEffect(() => {
    const map = mapRef.current
    if (!map || !ready) return
    map.setStyle(getMapStyle(currentTheme))
  }, [currentTheme, ready])

  // Center / Zoom synchronization
  useEffect(() => {
    const map = mapRef.current
    if (!map || !ready) return

    const targetCenter = toLngLat(center)
    const currentCenter = map.getCenter()
    const dist = Math.hypot(
      currentCenter.lng - targetCenter[0],
      currentCenter.lat - targetCenter[1]
    )

    if (dist > 0.0001 || Math.abs(map.getZoom() - zoom) > 0.1) {
      map.easeTo({
        center: targetCenter,
        zoom,
        pitch,
        duration: prefersReducedMotion() ? 0 : 500,
      })
    }
  }, [center, zoom, pitch, ready])

  return (
    <OsmMapContext.Provider value={{ map: mapInstance, ready }}>
      <div
        ref={containerRef}
        style={style}
        className={cn(
          'relative min-h-[220px] w-full overflow-hidden bg-sunken',
          className
        )}
      >
        {failed ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 text-center">
            <MapPin className="size-8 text-muted" />
            <p className="text-small font-semibold text-text">
              Map preview unavailable
            </p>
            <p className="text-label text-muted">
              WebGL is disabled or unsupported on this device.
            </p>
          </div>
        ) : (
          <>
            {showThemeToggle && ready && (
              <div
                role="group"
                aria-label="Map style"
                className="absolute top-3 left-3 z-10 flex overflow-hidden rounded-control border border-line-strong bg-surface text-chip font-medium shadow-e1"
              >
                <button
                  type="button"
                  onClick={() => setCurrentTheme('streets')}
                  className={cn(
                    'flex items-center gap-1.5 px-2.5 py-1 transition-colors cursor-pointer',
                    currentTheme === 'streets'
                      ? 'bg-primary text-on-primary font-semibold'
                      : 'text-muted hover:text-text'
                  )}
                >
                  <Layers className="size-3.5" /> Streets
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentTheme('satellite')}
                  className={cn(
                    'flex items-center gap-1.5 px-2.5 py-1 transition-colors cursor-pointer',
                    currentTheme === 'satellite'
                      ? 'bg-primary text-on-primary font-semibold'
                      : 'text-muted hover:text-text'
                  )}
                >
                  <Satellite className="size-3.5" /> Satellite
                </button>
              </div>
            )}
            {ready && children}
          </>
        )}
      </div>
    </OsmMapContext.Provider>
  )
}

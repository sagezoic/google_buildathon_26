import { useEffect, useRef, useState } from 'react'
import type { Feature, Polygon } from 'geojson'
import { Check, Plus, RotateCcw, Trash2 } from 'lucide-react'
import * as maplibregl from 'maplibre-gl'
import { cn } from '../../lib/cn'
import {
  formatArea,
  midpoint,
  sphericalPolygonArea,
  toLngLat,
  type AreaUnit,
  type GeoPoint,
  type LngLat,
} from './osm-geometry'
import { useOsmMap } from './OsmMap'

const SOURCE_ID = 'osm-polygon-editor-source'
const FILL_LAYER = 'osm-polygon-editor-fill'
const LINE_LAYER = 'osm-polygon-editor-line'

export interface OsmPolygonEditorProps {
  /** Initial or controlled polygon ring [[lng, lat], ...] */
  polygon?: LngLat[]
  /** Stated area unit for display & conversion */
  unit?: AreaUnit
  /** Whether vertices are draggable / editable */
  editable?: boolean
  /** Primary theme color for stroke and fill */
  color?: string
  /** Center reference pin (e.g. plot marker) */
  pin?: GeoPoint | LngLat
  /** Callback when polygon vertices or calculated area changes */
  onChange?: (points: LngLat[], areaSqm: number) => void
  /** Callback when center pin moves */
  onPinChange?: (pin: LngLat) => void
  className?: string
}

export default function OsmPolygonEditor({
  polygon = [],
  unit = 'sqft',
  editable = true,
  color = '#2F64B8',
  pin,
  onChange,
  onPinChange,
  className,
}: OsmPolygonEditorProps) {
  const { map, ready } = useOsmMap()
  const [points, setPoints] = useState<LngLat[]>(polygon)
  const [isDrawing, setIsDrawing] = useState(polygon.length < 3)
  const [activeVertex, setActiveVertex] = useState<number | null>(null)

  const vertexMarkersRef = useRef<maplibregl.Marker[]>([])
  const midpointMarkersRef = useRef<maplibregl.Marker[]>([])
  const pinMarkerRef = useRef<maplibregl.Marker | null>(null)

  const liveRef = useRef({ points, onChange, onPinChange, editable, isDrawing })
  useEffect(() => {
    liveRef.current = { points, onChange, onPinChange, editable, isDrawing }
  })

  // Sync external polygon changes if different
  useEffect(() => {
    if (polygon.length >= 3 && JSON.stringify(polygon) !== JSON.stringify(points)) {
      setPoints(polygon)
      setIsDrawing(false)
    }
  }, [polygon])

  // Setup MapLibre GeoJSON Source and Layers
  useEffect(() => {
    if (!map || !ready) return

    const initialFeature: Feature<Polygon> = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Polygon',
        coordinates: points.length >= 3 ? [[...points, points[0]]] : [],
      },
    }

    if (!map.getSource(SOURCE_ID)) {
      map.addSource(SOURCE_ID, {
        type: 'geojson',
        data: initialFeature,
      })

      map.addLayer({
        id: FILL_LAYER,
        type: 'fill',
        source: SOURCE_ID,
        paint: {
          'fill-color': color,
          'fill-opacity': 0.22,
        },
      })

      map.addLayer({
        id: LINE_LAYER,
        type: 'line',
        source: SOURCE_ID,
        paint: {
          'line-color': color,
          'line-width': 2.5,
          'line-dasharray': [3, 2],
        },
      })
    }

    // Map click handler for drawing new vertices
    const handleMapClick = (e: maplibregl.MapMouseEvent) => {
      if (!liveRef.current.editable || !liveRef.current.isDrawing) return

      const newPoint: LngLat = [e.lngLat.lng, e.lngLat.lat]
      const next = [...liveRef.current.points, newPoint]
      setPoints(next)

      const area = sphericalPolygonArea(next)
      liveRef.current.onChange?.(next, area)
    }

    map.on('click', handleMapClick)

    return () => {
      map.off('click', handleMapClick)
      if (map.getLayer(FILL_LAYER)) map.removeLayer(FILL_LAYER)
      if (map.getLayer(LINE_LAYER)) map.removeLayer(LINE_LAYER)
      if (map.getSource(SOURCE_ID)) map.removeSource(SOURCE_ID)
    }
  }, [map, ready])

  // Update GeoJSON source when points change
  useEffect(() => {
    if (!map || !ready) return
    const src = map.getSource(SOURCE_ID) as maplibregl.GeoJSONSource | undefined
    if (!src) return

    const ring = points.length >= 3 ? [[...points, points[0]]] : []
    src.setData({
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Polygon',
        coordinates: ring,
      },
    })
  }, [points, map, ready])

  // Center Pin Marker
  useEffect(() => {
    if (!map || !ready || !pin) return

    const p = toLngLat(pin)
    if (!pinMarkerRef.current) {
      const el = document.createElement('div')
      el.className =
        'flex size-10 cursor-grab items-center justify-center rounded-full drop-shadow-md focus-visible:outline-none'
      el.innerHTML =
        '<svg width="32" height="40" viewBox="0 0 30 38" fill="none"><path d="M15 36 C15 36 3 22 3 14 a12 12 0 0 1 24 0 c0 8-12 22-12 22z" fill="#2F64B8" stroke="#ffffff" stroke-width="2.5"/><circle cx="15" cy="14" r="4.5" fill="#ffffff"/></svg>'

      const marker = new maplibregl.Marker({
        element: el,
        draggable: editable,
        anchor: 'bottom',
      })
        .setLngLat(p)
        .addTo(map)

      marker.on('dragend', () => {
        const pt = marker.getLngLat()
        liveRef.current.onPinChange?.([pt.lng, pt.lat])
      })

      pinMarkerRef.current = marker
    } else {
      pinMarkerRef.current.setLngLat(p)
      pinMarkerRef.current.setDraggable(editable)
    }

    return () => {
      pinMarkerRef.current?.remove()
      pinMarkerRef.current = null
    }
  }, [pin, map, ready, editable])

  // Vertices and Midpoints Interactive Markers
  useEffect(() => {
    if (!map || !ready) return

    // Clean up existing vertex and midpoint markers
    vertexMarkersRef.current.forEach((m) => m.remove())
    vertexMarkersRef.current = []
    midpointMarkersRef.current.forEach((m) => m.remove())
    midpointMarkersRef.current = []

    if (!editable || isDrawing) return

    // Create vertex markers
    points.forEach((pt, index) => {
      const el = document.createElement('button')
      el.type = 'button'
      el.className = cn(
        'group flex size-6 cursor-grab items-center justify-center rounded-full border-2 border-white bg-primary text-[10px] font-bold text-on-primary shadow-e2 transition-transform hover:scale-125 focus:scale-125 focus-visible:outline-2 focus-visible:outline-focus',
        activeVertex === index && 'ring-2 ring-primary ring-offset-2'
      )
      el.setAttribute('aria-label', `Vertex ${index + 1}. Drag to move.`)
      el.innerText = `${index + 1}`

      const marker = new maplibregl.Marker({
        element: el,
        draggable: true,
        anchor: 'center',
      })
        .setLngLat(pt)
        .addTo(map)

      marker.on('drag', () => {
        const p = marker.getLngLat()
        setPoints((prev) => {
          const next = [...prev]
          next[index] = [p.lng, p.lat]
          return next
        })
      })

      marker.on('dragend', () => {
        const p = marker.getLngLat()
        setPoints((prev) => {
          const next = [...prev]
          next[index] = [p.lng, p.lat]
          const area = sphericalPolygonArea(next)
          liveRef.current.onChange?.(next, area)
          return next
        })
      })

      el.addEventListener('click', (e) => {
        e.stopPropagation()
        setActiveVertex(index)
      })

      vertexMarkersRef.current.push(marker)
    })

    // Create midpoint insertion handles
    if (points.length >= 3) {
      for (let i = 0; i < points.length; i++) {
        const p1 = points[i]
        const p2 = points[(i + 1) % points.length]
        const mid = midpoint(p1, p2)

        const el = document.createElement('button')
        el.type = 'button'
        el.className =
          'flex size-4 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-line-strong text-white opacity-70 shadow-sm transition-all hover:scale-125 hover:bg-primary hover:opacity-100'
        el.setAttribute(
          'aria-label',
          `Add vertex between point ${i + 1} and ${(i + 1) % points.length + 1}`
        )
        el.innerHTML =
          '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>'

        const marker = new maplibregl.Marker({
          element: el,
          draggable: false,
          anchor: 'center',
        })
          .setLngLat(mid)
          .addTo(map)

        el.addEventListener('click', (e) => {
          e.stopPropagation()
          setPoints((prev) => {
            const next = [...prev]
            next.splice(i + 1, 0, mid)
            const area = sphericalPolygonArea(next)
            liveRef.current.onChange?.(next, area)
            return next
          })
        })

        midpointMarkersRef.current.push(marker)
      }
    }

    return () => {
      vertexMarkersRef.current.forEach((m) => m.remove())
      vertexMarkersRef.current = []
      midpointMarkersRef.current.forEach((m) => m.remove())
      midpointMarkersRef.current = []
    }
  }, [points, map, ready, editable, isDrawing, activeVertex])

  const calculatedSqm = sphericalPolygonArea(points)

  const handleFinishDrawing = () => {
    if (points.length >= 3) {
      setIsDrawing(false)
      const area = sphericalPolygonArea(points)
      liveRef.current.onChange?.(points, area)
    }
  }

  const handleReset = () => {
    setPoints([])
    setIsDrawing(true)
    setActiveVertex(null)
    liveRef.current.onChange?.([], 0)
  }

  const handleDeleteVertex = (idx: number) => {
    if (points.length <= 3) return
    const next = points.filter((_, i) => i !== idx)
    setPoints(next)
    setActiveVertex(null)
    const area = sphericalPolygonArea(next)
    liveRef.current.onChange?.(next, area)
  }

  return (
    <div
      className={cn(
        'pointer-events-none absolute inset-x-3 bottom-3 z-10 flex flex-wrap items-center justify-between gap-2.5 sm:inset-x-4 sm:bottom-4',
        className
      )}
    >
      {/* Area & Perimeter Readout Badge */}
      <div className="pointer-events-auto flex items-center gap-2 rounded-control border border-line bg-surface/95 px-3 py-1.5 text-small font-medium text-text shadow-e2 backdrop-blur-xs">
        <span className="text-muted">Calculated Area:</span>
        <span className="font-semibold text-text tabular">
          {calculatedSqm > 0 ? formatArea(calculatedSqm, unit) : '—'}
        </span>
        {calculatedSqm > 0 && unit !== 'sqm' && (
          <span className="text-chip text-muted tabular">
            ({Math.round(calculatedSqm).toLocaleString('en-IN')} sq m)
          </span>
        )}
      </div>

      {/* Editor Control Actions */}
      {editable && (
        <div className="pointer-events-auto flex items-center gap-1.5 rounded-control border border-line bg-surface/95 p-1 shadow-e2 backdrop-blur-xs">
          {isDrawing ? (
            <>
              <span className="px-2 text-chip text-muted">
                Click map to add boundary points ({points.length}/3+):
              </span>
              <button
                type="button"
                disabled={points.length < 3}
                onClick={handleFinishDrawing}
                className="flex cursor-pointer items-center gap-1 rounded-[4px] bg-primary px-2.5 py-1 text-chip font-semibold text-on-primary transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Check className="size-3.5" /> Done
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setIsDrawing(true)}
                className="flex cursor-pointer items-center gap-1 rounded-[4px] px-2 py-1 text-chip font-medium text-muted hover:bg-field hover:text-text"
                title="Add more points"
              >
                <Plus className="size-3.5" /> Add Points
              </button>

              {activeVertex !== null && points.length > 3 && (
                <button
                  type="button"
                  onClick={() => handleDeleteVertex(activeVertex)}
                  className="flex cursor-pointer items-center gap-1 rounded-[4px] px-2 py-1 text-chip font-medium text-danger-ink hover:bg-danger-tint"
                  title={`Delete vertex ${activeVertex + 1}`}
                >
                  <Trash2 className="size-3.5" /> Del #{activeVertex + 1}
                </button>
              )}

              <button
                type="button"
                onClick={handleReset}
                className="flex cursor-pointer items-center gap-1 rounded-[4px] px-2 py-1 text-chip font-medium text-muted hover:bg-field hover:text-text"
                title="Clear boundary"
              >
                <RotateCcw className="size-3.5" /> Redraw
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

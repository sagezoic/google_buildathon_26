import { useEffect, useMemo, useRef, useState } from 'react'
import type { Feature, Polygon } from 'geojson'
import { Layers, Satellite } from 'lucide-react'
import * as maplibregl from 'maplibre-gl'
import { cn } from '../../lib/cn'
import {
  boundsFromCoords,
  formatArea,
  sphericalPolygonArea,
  type AreaUnit,
  type LngLat,
} from './osm-geometry'
import OsmMap, { useOsmMap } from './OsmMap'
import type { MapTheme } from './osm-styles'

const CADASTRAL_SRC = 'cadastral-survey-source'
const CADASTRAL_FILL = 'cadastral-survey-fill'
const CADASTRAL_LINE = 'cadastral-survey-line'

export interface CadastralCorner {
  label: string
  coord: LngLat
}

export interface OsmCadastralViewProps {
  /** Survey parcel perimeter coordinates [[lng, lat], ...] */
  coordinates: LngLat[]
  /** Center label (e.g. "Gat 112/2 Kusgaon · 418 sq m") */
  label: string
  /** Stated area unit */
  unit?: AreaUnit
  /** Initial base map theme */
  defaultTheme?: 'satellite' | 'streets'
  className?: string
}

function CadastralLayer({
  coordinates,
  label,
}: {
  coordinates: LngLat[]
  label: string
}) {
  const { map, ready } = useOsmMap()
  const cornerMarkersRef = useRef<maplibregl.Marker[]>([])

  const ring = useMemo(
    () =>
      coordinates.length >= 3
        ? coordinates[0][0] === coordinates[coordinates.length - 1][0] &&
          coordinates[0][1] === coordinates[coordinates.length - 1][1]
          ? coordinates
          : [...coordinates, coordinates[0]]
        : [],
    [coordinates]
  )

  useEffect(() => {
    if (!map || !ready || ring.length < 4) return

    const feature: Feature<Polygon> = {
      type: 'Feature',
      properties: { label },
      geometry: {
        type: 'Polygon',
        coordinates: [ring],
      },
    }

    if (!map.getSource(CADASTRAL_SRC)) {
      map.addSource(CADASTRAL_SRC, {
        type: 'geojson',
        data: feature,
      })

      map.addLayer({
        id: CADASTRAL_FILL,
        type: 'fill',
        source: CADASTRAL_SRC,
        paint: {
          'fill-color': '#00A86B',
          'fill-opacity': 0.25,
        },
      })

      map.addLayer({
        id: CADASTRAL_LINE,
        type: 'line',
        source: CADASTRAL_SRC,
        paint: {
          'line-color': '#00A86B',
          'line-width': 3,
        },
      })
    } else {
      ;(map.getSource(CADASTRAL_SRC) as maplibregl.GeoJSONSource).setData(feature)
    }

    // Fit camera to boundary bounds
    const bounds = boundsFromCoords(ring)
    if (bounds) {
      map.fitBounds(bounds, {
        padding: 60,
        maxZoom: 18,
        duration: 400,
      })
    }

    // Add Survey corner stone markers
    cornerMarkersRef.current.forEach((m) => m.remove())
    cornerMarkersRef.current = []

    // Take unique corners (exclude the closing duplicate)
    const uniqueCorners = ring.slice(0, -1)
    uniqueCorners.forEach((pt, i) => {
      const el = document.createElement('div')
      el.className =
        'flex size-5 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-success text-[9px] font-bold text-white shadow-e2 transition-transform hover:scale-125'
      el.setAttribute('title', `Survey Station S${i + 1}: ${pt[1].toFixed(5)}, ${pt[0].toFixed(5)}`)
      el.innerText = `S${i + 1}`

      const marker = new maplibregl.Marker({
        element: el,
        anchor: 'center',
      })
        .setLngLat(pt)
        .addTo(map)

      cornerMarkersRef.current.push(marker)
    })

    return () => {
      cornerMarkersRef.current.forEach((m) => m.remove())
      cornerMarkersRef.current = []
      if (map.getLayer(CADASTRAL_FILL)) map.removeLayer(CADASTRAL_FILL)
      if (map.getLayer(CADASTRAL_LINE)) map.removeLayer(CADASTRAL_LINE)
      if (map.getSource(CADASTRAL_SRC)) map.removeSource(CADASTRAL_SRC)
    }
  }, [ring, label, map, ready])

  return null
}

export default function OsmCadastralView({
  coordinates,
  label,
  unit = 'sqm',
  defaultTheme = 'satellite',
  className,
}: OsmCadastralViewProps) {
  const [theme, setTheme] = useState<MapTheme>(defaultTheme)
  const center = useMemo(() => {
    if (coordinates.length >= 3) {
      return coordinates[0]
    }
    return [73.4062, 18.7546] as LngLat // Kusgaon default
  }, [coordinates])

  const areaSqm = useMemo(() => sphericalPolygonArea(coordinates), [coordinates])

  return (
    <div className={cn('relative size-full overflow-hidden rounded-card', className)}>
      <OsmMap
        center={center}
        zoom={17}
        theme={theme}
        showControls
        showScale
        className="size-full min-h-[300px]"
      >
        <CadastralLayer coordinates={coordinates} label={label} />

        {/* Top Control Bar: Theme switcher & Parcel Label */}
        <div className="absolute top-3.5 left-3.5 z-10 flex flex-wrap items-center gap-2">
          <div
            role="group"
            aria-label="Map imagery"
            className="flex overflow-hidden rounded-control border border-line-strong bg-surface text-chip font-medium shadow-e1"
          >
            <button
              type="button"
              onClick={() => setTheme('satellite')}
              className={cn(
                'flex cursor-pointer items-center gap-1.5 px-2.5 py-1 transition-colors',
                theme === 'satellite'
                  ? 'bg-primary text-on-primary font-semibold'
                  : 'text-muted hover:text-text'
              )}
            >
              <Satellite className="size-3.5" /> Satellite
            </button>
            <button
              type="button"
              onClick={() => setTheme('streets')}
              className={cn(
                'flex cursor-pointer items-center gap-1.5 px-2.5 py-1 transition-colors',
                theme === 'streets'
                  ? 'bg-primary text-on-primary font-semibold'
                  : 'text-muted hover:text-text'
              )}
            >
              <Layers className="size-3.5" /> Cadastre / Streets
            </button>
          </div>

          <div className="rounded-control bg-surface/90 px-3 py-1 text-label font-semibold text-text shadow-e1 backdrop-blur-xs">
            {label}
          </div>
        </div>

        {/* Bottom Legend Badge */}
        <div className="pointer-events-none absolute bottom-3 left-3 z-10 flex items-center gap-2 rounded-control border border-line bg-surface/90 px-3 py-1.5 text-label font-medium text-text shadow-e1 backdrop-blur-xs">
          <span className="size-2.5 rounded-full bg-success" />
          <span>Survey Demarcation:</span>
          <span className="font-semibold tabular">{formatArea(areaSqm, unit)}</span>
          <span className="text-muted tabular">({coordinates.length} corner stations)</span>
        </div>
      </OsmMap>
    </div>
  )
}

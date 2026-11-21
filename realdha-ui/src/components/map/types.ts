import type { ReactNode } from 'react'
import type { Map as MapLibreMap } from 'maplibre-gl'
import type { GeoPoint, LngLat } from './osm-geometry'
import type { MapTheme } from './osm-styles'

export type { GeoPoint, LngLat, MapTheme }

export interface OsmMapProps {
  /** Map center coordinates [lng, lat] or { lng, lat } */
  center?: LngLat | GeoPoint
  /** Initial zoom level (default 14) */
  zoom?: number
  minZoom?: number
  maxZoom?: number
  /** Map pitch (0-85, default 0 for flat 2D) */
  pitch?: number
  /** Visual style theme: streets, satellite, night, light, standard */
  theme?: MapTheme
  /** Enable map drag/zoom interaction (default true) */
  interactive?: boolean
  /** Show zoom controls */
  showControls?: boolean
  /** Show metric scale indicator */
  showScale?: boolean
  /** Show theme selector control pill */
  showThemeToggle?: boolean
  className?: string
  style?: React.CSSProperties
  /** Callback when map finishes initial load */
  onLoad?: (map: MapLibreMap) => void
  /** Callback on map center/zoom change */
  onMove?: (center: LngLat, zoom: number) => void
  /** Callback on map background click */
  onClick?: (point: LngLat) => void
  /** Map children (markers, overlays, controls) */
  children?: ReactNode
}

export interface MarkerProps {
  position: LngLat | GeoPoint
  draggable?: boolean
  onDragEnd?: (pos: LngLat) => void
  onClick?: () => void
  className?: string
  ariaLabel?: string
  children?: ReactNode
}

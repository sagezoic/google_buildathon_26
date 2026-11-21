import { useEffect, useMemo, useRef, useState } from 'react'
import * as maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'
import { X } from 'lucide-react'
import { cn } from '../../lib/cn'
import { collapseAttribution } from '../map/attribution'
import { generateShapes, hasCoords } from '../../lib/society-shapes'
import { cardBadges, formatInr, type FlatMode, type SocietyCard } from '../../lib/flats-api'

/**
 * 3D society map, ported from the Flat Finder web app (web/src/map.js): tilted night satellite base,
 * 3D city buildings from OpenFreeMap vector tiles, society sites with generated towers, labels.
 * Three base modes (Night / Streets / Light) like the original.
 */

// Vite bundles the worker (with its shared chunk) into one asset; the default URL is not emitted in production builds.
maplibregl.setWorkerUrl(workerUrl)

type Mode = 'night' | 'streets' | 'light'
const MODES: ReadonlyArray<{ value: Mode; label: string }> = [
  { value: 'night', label: 'Night' }, { value: 'streets', label: 'Streets' }, { value: 'light', label: 'Light' },
]

const SRC = 'societies'
const SHAPES = 'society-shapes'
const GLYPHS = 'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf'
const PALETTE: Record<Mode, { block: string; sel: string; city: string; label: string; halo: string; glow: number }> = {
  night: { block: '#ffd9a0', sel: '#ffffff', city: '#17171a', label: '#f2f0ec', halo: 'rgba(0,0,0,.85)', glow: 0.5 },
  streets: { block: '#ffd9a0', sel: '#ffffff', city: '#2a2b30', label: '#f2f0ec', halo: 'rgba(0,0,0,.85)', glow: 0.5 },
  light: { block: '#e8710a', sel: '#1a73e8', city: '#e8e5df', label: '#202124', halo: 'rgba(255,255,255,.95)', glow: 0.28 },
}
const SKY: Record<Mode, maplibregl.SkySpecification> = {
  night: { 'sky-color': '#07080b', 'horizon-color': '#1a1712', 'fog-color': '#07080b', 'sky-horizon-blend': 0.6, 'horizon-fog-blend': 0.6, 'fog-ground-blend': 0.2 },
  streets: { 'sky-color': '#07080b', 'horizon-color': '#1a1712', 'fog-color': '#07080b', 'sky-horizon-blend': 0.6, 'horizon-fog-blend': 0.6, 'fog-ground-blend': 0.2 },
  light: { 'sky-color': '#cfe3f5', 'horizon-color': '#eef3f7', 'fog-color': '#f5f3ef', 'sky-horizon-blend': 0.6, 'horizon-fog-blend': 0.6, 'fog-ground-blend': 0.2 },
}
// Street layers, shown for Streets and Light; Night uses the dimmed satellite instead.
export const STREET_PAINT: Record<'streets' | 'light', Record<string, [string, unknown]>> = {
  streets: {
    'st-bg': ['background-color', '#202124'], 'st-green': ['fill-color', '#1f2a22'], 'st-park': ['fill-color', '#22311f'],
    'st-water': ['fill-color', '#15233a'], 'st-casing': ['line-color', '#0f0f11'], 'st-road': ['line-color', '#646a75'],
    'lbl-road': ['text-color', '#e4dfd5'], 'lbl-place': ['text-color', '#9d988e'],
  },
  light: {
    'st-bg': ['background-color', '#f5f3ef'], 'st-green': ['fill-color', '#d8ead2'], 'st-park': ['fill-color', '#c8e6c4'],
    'st-water': ['fill-color', '#aadaff'], 'st-casing': ['line-color', '#d6d3cd'], 'st-road': ['line-color', '#ffffff'],
    'lbl-road': ['text-color', '#4d5156'], 'lbl-place': ['text-color', '#5f6368'],
  },
}
export const STREET_IDS = ['st-bg', 'st-green', 'st-park', 'st-water', 'st-casing', 'st-road']
const roadWidth = ['interpolate', ['exponential', 1.5], ['zoom'], 10, 0.4, 17, 6]

export function baseStyle(): maplibregl.StyleSpecification {
  const none = { visibility: 'none' as const }
  return {
    version: 8,
    glyphs: GLYPHS,
    sky: { ...SKY.night, 'atmosphere-blend': ['interpolate', ['linear'], ['zoom'], 0, 1, 10, 0] },
    sources: {
      sat: { type: 'raster', tileSize: 256, maxzoom: 18, attribution: 'Imagery © Esri', tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'] },
      omt: { type: 'vector', url: 'https://tiles.openfreemap.org/planet', attribution: '© OpenStreetMap contributors · OpenFreeMap' },
    },
    layers: [
      { id: 'bg', type: 'background', paint: { 'background-color': '#050506' } },
      { id: 'sat', type: 'raster', source: 'sat', paint: { 'raster-brightness-max': 0.3, 'raster-saturation': -0.75, 'raster-contrast': 0.15, 'raster-hue-rotate': 200 } },
      { id: 'st-bg', type: 'background', layout: none, paint: { 'background-color': '#202124' } },
      { id: 'st-green', type: 'fill', source: 'omt', 'source-layer': 'landcover', layout: none, filter: ['in', ['get', 'class'], ['literal', ['grass', 'wood', 'farmland']]], paint: { 'fill-color': '#1f2a22', 'fill-opacity': 0.8 } },
      { id: 'st-park', type: 'fill', source: 'omt', 'source-layer': 'park', layout: none, paint: { 'fill-color': '#22311f', 'fill-opacity': 0.9 } },
      { id: 'st-water', type: 'fill', source: 'omt', 'source-layer': 'water', layout: none, paint: { 'fill-color': '#15233a' } },
      { id: 'st-casing', type: 'line', source: 'omt', 'source-layer': 'transportation', layout: { ...none, 'line-cap': 'round', 'line-join': 'round' },
        filter: ['in', ['get', 'class'], ['literal', ['motorway', 'trunk', 'primary', 'secondary', 'tertiary', 'minor']]], paint: { 'line-color': '#0f0f11', 'line-width': roadWidth.map((v, i) => (i === 4 ? 0.6 : i === 6 ? 8 : v)) as never } },
      { id: 'st-road', type: 'line', source: 'omt', 'source-layer': 'transportation', layout: { ...none, 'line-cap': 'round', 'line-join': 'round' },
        filter: ['in', ['get', 'class'], ['literal', ['motorway', 'trunk', 'primary', 'secondary', 'tertiary', 'minor', 'service']]], paint: { 'line-color': '#646a75', 'line-width': roadWidth as never } },
      { id: 'roads', type: 'line', source: 'omt', 'source-layer': 'transportation', filter: ['in', ['get', 'class'], ['literal', ['motorway', 'trunk', 'primary', 'secondary']]],
        paint: { 'line-color': '#ffcf8a', 'line-opacity': 0.2, 'line-width': ['interpolate', ['linear'], ['zoom'], 10, 0.5, 16, 2.5], 'line-blur': 1 } },
      { id: 'city', type: 'fill-extrusion', source: 'omt', 'source-layer': 'building', minzoom: 13,
        paint: { 'fill-extrusion-color': '#17171a', 'fill-extrusion-height': ['coalesce', ['get', 'render_height'], 8], 'fill-extrusion-base': ['coalesce', ['get', 'render_min_height'], 0], 'fill-extrusion-opacity': 0.85 } },
      { id: 'lbl-road', type: 'symbol', source: 'omt', 'source-layer': 'transportation_name', minzoom: 12.5,
        filter: ['in', ['get', 'class'], ['literal', ['motorway', 'trunk', 'primary', 'secondary', 'tertiary']]],
        layout: { 'symbol-placement': 'line', 'text-field': ['coalesce', ['get', 'name:en'], ['get', 'name']], 'text-font': ['Noto Sans Regular'], 'text-size': 11, 'text-max-angle': 30 },
        paint: { 'text-color': '#e4dfd5', 'text-halo-color': 'rgba(0,0,0,.9)', 'text-halo-width': 1.5 } },
      { id: 'lbl-place', type: 'symbol', source: 'omt', 'source-layer': 'place', minzoom: 10,
        filter: ['in', ['get', 'class'], ['literal', ['suburb', 'neighbourhood', 'quarter', 'village', 'town', 'city']]],
        layout: { 'text-field': ['coalesce', ['get', 'name:en'], ['get', 'name']], 'text-font': ['Noto Sans Bold'], 'text-size': 11.5, 'text-transform': 'uppercase', 'text-letter-spacing': 0.12 },
        paint: { 'text-color': '#9d988e', 'text-halo-color': 'rgba(0,0,0,.85)', 'text-halo-width': 1.2 } },
    ],
  }
}

function priceLabel(s: SocietyCard, mode: FlatMode): string {
  if (mode === 'rent') {
    const rents = Object.values(s.prices ?? {}).map((p) => p.rent_median).filter((n): n is number => n != null)
    return rents.length ? `${formatInr(Math.min(...rents))}/mo` : 'Rent on request'
  }
  return s.price_min != null ? formatInr(s.price_min) : 'Price on request'
}

const colorBy = (c: { block: string; sel: string }) => ['case', ['boolean', ['feature-state', 'sel'], false], c.sel, c.block]

export interface MarketMapProps {
  societies: SocietyCard[]
  mode: FlatMode
  center?: [number, number]
  zoom?: number
  onUnavailable?: () => void
}

export default function MarketMap({ societies, mode, center, zoom, onUnavailable }: MarketMapProps) {
  const box = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const prevSel = useRef<string | null>(null)
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)
  const [base, setBase] = useState<Mode>('streets')
  const [tilt, setTilt] = useState(true)
  const [selected, setSelected] = useState<string | null>(null)
  const reduce = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches

  const pts = useMemo(() => societies.filter(hasCoords), [societies])
  const geo = useMemo(() => generateShapes(pts), [pts])
  const geoRef = useRef(geo)
  geoRef.current = geo

  // Create the map once.
  useEffect(() => {
    if (!box.current) return
    let map: maplibregl.Map
    try {
      map = new maplibregl.Map({
        container: box.current,
        style: baseStyle(),
        center: center ?? [73.8567, 18.5204],
        zoom: zoom ?? 12,
        pitch: 50,
        maxPitch: 70,
        dragRotate: false, // north stays up
        pitchWithRotate: false,
        touchPitch: false,
        attributionControl: { compact: true },
      })
    } catch {
      setFailed(true)
      onUnavailable?.()
      return
    }
    collapseAttribution(map)
    map.touchZoomRotate.disableRotation()
    map.keyboard.disableRotation()
    map.addControl(new maplibregl.NavigationControl({ showCompass: false, visualizePitch: true }), 'top-right')
    map.addControl(new maplibregl.ScaleControl({ unit: 'metric', maxWidth: 90 }), 'bottom-right')
    map.on('error', (e) => console.warn('[market-map]', e.error?.message ?? e))
    map.on('load', () => {
      const g = geoRef.current
      map.addSource(SRC, { type: 'geojson', data: g.points, promoteId: 'sid' })
      map.addSource(SHAPES, { type: 'geojson', data: g.shapes, promoteId: 'sid' })
      const c = PALETTE.streets
      map.addLayer({ id: 'site-fill', type: 'fill', source: SHAPES, filter: ['==', ['get', 'role'], 'site'], paint: { 'fill-color': colorBy(c) as never, 'fill-opacity': 0.13 } })
      map.addLayer({ id: 'site-line', type: 'line', source: SHAPES, filter: ['==', ['get', 'role'], 'site'], paint: { 'line-color': colorBy(c) as never, 'line-blur': 1.5, 'line-opacity': 0.8, 'line-width': ['interpolate', ['linear'], ['zoom'], 11, 0.6, 16, 2] } })
      map.addLayer({ id: 'dots', type: 'circle', source: SRC, maxzoom: 14.5, paint: { 'circle-color': colorBy(c) as never, 'circle-radius': ['interpolate', ['linear'], ['zoom'], 9, 3, 14, 6], 'circle-stroke-width': 1, 'circle-stroke-color': 'rgba(0,0,0,.6)' } })
      map.addLayer({ id: 'bld', type: 'fill-extrusion', source: SHAPES, minzoom: 11.5, filter: ['==', ['get', 'role'], 'bld'], paint: { 'fill-extrusion-color': colorBy(c) as never, 'fill-extrusion-height': ['get', 'h'], 'fill-extrusion-opacity': 0.95, 'fill-extrusion-vertical-gradient': true } })
      map.addLayer({ id: 'names', type: 'symbol', source: SRC, minzoom: 13.2, layout: { 'text-field': ['get', 'name'], 'text-font': ['Noto Sans Regular'], 'text-size': 11.5, 'text-offset': [0, -2.2], 'text-optional': true }, paint: { 'text-color': c.label, 'text-halo-color': c.halo, 'text-halo-width': 1.4 } })
      for (const id of ['bld', 'site-fill', 'dots']) {
        map.on('click', id, (e) => { const f = e.features?.[0]; if (f) setSelected(String(f.properties?.sid)) })
        map.on('mouseenter', id, () => { map.getCanvas().style.cursor = 'pointer' })
        map.on('mouseleave', id, () => { map.getCanvas().style.cursor = '' })
      }
      setReady(true)
    })
    mapRef.current = map
    return () => { map.remove(); mapRef.current = null; setReady(false) }
    // Created once; data, theme and camera are synced by the effects below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Data + camera.
  useEffect(() => {
    const map = mapRef.current
    if (!map || !ready) return
    ;(map.getSource(SRC) as maplibregl.GeoJSONSource).setData(geo.points)
    ;(map.getSource(SHAPES) as maplibregl.GeoJSONSource).setData(geo.shapes)
    setSelected(null)
    // Few societies: frame them. Many: open on the city centre, tilted, so the 3D towers are visible; pan or use "Go to society".
    if (pts.length > 1 && pts.length <= 8) {
      const b = new maplibregl.LngLatBounds()
      pts.forEach((s) => b.extend([s.lng, s.lat]))
      map.fitBounds(b, { padding: 80, maxZoom: 14.5, pitch: map.getPitch(), duration: reduce ? 0 : 900 })
    } else if (pts.length === 1) map.jumpTo({ center: [pts[0].lng, pts[0].lat], zoom: 15, pitch: 55 })
    else if (center) map.jumpTo({ center, zoom: Math.max(zoom ?? 12, 12.4) })
  }, [geo, pts, ready, center, zoom, reduce])

  // Base mode: dark satellite, dark streets or light streets.
  useEffect(() => {
    const map = mapRef.current
    if (!map || !ready) return
    const streetsLike = base !== 'night'
    const vis = (id: string, on: boolean) => map.setLayoutProperty(id, 'visibility', on ? 'visible' : 'none')
    STREET_IDS.forEach((id) => vis(id, streetsLike))
    vis('sat', !streetsLike)
    vis('roads', !streetsLike ? true : false)
    if (streetsLike) for (const [id, [prop, v]] of Object.entries(STREET_PAINT[base as 'streets' | 'light'])) map.setPaintProperty(id, prop as 'line-color', v as string)
    const label = base === 'light' ? ['#4d5156', '#5f6368', '#ffffff'] : ['#e4dfd5', '#9d988e', 'rgba(0,0,0,.9)']
    map.setPaintProperty('lbl-road', 'text-color', label[0])
    map.setPaintProperty('lbl-place', 'text-color', label[1])
    map.setPaintProperty('lbl-road', 'text-halo-color', label[2])
    map.setPaintProperty('lbl-place', 'text-halo-color', label[2])
    const c = PALETTE[base]
    map.setPaintProperty('city', 'fill-extrusion-color', c.city)
    for (const [id, prop] of [['dots', 'circle-color'], ['bld', 'fill-extrusion-color'], ['site-fill', 'fill-color'], ['site-line', 'line-color']] as const) map.setPaintProperty(id, prop as 'circle-color', colorBy(c) as never)
    map.setPaintProperty('names', 'text-color', c.label)
    map.setPaintProperty('names', 'text-halo-color', c.halo)
    map.setSky({ ...SKY[base], 'atmosphere-blend': ['interpolate', ['linear'], ['zoom'], 0, 1, 10, 0] })
  }, [base, ready])

  // 2D / 3D camera.
  useEffect(() => {
    const map = mapRef.current
    if (!map || !ready) return
    map.easeTo({ pitch: tilt ? 50 : 0, duration: reduce ? 0 : 500 })
  }, [tilt, ready, reduce])

  // Selection highlight.
  useEffect(() => {
    const map = mapRef.current
    if (!map || !ready) return
    for (const src of [SRC, SHAPES]) {
      if (prevSel.current) map.setFeatureState({ source: src, id: prevSel.current }, { sel: false })
      if (selected) map.setFeatureState({ source: src, id: selected }, { sel: true })
    }
    prevSel.current = selected
  }, [selected, ready, geo])

  const sel = pts.find((s) => s.id === selected)
  const focusOn = (id: string) => {
    setSelected(id || null)
    const s = pts.find((p) => p.id === id)
    if (s) mapRef.current?.flyTo({ center: [s.lng, s.lat], zoom: 15.5, pitch: 60, duration: reduce ? 0 : 1200 })
  }

  if (failed) {
    return <p role="alert" className="rounded-card border border-line bg-surface p-4 text-small">The 3D map needs WebGL, which is not available in this browser. Use the list view instead.</p>
  }

  const ctl = 'inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-control border border-line-strong bg-surface px-3 text-chip text-text hover:border-line-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus [@media(pointer:coarse)]:min-h-11'

  return (
    <section aria-label="Map of societies" className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <div role="radiogroup" aria-label="Map style" className="inline-flex overflow-hidden rounded-control border border-line-strong bg-surface text-chip font-medium">
          {MODES.map((m) => (
            <button key={m.value} type="button" role="radio" aria-checked={base === m.value} onClick={() => setBase(m.value)}
              className={cn('min-h-9 cursor-pointer px-3 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus [@media(pointer:coarse)]:min-h-11', base === m.value ? 'bg-primary text-on-primary' : 'text-text hover:bg-primary-tint')}>
              {m.label}
            </button>
          ))}
        </div>
        <button type="button" aria-pressed={tilt} onClick={() => setTilt((t) => !t)} className={ctl}>3D view</button>
        {/* Keyboard and screen reader route to every society: the canvas itself is not focusable per pin. */}
        <label className="flex items-center gap-2 text-chip text-muted">
          <span>Go to society</span>
          <select value={selected ?? ''} onChange={(e) => focusOn(e.target.value)} className="h-control max-w-56 cursor-pointer rounded-control border border-line-strong bg-field px-2 text-chip text-text max-xl:h-11">
            <option value="">Select…</option>
            {pts.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </label>
        <span role="status" className="text-chip text-muted">{pts.length} on map</span>
      </div>

      <div className="relative h-[70vh] min-h-96 overflow-hidden rounded-card border border-line bg-[#050506]">
        <div ref={box} className="size-full" />
        {!ready && <div aria-busy="true" className="absolute inset-0 animate-pulse bg-[#050506] motion-reduce:animate-none" />}
        {sel && (
          <article className="absolute inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-10 flex gap-3 rounded-card border border-line bg-surface p-3 shadow-e1 md:right-auto md:w-80">
            <div className="min-w-0 flex-1">
              <h3 className="text-control font-semibold text-balance">
                <a href={`/marketplace?view=society&society=${encodeURIComponent(sel.id)}`} className="text-text no-underline hover:text-brand focus-visible:outline-2 focus-visible:outline-focus">{sel.name}</a>
              </h3>
              <p className="text-label text-muted">{[sel.locality, sel.pincode ? `Pune ${sel.pincode}` : 'Pune'].filter(Boolean).join(', ')}</p>
              <p className="mt-1 text-small"><b className="tabular">{priceLabel(sel, mode)}</b>{sel.rating != null && <span className="text-muted"> · {sel.rating.toFixed(1)} rating</span>}</p>
              <p className="mt-0.5 text-chip text-muted">{cardBadges(sel).join(' · ')}</p>
            </div>
            <button type="button" aria-label="Close society details" onClick={() => setSelected(null)} className="inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full hover:bg-sunken focus-visible:outline-2 focus-visible:outline-focus [@media(pointer:coarse)]:size-11">
              <X aria-hidden className="size-4" />
            </button>
          </article>
        )}
      </div>
    </section>
  )
}

import type { StyleSpecification } from 'maplibre-gl'

export type MapTheme = 'streets' | 'satellite' | 'night' | 'light' | 'standard'

export const GLYPHS = 'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf'

export const TILE_SOURCES = {
  vectorOmt: 'https://tiles.openfreemap.org/planet',
  osmRaster: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  esriSat: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
} as const

const roadWidth = ['interpolate', ['exponential', 1.5], ['zoom'], 10, 0.4, 17, 6]

/**
 * Standard OpenStreetMap Raster Style (lightweight, zero WebGL vector shader overhead).
 */
export function osmRasterStyle(): StyleSpecification {
  return {
    version: 8,
    sources: {
      'osm-tiles': {
        type: 'raster',
        tiles: [TILE_SOURCES.osmRaster],
        tileSize: 256,
        attribution: '© OpenStreetMap contributors',
      },
    },
    layers: [
      {
        id: 'osm-tiles-layer',
        type: 'raster',
        source: 'osm-tiles',
        minzoom: 0,
        maxzoom: 19,
      },
    ],
  }
}

/**
 * Vector and Satellite Hybrid Styles with OpenFreeMap vector planet and Esri Imagery.
 */
export function getMapStyle(theme: MapTheme = 'streets'): StyleSpecification {
  if (theme === 'standard') {
    return osmRasterStyle()
  }

  const isSat = theme === 'satellite'
  const isNight = theme === 'night'
  const isLight = theme === 'light'

  const bgColor = isNight ? '#050506' : isLight ? '#f5f3ef' : '#202124'
  const roadColor = isNight ? '#646a75' : isLight ? '#ffffff' : '#646a75'
  const casingColor = isNight ? '#0f0f11' : isLight ? '#d6d3cd' : '#0f0f11'
  const greenColor = isNight ? '#1f2a22' : isLight ? '#d8ead2' : '#1f2a22'
  const waterColor = isNight ? '#15233a' : isLight ? '#aadaff' : '#15233a'
  const textColor = isLight ? '#202124' : '#f2f0ec'
  const haloColor = isLight ? 'rgba(255,255,255,0.95)' : 'rgba(0,0,0,0.85)'

  return {
    version: 8,
    glyphs: GLYPHS,
    sources: {
      sat: {
        type: 'raster',
        tileSize: 256,
        maxzoom: 18,
        attribution: 'Imagery © Esri',
        tiles: [TILE_SOURCES.esriSat],
      },
      omt: {
        type: 'vector',
        url: TILE_SOURCES.vectorOmt,
        attribution: '© OpenStreetMap contributors · OpenFreeMap',
      },
    },
    layers: [
      {
        id: 'bg',
        type: 'background',
        paint: { 'background-color': bgColor },
      },
      {
        id: 'sat',
        type: 'raster',
        source: 'sat',
        layout: { visibility: isSat ? 'visible' : 'none' },
        paint: {
          'raster-brightness-max': 1,
          'raster-saturation': 0,
          'raster-contrast': 0,
        },
      },
      {
        id: 'st-green',
        type: 'fill',
        source: 'omt',
        'source-layer': 'landcover',
        layout: { visibility: isSat ? 'none' : 'visible' },
        filter: ['in', ['get', 'class'], ['literal', ['grass', 'wood', 'farmland']]],
        paint: { 'fill-color': greenColor, 'fill-opacity': isLight ? 0.6 : 0.8 },
      },
      {
        id: 'st-water',
        type: 'fill',
        source: 'omt',
        'source-layer': 'water',
        layout: { visibility: isSat ? 'none' : 'visible' },
        paint: { 'fill-color': waterColor },
      },
      {
        id: 'st-casing',
        type: 'line',
        source: 'omt',
        'source-layer': 'transportation',
        layout: {
          visibility: isSat ? 'none' : 'visible',
          'line-cap': 'round',
          'line-join': 'round',
        },
        filter: ['in', ['get', 'class'], ['literal', ['motorway', 'trunk', 'primary', 'secondary', 'tertiary']]],
        paint: {
          'line-color': casingColor,
          'line-width': (roadWidth as never),
        },
      },
      {
        id: 'st-road',
        type: 'line',
        source: 'omt',
        'source-layer': 'transportation',
        layout: {
          'line-cap': 'round',
          'line-join': 'round',
        },
        filter: ['in', ['get', 'class'], ['literal', ['motorway', 'trunk', 'primary', 'secondary', 'tertiary', 'minor', 'service']]],
        paint: {
          'line-color': isSat ? '#ffffff' : roadColor,
          'line-opacity': isSat ? 0.45 : 1,
          'line-width': (roadWidth as never),
        },
      },
      {
        id: 'buildings',
        type: 'fill-extrusion',
        source: 'omt',
        'source-layer': 'building',
        minzoom: 13,
        layout: { visibility: isSat ? 'none' : 'visible' },
        paint: {
          'fill-extrusion-color': isLight ? '#d4d0c7' : '#17171a',
          'fill-extrusion-height': ['coalesce', ['get', 'render_height'], 10],
          'fill-extrusion-base': ['coalesce', ['get', 'render_min_height'], 0],
          'fill-extrusion-opacity': 0.8,
        },
      },
      {
        id: 'lbl-road',
        type: 'symbol',
        source: 'omt',
        'source-layer': 'transportation_name',
        minzoom: 13,
        filter: ['in', ['get', 'class'], ['literal', ['motorway', 'trunk', 'primary', 'secondary']]],
        layout: {
          'symbol-placement': 'line',
          'text-field': ['coalesce', ['get', 'name:en'], ['get', 'name']],
          'text-font': ['Noto Sans Regular'],
          'text-size': 11,
        },
        paint: {
          'text-color': textColor,
          'text-halo-color': haloColor,
          'text-halo-width': 1.5,
        },
      },
      {
        id: 'lbl-place',
        type: 'symbol',
        source: 'omt',
        'source-layer': 'place',
        minzoom: 10,
        filter: ['in', ['get', 'class'], ['literal', ['suburb', 'neighbourhood', 'town', 'city']]],
        layout: {
          'text-field': ['coalesce', ['get', 'name:en'], ['get', 'name']],
          'text-font': ['Noto Sans Bold'],
          'text-size': 12,
          'text-transform': 'uppercase',
          'text-letter-spacing': 0.1,
        },
        paint: {
          'text-color': textColor,
          'text-halo-color': haloColor,
          'text-halo-width': 1.5,
        },
      },
    ],
  }
}

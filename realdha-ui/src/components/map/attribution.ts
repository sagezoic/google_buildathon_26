import type { Map } from 'maplibre-gl'

/**
 * MapLibre's compact attribution starts open (the credit text beside the (i) button).
 * Fold it so only the (i) button shows; clicking it still reveals the credit.
 * Folds now and again on `load` and the first `idle`, because the control re-opens while the map is sized.
 */
export function collapseAttribution(map: Map) {
  const fold = () => {
    map.getContainer().querySelector('.maplibregl-ctrl-attrib')?.classList.remove('maplibregl-compact-show')
  }
  fold()
  map.once('load', fold)
  map.once('idle', fold)
}

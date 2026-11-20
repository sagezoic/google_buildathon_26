import { Plus, Trash2 } from 'lucide-react'
import { Screen } from '../../../app/Shell'
import { path } from '../../../app/nav'
import { Button } from '../../../components/ui/button'
import { Card } from '../../../components/ui/card'
import { StepPills } from '../../../components/ui/f10-parts'
import { useTowers } from '../../../lib/f10-store'

/** F10-02 · Towers and floors setup. */
export default function TowersFloorsScreen() {
  const [towers, setTowers] = useTowers()

  const totalUnits = towers.reduce((acc, t) => acc + t.floors * t.perFloor, 0)

  const addTower = () => {
    const nextName = String.fromCharCode(65 + towers.length)
    setTowers([...towers, { name: nextName, floors: 18, perFloor: 4 }])
  }

  const removeTower = (index: number) => {
    if (towers.length <= 1) return
    setTowers(towers.filter((_, i) => i !== index))
  }

  const updateTower = (index: number, field: 'floors' | 'perFloor', val: number) => {
    setTowers(
      towers.map((t, i) => (i === index ? { ...t, [field]: Math.max(1, val) } : t))
    )
  }

  return (
    <Screen id="F10-02" role="developer" back={path('F10-01')} title="Towers and floors">
      <div className="mx-auto flex w-full max-w-[880px] flex-col gap-6 px-4 py-6 xl:py-8">
        <StepPills current={2} />

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
          <div>
            <h1 className="text-h1 font-bold text-text">Towers and floors</h1>
            <p className="text-body text-muted">
              Define the towers and typical unit distribution for Baner Heights.
            </p>
          </div>
          <div className="rounded-control bg-primary-tint px-3 py-1.5 font-semibold text-primary">
            {totalUnits} total units
          </div>
        </div>

        <Card className="flex flex-col gap-5 p-6">
          <div className="flex flex-col divide-y divide-line">
            {towers.map((tower, idx) => (
              <div key={tower.name} className="flex flex-wrap items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-control bg-text font-bold text-canvas">
                    {tower.name}
                  </div>
                  <div>
                    <span className="text-body font-semibold text-text">Tower {tower.name}</span>
                    <div className="text-small text-muted">{tower.floors * tower.perFloor} units</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-small text-muted">Floors:</span>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={tower.floors}
                      onChange={(e) => updateTower(idx, 'floors', parseInt(e.target.value) || 1)}
                      className="h-9 w-20 rounded-control border border-line bg-surface px-2 text-center text-body text-text outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-small text-muted">Units / floor:</span>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={tower.perFloor}
                      onChange={(e) => updateTower(idx, 'perFloor', parseInt(e.target.value) || 1)}
                      className="h-9 w-20 rounded-control border border-line bg-surface px-2 text-center text-body text-text outline-none"
                    />
                  </div>

                  {towers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTower(idx)}
                      className="p-1 text-muted hover:text-danger"
                      title="Remove tower"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <Button variant="secondary" size="sm" onClick={addTower} icon={<Plus className="size-3.5" />}>
              Add tower
            </Button>
          </div>

          <div className="flex justify-between border-t border-line pt-4">
            <Button variant="secondary" to={path('F10-01')}>
              Back
            </Button>
            <Button to={path('F10-03')}>
              Next: Bulk CSV
            </Button>
          </div>
        </Card>
      </div>
    </Screen>
  )
}

import { useState } from 'react'
import { Screen } from '../../../app/Shell'
import { path } from '../../../app/nav'
import { Button } from '../../../components/ui/button'
import { Card } from '../../../components/ui/card'
import { Pill } from '../../../components/ui/pill'
import { StepPills } from '../../../components/ui/f10-parts'
import { inrShort, useTowers } from '../../../lib/f10-store'
import { cn } from '../../../lib/cn'

const FLOORS = [24, 23, 22, 21, 20, 19, 18]
const UNITS_PER_FLOOR = [1, 2, 3, 4, 5, 6]

/** F10-04 · Unit grid editor with generated IDs. */
export default function UnitGridScreen() {
  const [towers] = useTowers()
  const [selectedTower, setSelectedTower] = useState('A')
  const [activeUnit, setActiveUnit] = useState<string | null>('A-1804')

  return (
    <Screen id="F10-04" role="developer" back={path('F10-03')} title="Unit grid editor">
      <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-6 px-4 py-6 xl:py-8">
        <StepPills current={3} />

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
          <div>
            <h1 className="text-h1 font-bold text-text">Unit grid · Tower {selectedTower}</h1>
            <p className="text-body text-muted">
              Click any unit cell to view configuration, price and availability status.
            </p>
          </div>
          <div className="flex rounded-control border border-line bg-surface p-0.5 text-chip font-medium">
            {towers.map((t) => (
              <button
                key={t.name}
                type="button"
                onClick={() => setSelectedTower(t.name)}
                className={cn(
                  'rounded-[4px] px-3.5 py-1.5 transition-colors',
                  selectedTower === t.name ? 'bg-primary text-on-primary' : 'text-muted hover:text-text'
                )}
              >
                Tower {t.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          {/* Main Grid */}
          <div className="overflow-x-auto rounded-card border border-line bg-surface p-4 xl:col-span-8">
            <div className="flex flex-col gap-2 min-w-[500px]">
              {FLOORS.map((floor) => (
                <div key={floor} className="flex items-center gap-2">
                  <span className="w-16 font-mono text-small text-muted">Floor {floor}</span>
                  <div className="grid flex-1 grid-cols-6 gap-2">
                    {UNITS_PER_FLOOR.map((no) => {
                      const uId = `${selectedTower}-${floor}${String(no).padStart(2, '0')}`
                      const isSelected = activeUnit === uId
                      const isBooked = no === 3 && floor % 2 === 0
                      const isSold = no === 5 && floor % 3 === 0
                      return (
                        <button
                          key={no}
                          type="button"
                          onClick={() => setActiveUnit(uId)}
                          className={cn(
                            'flex flex-col items-center justify-center rounded-control border p-1.5 text-center transition-colors',
                            isSelected
                              ? 'border-2 border-primary bg-primary-tint'
                              : isSold
                              ? 'border-line bg-skeleton opacity-60'
                              : isBooked
                              ? 'border-warning-line bg-warning-tint/30'
                              : 'border-line bg-surface hover:border-line-hover'
                          )}
                        >
                          <span className="font-mono text-label font-semibold">{uId}</span>
                          <span className="text-overline text-muted">{no % 2 === 1 ? '3 BHK' : '2 BHK'}</span>
                          <span className="text-overline font-medium text-text">{inrShort(no % 2 === 1 ? 14200000 : 9500000)}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Unit Details Panel */}
          <div className="flex flex-col gap-4 xl:col-span-4">
            <Card className="flex flex-col gap-4 p-5">
              <div className="flex items-center justify-between border-b border-line pb-3">
                <span className="text-h2 font-bold text-text">{activeUnit ?? 'Select a unit'}</span>
                <Pill tone="success">Available</Pill>
              </div>

              <div className="flex flex-col gap-2 text-small">
                <div className="flex justify-between">
                  <span className="text-muted">Configuration:</span>
                  <span className="font-semibold text-text">3 BHK</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Carpet Area:</span>
                  <span className="font-semibold text-text">1,180 sq ft</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Facing:</span>
                  <span className="font-semibold text-text">East</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Floor:</span>
                  <span className="font-semibold text-text">18 of 24</span>
                </div>
                <div className="flex justify-between border-t border-line pt-2">
                  <span className="text-muted">Price:</span>
                  <span className="font-bold text-text">₹1,42,00,000</span>
                </div>
              </div>

              <div className="pt-2">
                <Button variant="secondary" size="sm" className="w-full">
                  Edit unit specs
                </Button>
              </div>
            </Card>

            <div className="flex justify-between pt-4">
              <Button variant="secondary" to={path('F10-03')}>
                Back
              </Button>
              <Button to={path('F10-05')}>
                Next: Plans & Publish
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Screen>
  )
}

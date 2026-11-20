import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Screen } from '../../app/Shell'
import { path } from '../../app/nav'
import { Card } from '../../components/ui/card'
import { inrShort } from '../../lib/f10-store'
import { cn } from '../../lib/cn'

const TOWERS = ['Tower A', 'Tower B', 'Tower C']
const FLOORS = [24, 23, 22, 21, 20, 19, 18, 17, 16, 15]
const UNITS = [1, 2, 3, 4, 5, 6]

/** F10-08 · Building stack picker for buyer exploration. */
export default function StackPickerScreen() {
  const navigate = useNavigate()
  const [tower, setTower] = useState('Tower A')

  const handleSelectUnit = (_uId: string) => {
    navigate(path('F09-03'))
  }

  return (
    <Screen id="F10-08" role="buyer" back={path('F10-07')} title="Choose a unit">
      <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-6 px-4 py-6 xl:py-8">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
          <div>
            <h1 className="text-h1 font-bold text-text">Choose a unit · Baner Heights</h1>
            <p className="text-body text-muted">
              Select your floor and unit to inspect specifications, facing and 3D view.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex rounded-control border border-line bg-surface p-0.5 text-chip font-medium">
              {TOWERS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTower(t)}
                  className={cn(
                    'rounded-[4px] px-3 py-1.5 transition-colors',
                    tower === t ? 'bg-primary text-on-primary' : 'text-muted hover:text-text'
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-small">
          <div className="flex items-center gap-1.5 font-medium text-success-ink">
            <span className="size-3 rounded-full bg-success-ink" />
            <span>✓ Available</span>
          </div>
          <div className="flex items-center gap-1.5 font-medium text-warning-ink">
            <span className="size-3 rounded-full bg-warning-ink" />
            <span>◔ Booked</span>
          </div>
          <div className="flex items-center gap-1.5 font-medium text-muted">
            <span className="size-3 rounded-full bg-line-strong" />
            <span>■ Sold</span>
          </div>
        </div>

        {/* Interactive Stack Grid */}
        <Card className="flex flex-col gap-3 overflow-x-auto p-5">
          <div className="flex flex-col gap-2 min-w-[600px]">
            {FLOORS.map((floor) => (
              <div key={floor} className="flex items-center gap-2">
                <span className="w-20 font-mono text-small font-medium text-muted">Floor {floor}</span>
                <div className="grid flex-1 grid-cols-6 gap-2">
                  {UNITS.map((no) => {
                    const prefix = tower === 'Tower A' ? 'A' : tower === 'Tower B' ? 'B' : 'C'
                    const uId = `${prefix}-${floor}${String(no).padStart(2, '0')}`
                    const isSold = no === 5 && floor % 3 === 0
                    const isBooked = no === 3 && floor % 2 === 0

                    return (
                      <button
                        key={no}
                        type="button"
                        disabled={isSold}
                        onClick={() => handleSelectUnit(uId)}
                        className={cn(
                          'flex flex-col items-center justify-center rounded-control border p-2 text-center transition-all',
                          isSold
                            ? 'border-line bg-skeleton text-muted cursor-not-allowed opacity-60'
                            : isBooked
                            ? 'border-warning-line bg-warning-tint/30 hover:border-warning-line hover:shadow-e1'
                            : 'border-line bg-surface hover:border-primary hover:bg-primary-tint/30 hover:shadow-e1'
                        )}
                      >
                        <span className="font-mono text-small font-bold">{uId}</span>
                        <span className="text-overline text-muted">
                          {isSold ? 'Sold' : isBooked ? 'Booked' : 'Available'}
                        </span>
                        <span className="text-overline font-semibold text-text">
                          {inrShort(no % 2 === 1 ? 14200000 : 9500000)}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </Screen>
  )
}

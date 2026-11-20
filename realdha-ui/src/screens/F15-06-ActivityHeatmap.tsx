import { useState } from 'react'
import { Screen } from '../app/Shell'
import { path } from '../app/nav'
import { Card } from '../components/ui/card'
import { cn } from '../lib/cn'

const METRICS = ['Compares', 'Views', 'Shortlists'] as const
const FLOORS = [24, 20, 18, 16, 12, 8, 4, 1]
const FACINGS = ['East · Hill', 'North · Garden', 'West · Road', 'South · Pool']

/** F15-06 · Buyer activity heatmap by floor and facing. */
export default function ActivityHeatmapScreen() {
  const [metric, setMetric] = useState<typeof METRICS[number]>('Compares')

  const getValue = (floor: number, fIdx: number) => {
    return Math.round(((floor * 3 + fIdx * 7) % 35) + 4)
  }

  return (
    <Screen id="F15-06" role="developer" back={path('F15-01')} title="Activity heatmap">
      <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-6 px-4 py-6 xl:py-8">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
          <div>
            <h1 className="text-h1 font-bold text-text">Buyer activity · Tower A</h1>
            <p className="text-body text-muted">
              {metric} per unit, last 30 days · 240 units · Cell number = {metric.toLowerCase()}
            </p>
          </div>

          <div className="flex rounded-control border border-line bg-surface p-0.5 text-chip font-medium">
            {METRICS.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMetric(m)}
                className={cn(
                  'rounded-[4px] px-3.5 py-1.5 transition-colors',
                  metric === m ? 'bg-primary text-on-primary' : 'text-muted hover:text-text'
                )}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Heatmap grid */}
        <Card className="flex flex-col gap-4 overflow-x-auto p-6">
          <div className="flex flex-col gap-2 min-w-[700px]">
            {/* Column Headers */}
            <div className="grid grid-cols-5 gap-2 text-center text-label font-semibold text-muted pb-1">
              <span className="text-left">Floor</span>
              {FACINGS.map((f) => (
                <span key={f}>{f}</span>
              ))}
            </div>

            {/* Rows */}
            {FLOORS.map((floor) => (
              <div key={floor} className="grid grid-cols-5 items-center gap-2">
                <span className="font-mono text-small font-semibold text-muted">Floor {floor}</span>
                {FACINGS.map((f, i) => {
                  const val = getValue(floor, i)
                  const isHigh = val > 24
                  const isMed = val > 14
                  return (
                    <div
                      key={f}
                      className={cn(
                        'flex h-11 items-center justify-center rounded-control font-mono text-small font-bold transition-transform hover:scale-105',
                        isHigh
                          ? 'bg-primary text-on-primary'
                          : isMed
                          ? 'bg-primary-tint text-primary'
                          : 'bg-canvas text-muted border border-line'
                      )}
                    >
                      {val}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between border-t border-line pt-3 text-overline text-muted">
            <span>High demand concentrated on upper floors facing East (Baner hill view).</span>
            <div className="flex items-center gap-2">
              <span className="inline-block size-3 rounded-full bg-primary" /> High
              <span className="inline-block size-3 rounded-full bg-primary-tint" /> Medium
              <span className="inline-block size-3 rounded-full bg-canvas border border-line" /> Low
            </div>
          </div>
        </Card>
      </div>
    </Screen>
  )
}

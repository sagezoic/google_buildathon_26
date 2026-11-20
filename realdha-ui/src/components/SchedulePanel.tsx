import { useState } from 'react'
import { Calendar, MapPin, X } from 'lucide-react'
import type { Scenario, AdjacentUnit, TitleChainTickDetail } from '../data/scenarios'

interface SchedulePanelProps {
  scenario: Scenario
}

export function SchedulePanel({ scenario }: SchedulePanelProps) {
  const [selectedNeighbor, setSelectedNeighbor] = useState<{ dir: string; unit: AdjacentUnit } | null>(null)
  const [selectedTick, setSelectedTick] = useState<TitleChainTickDetail | null>(null)

  const isHighRise = scenario.floorPlan.type === 'highrise'

  return (
    <section className="panel schedule-panel">
      {/* Panel Header */}
      <div className="panel-header">
        <div>
          <span className="dv">मालमत्तेचे वर्णन</span>{' '}
          <em>Schedule of Property · चतुःसीमा</em>
        </div>
        <span className="deed-ref-pill">Schedule B</span>
      </div>

      {/* Authentic Revenue Register Double-Bordered Schedule Box */}
      <div className="schedule-box">
        <h2 className="schedule-title dv">
          अनुसूची · मालमत्तेचे वर्णन
          <span className="schedule-title-sub">SCHEDULE OF PROPERTY · BOUNDARY DELINEATION</span>
        </h2>

        {isHighRise ? (
          /* High-Rise 3D Chaturima Grid */
          <div className="chaturima-grid">
            {/* Row 1: NW, North, NE */}
            <div className="ch-cell ch-x" />
            <div
              className="ch-cell ch-ew boundary-interactive"
              onClick={() => setSelectedNeighbor({ dir: 'North · उत्तर', unit: scenario.north })}
              role="button"
              tabIndex={0}
            >
              <i>North · उत्तर</i>
              <span className="ch-link">{scenario.north.name}</span>
              <small className="ch-sub">{scenario.north.status || 'Adjacent Unit'}</small>
            </div>
            <div className="ch-cell ch-x" />

            {/* Row 2: West, Active Unit, East */}
            <div
              className="ch-cell ch-ew boundary-interactive"
              onClick={() => setSelectedNeighbor({ dir: 'West · पश्चिम', unit: scenario.west })}
              role="button"
              tabIndex={0}
            >
              <i>West · पश्चिम</i>
              <span>{scenario.west.name}</span>
            </div>

            <div className="ch-cell ch-center">
              <i>Active Unit</i>
              <strong>{scenario.unit.split(' ')[0]} {scenario.unit.split(' ')[1]}</strong>
              <small className="center-rera">RERA Reg.</small>
            </div>

            <div
              className="ch-cell ch-ew boundary-interactive"
              onClick={() => setSelectedNeighbor({ dir: 'East · पूर्व', unit: scenario.east })}
              role="button"
              tabIndex={0}
            >
              <i>East · पूर्व</i>
              <span>{scenario.east.name}</span>
              <small className="ch-sub">Morning Sun Facing</small>
            </div>

            {/* Row 3: SW, South, SE */}
            <div className="ch-cell ch-x" />
            <div
              className="ch-cell ch-ew boundary-interactive"
              onClick={() => setSelectedNeighbor({ dir: 'South · दक्षिण', unit: scenario.south })}
              role="button"
              tabIndex={0}
            >
              <i>South · दक्षिण</i>
              <span className="ch-link">{scenario.south.name}</span>
              <small className="ch-sub">{scenario.south.status || 'Adjacent Unit'}</small>
            </div>
            <div className="ch-cell ch-x" />

            {/* Vertical Stack: Above & Below */}
            <div className="ch-above-below">
              <div
                className="boundary-interactive"
                onClick={() => setSelectedNeighbor({ dir: 'Above · वर (Floor Above)', unit: scenario.above })}
                role="button"
                tabIndex={0}
              >
                <i>Above · वर</i>
                <span className="ch-link">{scenario.above.name}</span>
                <small className="ch-sub">{scenario.above.description}</small>
              </div>
              <div
                className="boundary-interactive"
                onClick={() => setSelectedNeighbor({ dir: 'Below · खाली (Floor Below)', unit: scenario.below })}
                role="button"
                tabIndex={0}
              >
                <i>Below · खाली</i>
                <span className="ch-link">{scenario.below.name}</span>
                <small className="ch-sub">{scenario.below.description}</small>
              </div>
            </div>
          </div>
        ) : (
          /* Ground Parcel / Warehouse Chaturima Grid */
          <div className="chaturima-grid chaturima-plot">
            <div
              className="ch-cell ch-ew boundary-interactive"
              onClick={() => setSelectedNeighbor({ dir: 'North · उत्तर', unit: scenario.north })}
            >
              <i>North · उत्तर</i>
              <span>{scenario.north.name}</span>
            </div>
            <div
              className="ch-cell ch-ew boundary-interactive"
              onClick={() => setSelectedNeighbor({ dir: 'West · पश्चिम', unit: scenario.west })}
            >
              <i>West · पश्चिम</i>
              <span>{scenario.west.name}</span>
            </div>
            <div className="ch-cell ch-center">
              <i>Parcel</i>
              <strong>{scenario.unit.split('·')[0]}</strong>
            </div>
            <div
              className="ch-cell ch-ew boundary-interactive"
              onClick={() => setSelectedNeighbor({ dir: 'East · पूर्व', unit: scenario.east })}
            >
              <i>East · पूर्व</i>
              <span>{scenario.east.name}</span>
            </div>
            <div
              className="ch-cell ch-ew boundary-interactive"
              onClick={() => setSelectedNeighbor({ dir: 'South · दक्षिण', unit: scenario.south })}
            >
              <i>South · दक्षिण</i>
              <span>{scenario.south.name}</span>
            </div>
          </div>
        )}

        {/* Selected Neighbor Popover Callout */}
        {selectedNeighbor && (
          <div className="neighbor-detail-callout">
            <div className="neighbor-callout-header">
              <div className="neighbor-dir-title">
                <MapPin size={14} />
                <strong>{selectedNeighbor.dir}: {selectedNeighbor.unit.name}</strong>
              </div>
              <button
                className="callout-close-btn"
                onClick={() => setSelectedNeighbor(null)}
                aria-label="Close"
              >
                <X size={14} />
              </button>
            </div>
            <p className="neighbor-desc-text">{selectedNeighbor.unit.description}</p>
            {selectedNeighbor.unit.realdhaId && (
              <div className="neighbor-realdha-id n">
                <span>Adjacent REALDHA ID: <strong>{selectedNeighbor.unit.realdhaId}</strong></span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Interactive 30-Year Title Chain (मालकी साखळी) */}
      <div className="title-chain-section">
        <div className="title-chain-labels">
          <div className="chain-title-wrap">
            <span className="dv chain-title">मालकी साखळी · Title Chain</span>
            <span className="chain-years-pill n">{scenario.titleChainYears}</span>
          </div>
          <span className="chain-hint">Click any segment or mutation tick to inspect history</span>
        </div>

        {/* Colored Segment Bar */}
        <div className="title-chain-bar">
          {scenario.titleChainBar.map((seg, idx) => (
            <div
              key={idx}
              className={`title-chain-segment ${seg.color === 'hatch' ? 'hatch' : ''}`}
              style={{
                width: seg.width,
                background: seg.color !== 'hatch' ? seg.color : undefined,
              }}
              title={`${seg.years}: ${seg.holder} (${seg.transferType})`}
            >
              <span className="seg-years n">{seg.years}</span>
            </div>
          ))}
        </div>

        {/* Mutation Ticks Timeline */}
        <div className="title-chain-ticks-interactive">
          {scenario.titleChainTicks.map((tick, idx) => (
            <button
              key={idx}
              className={`tick-button ${selectedTick?.year === tick.year ? 'active' : ''}`}
              onClick={() => setSelectedTick(selectedTick?.year === tick.year ? null : tick)}
            >
              <span className="tick-dot" />
              <strong className="tick-year n">{tick.year}</strong>
              <span className="tick-label">{tick.label}</span>
            </button>
          ))}
        </div>

        {/* Selected Tick Detail Card */}
        {selectedTick && (
          <div className="tick-detail-box">
            <div className="tick-detail-header">
              <Calendar size={14} />
              <strong>{selectedTick.year} · {selectedTick.label}</strong>
              <button
                className="callout-close-btn"
                onClick={() => setSelectedTick(null)}
                aria-label="Close"
              >
                <X size={14} />
              </button>
            </div>
            <p className="tick-detail-text">{selectedTick.detail}</p>
            <div className="tick-doc-ref">
              <span>Supporting Record: <strong>{selectedTick.docRef}</strong></span>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

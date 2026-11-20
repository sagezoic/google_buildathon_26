import { useState } from 'react'
import { Sun, Sunset, Compass, Layers, Building2, Eye } from 'lucide-react'
import type { Scenario } from '../data/scenarios'

interface ExplorePanelProps {
  scenario: Scenario
}

export function ExplorePanel({ scenario }: ExplorePanelProps) {
  const [activeTab, setActiveTab] = useState<'tower' | 'floorplan' | 'light'>('tower')
  const [sunMode, setSunMode] = useState<'morning' | 'afternoon'>('morning')

  const isHighRise = scenario.floorPlan.type === 'highrise'
  const isPlot = scenario.floorPlan.type === 'plot'
  const isWarehouse = scenario.floorPlan.type === 'warehouse'

  return (
    <section className="panel explore-panel">
      {/* Panel Header */}
      <div className="panel-header">
        <div>
          <span className="dv">एक्सप्लोर</span>{' '}
          <em>Spatial Twin &amp; Architectural Truth</em>
        </div>
        <span className="unit-type-pill">{scenario.unitType.split(' ')[0]}</span>
      </div>

      {/* Tabs */}
      <div className="panel-tabs">
        <button
          className={`tab ${activeTab === 'tower' ? 'active' : ''}`}
          onClick={() => setActiveTab('tower')}
        >
          <Building2 size={14} />
          <span>{isPlot ? 'Land Parcel Map' : isWarehouse ? 'Site & Docks' : 'Tower Massing'}</span>
        </button>
        <button
          className={`tab ${activeTab === 'floorplan' ? 'active' : ''}`}
          onClick={() => setActiveTab('floorplan')}
        >
          <Layers size={14} />
          <span>Floor Plan (Indicative)</span>
        </button>
        <button
          className={`tab ${activeTab === 'light' ? 'active' : ''}`}
          onClick={() => setActiveTab('light')}
        >
          <Sun size={14} />
          <span>Sun &amp; Balcony</span>
        </button>
      </div>

      {/* Viewport Container */}
      <div className="explore-viewport">
        {/* TAB 1: TOWER / SITE LAYOUT */}
        {activeTab === 'tower' && (
          <div className="viewport-stage">
            {isHighRise && (
              <div className="highrise-view">
                <svg
                  viewBox="0 0 360 320"
                  width="100%"
                  height="260"
                  aria-label="Tower Massing Diagram"
                  className="tower-svg"
                >
                  <defs>
                    <pattern
                      id="towerHatch"
                      width="6"
                      height="6"
                      patternUnits="userSpaceOnUse"
                      patternTransform="rotate(45)"
                    >
                      <line x1="0" y1="0" x2="0" y2="6" stroke="#16181D" strokeWidth="1" />
                    </pattern>
                  </defs>

                  {/* Ground Line */}
                  <line x1="10" y1="305" x2="350" y2="305" stroke="#16181D" strokeWidth="3" />
                  <text x="180" y="318" textAnchor="middle" fontSize="11" fill="#666" fontWeight="600">
                    Ground Grade · Entrance Plaza &amp; Lobby
                  </text>

                  {/* Height Scale */}
                  <line x1="45" y1="20" x2="45" y2="305" stroke="#16181D" strokeWidth="1" strokeDasharray="3 3" />
                  <line x1="40" y1="20" x2="50" y2="20" stroke="#16181D" strokeWidth="1.5" />
                  <line x1="40" y1="305" x2="50" y2="305" stroke="#16181D" strokeWidth="1.5" />
                  <text
                    transform="translate(32 170) rotate(-90)"
                    fontSize="11"
                    fontFamily="var(--font-narrow)"
                    fontWeight="700"
                    fill="#333"
                    textAnchor="middle"
                  >
                    {scenario.floorHeight} Height to {scenario.floor}
                  </text>

                  {/* Floors Group */}
                  <g stroke="#16181D" strokeWidth="1.5">
                    {/* Rooftop Plant */}
                    <rect x="75" y="15" width="210" height="18" fill="url(#towerHatch)" />
                    <text x="180" y="28" textAnchor="middle" fontSize="10" fill="#333" fontWeight="700">
                      Rooftop Solar &amp; Service Slab
                    </text>

                    {/* Upper Floors */}
                    <rect x="75" y="36" width="210" height="22" fill="#FAFBF8" />
                    <text x="180" y="51" textAnchor="middle" fontSize="11" fill="#777">Floor 24–21</text>

                    <rect x="75" y="60" width="210" height="22" fill="#FAFBF8" />
                    <text x="180" y="75" textAnchor="middle" fontSize="11" fill="#777">Floor 20</text>

                    {/* Floor Above */}
                    <rect x="75" y="84" width="210" height="26" fill="#F0F2EC" />
                    <text x="180" y="101" textAnchor="middle" fontSize="12" fontWeight="700" fill="#16181D">
                      Above: {scenario.above.name} ({scenario.floor.replace('Floor ', '') ? `Fl ${Number(scenario.floor.replace('Floor ', '')) + 1 || 19}` : 'Fl 19'})
                    </text>

                    {/* Active Selected Unit Floor */}
                    <rect
                      x="75"
                      y="112"
                      width="210"
                      height="36"
                      fill="#22307A"
                      stroke="#16181D"
                      strokeWidth="3"
                    />
                    <text x="180" y="134" textAnchor="middle" fontSize="14" fontWeight="800" fill="#fff" fontFamily="var(--font-sans)">
                      ACTIVE UNIT: {scenario.unit.split('·')[0]}
                    </text>
                    <text x="180" y="145" textAnchor="middle" fontSize="10" fontWeight="600" fill="#c9d0f2">
                      {scenario.tower} · {scenario.floor} · {scenario.carpet}
                    </text>

                    {/* Floor Below */}
                    <rect x="75" y="150" width="210" height="26" fill="#F0F2EC" />
                    <text x="180" y="167" textAnchor="middle" fontSize="12" fontWeight="700" fill="#16181D">
                      Below: {scenario.below.name} ({scenario.floor.replace('Floor ', '') ? `Fl ${Number(scenario.floor.replace('Floor ', '')) - 1 || 17}` : 'Fl 17'})
                    </text>

                    {/* Lower Floors */}
                    <rect x="75" y="178" width="210" height="24" fill="#FAFBF8" />
                    <text x="180" y="194" textAnchor="middle" fontSize="11" fill="#777">Floor 16–10</text>

                    <rect x="75" y="204" width="210" height="24" fill="#FAFBF8" />
                    <text x="180" y="220" textAnchor="middle" fontSize="11" fill="#777">Floor 9–5</text>

                    <rect x="75" y="230" width="210" height="24" fill="#FAFBF8" />
                    <text x="180" y="246" textAnchor="middle" fontSize="11" fill="#777">Floor 4–1</text>

                    {/* Podium / Ground Base */}
                    <rect x="60" y="256" width="240" height="48" fill="#EAECE5" strokeWidth="2" />
                    <text x="180" y="280" textAnchor="middle" fontSize="12" fontWeight="700" fill="#222">
                      Double-Height Entrance Lobby &amp; Parking Podium
                    </text>
                    <text x="180" y="295" textAnchor="middle" fontSize="10" fill="#666">
                      RERA Sanctioned Height: 72 Metres
                    </text>
                  </g>
                </svg>
                <div className="stack-context-bar n">
                  <span>Above: <strong>{scenario.above.name}</strong></span>
                  <span>Active: <strong>{scenario.unit.split(' ')[0]} {scenario.unit.split(' ')[1]}</strong></span>
                  <span>Below: <strong>{scenario.below.name}</strong></span>
                </div>
              </div>
            )}

            {isPlot && (
              <div className="plot-view">
                <svg
                  viewBox="0 0 360 260"
                  width="100%"
                  height="260"
                  aria-label="Land Parcel Boundary Survey Map"
                  className="plot-svg"
                >
                  <defs>
                    <pattern id="disputeHatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                      <line x1="0" y1="0" x2="0" y2="8" stroke="#C3271F" strokeWidth="2" />
                    </pattern>
                  </defs>

                  {/* Public Access Road (East) */}
                  <rect x="290" y="15" width="60" height="230" fill="#D8DAD4" stroke="#16181D" strokeWidth="1.5" />
                  <text transform="translate(325 130) rotate(90)" textAnchor="middle" fontSize="12" fontWeight="700" fill="#333">
                    12m Public Access Road · Old Khandala Highway
                  </text>

                  {/* Sanctioned Plot 418 sq m */}
                  <rect x="30" y="30" width="220" height="190" fill="#FAFBF8" stroke="#16181D" strokeWidth="2.5" />
                  <text x="140" y="60" textAnchor="middle" fontSize="15" fontWeight="800" fill="#16181D" fontFamily="var(--font-sans)">
                    PLOT NA-412 · GAT #201
                  </text>
                  <text x="140" y="80" textAnchor="middle" fontSize="13" fontWeight="700" fill="#1E7A46">
                    Official 7/12 Sanctioned Area: 418 sq m (0.0418 Ha)
                  </text>
                  <text x="140" y="100" textAnchor="middle" fontSize="11" fill="#555">
                    Collector NA Order 2019/44 · Freehold Residential
                  </text>

                  {/* Disputed Strip 47 sq m */}
                  <rect x="250" y="30" width="40" height="190" fill="url(#disputeHatch)" stroke="#C3271F" strokeWidth="2" />
                  <text transform="translate(275 125) rotate(-90)" textAnchor="middle" fontSize="11" fontWeight="800" fill="#C3271F">
                    ⚠ 47 sq m Claimed Overlap
                  </text>

                  {/* Dimensions */}
                  <text x="140" y="24" textAnchor="middle" fontSize="11" fontWeight="600" fill="#444">North: 22.0 metres</text>
                  <text x="140" y="238" textAnchor="middle" fontSize="11" fontWeight="600" fill="#444">South: 22.0 metres (Plot 413)</text>
                  <text transform="translate(18 125) rotate(-90)" textAnchor="middle" fontSize="11" fontWeight="600" fill="#444">West: 19.0m (Valley)</text>

                  {/* North Indicator */}
                  <g transform="translate(45 50)">
                    <circle cx="0" cy="0" r="14" fill="#fff" stroke="#16181D" strokeWidth="1.5" />
                    <line x1="0" y1="8" x2="0" y2="-10" stroke="#C3271F" strokeWidth="2" />
                    <polygon points="0,-12 -4,-4 4,-4" fill="#C3271F" />
                    <text x="0" y="-15" textAnchor="middle" fontSize="10" fontWeight="800" fill="#C3271F">N</text>
                  </g>
                </svg>
                <div className="plot-legend">
                  <span className="legend-item"><span className="legend-box verified" /> Sanctioned 7/12 (418 sq m)</span>
                  <span className="legend-item"><span className="legend-box flagged" /> Seller Recital Gap (47 sq m)</span>
                </div>
              </div>
            )}

            {isWarehouse && (
              <div className="warehouse-view">
                <svg
                  viewBox="0 0 360 260"
                  width="100%"
                  height="260"
                  aria-label="Industrial Warehouse Layout"
                  className="warehouse-svg"
                >
                  {/* Truck Apron & Arterial Road */}
                  <rect x="15" y="15" width="80" height="230" fill="#EAECE5" stroke="#16181D" strokeWidth="1.5" />
                  <text transform="translate(45 130) rotate(-90)" textAnchor="middle" fontSize="11" fontWeight="700" fill="#333">
                    Truck Ingress &amp; 45m Logistics Arterial Road
                  </text>

                  {/* Loading Docks */}
                  <rect x="95" y="25" width="40" height="210" fill="#D5D9CD" stroke="#16181D" strokeWidth="1.5" />
                  <text transform="translate(118 130) rotate(-90)" textAnchor="middle" fontSize="11" fontWeight="800" fill="#22307A">
                    8-Bay Dedicated Loading Docks
                  </text>

                  {/* Main Storage Shed */}
                  <rect x="135" y="25" width="210" height="150" fill="#FAFBF8" stroke="#16181D" strokeWidth="2.5" />
                  <text x="240" y="60" textAnchor="middle" fontSize="14" fontWeight="800" fill="#16181D">
                    WAREHOUSE WH-7 (12,000 SQ FT)
                  </text>
                  <text x="240" y="80" textAnchor="middle" fontSize="12" fontWeight="700" fill="#1E7A46">
                    Clear Height: 11.0 Metres · FM2 Laser Floor
                  </text>
                  <text x="240" y="100" textAnchor="middle" fontSize="11" fill="#555">
                    Tenant: Express Logistics (₹3.6L/mo active)
                  </text>
                  <text x="240" y="130" textAnchor="middle" fontSize="11" fontWeight="700" fill="#C3271F">
                    ⚠ Encumbered by Active SBI Mortgage ₹2.4 Cr
                  </text>

                  {/* Office Mezzanine */}
                  <rect x="135" y="175" width="130" height="60" fill="#F0F2EC" stroke="#16181D" strokeWidth="1.5" />
                  <text x="200" y="205" textAnchor="middle" fontSize="11" fontWeight="700" fill="#333">
                    Administrative Mezzanine (1,200 sq ft)
                  </text>

                  {/* Utility & Fire Pump */}
                  <rect x="265" y="175" width="80" height="60" fill="#EAECE5" stroke="#16181D" strokeWidth="1.5" />
                  <text x="305" y="205" textAnchor="middle" fontSize="10" fill="#555">
                    Fire Sprinklers &amp; Substation
                  </text>
                </svg>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: INDICATIVE FLOOR PLAN */}
        {activeTab === 'floorplan' && (
          <div className="viewport-stage floorplan-stage">
            <div className="floorplan-disclaimer">
              <span>{scenario.floorPlan.indicativeDisclaimer}</span>
            </div>

            <svg
              viewBox="0 0 380 280"
              width="100%"
              height="240"
              aria-label="Architectural Indicative Floor Plan"
              className="floorplan-svg"
            >
              {/* Rooms */}
              {scenario.floorPlan.rooms.map((room, idx) => (
                <g key={idx}>
                  <rect
                    x={room.x}
                    y={room.y}
                    width={room.w}
                    height={room.h}
                    fill={room.fillColor || '#FAFBF8'}
                    stroke="#16181D"
                    strokeWidth="1.5"
                  />
                  <text
                    x={room.x + room.w / 2}
                    y={room.y + room.h / 2 - 8}
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight="700"
                    fill="#16181D"
                    fontFamily="var(--font-sans)"
                  >
                    {room.name}
                  </text>
                  <text
                    x={room.x + room.w / 2}
                    y={room.y + room.h / 2 + 6}
                    textAnchor="middle"
                    fontSize="10"
                    fill="#666"
                    className="dv"
                  >
                    {room.nameDv}
                  </text>
                  <text
                    x={room.x + room.w / 2}
                    y={room.y + room.h / 2 + 20}
                    textAnchor="middle"
                    fontSize="10"
                    fontWeight="600"
                    fill="#22307A"
                    className="n"
                  >
                    {room.dimensions} ({room.areaSqFt} sq ft)
                  </text>
                </g>
              ))}

              {/* Balconies */}
              {scenario.floorPlan.balconies?.map((balcony, idx) => (
                <g key={idx}>
                  <rect
                    x={balcony.x}
                    y={balcony.y}
                    width={balcony.w}
                    height={balcony.h}
                    fill="#E8F0FE"
                    stroke="#22307A"
                    strokeWidth="1.5"
                    strokeDasharray="4 2"
                  />
                  <text
                    x={balcony.x + balcony.w / 2}
                    y={balcony.y + balcony.h / 2 + 4}
                    textAnchor="middle"
                    fontSize="10"
                    fontWeight="700"
                    fill="#22307A"
                  >
                    {balcony.name}
                  </text>
                </g>
              ))}

              {/* Compass Rose */}
              <g transform="translate(340 40)">
                <circle cx="0" cy="0" r="14" fill="#fff" stroke="#16181D" strokeWidth="1" />
                <line x1="0" y1="8" x2="0" y2="-10" stroke="#C3271F" strokeWidth="2" />
                <polygon points="0,-12 -3,-4 3,-4" fill="#C3271F" />
                <text x="0" y="-15" textAnchor="middle" fontSize="9" fontWeight="800" fill="#C3271F">N</text>
                <text x="16" y="3" textAnchor="middle" fontSize="8" fontWeight="700" fill="#333">E</text>
              </g>

              {/* Main Entry Arrow */}
              {scenario.floorPlan.entryPoint && (
                <g transform={`translate(${scenario.floorPlan.entryPoint.x} ${scenario.floorPlan.entryPoint.y})`}>
                  <text x="0" y="-8" fontSize="9" fontWeight="700" fill="#22307A">Entry</text>
                  <polygon points="0,0 12,5 12,-5" fill="#22307A" />
                </g>
              )}
            </svg>

            <div className="orientation-footer">
              <Compass size={14} />
              <span>{scenario.floorPlan.compassOrientation}</span>
            </div>
          </div>
        )}

        {/* TAB 3: LIGHT & SUN SIMULATION */}
        {activeTab === 'light' && (
          <div className="viewport-stage light-stage">
            <div className="sun-mode-toggle">
              <button
                className={`sun-btn ${sunMode === 'morning' ? 'active' : ''}`}
                onClick={() => setSunMode('morning')}
              >
                <Sun size={15} />
                <span>Morning Light (07:30 AM · East)</span>
              </button>
              <button
                className={`sun-btn ${sunMode === 'afternoon' ? 'active' : ''}`}
                onClick={() => setSunMode('afternoon')}
              >
                <Sunset size={15} />
                <span>Afternoon Light (14:30 PM · West)</span>
              </button>
            </div>

            <div className="light-simulation-canvas">
              <svg viewBox="0 0 360 160" width="100%" height="150" aria-label="Sunlight simulation">
                {/* Simulated Facade */}
                <rect x="100" y="40" width="160" height="90" fill="#FAFBF8" stroke="#16181D" strokeWidth="2" />
                <text x="180" y="80" textAnchor="middle" fontSize="12" fontWeight="700" fill="#16181D">
                  {scenario.unit.split('·')[0]} Facade
                </text>
                <text x="180" y="96" textAnchor="middle" fontSize="11" fill="#666">
                  Facing: {scenario.facing}
                </text>

                {sunMode === 'morning' ? (
                  /* Morning East Sun */
                  <g>
                    <circle cx="50" cy="40" r="18" fill="#FDB813" />
                    <circle cx="50" cy="40" r="28" fill="#FDB813" opacity="0.25" />
                    {/* Sun Rays */}
                    <line x1="68" y1="50" x2="110" y2="70" stroke="#FDB813" strokeWidth="2.5" strokeDasharray="4 2" />
                    <line x1="65" y1="35" x2="115" y2="50" stroke="#FDB813" strokeWidth="2.5" strokeDasharray="4 2" />
                    <line x1="55" y1="60" x2="105" y2="95" stroke="#FDB813" strokeWidth="2.5" strokeDasharray="4 2" />
                    <text x="50" y="80" textAnchor="middle" fontSize="11" fontWeight="700" fill="#B37400">
                      East Rising Sun
                    </text>
                  </g>
                ) : (
                  /* Afternoon West Sun */
                  <g>
                    <circle cx="310" cy="40" r="18" fill="#E65100" />
                    <circle cx="310" cy="40" r="28" fill="#E65100" opacity="0.2" />
                    {/* Sun Rays */}
                    <line x1="292" y1="50" x2="250" y2="70" stroke="#E65100" strokeWidth="2.5" strokeDasharray="4 2" />
                    <line x1="295" y1="35" x2="245" y2="50" stroke="#E65100" strokeWidth="2.5" strokeDasharray="4 2" />
                    <line x1="305" y1="60" x2="255" y2="95" stroke="#E65100" strokeWidth="2.5" strokeDasharray="4 2" />
                    <text x="310" y="80" textAnchor="middle" fontSize="11" fontWeight="700" fill="#C3271F">
                      West Setting Sun
                    </text>
                  </g>
                )}
              </svg>
            </div>

            <div className="light-narrative-box">
              <div className="narrative-row">
                <Sun size={15} className="text-amb" />
                <p>
                  {sunMode === 'morning'
                    ? scenario.lightSimulation.morningDesc
                    : scenario.lightSimulation.afternoonDesc}
                </p>
              </div>
              <div className="narrative-row vista-row">
                <Eye size={15} className="text-ind" />
                <p>
                  <strong>Balcony Vista:</strong> {scenario.lightSimulation.balconyView}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Persistent Spec Grid */}
      <div className="spec-grid n">
        <div>
          <i>Facing / अभिमुखता</i>
          {scenario.facing}
        </div>
        <div>
          <i>Floor Height / उंची</i>
          {scenario.floorHeight}
        </div>
        <div>
          <i>Carpet / चटई क्षेत्र</i>
          {scenario.carpet}
        </div>
        <div>
          <i>Built-up / बांधकाम क्षेत्र</i>
          {scenario.builtUp}
        </div>
      </div>
    </section>
  )
}

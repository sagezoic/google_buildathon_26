import { ChevronDown, Download, Search } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import { Screen } from '../../../app/Shell'
import { path } from '../../../app/nav'
import { Button } from '../../../components/ui/button'
import { Card } from '../../../components/ui/card'
import { Pill } from '../../../components/ui/pill'
import { download } from '../../../lib/f10-store'

interface InvUnit {
  id: string
  tower: string
  floor: number
  unit: string
  bhk: string
  carpet: string
  price: string
  status: 'Available' | 'Booked' | 'Sold'
}

const INVENTORY_UNITS: InvUnit[] = [
  { id: 'RA-PUN-001-A-18-04', tower: 'A', floor: 18, unit: 'A-1804', bhk: '3 BHK', carpet: '1,180 sq ft', price: '₹1,42,00,000', status: 'Available' },
  { id: 'RA-PUN-001-A-17-04', tower: 'A', floor: 17, unit: 'A-1704', bhk: '3 BHK', carpet: '1,180 sq ft', price: '₹1,38,00,000', status: 'Available' },
  { id: 'RA-PUN-001-A-12-02', tower: 'A', floor: 12, unit: 'A-1202', bhk: '2 BHK', carpet: '860 sq ft', price: '₹92,00,000', status: 'Booked' },
  { id: 'RA-PUN-001-B-09-02', tower: 'B', floor: 9, unit: 'B-0902', bhk: '2 BHK', carpet: '860 sq ft', price: '₹89,00,000', status: 'Sold' },
  { id: 'RA-PUN-001-A-21-06', tower: 'A', floor: 21, unit: 'A-2106', bhk: '4 BHK', carpet: '1,650 sq ft', price: '₹2,10,00,000', status: 'Available' },
]

/** F15-02 · Inventory table with inline editing and price history links. */
export default function InventoryScreen() {
  const [q, setQ] = useState('')
  const [selected, setSelected] = useState<string[]>(['RA-PUN-001-A-18-04', 'RA-PUN-001-A-17-04'])

  const handleExport = () => {
    const csvContent = 'ID,Tower,Floor,Unit,BHK,Carpet,Price,Status\n' +
      INVENTORY_UNITS.map((u) => `${u.id},${u.tower},${u.floor},${u.unit},${u.bhk},${u.carpet},${u.price},${u.status}`).join('\n')
    download('baner_heights_inventory.csv', csvContent)
  }

  return (
    <Screen id="F15-02" role="developer" back={path('F15-01')} title="Inventory">
      <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-6 px-4 py-6 xl:py-8">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
          <div>
            <h1 className="text-h1 font-bold text-text">Inventory · Baner Heights</h1>
            <p className="text-body text-muted">
              Live unit statuses and price management. Click price to view change history.
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={handleExport} icon={<Download className="size-3.5" />}>
            Export CSV
          </Button>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-64">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
              <input
                type="text"
                placeholder="Search by ID or unit"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="h-control w-full rounded-control border border-line bg-surface pl-9 pr-3 text-small text-text outline-none"
              />
            </div>
            <Button variant="secondary" size="sm" icon={<ChevronDown className="size-3.5" />}>
              Tower
            </Button>
            <Button variant="secondary" size="sm" icon={<ChevronDown className="size-3.5" />}>
              Status
            </Button>
          </div>

          {selected.length > 0 && (
            <div className="flex items-center gap-2 rounded-control bg-canvas px-3 py-1 text-small">
              <span className="font-semibold text-text">{selected.length} selected</span>
              <Button variant="secondary" size="sm">
                Set status
              </Button>
              <Button variant="secondary" size="sm">
                Change price
              </Button>
            </div>
          )}
        </div>

        {/* Table */}
        <Card className="flex flex-col overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-small">
              <thead className="border-b border-line bg-canvas text-label font-semibold text-muted">
                <tr>
                  <th className="w-10 px-4 py-3"></th>
                  <th className="px-4 py-3">Unit</th>
                  <th className="px-4 py-3">Record ID</th>
                  <th className="px-4 py-3">BHK</th>
                  <th className="px-4 py-3">Carpet Area</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line bg-surface">
                {INVENTORY_UNITS.map((unit) => (
                  <tr key={unit.id} className="hover:bg-canvas/50">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.includes(unit.id)}
                        onChange={(e) => {
                          if (e.target.checked) setSelected([...selected, unit.id])
                          else setSelected(selected.filter((id) => id !== unit.id))
                        }}
                        className="size-4 rounded border-line"
                      />
                    </td>
                    <td className="px-4 py-3 font-bold text-text">
                      {unit.unit}
                    </td>
                    <td className="px-4 py-3 font-mono text-muted">
                      {unit.id}
                    </td>
                    <td className="px-4 py-3">{unit.bhk}</td>
                    <td className="px-4 py-3 text-muted">{unit.carpet}</td>
                    <td className="px-4 py-3 font-semibold text-text">
                      <Link to={path('F15-03')} className="hover:text-primary hover:underline" title="View price history">
                        {unit.price}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <Pill
                        tone={
                          unit.status === 'Available'
                            ? 'success'
                            : unit.status === 'Booked'
                            ? 'warning'
                            : 'neutral'
                        }
                      >
                        {unit.status}
                      </Pill>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="sm" to={path('F15-03')}>
                        History
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </Screen>
  )
}

import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router'
import { Screen } from '../app/Shell'
import { path } from '../app/nav'
import { Card } from '../components/ui/card'
import { PRICE_HISTORY } from '../data/fixtures/f15-devconsole'

/** F15-03 · Price-change history for unit A-1704. */
export default function PriceHistoryScreen() {
  return (
    <Screen id="F15-03" role="developer" back={path('F15-02')} title="Price history">
      <div className="mx-auto flex w-full max-w-[920px] flex-col gap-6 px-4 py-6 xl:py-8">
        <div className="flex flex-col gap-1">
          <Link to={path('F15-02')} className="inline-flex items-center gap-1.5 text-small text-muted hover:text-text hover:underline">
            <ArrowLeft className="size-4" />
            <span>Inventory › A-1704</span>
          </Link>
          <div className="pt-2">
            <h1 className="text-h1 font-bold text-text">Price-change history</h1>
            <p className="text-body text-muted">Audit trail of all unit pricing revisions.</p>
          </div>
        </div>

        <Card className="flex flex-col overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-small">
              <thead className="border-b border-line bg-canvas text-label font-semibold text-muted">
                <tr>
                  <th className="px-4 py-3">When</th>
                  <th className="px-4 py-3">Unit</th>
                  <th className="px-4 py-3">From</th>
                  <th className="px-4 py-3">To</th>
                  <th className="px-4 py-3">Change</th>
                  <th className="px-4 py-3 text-right">By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line bg-surface">
                {PRICE_HISTORY.map((row) => (
                  <tr key={row.id} className="hover:bg-canvas/50">
                    <td className="px-4 py-3 font-mono text-muted">
                      {row.when}
                    </td>
                    <td className="px-4 py-3 font-bold text-text">
                      {row.unit}
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {row.fromPrice}
                    </td>
                    <td className="px-4 py-3 font-semibold text-text">
                      {row.toPrice}
                    </td>
                    <td className="px-4 py-3 font-medium text-success-ink">
                      {row.change}
                    </td>
                    <td className="px-4 py-3 text-right text-muted">
                      {row.by}
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

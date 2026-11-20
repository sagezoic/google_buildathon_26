import { AlertCircle, Download, FileSpreadsheet } from 'lucide-react'
import { Screen } from '../../../app/Shell'
import { path } from '../../../app/nav'
import { Button } from '../../../components/ui/button'
import { Card } from '../../../components/ui/card'
import { StepPills } from '../../../components/ui/f10-parts'
import { download, sampleCsv } from '../../../lib/f10-store'
import { toCsv } from '../../parts/f-lib'

/** F10-03 · Bulk CSV upload and mapping. */
export default function BulkCSVScreen() {
  const handleDownloadSample = () => {
    const csv = sampleCsv()
    download(csv.name, toCsv([csv.headers, ...csv.rows]))
  }

  return (
    <Screen id="F10-03" role="developer" back={path('F10-02')} title="Bulk CSV upload">
      <div className="mx-auto flex w-full max-w-[960px] flex-col gap-6 px-4 py-6 xl:py-8">
        <StepPills current={3} />

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
          <div>
            <h1 className="text-h1 font-bold text-text">Bulk upload units (CSV)</h1>
            <p className="text-body text-muted">
              Upload unit inventory, pricing, configuration and facing via spreadsheet.
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={handleDownloadSample} icon={<Download className="size-3.5" />}>
            Download sample CSV
          </Button>
        </div>

        <Card className="flex flex-col gap-5 p-6">
          {/* Uploaded file summary */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-control border border-line bg-canvas p-4">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="size-6 text-primary" />
              <div>
                <span className="text-body font-semibold text-text">units_baner_heights.csv</span>
                <div className="text-small text-muted">336 rows · 9 columns · Uploaded just now</div>
              </div>
            </div>
            <span className="flex items-center gap-1.5 text-small font-medium text-warning-ink">
              <AlertCircle className="size-4" /> 3 errors in 336 rows
            </span>
          </div>

          {/* Validation errors table */}
          <div className="flex flex-col gap-2">
            <span className="text-label font-semibold text-text">Rows needing review</span>
            <div className="overflow-x-auto rounded-control border border-line">
              <table className="w-full text-left text-small">
                <thead className="border-b border-line bg-canvas text-label font-semibold text-muted">
                  <tr>
                    <th className="px-3 py-2">Row</th>
                    <th className="px-3 py-2">Unit</th>
                    <th className="px-3 py-2">Issue</th>
                    <th className="px-3 py-2">Value in CSV</th>
                    <th className="px-3 py-2">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line bg-surface">
                  <tr>
                    <td className="px-3 py-2 font-mono">14</td>
                    <td className="px-3 py-2 font-medium">A-2002</td>
                    <td className="px-3 py-2 text-warning-ink">Price format</td>
                    <td className="px-3 py-2 font-mono text-muted">"1.4 Cr"</td>
                    <td className="px-3 py-2">
                      <span className="text-success-ink font-medium">Auto-parsed to ₹1,40,00,000</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-mono">29</td>
                    <td className="px-3 py-2 font-medium">A-1804</td>
                    <td className="px-3 py-2 text-warning-ink">Duplicate unit row</td>
                    <td className="px-3 py-2 font-mono text-muted">Duplicate A-1804</td>
                    <td className="px-3 py-2">
                      <span className="text-success-ink font-medium">Merged with primary</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-mono">57</td>
                    <td className="px-3 py-2 font-medium">B-0902</td>
                    <td className="px-3 py-2 text-warning-ink">Invalid facing</td>
                    <td className="px-3 py-2 font-mono text-muted">"Northeast"</td>
                    <td className="px-3 py-2">
                      <span className="text-success-ink font-medium">Set to North</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-between border-t border-line pt-4">
            <Button variant="secondary" to={path('F10-02')}>
              Back
            </Button>
            <Button to={path('F10-04')}>
              Continue to Unit Grid
            </Button>
          </div>
        </Card>
      </div>
    </Screen>
  )
}

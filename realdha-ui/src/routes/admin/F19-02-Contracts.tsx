import { Check, Copy } from 'lucide-react'
import { useState } from 'react'
import { Screen } from '../../app/Shell'
import { path } from '../../app/nav'
import { Card } from '../../components/ui/card'
import { Pill } from '../../components/ui/pill'
import { CONTRACTS, type Contract } from '../../data/fixtures/f19-admin'
import { AdminGate } from '../parts/AdminGate'
import { Page, Resp } from '../parts/f-bits'
import { mono } from '../parts/f-lib'
import { cn } from '../../lib/cn'

export default function Contracts() {
  const [copied, setCopied] = useState<string | null>(null)

  const copy = (addr: string) => {
    void navigator.clipboard?.writeText(addr)
    setCopied(addr)
    setTimeout(() => setCopied(null), 1500)
  }

  return (
    <AdminGate>
      <Screen id="F19-02" role="admin" back={path('GP-23')} title="Contracts">
        <Page className="xl:max-w-[1100px]">
          <h1 className="text-h1"><Resp d="Contracts" m="Contracts" /></h1>

          {/* Desktop & Tablet Table */}
          <Card className="hidden overflow-hidden p-0 md:block">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-small">
                <thead>
                  <tr className="border-b border-line bg-sunken text-left text-label text-muted">
                    <th scope="col" className="px-4 py-2.5 font-semibold">Name</th>
                    <th scope="col" className="px-4 py-2.5 font-semibold">Address</th>
                    <th scope="col" className="px-4 py-2.5 font-semibold">Network</th>
                    <th scope="col" className="px-4 py-2.5 font-semibold">Version</th>
                    <th scope="col" className="px-4 py-2.5 font-semibold">Deployed</th>
                    <th scope="col" className="px-4 py-2.5 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {CONTRACTS.map((c: Contract) => (
                    <tr key={c.address} className="border-b border-line last:border-0 hover:bg-canvas">
                      <td className="px-4 py-3 font-medium text-text">{c.name}</td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => copy(c.address)}
                          aria-label={`Copy address ${c.address}`}
                          className={cn(mono, 'inline-flex items-center gap-1.5 cursor-pointer text-chain-ink hover:underline')}
                        >
                          {c.address}
                          {copied === c.address ? (
                            <Check className="size-3 text-success-ink" aria-hidden />
                          ) : (
                            <Copy className="size-3 text-muted" aria-hidden />
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3">{c.network}</td>
                      <td className="px-4 py-3">{c.version}</td>
                      <td className="px-4 py-3">{c.deployed}</td>
                      <td className="px-4 py-3">
                        {c.status === 'Active' ? (
                          <Pill tone="chain" icon={<Check className="size-3" />}>Active</Pill>
                        ) : (
                          <Pill tone="warning">Pending</Pill>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Mobile Card List */}
          <div className="flex flex-col gap-3 md:hidden">
            {CONTRACTS.map((c: Contract) => (
              <Card key={c.address} className="flex flex-col gap-2 p-4">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-semibold text-text">{c.name}</span>
                  {c.status === 'Active' ? (
                    <Pill tone="chain" icon={<Check className="size-3" />}>Active</Pill>
                  ) : (
                    <Pill tone="warning">Pending</Pill>
                  )}
                </div>
                <div className="flex items-center justify-between text-small">
                  <span className="text-label text-muted">Address</span>
                  <button
                    type="button"
                    onClick={() => copy(c.address)}
                    className={cn(mono, 'inline-flex items-center gap-1.5 cursor-pointer text-chain-ink')}
                  >
                    {c.address}
                    {copied === c.address ? (
                      <Check className="size-3 text-success-ink" aria-hidden />
                    ) : (
                      <Copy className="size-3 text-muted" aria-hidden />
                    )}
                  </button>
                </div>
                <div className="flex items-center justify-between text-small">
                  <span className="text-label text-muted">Network</span>
                  <span>{c.network}</span>
                </div>
                <div className="flex items-center justify-between text-small">
                  <span className="text-label text-muted">Version</span>
                  <span>{c.version}</span>
                </div>
                <div className="flex items-center justify-between text-small">
                  <span className="text-label text-muted">Deployed</span>
                  <span>{c.deployed}</span>
                </div>
              </Card>
            ))}
          </div>

          <p className="text-label text-muted">Testnet only. Sample data.</p>
        </Page>
      </Screen>
    </AdminGate>
  )
}

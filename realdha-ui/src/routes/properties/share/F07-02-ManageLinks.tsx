import { Check, Copy, Plus } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import { Screen } from '../../../app/Shell'
import { path } from '../../../app/nav'
import { usePersistentState } from '../../../app/persist'
import { Button } from '../../../components/ui/button'
import { Card } from '../../../components/ui/card'
import { Pill } from '../../../components/ui/pill'
import { Modal } from '../../../components/ui/modal'
import { SEED_SHARE_LINKS, type ShareLinkRecord } from '../../../data/fixtures/f07-share'

/** F07-02 · Manage share links. */
export default function ManageLinksScreen() {
  const [links, setLinks] = usePersistentState<ShareLinkRecord[]>('f07.links', SEED_SHARE_LINKS)
  const [activeLog, setActiveLog] = useState<ShareLinkRecord | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleCopy = (l: ShareLinkRecord) => {
    navigator.clipboard?.writeText('https://' + l.url)
    setCopiedId(l.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleRevoke = (id: string) => {
    setLinks((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: 'Revoked' } : l))
    )
  }

  return (
    <Screen id="F07-02" back={path('F04-01')} title="Manage share links">
      <div className="mx-auto flex w-full max-w-[1080px] flex-col gap-6 px-4 py-6 xl:py-8">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
          <div>
            <span className="text-label text-muted">A-1804 · 3 BHK · RA-PUN-001-A-18-04</span>
            <h1 className="text-h1 font-semibold text-text">Share links</h1>
          </div>
          <Button to={path('F07-01')} icon={<Plus className="size-4" />}>
            Create link
          </Button>
        </div>

        <Card className="flex flex-col overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-small">
              <thead className="border-b border-line bg-canvas text-label font-semibold text-muted">
                <tr>
                  <th className="px-4 py-3">Link</th>
                  <th className="px-4 py-3">Access</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Expiry</th>
                  <th className="px-4 py-3">Views</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line bg-surface">
                {links.map((link) => (
                  <tr key={link.id} className="hover:bg-canvas/50">
                    <td className="px-4 py-3 font-mono font-medium text-text">
                      <div className="flex items-center gap-2">
                        <Link to={path('F07-03')} className="hover:underline text-primary">
                          {link.url}
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleCopy(link)}
                          className="text-muted hover:text-text"
                          title="Copy link"
                        >
                          {copiedId === link.id ? (
                            <Check className="size-3.5 text-success-ink" />
                          ) : (
                            <Copy className="size-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-text">
                      {link.access}
                    </td>
                    <td className="px-4 py-3">
                      <Pill
                        tone={
                          link.status === 'Active'
                            ? 'success'
                            : link.status === 'Revoked'
                            ? 'danger'
                            : 'neutral'
                        }
                      >
                        {link.status}
                      </Pill>
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {link.expiryLabel}
                    </td>
                    <td className="px-4 py-3 font-medium text-text">
                      {link.views} views
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setActiveLog(link)}
                        >
                          View log
                        </Button>
                        {link.status === 'Active' && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleRevoke(link.id)}
                          >
                            Revoke
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* View log modal */}
        <Modal
          open={!!activeLog}
          onOpenChange={(open) => !open && setActiveLog(null)}
          title={`Access log · ${activeLog?.code}`}
        >
          <div className="flex flex-col gap-4">
            <p className="text-small text-muted">
              Record views for shared link <b>{activeLog?.url}</b>.
            </p>
            {activeLog && activeLog.log.length > 0 ? (
              <div className="flex flex-col divide-y divide-line rounded-control border border-line">
                {activeLog.log.map((entry, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 text-small">
                    <div>
                      <div className="font-medium text-text">{entry.city}, India</div>
                      <div className="font-mono text-overline text-muted">{entry.ip}</div>
                    </div>
                    <span className="text-small text-muted">{entry.time}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-small text-muted">
                No access events recorded yet.
              </div>
            )}
            <div className="flex justify-end pt-2">
              <Button variant="secondary" onClick={() => setActiveLog(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </Screen>
  )
}
